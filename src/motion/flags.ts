import { useSyncExternalStore } from 'react';

/** Client-only environment checks. Call from effects or client-only modules. */

/** Same query as the `--k` media query in globals.css. Keep the two in sync. */
export const PORTRAIT_QUERY = '(max-width: 767px), (orientation: portrait) and (max-width: 1024px)';

export const isPortrait = () =>
  typeof window !== 'undefined' && window.matchMedia(PORTRAIT_QUERY).matches;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * prefers-reduced-motion as a hook that is hydration-safe: `false` while hydrating (matching the server
 * HTML), then the real value. Motion's own useReducedMotion reads the real value on the first client
 * render, which makes reduced-motion visitors hit a hydration mismatch.
 */
export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED_QUERY);
      mq.addEventListener?.('change', onChange);
      return () => mq.removeEventListener?.('change', onChange);
    },
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

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
