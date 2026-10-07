'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { chapterById } from '@/content/chapters';
import { scrollVh } from '@/motion/scroll';
import { text } from '@/motion/tokens';
import { useIsMobile } from '@/motion/reveal';

type Ctx = {
  chapterId: string;
  copyIn: [number, number] | null;
  copyOut: [number, number];
  /** Number of scrub lines in this chapter's copy (chip, each headline line, paragraph, buttons…). */
  lines: number;
  /** Chapter 00 only: elements also play the time-based load reveal. */
  loadReveal: boolean;
  reduced: boolean;
  mobile: boolean;
};

const ChapterCopyContext = createContext<Ctx | null>(null);
export const useChapterCopy = () => useContext(ChapterCopyContext);

type Props = { chapterId: string; lines: number; children: ReactNode; className?: string };

/**
 * Scroll-linked copy for one chapter (SPEC §14.2). Reads `copyIn` / `copyOut` from chapters.ts.
 * Children (SplitText, RevealBlock) call `useScrub(line)` with their line index.
 */
export function ChapterCopy({ chapterId, lines, children, className }: Props) {
  const chapter = chapterById(chapterId);
  const reduced = useReducedMotion() ?? false;
  const mobile = useIsMobile();
  const value = useMemo<Ctx>(
    () => ({
      chapterId,
      copyIn: chapter.copyIn,
      copyOut: chapter.copyOut,
      lines: Math.max(1, lines),
      loadReveal: chapter.copyIn === null,
      reduced,
      mobile,
    }),
    [chapterId, chapter.copyIn, chapter.copyOut, lines, reduced, mobile],
  );
  return (
    <ChapterCopyContext.Provider value={value}>
      <div className={className}>{children}</div>
    </ChapterCopyContext.Provider>
  );
}

/**
 * Per-line window inside a chapter window: lines start `lineStep` vh apart and all last the same,
 * so line 0 starts at the window start and the last line ends at the window end.
 */
function lineWindow([a, b]: [number, number], line: number, lines: number, staggered: boolean): [number, number] {
  const span = b - a;
  const step = staggered && lines > 1 ? Math.min(text.scrub.lineStep, (span * 0.5) / (lines - 1)) : 0;
  const duration = span - step * (lines - 1);
  const start = a + step * Math.min(line, lines - 1);
  return [start, start + duration];
}

export type Scrub = {
  opacity: MotionValue<number>;
  y: MotionValue<number>;
  filter?: MotionValue<string>;
  visibility: MotionValue<string>;
  willChange: MotionValue<string>;
};

/**
 * Scrubbed enter + exit for one line (pure function of scrollVh; reversible; no setState on scroll).
 * Exit: opacity 1 → 0, y 0 → −rise, blur 0 → 6 px (headlines, desktop). Enter is the mirror from +rise.
 * Reduced motion: opacity only, no line offsets.
 */
export function useScrub(line: number, { blur = false }: { blur?: boolean } = {}): Scrub | null {
  const ctx = useChapterCopy();
  // Hooks must run unconditionally; fall back to a window that never triggers when outside ChapterCopy.
  const plain = !ctx || ctx.reduced;
  const lines = ctx?.lines ?? 1;
  const [oa, ob] = lineWindow(ctx?.copyOut ?? [1e9, 1e9 + 1], line, lines, !plain);
  const enter = ctx?.copyIn ? lineWindow(ctx.copyIn, line, lines, !plain) : null;
  const rise = plain ? 0 : ctx!.mobile ? text.scrub.riseMobile : text.scrub.rise;
  const blurPx = blur && !plain && !ctx!.mobile ? text.scrub.blur : 0;

  const input = enter ? [enter[0], enter[1], oa, ob] : [oa, ob];
  const opacity = useTransform(scrollVh, input, enter ? [0, 1, 1, 0] : [1, 0]);
  const y = useTransform(scrollVh, input, enter ? [rise, 0, 0, -rise] : [0, -rise]);
  const blurAmount = useTransform(scrollVh, input, enter ? [blurPx, 0, 0, blurPx] : [0, blurPx]);
  const filter = useTransform(blurAmount, (v) => (v > 0.01 ? `blur(${v.toFixed(2)}px)` : 'none'));
  const visibility = useTransform(opacity, (o): string => (o < 0.01 ? 'hidden' : 'visible'));
  const willChange = useTransform(scrollVh, (vh): string => {
    const moving = (enter && vh > enter[0] && vh < enter[1]) || (vh > oa && vh < ob);
    return moving ? (blurPx ? 'opacity, transform, filter' : 'opacity, transform') : 'auto';
  });

  if (!ctx) return null;
  return { opacity, y, filter: blurPx ? filter : undefined, visibility, willChange };
}
