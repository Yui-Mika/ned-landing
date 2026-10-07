'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useLoadReveal } from '@/motion/reveal';
import { text as tokens } from '@/motion/tokens';
import { useChapterCopy, useScrub } from './ChapterCopy';

type Props = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  mode?: 'words';
  id?: string;
  className?: string;
  /** First scrub line index of this text inside <ChapterCopy>; each visual line takes the next index. */
  lineStart?: number;
  /** Reports how many visual lines the text wraps to (re-measured on resize / font load). */
  onLines?: (count: number) => void;
  /** Called when the last word has finished its load reveal. */
  onRevealed?: () => void;
};

/**
 * Word-split text (SPEC §14.3). The parent element carries the full sentence as `aria-label`;
 * word spans are `aria-hidden`, so screen readers read one clean headline.
 * Each word sits in an overflow-hidden mask so it slides up from under its line.
 */
export function SplitText({ text, as: Tag = 'h1', mode = 'words', id, className, lineStart = 0, onLines, onRevealed }: Props) {
  const words = mode === 'words' ? text.split(/\s+/).filter(Boolean) : [text];
  const masks = useRef<(HTMLSpanElement | null)[]>([]);
  // Typed as the heading element; <p> shares every member used here.
  const root = useRef<HTMLHeadingElement>(null);
  const [lineOf, setLineOf] = useState<number[]>(() => words.map(() => 0));

  // Group words into visual lines by their top offset. Runs on layout, resize and font load — never on scroll.
  useLayoutEffect(() => {
    const measure = () => {
      const tops: number[] = [];
      const next = masks.current.map((el) => {
        const top = el?.offsetTop ?? 0;
        let i = tops.findIndex((t) => Math.abs(t - top) < 4);
        if (i < 0) i = tops.push(top) - 1;
        return i;
      });
      setLineOf((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next));
      onLines?.(tops.length);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (root.current) ro.observe(root.current);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <Tag ref={root} id={id} className={className} aria-label={text}>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <Word
            key={`${i}-${w}`}
            ref={(el) => {
              masks.current[i] = el;
            }}
            word={w}
            index={i}
            line={lineStart + (lineOf[i] ?? 0)}
            last={i === words.length - 1}
            onRevealed={i === words.length - 1 ? onRevealed : undefined}
          />
        ))}
      </span>
    </Tag>
  );
}

type WordProps = {
  word: string;
  index: number;
  line: number;
  last: boolean;
  onRevealed?: () => void;
  ref: (el: HTMLSpanElement | null) => void;
};

function Word({ word, index, line, last, onRevealed, ref }: WordProps) {
  const ctx = useChapterCopy();
  const scrub = useScrub(line, { blur: true });
  const h = tokens.reveal.headline;
  const mobile = ctx?.mobile ?? false;
  const controls = useLoadReveal({
    enabled: ctx?.loadReveal ?? false,
    delay: h.delay + index * (mobile ? h.staggerMobile : h.stagger),
    duration: h.duration,
    from: mobile ? { y: h.rise } : { y: h.rise, filter: `blur(${h.blur}px)` },
    onDone: onRevealed,
  });

  return (
    <>
      {/* Mask: padding + negative margin give descenders and blur a little room inside the clip. */}
      <motion.span
        ref={ref}
        className="-mx-[0.06em] -my-[0.12em] inline-block overflow-hidden px-[0.06em] py-[0.12em] align-top"
        style={
          scrub
            ? { opacity: scrub.opacity, y: scrub.y, filter: scrub.filter, visibility: scrub.visibility, willChange: scrub.willChange }
            : undefined
        }
      >
        <motion.span className="inline-block" data-reveal={ctx?.loadReveal ? '' : undefined} animate={controls}>
          {word}
        </motion.span>
      </motion.span>
      {!last && ' '}
    </>
  );
}
