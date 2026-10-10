'use client';

import { useState } from 'react';
import { motion, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { scrollVh } from '@/motion/scroll';
import { useHydrated } from '@/motion/flags';
import { CH06 } from '@/scene/poses';
import { chapterById } from '@/content/chapters';
import { StaticPhones } from '@/components/StaticPhones';
import { ChapterCopy } from '@/components/text/ChapterCopy';
import { RevealBlock } from '@/components/text/RevealBlock';
import { SplitText } from '@/components/text/SplitText';
import { ContractDetailScreen } from '@/screens/phone/ContractDetailScreen';
import { MilestoneSubmittedScreen } from '@/screens/phone/MilestoneSubmittedScreen';
import { SUBMITTED_FP } from '@/screens/web/WebSubmitScreen';

const ch = chapterById('06');

/** The two T5 Zoom windows (camera track in poses.ts): the form as it is filled, then the submitted result. */
const ZOOMS = [
  CH06.links[0][0] - 6,
  CH06.links[0][0] + 2,
  CH06.checks[3] + 4,
  CH06.submitTap[0] - 6,
  CH06.doneAt + 2,
  CH06.doneAt + 12,
  CH06.laptopOut[0] - 2,
  CH06.laptopOut[1],
];

/**
 * While the camera pushes onto the laptop screen, the rest of it spreads under the copy column. A soft page-colour
 * scrim (landing layer) keeps the copy readable on desktop. Portrait has no zoom (mobile layout pass), so no scrim.
 */
function ZoomScrim() {
  const hydrated = useHydrated();
  const opacity = useTransform(scrollVh, ZOOMS, [0, 1, 1, 0, 0, 1, 1, 0]);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? 'hidden' : 'visible'));
  if (!hydrated) return null;
  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{ opacity, visibility, background: 'linear-gradient(90deg, #06060E 0%, #06060E 78%, rgb(6 6 14 / 0) 100%)' }}
        className="pointer-events-none fixed inset-y-0 left-0 w-[40vw] max-md:hidden portrait:max-lg:hidden"
      />
    </>
  );
}

/**
 * Chapter 06 · Work and submit (1360–1620 vh). The devices live in the 3D stage (poses.ts, CH06: your phone on the
 * locked contract, T9 Owner turn of the laptop, the WebSubmit form filled by scroll with T5 Zoom, wallet panel,
 * Submitted · in review, your phone back on MilestoneSubmitted); this is the copy column, on the left.
 */
export function Ch06Submit({ stills = false }: { stills?: boolean }) {
  const [headlineLines, setHeadlineLines] = useState(1);
  const line = { headline: 0, l1: headlineLines, l2: headlineLines + 1 };
  const pinVh = ch.copyOut[1] - ch.start;

  return (
    <section
      id={`chapter-${ch.id}`}
      aria-labelledby="ch06-title"
      className="relative"
      style={{ height: `calc(var(--k) * ${ch.end - ch.start}vh)` }}
    >
      <div className="pointer-events-none" style={{ height: `calc(var(--k) * ${pinVh}vh + 100svh)` }}>
        <div className="sticky top-0 flex h-svh flex-col items-stretch justify-start gap-8 px-4 pt-20 md:flex-row md:items-center md:justify-start md:px-8 md:pt-0 lg:px-14">
          {!stills && <ZoomScrim />}
          <ChapterCopy chapterId="06" lines={line.l2 + 1} className="pointer-events-auto relative z-10 w-full md:max-w-[30%] md:min-w-[320px]">
            <SplitText
              as="h2"
              id="ch06-title"
              text={copy.submit.headline}
              lineStart={line.headline}
              onLines={setHeadlineLines}
              className="font-display text-[clamp(28px,3.4vw,50px)] leading-[1.04] font-bold tracking-[-0.02em] text-ink"
            />
            <RevealBlock line={line.l1}>
              <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-muted md:mt-6 md:text-[17px]">{copy.submit.l1}</p>
            </RevealBlock>
            <RevealBlock line={line.l2}>
              <p className="mt-2 max-w-[40ch] text-[15px] leading-relaxed text-muted md:text-[17px]">{copy.submit.l2}</p>
            </RevealBlock>
          </ChapterCopy>
          {stills && (
            <div className="flex justify-center md:ml-auto">
              <StaticPhones
                phones={[
                  { screen: <ContractDetailScreen variant="vinhLocked" />, owner: 'you' },
                  { screen: <MilestoneSubmittedScreen fingerprint={SUBMITTED_FP} />, owner: 'you' },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
