/** Client-only environment checks. Call from effects or client-only modules. */

/** Same query as the `--k` media query in globals.css. Keep the two in sync. */
export const PORTRAIT_QUERY = '(max-width: 767px), (orientation: portrait) and (max-width: 1024px)';

export const isPortrait = () =>
  typeof window !== 'undefined' && window.matchMedia(PORTRAIT_QUERY).matches;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches;

export function hasWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
