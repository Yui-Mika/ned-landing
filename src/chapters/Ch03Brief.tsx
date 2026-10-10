'use client';

import { useState } from 'react';
import { motion, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { chapterById } from '@/content/chapters';
import { scrollVh } from '@/motion/scroll';
import { useHydrated } from '@/motion/flags';
import { useIsMobile } from '@/motion/reveal';
import { stageZone } from '@/scene/zone';
import { StaticPhones } from '@/components/StaticPhones';
import { ChapterCopy } from '@/components/text/ChapterCopy';
import { RevealBlock } from '@/components/text/RevealBlock';
import { SplitText } from '@/components/text/SplitText';
import { ContractNew1Screen, ContractNew2Screen, ContractNew3Screen } from '@/screens/phone/ContractNewScreens';

const ch = chapterById('03');

/** T6 Fan caption window (vh): in while the three phones are fanned out (poses.ts t6Fan: 828 → 840 → 848 → 860). */
const CAPTION: [number, number, number, number] = [832, 840, 848, 856];

/** "Prefer the phone? Same three steps." under the fan (landing layer), opacity scrubbed by scroll. */
function FanCaption() {
  const hydrated = useHydrated();
  const mobile = useIsMobile();
  // Portrait: inside the caption row's window (scene/zone.ts), around the carousel.
  const opacity = useTransform(scrollVh, mobile ? [832, 838, 854, 860] : CAPTION, [0, 1, 1, 0]);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? 'hidden' : 'visible'));
  // Portrait: its own row in the stage zone, under the invite chip's row and above the carousel (scene/zone.ts).
  const top = useTransform(scrollVh, (vh) => {
    const z = stageZone(vh);
    return z.rows.top + z.rows.chip;
  });
  if (!hydrated) return null;
  return (
    <motion.p
      data-fan-caption=""
      style={mobile ? { opacity, visibility, top, bottom: 'auto', left: '50%' } : { opacity, visibility }}
      className="pointer-events-none fixed bottom-[2svh] left-1/2 z-10 -translate-x-1/2 text-center font-display text-[18px] font-bold text-ink md:bottom-[2.5svh] md:left-[65vw] md:text-[22px] portrait:max-lg:bottom-auto portrait:max-lg:left-1/2 portrait:max-lg:top-[40svh] portrait:max-lg:text-[16px] whitespace-nowrap"
    >
      {copy.brief.fanCaption}
    </motion.p>
  );
}

/**
 * Chapter 03 · The brief (560–860 vh). The laptop, phones and chip live in the 3D stage (poses.ts: laptop slides
 * in, lid opens, the brief is filled, T5 Zoom on "Done when", Create → wallet panel, T8 Lift-off of the invite
 * link, T6 Fan of the phone steps); this is the copy column, on the left. Scrubbed enter / exit, no load reveal.
 */
export function Ch03Brief({ stills = false }: { stills?: boolean }) {
  const [headlineLines, setHeadlineLines] = useState(1);
  const line = { headline: 0, l1: headlineLines, l2: headlineLines + 1, small: headlineLines + 2 };
  const pinVh = ch.copyOut[1] - ch.start;

  return (
    <section
      id={`chapter-${ch.id}`}
      aria-labelledby="ch03-title"
      className="relative"
      style={{ height: `calc(var(--k) * ${ch.end - ch.start}vh)` }}
    >
      <div className="pointer-events-none" style={{ height: `calc(var(--k) * ${pinVh}vh + 100svh)` }}>
        <div className="sticky top-0 flex h-svh flex-col items-stretch justify-start gap-8 px-4 pt-20 md:flex-row md:items-center md:justify-start md:px-8 md:pt-0 lg:px-14">
          <ChapterCopy chapterId="03" lines={line.small + 1} className="pointer-events-auto relative z-10 w-full md:max-w-[30%] md:min-w-[320px]">
            <SplitText
              as="h2"
              id="ch03-title"
              text={copy.brief.headline}
              lineStart={line.headline}
              onLines={setHeadlineLines}
              className="font-display text-[clamp(28px,3.4vw,50px)] leading-[1.04] font-bold tracking-[-0.02em] text-ink"
            />
            <RevealBlock line={line.l1}>
              <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-muted md:mt-6 md:text-[17px]">{copy.brief.l1}</p>
            </RevealBlock>
            <RevealBlock line={line.l2}>
              <p className="mt-2 max-w-[40ch] text-[15px] leading-relaxed text-muted md:text-[17px]">{copy.brief.l2}</p>
            </RevealBlock>
            <RevealBlock line={line.small}>
              <p className="mt-3 max-w-[44ch] text-[13px] text-muted md:mt-4">{copy.brief.small}</p>
            </RevealBlock>
          </ChapterCopy>
          {stills && (
            <div className="flex flex-col items-center gap-3 md:ml-auto">
              <StaticPhones
                phones={[
                  { screen: <ContractNew1Screen />, owner: 'client' },
                  { screen: <ContractNew2Screen />, owner: 'client' },
                  { screen: <ContractNew3Screen />, owner: 'client' },
                ]}
                scale={0.3}
              />
              <p className="text-center font-display text-[18px] font-bold text-ink">{copy.brief.fanCaption}</p>
            </div>
          )}
        </div>
      </div>
      {!stills && <FanCaption />}
    </section>
  );
}
