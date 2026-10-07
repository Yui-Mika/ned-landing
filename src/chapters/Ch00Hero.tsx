'use client';

import { useState } from 'react';
import { copy } from '@/content/copy';
import { chapterById, chapters } from '@/content/chapters';
import { scrollToVh } from '@/motion/scroll';
import { text } from '@/motion/tokens';
import { useIsMobile } from '@/motion/reveal';
import { Chip } from '@/components/Chip';
import { LinkMenu } from '@/components/LinkMenu';
import { ChapterCopy } from '@/components/text/ChapterCopy';
import { RevealBlock } from '@/components/text/RevealBlock';
import { SplitText } from '@/components/text/SplitText';

const hero = chapterById('00');
const next = chapters[1];
const r = text.reveal;
const headlineWords = copy.hero.headline.split(/\s+/).length;

/** Chapter 00 · Hero (0–140 vh). The phone lives in the 3D stage; this is the copy column. */
export function Ch00Hero() {
  const mobile = useIsMobile();
  // Scrub lines, top to bottom: chip · headline lines · sub · buttons.
  const [headlineLines, setHeadlineLines] = useState(3);
  const line = { chip: 0, headline: 1, sub: 1 + headlineLines, buttons: 2 + headlineLines };

  // Load reveal timeline (§14.1), all from tokens.
  const lastWordStart = r.headline.delay + (headlineWords - 1) * (mobile ? r.headline.staggerMobile : r.headline.stagger);
  const subStart = lastWordStart + r.sub.after;
  const buttonsStart = subStart + r.buttons.after;
  // The copy stays pinned until its exit window ends, then the section scrolls on.
  const pinVh = hero.copyOut[1] - hero.start;

  return (
    <section
      id={`chapter-${hero.id}`}
      aria-labelledby="hero-title"
      className="relative"
      style={{ height: `calc(var(--k) * ${hero.end - hero.start}vh)` }}
    >
      <div style={{ height: `calc(var(--k) * ${pinVh}vh + 100svh)` }}>
        <div className="sticky top-0 flex h-svh items-start px-4 pt-20 md:items-center md:px-8 md:pt-0 lg:px-14">
          <ChapterCopy chapterId="00" lines={line.buttons + 1} className="relative z-10 w-full md:max-w-[34%] md:min-w-[400px]">
            <RevealBlock line={line.chip} delay={r.chip.delay} duration={r.chip.duration} rise={r.chip.rise}>
              <Chip>{copy.hero.chip}</Chip>
            </RevealBlock>

            <SplitText
              as="h1"
              id="hero-title"
              text={copy.hero.headline}
              lineStart={line.headline}
              onLines={setHeadlineLines}
              onRevealed={() => performance.mark('ned:reveal:headline')}
              className="mt-4 font-display text-[clamp(30px,4.2vw,60px)] leading-[1.02] font-bold tracking-[-0.02em] text-ink md:mt-6"
            />

            <RevealBlock line={line.sub} delay={subStart} duration={r.sub.duration} rise={r.sub.rise}>
              <p className="mt-3 max-w-[46ch] text-[14px] leading-relaxed text-muted md:mt-6 md:text-[17px]">{copy.hero.sub}</p>
            </RevealBlock>

            <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-8">
              {/* z-10 keeps the open product menu above the next button's transformed layer. */}
              <RevealBlock line={line.buttons} delay={buttonsStart} duration={r.buttons.duration} rise={r.buttons.rise} className="relative z-10">
                <LinkMenu variant="hero" align="left" />
              </RevealBlock>
              <RevealBlock
                line={line.buttons}
                delay={buttonsStart + r.buttons.stagger}
                duration={r.buttons.duration}
                rise={r.buttons.rise}
              >
                <button
                  type="button"
                  onClick={() => scrollToVh(next.start, 1.1)}
                  className="rounded-full border border-white/15 px-6 py-3 text-[15px] font-medium text-ink transition-colors hover:border-accent/60 hover:bg-accent/10"
                >
                  {copy.hero.ctaScroll} <span aria-hidden="true">↓</span>
                </button>
              </RevealBlock>
            </div>
          </ChapterCopy>
        </div>
      </div>
    </section>
  );
}
