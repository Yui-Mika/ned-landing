// Motion tokens (motion map v3.1, board "Motion system").

export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
  in: [0.55, 0, 1, 0.45],
  back: [0.34, 1.56, 0.64, 1],
} as const;

export const spring = {
  soft: { type: 'spring', stiffness: 140, damping: 22 },
  snap: { type: 'spring', stiffness: 420, damping: 32 },
  layout: { type: 'spring', stiffness: 260, damping: 32 },
} as const;

/** Seconds of crossfade between Teddy clips. */
export const CLIP_FADE = 0.35;
/** Damping λ for the camera and look-at (higher = snappier). */
export const DAMP = 6;
/** vh of hysteresis before a trigger counts as crossed. */
export const HYST = 2;
/** vh per second that counts as a fast scroll (Teddy looks surprised). */
export const FAST_SCROLL = 260;
