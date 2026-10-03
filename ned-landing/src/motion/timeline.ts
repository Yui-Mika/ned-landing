// The single source of truth for scroll choreography. Matches motion map v3.1 on the storyboard canvas
// (boards MM-00 … MM-09). Every range is in "story vh": 100 = one viewport height of scroll on desktop.
// On phones the page is shorter (K = 0.75); the conversion lives in useScrollVh, so these numbers never change.
// Row ids in comments (e.g. 02.6) point at the motion map rows.

export type Range = readonly [number, number];

/** Total story length in vh. */
export const TOTAL = 2480;

export const CHAPTER: Record<string, Range> = {
  hero: [0, 120],
  problem: [120, 380],
  idea: [380, 640],
  milestones: [640, 1040],
  twoWays: [1040, 1400],
  app: [1400, 1860],
  role: [1860, 2080],
  real: [2080, 2260],
  close: [2260, 2480],
};

/** The key moment: the coin becomes ₫ before it crosses the border (05.14). */
export const KEY_VH = 1262;

/** Presentation mode (?present=1): PageDown / Space / → jump between these stops. */
export const PRESENT_STOPS = [
  0, 165, 215, 290, 336, 425, 534, 580, 702, 790, 930, 1085, 1140, 1262, 1330, 1480, 1560, 1640, 1720, 1800,
  1945, 2035, 2165, 2220, 2368, 2480,
];

/**
 * prefers-reduced-motion: no scrubbing. The story snaps to the last key state at or before the scroll
 * position, behind a 300 ms dip (motion map "Reduced motion" cells).
 */
export const REDUCED_STATES = [
  0, 165, 215, 290, 336, 430, 480, 556, 640, 702, 790, 950, 1085, 1140, 1300, 1335, 1480, 1560, 1640, 1720,
  1830, 1945, 2035, 2165, 2220, 2368, 2480,
];

export function reducedState(v: number) {
  let s = REDUCED_STATES[0];
  for (const x of REDUCED_STATES) if (x <= v + 0.5) s = x;
  return s;
}

// ---------- helpers ----------

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const seg = (v: number, r: Range) => (r[1] === r[0] ? (v >= r[0] ? 1 : 0) : clamp((v - r[0]) / (r[1] - r[0])));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t: number) => t * t * t;
/** Overshoot, for things that pop into place (gates, partner node). */
export const easeBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
/** 0 → 1 → 0 bell over 0..1. */
export const bell = (t: number) => Math.sin(clamp(t) * Math.PI);
/** 1 inside [a, b], 0 outside, with soft edges of width f. */
export const within = (v: number, r: Range, f = 6) => clamp((v - r[0] + f) / f) * clamp((r[1] + f - v) / f);
/** Fade in over `inR`, fade out over `outR`. */
export const window01 = (v: number, inR: Range, outR: Range) => seg(v, inR) * (1 - seg(v, outR));
/** Split a range into n staggered sub-ranges, each `share` of the length. */
export function stagger(r: Range, i: number, n: number, share = 0.4): Range {
  const len = r[1] - r[0];
  const d = len * share;
  const start = r[0] + (n <= 1 ? 0 : ((len - d) * i) / (n - 1));
  return [start, start + d];
}
