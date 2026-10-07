'use client';

import { motion, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { scrollVh } from '@/motion/scroll';
import { useLoadReveal } from '@/motion/reveal';
import { text } from '@/motion/tokens';

/** "SCROLL ↓" cue, start of the page only. Load reveal: fades in last, then pulses slowly. */
export function ScrollCue() {
  const opacity = useTransform(scrollVh, [0, 15], [1, 0]);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? 'hidden' : 'visible'));
  const reveal = useLoadReveal({
    delay: text.reveal.cue.delay,
    duration: text.reveal.cue.duration,
    onDone: () => performance.mark('ned:reveal:end'),
  });
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity, visibility }}
      className="pointer-events-none fixed bottom-6 left-1/2 z-30 hidden -translate-x-1/2 font-mono text-[12px] tracking-[0.2em] text-muted md:block"
    >
      <motion.span data-reveal="" animate={reveal} className="block">
        <span className="cue-pulse block">
          {copy.hero.scrollCue} <span>↓</span>
        </span>
      </motion.span>
    </motion.div>
  );
}
