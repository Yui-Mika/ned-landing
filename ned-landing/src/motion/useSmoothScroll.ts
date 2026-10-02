import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { PRESENT, prefersReducedMotion } from './flags';
import { PRESENT_STOPS, scrollToVh, vhToScroll } from './timeline';

let lenisInstance: Lenis | null = null;

/** Scroll smoothly to a position in vh; falls back to native scroll. */
export function scrollToVhPosition(vh: number) {
  const top = vhToScroll(vh);
  if (lenisInstance) lenisInstance.scrollTo(top, { duration: 0.9 });
  else window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

/**
 * Lenis smooth scroll. It drives the native scroll position, so motion's useScroll
 * keeps working as the single source of truth. Off under prefers-reduced-motion.
 */
export function useSmoothScroll() {
  const ref = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.12, smoothWheel: true });
    ref.current = lenis;
    lenisInstance = lenis;
    return () => {
      lenis.destroy();
      ref.current = null;
      lenisInstance = null;
    };
  }, []);

  // Presentation mode: PageDown / Space / ArrowDown go to the next stop, PageUp / Shift+Space back.
  useEffect(() => {
    if (!PRESENT) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(target.tagName)) return;
      const forward = e.key === 'PageDown' || e.key === 'ArrowDown' || (e.key === ' ' && !e.shiftKey);
      const back = e.key === 'PageUp' || e.key === 'ArrowUp' || (e.key === ' ' && e.shiftKey);
      if (!forward && !back) return;
      e.preventDefault();
      const now = scrollToVh(window.scrollY);
      const next = forward
        ? PRESENT_STOPS.find((s) => s > now + 2)
        : [...PRESENT_STOPS].reverse().find((s) => s < now - 2);
      if (next !== undefined) scrollToVhPosition(next);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
