import { bell, clamp, lerp } from '../../motion/timeline';
import type { ClipName } from './types';

/**
 * Procedural poses for the block placeholder. Angles in radians.
 * fwd: arm raised forward · out: arm raised sideways · head x = pitch (down +), y = yaw, z = roll.
 */
export type Pose = {
  armL: { fwd: number; out: number };
  armR: { fwd: number; out: number };
  head: { x: number; y: number; z: number };
  legL: number;
  legR: number;
  lift: number;
  lean: number;
  eyes: number;
};

export const blank = (): Pose => ({
  armL: { fwd: 0, out: 0.12 },
  armR: { fwd: 0, out: 0.12 },
  head: { x: 0, y: 0, z: 0 },
  legL: 0,
  legR: 0,
  lift: 0,
  lean: 0,
  eyes: 1,
});

export function mix(a: Pose, b: Pose, t: number, out: Pose): Pose {
  out.armL.fwd = lerp(a.armL.fwd, b.armL.fwd, t);
  out.armL.out = lerp(a.armL.out, b.armL.out, t);
  out.armR.fwd = lerp(a.armR.fwd, b.armR.fwd, t);
  out.armR.out = lerp(a.armR.out, b.armR.out, t);
  out.head.x = lerp(a.head.x, b.head.x, t);
  out.head.y = lerp(a.head.y, b.head.y, t);
  out.head.z = lerp(a.head.z, b.head.z, t);
  out.legL = lerp(a.legL, b.legL, t);
  out.legR = lerp(a.legR, b.legR, t);
  out.lift = lerp(a.lift, b.lift, t);
  out.lean = lerp(a.lean, b.lean, t);
  out.eyes = lerp(a.eyes, b.eyes, t);
  return out;
}

export function copyPose(src: Pose, dst: Pose) {
  return mix(src, src, 0, dst);
}

/** Fill `p` with the pose of `clip` at `time` seconds (or `scrub` 0–1). `still` freezes ambient motion. */
export function poseOf(clip: ClipName, time: number, scrub: number | undefined, still: boolean, p: Pose): Pose {
  const s = scrub ?? 0;
  const amb = still ? 0 : 1;
  const breathe = Math.sin(time * 1.6) * 0.02 * amb;
  Object.assign(p, blank());
  p.armL = { fwd: 0, out: 0.12 };
  p.armR = { fwd: 0, out: 0.12 };
  p.head = { x: breathe, y: 0, z: 0 };

  switch (clip) {
    case 'idle':
      p.armL.out = p.armR.out = 0.12 + breathe;
      break;
    case 'walk': {
      const ph = (scrub !== undefined ? s * 6 : time * 1.4) * Math.PI * 2;
      p.legL = Math.sin(ph) * 0.5;
      p.legR = -Math.sin(ph) * 0.5;
      p.armL.fwd = -Math.sin(ph) * 0.4;
      p.armR.fwd = Math.sin(ph) * 0.4;
      p.lift = Math.abs(Math.sin(ph)) * 0.04;
      break;
    }
    case 'wave':
    case 'bye': {
      const w = still ? 0 : Math.sin(time * 9) * 0.35;
      p.armR.out = 2.5 + w;
      p.armR.fwd = 0.2;
      p.head.z = -0.08;
      if (clip === 'bye') p.head.x = 0.06;
      break;
    }
    case 'give': {
      const reach = s < 0.6 ? s / 0.6 : 1 - (s - 0.6) / 0.4;
      p.armL.fwd = p.armR.fwd = 1.3 * clamp(reach);
      p.armL.out = p.armR.out = 0.1;
      p.lean = 0.12 * clamp(reach);
      break;
    }
    case 'catch':
    case 'hold': {
      const k = clip === 'catch' ? 1.25 - 0.25 * clamp(time / 0.6) : 1.0;
      p.armL.fwd = p.armR.fwd = k;
      p.armL.out = p.armR.out = 0.22;
      break;
    }
    case 'lock':
      p.armL.fwd = p.armR.fwd = 0.9 + 0.5 * bell(s);
      p.lean = 0.16 * bell(s);
      break;
    case 'reach': {
      const k = time < 0.25 ? time / 0.25 : Math.max(0, 1 - (time - 0.25) / 0.5);
      p.armR.fwd = 1.5 * k;
      p.lean = 0.1 * k - (time > 0.25 && time < 0.6 ? 0.08 : 0);
      break;
    }
    case 'think':
      p.armR.fwd = 1.9;
      p.armR.out = -0.35;
      p.head.x = -0.1;
      p.head.y = 0.2;
      p.head.z = 0.12;
      break;
    case 'headShake': {
      const decay = Math.max(0, 1 - time / 1.4);
      p.head.y = still ? 0 : Math.sin(time * 14) * 0.38 * decay;
      break;
    }
    case 'approve':
      p.head.x = 0.25 * bell(clamp(time / 0.6));
      p.armR.out = 2.4;
      p.armR.fwd = 0.5;
      break;
    case 'nod':
      p.head.x = 0.22 * bell(clamp(time / 0.7));
      break;
    case 'proud':
      p.armL.out = p.armR.out = 0.7;
      p.armL.fwd = p.armR.fwd = -0.25;
      p.head.x = -0.12;
      p.lift = 0.02;
      break;
    case 'happy': {
      const w = still ? 0 : Math.sin(time * 6) * 0.12;
      p.armL.out = p.armR.out = 2.6 + w;
      p.lift = still ? 0 : Math.abs(Math.sin(time * 6)) * 0.12;
      break;
    }
    case 'curious':
      p.lean = 0.12;
      p.head.z = 0.2;
      p.head.x = 0.1;
      p.armR.fwd = 0.6;
      break;
    case 'surprised':
      p.armL.out = p.armR.out = 1.2;
      p.armL.fwd = p.armR.fwd = 0.8;
      p.lift = 0.1 * bell(clamp(time / 0.8));
      p.eyes = 1.4;
      break;
    case 'sleepy':
      p.head.x = 0.35 + Math.sin(time * 0.8) * 0.03 * amb;
      p.armL.out = p.armR.out = 0.05;
      p.eyes = 0.1;
      break;
  }
  return p;
}
