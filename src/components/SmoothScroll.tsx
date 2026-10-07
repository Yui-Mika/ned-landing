'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { prefersReducedMotion } from '@/motion/flags';
import { setLenis, syncScrollVh } from '@/motion/scroll';

/**
 * Lenis drives the native scroll position, so `window.scrollY` stays the single source
 * and `scrollVh` follows it. Off under prefers-reduced-motion (native scroll only).
 */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = prefersReducedMotion() ? null : new Lenis({ autoRaf: true, lerp: 0.12, smoothWheel: true });
    setLenis(lenis);

    syncScrollVh();
    window.addEventListener('scroll', syncScrollVh, { passive: true });
    window.addEventListener('resize', syncScrollVh);
    return () => {
      window.removeEventListener('scroll', syncScrollVh);
      window.removeEventListener('resize', syncScrollVh);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
