/** Motion tokens (SPEC §5.3). */
export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const spring = {
  soft: { stiffness: 140, damping: 22 },
  snap: { stiffness: 420, damping: 32 },
};

/** Camera damping λ for THREE.MathUtils.damp. */
export const CAMERA_LAMBDA = 6;

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
  out: cubic(...ease.out),
  inOut: cubic(...ease.inOut),
};
export type EaseName = keyof typeof easeFn;
