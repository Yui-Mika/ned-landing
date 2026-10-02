import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import type { MotionValue } from 'motion/react';
import { easeInOut, seg } from '../motion/timeline';

type Key = { v: number; pos: [number, number, number]; target: [number, number, number] };

// Camera keyframes in vh. Eased tweens between keys (motion principles: eased tweens for camera).
const KEYS: Key[] = [
  { v: 0, pos: [0, 0.2, 10], target: [0, 0, 0] },
  { v: 50, pos: [0, -0.2, 9.4], target: [0.4, -0.4, 0] },
  { v: 120, pos: [1.6, -4.9, 5.0], target: [0.78, -6.8, 0.78] }, // close on the hand
  { v: 170, pos: [0, -2.6, 12.5], target: [0, -7.3, 0] }, // pull back: members appear
  { v: 300, pos: [0.6, -3.0, 11.6], target: [0, -7.5, 0] }, // slow drift
  { v: 400, pos: [0, -3.4, 10.5], target: [0, -7.6, 0] },
];

// Reduced motion: no camera travel; one still view per chapter.
const STILL_HERO = KEYS[0];
const STILL_PROBLEM = KEYS[3];

const a = new Vector3();
const b = new Vector3();
const pos = new Vector3();
const target = new Vector3();
const lookTarget = new Vector3();

function sample(v: number, out: Vector3, outTarget: Vector3) {
  if (v <= KEYS[0].v) {
    out.fromArray(KEYS[0].pos);
    outTarget.fromArray(KEYS[0].target);
    return;
  }
  for (let i = 0; i < KEYS.length - 1; i++) {
    const k0 = KEYS[i];
    const k1 = KEYS[i + 1];
    if (v <= k1.v) {
      const t = easeInOut(seg(v, [k0.v, k1.v]));
      out.lerpVectors(a.fromArray(k0.pos), b.fromArray(k1.pos), t);
      outTarget.lerpVectors(a.fromArray(k0.target), b.fromArray(k1.target), t);
      return;
    }
  }
  const last = KEYS[KEYS.length - 1];
  out.fromArray(last.pos);
  outTarget.fromArray(last.target);
}

type Props = { vh: MotionValue<number>; reduced: boolean; parallax: boolean };

export function CameraRig({ vh, reduced, parallax }: Props) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const offset = useRef({ x: 0, y: 0 });

  useFrame((state, dt) => {
    const v = vh.get();
    if (reduced) {
      const k = v < 120 ? STILL_HERO : STILL_PROBLEM;
      pos.fromArray(k.pos);
      target.fromArray(k.target);
    } else {
      sample(v, pos, target);
    }

    // Portrait screens: step back so the Fund and the ring of members fit the width.
    const aspect = size.width / Math.max(1, size.height);
    if (aspect < 0.85) {
      const back = MathUtils.lerp(1.55, 1.0, MathUtils.clamp((aspect - 0.45) / 0.4, 0, 1));
      pos.sub(target).multiplyScalar(back).add(target);
    }

    // Cursor parallax, hero only (±3°-ish), damped.
    const weight = parallax && !reduced ? 1 - seg(v, [0, 50]) : 0;
    offset.current.x = MathUtils.damp(offset.current.x, state.pointer.x * 0.45 * weight, 4, dt);
    offset.current.y = MathUtils.damp(offset.current.y, state.pointer.y * 0.3 * weight, 4, dt);
    pos.x += offset.current.x;
    pos.y += offset.current.y;

    camera.position.copy(pos);
    lookTarget.copy(target);
    camera.lookAt(lookTarget);
  });

  return null;
}
