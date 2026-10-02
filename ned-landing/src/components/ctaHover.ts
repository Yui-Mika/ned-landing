import { useSyncExternalStore } from 'react';

// A tiny shared store: is the pointer over a call to action? Teddy leans toward it.
let hovering = false;
const listeners = new Set<() => void>();

export function setCtaHover(value: boolean) {
  if (hovering === value) return;
  hovering = value;
  listeners.forEach((l) => l());
}

export function useCtaHover() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => hovering,
    () => false,
  );
}

/** Spread onto any CTA element. */
export const ctaHoverProps = {
  onPointerEnter: () => setCtaHover(true),
  onPointerLeave: () => setCtaHover(false),
  onFocus: () => setCtaHover(true),
  onBlur: () => setCtaHover(false),
};
