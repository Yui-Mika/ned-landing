// Environment flags read once at start-up.

const params = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);

/** ?present=1 — projector mode: brighter, larger type, keyboard stops, no cursor-follow or idle sleepy. */
export const PRESENT = params.get('present') === '1';

/** ?debug=1 — shows the current story vh and chapter in a corner. */
export const DEBUG = params.get('debug') === '1';

export const IS_TOUCH = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isPhone() {
  return typeof window !== 'undefined' && Math.min(window.innerWidth, window.innerHeight) < 600;
}

/** Phones get a shorter page: every vh range is multiplied by K (motion map: K = 0.75). */
export const K = isPhone() ? 0.75 : 1;

export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
