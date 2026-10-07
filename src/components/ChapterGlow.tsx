'use client';

import { motion, useTransform } from 'motion/react';
import { chapterById } from '@/content/chapters';
import { scrollVh } from '@/motion/scroll';

type Props = {
  chapterId: string;
  /** Glow centre, in % of the viewport. */
  at?: [number, number];
  /** Peak alpha of the purple at the centre. Keep it faint. */
  strength?: number;
};

/** Fade in / out over this many vh at the chapter's edges. */
const EDGE = 14;

/**
 * Chapter background: the plain page colour with a very faint purple glow (landing layer only).
 * Fixed behind the 3D canvas; its opacity is scrubbed by scroll. Decorative.
 */
export function ChapterGlow({ chapterId, at = [32, 55], strength = 0.14 }: Props) {
  const c = chapterById(chapterId);
  const opacity = useTransform(scrollVh, [c.start - EDGE, c.start + EDGE, c.end - EDGE, c.end], [0, 1, 1, 0]);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? 'hidden' : 'visible'));
  return (
    <motion.div
      aria-hidden="true"
      data-chapter-glow={chapterId}
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        opacity,
        visibility,
        background: `radial-gradient(60% 55% at ${at[0]}% ${at[1]}%, rgb(123 47 190 / ${strength}), rgb(123 47 190 / 0) 70%)`,
      }}
    />
  );
}
