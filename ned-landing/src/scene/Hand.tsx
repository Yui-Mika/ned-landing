import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import type { Group, MeshStandardMaterial } from 'three';
import type { MotionValue } from 'motion/react';
import { TIMELINE, easeOut, seg } from '../motion/timeline';
import { CENTRE, HAND } from './layout';

type Props = { vh: MotionValue<number> };

/**
 * One outstretched, open hand: where shared money sits today. It rises into frame as the Fund
 * dissolves (50–100 vh) and belongs to the centre figure of chapter 02, fading with it.
 */
export function Hand({ vh }: Props) {
  const group = useRef<Group>(null);
  const mats = useRef<MeshStandardMaterial[]>([]);
  // Fingers point away from the centre figure.
  const yaw = useMemo(() => -Math.atan2(HAND.z - CENTRE.z, HAND.x - CENTRE.x), []);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const v = vh.get();
    const rise = easeOut(seg(v, TIMELINE.hero.handRise));
    const fade = seg(v, TIMELINE.problem.centreFade);
    const o = rise * (1 - fade);
    g.visible = o > 0.001;
    g.position.set(HAND.x, HAND.y - (1 - rise) * 1.6 - fade * 0.3, HAND.z);
    mats.current.forEach((m) => {
      if (m) m.opacity = 0.92 * o;
    });
  });

  const mat = (i: number) => (
    <meshStandardMaterial
      ref={(m) => {
        if (m) mats.current[i] = m;
      }}
      color="#E4DAF5"
      emissive="#5A1D9E"
      emissiveIntensity={0.25}
      roughness={0.6}
      transparent
      opacity={0}
    />
  );

  return (
    <group ref={group} rotation={[0, yaw, 0]}>
      <RoundedBox args={[0.56, 0.1, 0.44]} radius={0.05} smoothness={3} position={[0, -0.05, 0]}>
        {mat(0)}
      </RoundedBox>
      {[-0.15, -0.05, 0.05, 0.15].map((z, i) => (
        <mesh key={z} position={[0.4, -0.02 + (i === 0 || i === 3 ? -0.01 : 0), z]} rotation={[0, 0, Math.PI / 2 - 0.18]}>
          <capsuleGeometry args={[0.05, i === 0 ? 0.16 : 0.22, 4, 10]} />
          {mat(i + 1)}
        </mesh>
      ))}
      <mesh position={[0.02, -0.02, 0.28]} rotation={[0, -0.7, Math.PI / 2 - 0.1]}>
        <capsuleGeometry args={[0.055, 0.16, 4, 10]} />
        {mat(5)}
      </mesh>
    </group>
  );
}
