import { Vector3 } from 'three';
import { easeInOut, easeOut, seg, type Range } from '../../motion/timeline';
import { FAST_SCROLL } from '../../motion/tokens';
import { TEDDY } from '../world';
import type { ClipName, ClipRequest } from './types';

// Story direction for the two Teddys (TC / TF rows of motion map v3.1).
// Moods follow the story, never the money: neutral idle wherever money is lost, returned or released.

type Beat = {
  r: Range;
  clip: ClipName;
  mode: 'loop' | 'once' | 'scrub';
  /** For 'once': seconds the clip lasts before `then` takes over. */
  dur?: number;
  then?: ClipName;
  /** Start only after the preloader is done (hero wave). */
  afterReady?: boolean;
};

const TF_BEATS: Beat[] = [
  { r: [-1e6, 30], clip: 'wave', mode: 'once', dur: 2.4, then: 'idle', afterReady: true }, // 01.6
  { r: [30, 100], clip: 'walk', mode: 'scrub' }, // 01.12
  { r: [178, 200], clip: 'give', mode: 'scrub' }, // 02.5
  { r: [330, 380], clip: 'hold', mode: 'loop' }, // receives the coins sent up front (02.14)
  { r: [395, 470], clip: 'think', mode: 'loop' }, // 03.3
  { r: [580, 605], clip: 'headShake', mode: 'once', dur: 1.4, then: 'idle' }, // 03.13
  { r: [605, 640], clip: 'walk', mode: 'scrub' }, // 03.16
  { r: [708, 728], clip: 'give', mode: 'scrub' }, // 04.5
  { r: [830, 900], clip: 'nod', mode: 'once', dur: 0.8, then: 'idle' }, // 04.12, no celebration
  { r: [1785, 1860], clip: 'happy', mode: 'once', dur: 1.8, then: 'idle' }, // 06.12, "VND arrived" only
  { r: [2325, 2430], clip: 'proud', mode: 'once', dur: 2.2, then: 'idle' }, // 09.6
  { r: [2430, 1e6], clip: 'bye', mode: 'once', dur: 2.2, then: 'idle' }, // 09.12
];

const TC_BEATS: Beat[] = [
  { r: [50, 210], clip: 'hold', mode: 'loop' }, // 01.14
  { r: [210, 258], clip: 'catch', mode: 'once', dur: 0.6, then: 'hold' }, // 02.7
  { r: [310, 336], clip: 'give', mode: 'scrub' }, // 02.14
  { r: [470, 478], clip: 'hold', mode: 'loop' },
  { r: [478, 510], clip: 'lock', mode: 'scrub' }, // 03.7
  { r: [575, 605], clip: 'reach', mode: 'once', dur: 1.0, then: 'idle' }, // 03.12
  { r: [605, 640], clip: 'walk', mode: 'scrub' }, // 03.16
  { r: [748, 800], clip: 'approve', mode: 'once', dur: 1.4, then: 'idle' }, // 04.9
];

type Move = [Range, Vector3, Vector3, number, number];
const TF_MOVES: Move[] = [
  [[30, 100], TEDDY.tfHero, TEDDY.tfMark, -0.35, -0.6],
  [[605, 640], TEDDY.tfMark, TEDDY.tfTrack, -0.6, -0.85],
  [[1780, 1780], TEDDY.tfApp, TEDDY.tfApp, 0.3, 0.3],
  [[2280, 2280], TEDDY.tfClose, TEDDY.tfClose, -0.45, -0.45],
];
const TC_MOVES: Move[] = [
  [[0, 0], TEDDY.tcMark, TEDDY.tcMark, 0.6, 0.6],
  [[605, 640], TEDDY.tcMark, TEDDY.tcTrack, 0.6, 0.85],
  [[2280, 2280], TEDDY.tcClose, TEDDY.tcClose, 0.5, 0.5],
];

export type Direction = {
  opacity: number;
  pos: Vector3;
  rotY: number;
  req: ClipRequest;
  /** Whether interaction (cursor, hover, fast scroll, sleepy) may override the clip. */
  free: boolean;
};

function place(moves: Move[], v: number, pos: Vector3) {
  let rot = moves[0][3];
  pos.copy(moves[0][1]);
  for (const [r, a, b, ra, rb] of moves) {
    if (v < r[0]) break;
    const t = easeInOut(seg(v, r));
    pos.copy(a).lerp(b, t);
    rot = ra + (rb - ra) * t;
  }
  return rot;
}

class BeatClock {
  private index = -2;
  private start = 0;
  resolve(beats: Beat[], v: number, now: number, readyAt: number | null): ClipRequest & { free: boolean } {
    const i = beats.findIndex((b) => v >= b.r[0] && v < b.r[1]);
    if (i !== this.index) {
      this.index = i;
      this.start = now;
    }
    if (i < 0) return { clip: 'idle', time: now, free: true };
    const b = beats[i];
    if (b.mode === 'scrub') return { clip: b.clip, time: now, scrub: seg(v, b.r), free: false };
    if (b.mode === 'loop') return { clip: b.clip, time: now - this.start, free: b.clip === 'hold' };
    let start = this.start;
    if (b.afterReady) {
      if (readyAt === null) return { clip: 'idle', time: now, free: false };
      start = Math.max(start, readyAt);
    }
    const t = now - start;
    if (t < (b.dur ?? 1)) return { clip: b.clip, time: t, free: false };
    return { clip: b.then ?? 'idle', time: t - (b.dur ?? 1), free: (b.then ?? 'idle') === 'idle' };
  }
}

export class Director {
  private tfClock = new BeatClock();
  private tcClock = new BeatClock();
  private surprisedUntil = -1;
  readonly tf: Direction = { opacity: 0, pos: new Vector3(), rotY: 0, req: { clip: 'idle', time: 0 }, free: true };
  readonly tc: Direction = { opacity: 0, pos: new Vector3(), rotY: 0, req: { clip: 'idle', time: 0 }, free: true };

  update(
    v: number,
    now: number,
    readyAt: number | null,
    io: { velocity: number; ctaHover: boolean; idleFor: number; lateNight: boolean; present: boolean },
  ) {
    // ---------- Freelancer Teddy ----------
    const tf = this.tf;
    tf.rotY = place(TF_MOVES, v, tf.pos);
    const entry = readyAt === null ? 0 : easeOut(Math.min(1, (now - readyAt) / 0.6));
    let o = 0;
    if (v < 1040) o = entry * (1 - seg(v, [1025, 1040]));
    else if (v >= 1785 && v < 1840) o = seg(v, [1785, 1800]) * (1 - seg(v, [1825, 1840]));
    else if (v >= 2290) o = seg(v, [2290, 2320]);
    tf.opacity = o;
    if (v < 30) tf.pos.y = -0.4 * (1 - entry);
    if (v >= 2280) tf.pos.y = -0.4 * (1 - easeOut(seg(v, [2290, 2320])));

    const r = this.tfClock.resolve(TF_BEATS, v, now, readyAt);
    tf.req = r;
    tf.free = r.free;
    if (r.free && o > 0.5) {
      if (!io.present && Math.abs(io.velocity) > FAST_SCROLL) this.surprisedUntil = now + 0.8;
      if (now < this.surprisedUntil) tf.req = { clip: 'surprised', time: 0.8 - (this.surprisedUntil - now) };
      else if (io.ctaHover) tf.req = { clip: 'curious', time: now };
      else if (!io.present && io.lateNight && io.idleFor > 20) tf.req = { clip: 'sleepy', time: now };
    }

    // ---------- Client Teddy ----------
    const tc = this.tc;
    tc.rotY = place(TC_MOVES, v, tc.pos);
    let oc = 0;
    if (v < 380) {
      const ghost = 1 - 0.85 * seg(v, [258, 290]) + 0.85 * seg(v, [300, 312]); // 02.10, 02.14
      oc = easeOut(seg(v, [50, 100])) * ghost;
      tc.pos.y = -0.6 * (1 - easeOut(seg(v, [50, 100])));
    } else if (v < 1040) oc = 1 - seg(v, [1020, 1040]);
    else if (v >= 2290) {
      oc = seg(v, [2290, 2320]);
      tc.pos.y = -0.4 * (1 - easeOut(seg(v, [2290, 2320])));
    }
    tc.opacity = oc;
    const rc = this.tcClock.resolve(TC_BEATS, v, now, readyAt);
    tc.req = rc;
    tc.free = false;
  }
}
