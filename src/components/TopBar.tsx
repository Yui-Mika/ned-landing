'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { chapterAt, chapters } from '@/content/chapters';
import { scrollVh } from '@/motion/scroll';
import { useLoadReveal } from '@/motion/reveal';
import { text } from '@/motion/tokens';
import { LinkMenu } from './LinkMenu';

const STORY_END = chapters[chapters.length - 1].end;

/** Persistent top bar: wordmark · chapter name · "Try the demo ↗". Progress bar along its bottom edge. */
export function TopBar() {
  const [chapter, setChapter] = useState(chapters[0]);
  useMotionValueEvent(scrollVh, 'change', (vh) => {
    const c = chapterAt(vh);
    if (c.id !== chapter.id) setChapter(c);
  });
  const progress = useTransform(scrollVh, [0, STORY_END], [0, 1]);
  // Load reveal step 1: fade in.
  const reveal = useLoadReveal({ delay: text.reveal.topBar.delay, duration: text.reveal.topBar.duration });

  return (
    <motion.header data-top-bar="" data-reveal="" animate={reveal} className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-bg/60 backdrop-blur-md">
      <div className="mx-auto flex h-14 items-center gap-4 px-4 md:px-8">
        {/* TODO(asset): real N.E.D wordmark */}
        <a href="#main" className="font-display text-[20px] font-bold tracking-tight text-ink">
          {copy.site.wordmark}
        </a>
        <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 font-mono text-[12px] tracking-wider text-muted uppercase sm:flex" aria-live="polite">
          <span className="text-accent">{chapter.id}</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={chapter.id}
              className="truncate"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {chapter.name}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="ml-auto sm:ml-0">
          <LinkMenu />
        </div>
      </div>
      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-px w-full origin-left bg-accent"
        style={{ scaleX: progress }}
      />
    </motion.header>
  );
}
