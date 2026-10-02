import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { InstancedMesh, MathUtils, Object3D, Vector3 } from 'three';
import type { MotionValue } from 'motion/react';
import { TIMELINE, easeIn, easeInOut, seg } from '../motion/timeline';
import { HAND, MEMBER_HANDS, fundPosition } from './layout';

type Props = { vh: MotionValue<number>; count: number; reduced: boolean };

const MEMBER_COINS = MEMBER_HANDS.length;
const dummy = new Object3D();
const orbit = new Vector3();
const pile = new Vector3();
const from = new Vector3();

/**
 * The money: one InstancedMesh of USDC coins.
 * 01 · orbit the Fund → 56–120 vh: fall into one open hand (staggered, with a small arc).
 * 02 · each member passes one more coin to the centre (170–240) → all coins vanish with the
 *      centre figure (250–296).
 */
export function Coins({ vh, count, reduced }: Props) {
  const mesh = useRef<InstancedMesh>(null);
  const size = useThree((s) => s.size);
  const total = count + MEMBER_COINS;

  // Where each coin rests in the hand: a small pile, 12 per layer.
  const piles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const layer = Math.floor(i / 12);
        const k = i % 12;
        const a = (k / 12) * Math.PI * 2 + layer * 0.5;
        const r = 0.05 + 0.15 * ((k % 3) / 2);
        return new Vector3(HAND.x + Math.cos(a) * r, HAND.y + 0.1 + layer * 0.034, HAND.z + Math.sin(a) * r);
      }),
    [count],
  );
  const pileTop = HAND.y + 0.1 + Math.ceil(count / 12) * 0.034;

  useLayoutEffect(() => {
    // Hide everything until the first frame places it.
    const m = mesh.current;
    if (!m) return;
    dummy.scale.setScalar(0);
    dummy.updateMatrix();
    for (let i = 0; i < total; i++) m.setMatrixAt(i, dummy.matrix);
    m.instanceMatrix.needsUpdate = true;
  }, [total]);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const v = vh.get();
    const t = reduced ? 0 : state.clock.elapsedTime;
    const portrait = size.width / Math.max(1, size.height) < 0.85;
    const fund = fundPosition(portrait);
    const vanish = 1 - easeIn(seg(v, TIMELINE.problem.coinsVanish));
    const [f0, f1] = TIMELINE.hero.coinsFall;

    for (let i = 0; i < count; i++) {
      // Orbit around the Fund, on a ring tilted toward the camera.
      const ang = (i / count) * Math.PI * 2 + t * 0.15;
      const r = 2.5 + 0.35 * Math.sin(i * 1.7);
      const ly = 0.3 * Math.sin(i * 2.3 + t * 0.5);
      const lx = Math.cos(ang) * r;
      const lz = Math.sin(ang) * r;
      const tilt = 0.35;
      orbit.set(fund.x + lx, fund.y + ly * Math.cos(tilt) - lz * Math.sin(tilt), fund.z + ly * Math.sin(tilt) + lz * Math.cos(tilt));

      // Fall into the hand, staggered.
      const stagger = (i % 16) * 2.2;
      const p = easeInOut(seg(v, [f0 + stagger * 0.5, f1 - 30 + stagger]));
      pile.copy(piles[i]);
      dummy.position.lerpVectors(orbit, pile, p);
      dummy.position.y += Math.sin(Math.PI * p) * 0.7;

      dummy.rotation.set(MathUtils.lerp(Math.PI / 2, 0, p), 0, (1 - p) * (t * 0.8 + i));
      dummy.scale.setScalar(MathUtils.lerp(1, 0.62, p) * vanish);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }

    // One coin per member, passed to the centre in turn.
    const appear = seg(v, [130, 160]);
    for (let j = 0; j < MEMBER_COINS; j++) {
      const q = easeInOut(seg(v, [172 + j * 9, 200 + j * 9]));
      from.copy(MEMBER_HANDS[j]).setY(MEMBER_HANDS[j].y + 0.1);
      pile.set(HAND.x + Math.cos(j) * 0.08, pileTop + 0.02 * j, HAND.z + Math.sin(j) * 0.08);
      dummy.position.lerpVectors(from, pile, q);
      dummy.position.y += Math.sin(Math.PI * q) * 0.9;
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(0.62 * appear * vanish);
      dummy.updateMatrix();
      m.setMatrixAt(count + j, dummy.matrix);
    }

    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, total]} frustumCulled={false}>
      <cylinderGeometry args={[0.17, 0.17, 0.04, 28]} />
      <meshStandardMaterial color="#2775CA" emissive="#0B2A55" emissiveIntensity={0.4} metalness={0.55} roughness={0.32} />
    </instancedMesh>
  );
}
