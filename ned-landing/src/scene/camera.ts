import { Vector3 } from 'three';
import { easeIn, easeInOut, easeOut, seg, type Range } from '../motion/timeline';

type Pose = { pos: [number, number, number]; tgt: [number, number, number] };
type Ease = (t: number) => number;

const H0: Pose = { pos: [0, 1.6, 9], tgt: [0, 0.9, 0] };
const H1: Pose = { pos: [0, 1.15, 10.5], tgt: [0, 0.75, 0] };
const PROBLEM: Pose = { pos: [0, 1.35, 10.6], tgt: [0, 0.85, 0] };
const SLOT: Pose = { pos: [0, 1.15, 1.5], tgt: [0, 1.1, 0] };
const IDEA0: Pose = { pos: [0, 1.3, 5.5], tgt: [0, 1.0, 0] };
const IDEA1: Pose = { pos: [0, 1.3, 9.8], tgt: [0, 0.95, 0] };
const TRACK: Pose = { pos: [0.85, 3.5, 9.2], tgt: [0.85, 0.6, -0.3] };
const TRUCK: Pose = { pos: [6, 3.5, 9.2], tgt: [6, 0.6, -0.3] };
const FORK0: Pose = { pos: [9, 6.5, 9.5], tgt: [10.2, 0, 0.4] };
const ADDR: Pose = { pos: [8.35, 1.15, 3.1], tgt: [8.15, 0.92, 0.7] };
const BRANCH_A: Pose = { pos: [10.2, 5, 6.5], tgt: [11.5, 0.3, -2.6] };
const BRANCH_B: Pose = { pos: [11.2, 4.2, 10], tgt: [11.8, 0.3, 2.6] };
const KEY: Pose = { pos: [11.4, 3.2, 9.9], tgt: [11.9, 0.4, 2.8] };
const BANK: Pose = { pos: [12.6, 2.6, 8.4], tgt: [13.0, 0.4, 3.0] };
const APP: Pose = { pos: [12.4, 2.2, 9.0], tgt: [12.9, 0.6, 3.0] };
const ROLE: Pose = { pos: [20, 0.7, 9], tgt: [20, 1.3, 0] };
const REAL: Pose = { pos: [20, 11, 0.6], tgt: [20, 0, 0] };

/** Camera moves (CAM rows of motion map v4.1). Between segments the camera holds; 380 is a cut. */
const SEGMENTS: [Range, Pose, Pose, Ease][] = [
  [[20, 90], H0, H1, easeInOut], // 01.10
  [[120, 170], H1, PROBLEM, easeInOut], // 02.1
  [[356, 380], PROBLEM, SLOT, easeIn], // 02.16
  [[380, 410], IDEA0, IDEA1, easeOut], // 03.1 (cut behind the slot glow)
  [[660, 700], IDEA1, TRACK, easeInOut], // 03.19
  [[1145, 1200], TRACK, TRUCK, easeInOut], // 04.26
  [[1200, 1235], TRUCK, FORK0, easeInOut], // 05.1
  [[1238, 1256], FORK0, ADDR, easeInOut], // 05.5 close-up on the TO field
  [[1280, 1305], ADDR, BRANCH_A, easeInOut], // 05.7
  [[1365, 1400], BRANCH_A, BRANCH_B, easeInOut], // 05.11
  [[1425, 1455], BRANCH_B, KEY, easeInOut],
  [[1540, 1580], KEY, BANK, easeInOut], // 05.22
  [[1600, 1630], BANK, APP, easeInOut], // 06.1
  [[2035, 2090], APP, ROLE, easeInOut], // 07.1
  [[2280, 2310], ROLE, REAL, easeInOut], // 08.1
  [[2435, 2520], REAL, H0, easeInOut], // 09.1
];

const a = new Vector3();
const b = new Vector3();

export function cameraAt(v: number, pos: Vector3, tgt: Vector3) {
  let from = SEGMENTS[0][1];
  let to = from;
  let t = 0;
  for (const [r, p0, p1, ease] of SEGMENTS) {
    if (v < r[0]) break;
    from = p0;
    to = p1;
    t = ease(seg(v, r));
  }
  pos.copy(a.fromArray(from.pos).lerp(b.fromArray(to.pos), t));
  tgt.copy(a.fromArray(from.tgt).lerp(b.fromArray(to.tgt), t));
}

/**
 * Lens shift (share of the screen width): pushes the scene right while the copy sits on the left,
 * without changing the perspective. 0 = centred.
 */
const SHIFT: [number, number][] = [
  [0, 0],
  [120, 0],
  [170, 0.2],
  [356, 0.2],
  [380, 0],
  [381, 0.2],
  [660, 0.2],
  [700, 0.15],
  [1160, 0.15],
  [1220, 0.26],
  [1240, 0.26],
  [1256, 0.3],
  [1290, 0.3],
  [1305, 0.26],
  [1400, 0.26],
  [1440, 0.32],
  [1560, 0.32],
  [1600, 0],
];

export function shiftAt(v: number) {
  let prev = SHIFT[0];
  for (const cur of SHIFT) {
    if (v < cur[0]) {
      const t = easeInOut(seg(v, [prev[0], cur[0]]));
      return prev[1] + (cur[1] - prev[1]) * t;
    }
    prev = cur;
  }
  return prev[1];
}
