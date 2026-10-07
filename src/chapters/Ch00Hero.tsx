'use client';

import { motion, useReducedMotion, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { chapters } from '@/content/chapters';
import { scrollToVh, scrollVh } from '@/motion/scroll';
import { ease } from '@/motion/tokens';
import { Chip } from '@/components/Chip';
import { LinkMenu } from '@/components/LinkMenu';

const [hero, next] = chapters;

/** Chapter 00 · Hero (0–140 vh). The phone itself lives in the 3D stage; this is the copy column. */
export function Ch00Hero() {
  const reduced = useReducedMotion() ?? false;
  const opacity = useTransform(scrollVh, [80, 115], [1, 0]);
  const y = useTransform(scrollVh, [80, 115], [0, reduced ? 0 : -40]);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? 'hidden' : 'visible'));

  const enter = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay: 0.15 + i * 0.08, ease: ease.out },
        };

  return (
    <section
      id={`chapter-${hero.id}`}
      aria-labelledby="hero-title"
      className="relative"
      style={{ height: `calc(var(--k) * ${hero.end - hero.start}vh)` }}
    >
      <div className="sticky top-0 flex h-svh items-start px-4 pt-20 md:items-center md:px-8 md:pt-0 lg:px-14">
        <motion.div style={{ opacity, y, visibility }} className="relative z-10 w-full md:max-w-[34%] md:min-w-[400px]">
          <motion.div {...enter(0)}>
            <Chip>{copy.hero.chip}</Chip>
          </motion.div>
          <motion.h1
            id="hero-title"
            {...enter(1)}
            className="mt-4 font-display text-[clamp(30px,4.2vw,60px)] leading-[1.02] font-bold tracking-[-0.02em] text-ink md:mt-6"
          >
            {copy.hero.headline}
          </motion.h1>
          <motion.p
            {...enter(2)}
            className="mt-3 max-w-[46ch] text-[14px] leading-relaxed text-muted md:mt-6 md:text-[17px]"
          >
            {copy.hero.sub}
          </motion.p>
          <motion.div {...enter(3)} className="mt-5 flex flex-wrap items-center gap-3 md:mt-8">
            <LinkMenu variant="hero" align="left" />
            <button
              type="button"
              onClick={() => scrollToVh(next.start, 1.1)}
              className="rounded-full border border-white/15 px-6 py-3 text-[15px] font-medium text-ink transition-colors hover:border-accent/60 hover:bg-accent/10"
            >
              {copy.hero.ctaScroll} <span aria-hidden="true">↓</span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
