'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useLoadReveal } from '@/motion/reveal';
import { text } from '@/motion/tokens';
import { useChapterCopy, useScrub } from './ChapterCopy';

type Props = {
  children: ReactNode;
  /** Scrub line index inside the surrounding <ChapterCopy> (exit / enter order). */
  line?: number;
  /** Load reveal (chapter 00 only): start offset in ms from the reveal start. */
  delay?: number;
  duration?: number;
  /** Load reveal rise in px. */
  rise?: number;
  className?: string;
  onRevealed?: () => void;
};

/**
 * Fade + rise for paragraphs, chips and buttons (SPEC §14.3).
 * Outer layer: scrubbed by scroll (from ChapterCopy). Inner layer: the one-time load reveal.
 */
export function RevealBlock({ children, line = 0, delay = 0, duration = 500, rise = 12, className, onRevealed }: Props) {
  const ctx = useChapterCopy();
  const scrub = useScrub(line);
  const reveal = ctx?.loadReveal ?? false;
  // Portrait: no step travels more than 12 px (mobile layout pass).
  const travel = ctx?.mobile ? Math.min(rise, text.reveal.riseMobileMax) : rise;
  const controls = useLoadReveal({ enabled: reveal, delay, duration, from: { y: travel }, onDone: onRevealed });

  return (
    <motion.div
      className={className}
      style={scrub ? { opacity: scrub.opacity, y: scrub.y, visibility: scrub.visibility, willChange: scrub.willChange } : undefined}
    >
      {reveal ? (
        <motion.div data-reveal="" animate={controls}>
          {children}
        </motion.div>
      ) : (
        children
      )}
    </motion.div>
  );
}
