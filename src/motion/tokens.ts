/**
 * Motion tokens. Curves per SPEC §12.6 (replace §5.3's curves): EASE and EASE_OUT only.
 * Springs (drag / flip) and camera damping stay from §5.3.
 */
export const EASE = [0.2, 0, 0, 1] as const;
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const spring = {
  soft: { stiffness: 140, damping: 22 },
  snap: { stiffness: 420, damping: 32 },
};

/** Camera damping λ for THREE.MathUtils.damp. */
export const CAMERA_LAMBDA = 6;

/**
 * Text animation (SPEC §14). Times in ms, distances in px unless noted. Tune the feel here.
 * Reveal timeline for chapter 00 (stays ≤ 1.6 s):
 *   top bar 0 → 400 · chip 100 → 600 · headline words from 200, 60 ms apart, 700 each
 *   · sub 300 after the last word starts · buttons 80 after the sub, 80 apart · scroll cue last.
 */
export const text = {
  reveal: {
    /** Never hold the page longer than this after navigation start (§14.1). */
    maxWaitMs: 1200,
    topBar: { delay: 0, duration: 400 },
    chip: { delay: 100, duration: 500, rise: 12 },
    headline: { delay: 200, duration: 700, stagger: 60, staggerMobile: 40, rise: '0.5em', riseMobile: 12, blur: 8 },
    sub: { after: 300, duration: 600, rise: 16 },
    buttons: { after: 80, duration: 500, stagger: 80, rise: 12 },
    cue: { delay: 1300, duration: 300 },
    /** Portrait: no load-reveal step travels more than this (px). */
    riseMobileMax: 12,
    /** prefers-reduced-motion: every step is a plain opacity fade, all at once. */
    reducedDuration: 200,
  },
  scrub: {
    /** Default enter / exit window length at a chapter's start / end, in vh (§14.2). */
    window: 12,
    /** Lines leave one after another, this many vh apart. */
    lineStep: 3,
    rise: 32,
    /** Portrait: copy crossfades with at most 12 px of travel, never blur (mobile layout pass). */
    riseMobile: 12,
    blur: 6,
  },
};

/**
 * Hero intro: the refraction sweep (SPEC §16). Times in ms from the load-reveal start.
 *   0 copy reveal · 1000 sweep 1 (L → R, 1.8 s) · 2800 phone enters (700 ms) · +300 Teddy + hint · then ping-pong loop.
 */
export const intro = {
  sweepDelay: 1000,
  sweepDuration: 1800,
  /** Fallback: finish the intro this long after the sweep should have ended, even if the band hasn't reported. */
  fallbackGrace: 1500,
  phone: { duration: 700, rise: 24, scaleFrom: 0.96 },
  /** Teddy and the "Drag me" hint follow the phone by this much. */
  companionsDelay: 300,
  /** Reduced motion: the phone fades in, nothing moves. */
  reducedFade: 200,
};

/** The fluted-glass light band (SPEC §16.2). Positions are the band centre in vw. */
export const band = {
  /** Purple only, light → deep, then the page background (no other hue). */
  colors: { light: '#D4B5F7', mid: '#B87AED', deep: '#7B2FBE', deepest: '#2A0B4D', bg: '#06060E' },
  widthVw: 30,
  /** Sweep 1 starts fully off-screen left and ends at the loop's right end. */
  sweepFrom: -25,
  loopFrom: 100,
  loopTo: 0,
  legSeconds: 8,
  legSecondsMobile: 10,
  /** Gentle symmetric ease for the ambient loop. */
  loopEase: [0.45, 0, 0.55, 1] as const,
  ribPx: 48,
  ribPxMobile: 28,
  /** Horizontal shift of the second (refracted) slice in each rib, desktop only. */
  refractShiftPx: 14,
  grainOpacity: 0.05,
  /** Reduced motion / no JS: a still band at the left-centre, low opacity. */
  staticAt: 25,
  staticOpacity: 0.35,
  /** Band fades out with the hero. */
  fadeVh: [60, 140] as const,
  /** Pause the loop past this scroll position. */
  pauseAfterVh: 140,
  /**
   * Contrast guard (SPEC §16.5): band opacity behind the copy (left 45% on desktop, top on portrait).
   * Measured (test 22): at 0.5 the muted sub-paragraph fell to 2.58:1 and the chip to 3.34:1; at 0.3 the
   * sub still hit 4.18:1 at the cap's edge. 0.25 with the cap held to 50% width passes (see README).
   */
  copyCap: 0.25,
};

const cubic = (p1x: number, p1y: number, p2x: number, p2y: number) => {
  // Cubic-bezier easing (same curve as CSS), solved by Newton iterations.
  const bx = (t: number) => 3 * (1 - t) * (1 - t) * t * p1x + 3 * (1 - t) * t * t * p2x + t * t * t;
  const by = (t: number) => 3 * (1 - t) * (1 - t) * t * p1y + 3 * (1 - t) * t * t * p2y + t * t * t;
  const dx = (t: number) =>
    3 * (1 - t) * (1 - t) * p1x + 6 * (1 - t) * t * (p2x - p1x) + 3 * t * t * (1 - p2x);
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= (bx(t) - x) / d;
    }
    return by(Math.min(1, Math.max(0, t)));
  };
};

export const easeFn = {
  linear: (x: number) => x,
  ease: cubic(...EASE),
  easeOut: cubic(...EASE_OUT),
};
export type EaseName = keyof typeof easeFn;
