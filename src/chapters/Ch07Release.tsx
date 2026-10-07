'use client';

import { useState } from 'react';
import { motion, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { scrollVh } from '@/motion/scroll';
import { useHydrated } from '@/motion/flags';
import { CH07 } from '@/scene/poses';
import { chapterById } from '@/content/chapters';
import { StaticPhones } from '@/components/StaticPhones';
import { ChapterCopy } from '@/components/text/ChapterCopy';
import { RevealBlock } from '@/components/text/RevealBlock';
import { SplitText } from '@/components/text/SplitText';
import { MilestoneReleasedScreen } from '@/screens/phone/MilestoneReleasedScreen';

const ch = chapterById('07');
const b = copy.release;

/** The VND block (landing layer, SPEC row 07): amount, "example, estimated · milestone 1, 250 USDC", small line. */
function BlockText({ align = 'center' }: { align?: 'center' | 'left' }) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      <p className="font-display text-[30px] leading-[1.1] font-bold text-vnd md:text-[40px]">{b.block.amount}</p>
      <p className="mt-1 font-mono text-[13px] text-ink md:text-[14px]">{b.block.meta}</p>
      <p className="mt-2 text-[13px] text-muted">{b.small}</p>
    </div>
  );
}

/** Under the T3 Split, held through the climax; opacity scrubbed by scroll (CH07.block). */
function ClimaxBlock() {
  const opacity = useTransform(scrollVh, CH07.block, [0, 1, 1, 0]);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? 'hidden' : 'visible'));
  return (
    <motion.div
      data-release-block=""
      style={{ opacity, visibility }}
      className="pointer-events-none fixed bottom-[3svh] left-[66.7vw] z-10 -translate-x-1/2 whitespace-nowrap portrait:max-lg:top-[37svh] portrait:max-lg:bottom-auto portrait:max-lg:left-1/2"
    >
      <BlockText />
    </motion.div>
  );
}

/**
 * Chapter 07 · Review and release (1620–1900 vh), the key moment. The phones and the amount chip live in the 3D stage
 * (poses.ts, CH07: T2 Flip to the client's phone on MilestoneReview, T5 Zoom on "Slide to release", MilestoneReleased,
 * T3 Split with your phone on MilestoneReleasedVN, the amount chip across the seam); this is the copy column, on the
 * left, plus the VND block under the split. Without JS or WebGL the block sits in the copy column.
 */
export function Ch07Release({ stills = false }: { stills?: boolean }) {
  const hydrated = useHydrated();
  const [headlineLines, setHeadlineLines] = useState(2);
  const line = { headline: 0, l1: headlineLines, l2: headlineLines + 1, block: headlineLines + 2 };
  const staticBlock = stills || !hydrated;
  const pinVh = ch.copyOut[1] - ch.start;

  return (
    <section
      id={`chapter-${ch.id}`}
      aria-labelledby="ch07-title"
      className="relative"
      style={{ height: `calc(var(--k) * ${ch.end - ch.start}vh)` }}
    >
      <div className="pointer-events-none" style={{ height: `calc(var(--k) * ${pinVh}vh + 100svh)` }}>
        <div className="sticky top-0 flex h-svh flex-col items-stretch justify-start gap-8 px-4 pt-20 md:flex-row md:items-center md:justify-start md:px-8 md:pt-0 lg:px-14">
          <ChapterCopy chapterId="07" lines={staticBlock ? line.block + 1 : line.l2 + 1} className="pointer-events-auto relative z-10 w-full md:max-w-[30%] md:min-w-[320px]">
            <SplitText
              as="h2"
              id="ch07-title"
              text={b.headline}
              lineStart={line.headline}
              onLines={setHeadlineLines}
              className="font-display text-[clamp(28px,3.4vw,50px)] leading-[1.04] font-bold tracking-[-0.02em] text-ink"
            />
            <RevealBlock line={line.l1}>
              <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-muted md:mt-6 md:text-[17px]">{b.l1}</p>
            </RevealBlock>
            <RevealBlock line={line.l2}>
              <p className="mt-2 max-w-[40ch] text-[15px] leading-relaxed text-muted md:text-[17px]">{b.l2}</p>
            </RevealBlock>
            {staticBlock && (
              <RevealBlock line={line.block}>
                <div className="mt-5">
                  <BlockText align="left" />
                </div>
              </RevealBlock>
            )}
          </ChapterCopy>
          {stills && (
            <div className="flex justify-center md:ml-auto">
              <StaticPhones
                phones={[
                  { screen: <MilestoneReleasedScreen variant="client" />, owner: 'client' },
                  { screen: <MilestoneReleasedScreen variant="freelancerVN" />, owner: 'you' },
                ]}
              />
            </div>
          )}
        </div>
      </div>
      {!staticBlock && <ClimaxBlock />}
    </section>
  );
}
