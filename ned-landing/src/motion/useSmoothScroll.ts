import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { PRESENT, prefersReducedMotion } from './flags';
import { PRESENT_STOPS } from './timeline';
import { scrollToVh, vhToScroll } from './useScrollVh';

let lenisInstance: Lenis | null = null;
let input = { locked: false };

/** Scroll smoothly to a story position; falls back to native scroll. */
export function scrollToVhPosition(vh: number, duration = 1.2) {
  const top = vhToScroll(vh);
  if (lenisInstance) {
    input.locked = true;
    lenisInstance.scrollTo(top, {
      duration,
      easing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      lock: true,
      onComplete: () => {
        input.locked = false;
      },
    });
  } else {
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
}

/**
 * Lenis smooth scroll. It drives the native scroll position, so motion's useScroll stays the single
 * source of truth. Off under prefers-reduced-motion.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1, smoothWheel: true });
    lenisInstance = lenis;
    return () => {
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  // Presentation mode: PageDown / Space / → / ↓ go to the next stop; PageUp / Shift+Space / ← / ↑ back.
  useEffect(() => {
    if (!PRESENT) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      const forward = ['PageDown', 'ArrowDown', 'ArrowRight'].includes(e.key) || (e.key === ' ' && !e.shiftKey);
      const back = ['PageUp', 'ArrowUp', 'ArrowLeft'].includes(e.key) || (e.key === ' ' && e.shiftKey);
      if (!forward && !back) return;
      e.preventDefault();
      if (input.locked) return;
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
