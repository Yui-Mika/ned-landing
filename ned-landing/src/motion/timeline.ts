// The single source of truth for scroll choreography. Every range is in vh of scroll
// (100 = one viewport height). The DOM reads these through motion values; the 3D scene
// reads the same values inside useFrame. Matches the storyboard's motion map.

export const TIMELINE = {
  hero: {
    range: [0, 120],
    copyOut: [28, 50],
    teddyOut: [24, 44],
    fundDissolve: [50, 92],
    handRise: [50, 100],
    coinsFall: [56, 120],
  },
  problem: {
    range: [120, 400],
    pullBack: [120, 170],
    membersIn: [125, 170],
    line1: [135, 165],
    line2: [178, 208],
    passCoins: [170, 240],
    line3: [246, 272],
    centreFade: [244, 300],
    coinsVanish: [250, 296],
  },
  /** Scroll length covered by this prototype. Chapters 03–08 extend it later. */
  total: 400,
} as const;

/** Presentation mode (?present=1): PageDown / Space jump between these stops (vh). */
export const PRESENT_STOPS = [0, 120, 200, 262, 300, 400];

export type Range = readonly [number, number];

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const seg = (v: number, r: Range) => clamp((v - r[0]) / (r[1] - r[0]));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t: number) => t * t * t;

/** 0 → 1 → 0 window: fades in over the first part of a range, out over the second. */
export const window01 = (v: number, inR: Range, outR: Range) => seg(v, inR) * (1 - seg(v, outR));

/** Current scroll position in vh. */
export const scrollToVh = (y: number) => (y / Math.max(1, window.innerHeight)) * 100;
export const vhToScroll = (vh: number) => (vh / 100) * window.innerHeight;
