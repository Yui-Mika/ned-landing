'use client';

import { motion, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { scrollVh } from '@/motion/scroll';

/** "SCROLL ↓" cue, start of the page only. */
export function ScrollCue() {
  const opacity = useTransform(scrollVh, [0, 15], [1, 0]);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? 'hidden' : 'visible'));
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity, visibility }}
      className="pointer-events-none fixed bottom-6 left-1/2 z-30 hidden -translate-x-1/2 font-mono md:block text-[12px] tracking-[0.2em] text-muted"
    >
      {copy.hero.scrollCue} <span className="inline-block motion-safe:animate-bounce">↓</span>
    </motion.div>
  );
}
