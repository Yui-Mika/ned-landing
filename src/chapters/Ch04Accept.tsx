'use client';

import { useState } from 'react';
import { motion, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { scrollVh } from '@/motion/scroll';
import { useHydrated } from '@/motion/flags';
import { chapterById } from '@/content/chapters';
import { Chip } from '@/components/Chip';
import { StaticPhones } from '@/components/StaticPhones';
import { ChapterCopy } from '@/components/text/ChapterCopy';
import { RevealBlock } from '@/components/text/RevealBlock';
import { SplitText } from '@/components/text/SplitText';
import { ContractAcceptScreen } from '@/screens/phone/ContractAcceptScreen';
import { ContractDetailScreen } from '@/screens/phone/ContractDetailScreen';

const ch = chapterById('04');

/** T5 Zoom window on the destination cards (camera track in poses.ts: 976 → 990 … 1030 → 1044). */
const ZOOM: [number, number, number, number] = [976, 990, 1030, 1044];

/**
 * Portrait only: while the camera pushes onto the destination cards, the phone rises under the copy column.
 * A soft page-colour scrim (landing layer, SPEC §16.5) keeps the copy readable over it.
 */
function PortraitScrim() {
  const hydrated = useHydrated();
  const opacity = useTransform(scrollVh, ZOOM, [0, 1, 1, 0]);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? 'hidden' : 'visible'));
  if (!hydrated) return null;
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity, visibility, background: 'linear-gradient(180deg, #06060E 0%, #06060E 78%, rgb(6 6 14 / 0) 100%)' }}
      className="pointer-events-none fixed inset-x-0 top-0 hidden h-[50svh] max-md:block portrait:max-lg:block"
    />
  );
}

/**
 * Chapter 04 · Accept, and choose once (860–1120 vh). The phone and the invite-link chip live in the 3D stage
 * (poses.ts: chip drops into your phone → ContractDetail (new) → tap → ContractAccept, T5 Zoom on the destination
 * cards → slide to accept follows scroll → ContractDetail (accepted)); this is the copy column, on the left.
 */
export function Ch04Accept({ stills = false }: { stills?: boolean }) {
  const [headlineLines, setHeadlineLines] = useState(2);
  const line = { headline: 0, l1: headlineLines, l2: headlineLines + 1, chip: headlineLines + 2 };
  const pinVh = ch.copyOut[1] - ch.start;

  return (
    <section
      id={`chapter-${ch.id}`}
      aria-labelledby="ch04-title"
      className="relative"
      style={{ height: `calc(var(--k) * ${ch.end - ch.start}vh)` }}
    >
      <div className="pointer-events-none" style={{ height: `calc(var(--k) * ${pinVh}vh + 100svh)` }}>
        <div className="sticky top-0 flex h-svh flex-col items-stretch justify-start gap-8 px-4 pt-20 md:flex-row md:items-center md:justify-start md:px-8 md:pt-0 lg:px-14">
          {!stills && <PortraitScrim />}
          <ChapterCopy chapterId="04" lines={line.chip + 1} className="pointer-events-auto relative z-10 w-full md:max-w-[32%] md:min-w-[320px]">
            <SplitText
              as="h2"
              id="ch04-title"
              text={copy.accept.headline}
              lineStart={line.headline}
              onLines={setHeadlineLines}
              className="font-display text-[clamp(26px,3.1vw,46px)] leading-[1.04] font-bold tracking-[-0.02em] text-ink"
            />
            <RevealBlock line={line.l1}>
              <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-muted md:mt-6 md:text-[17px]">{copy.accept.l1}</p>
            </RevealBlock>
            <RevealBlock line={line.l2}>
              <p className="mt-2 max-w-[40ch] text-[15px] leading-relaxed text-muted md:text-[17px]">{copy.accept.l2}</p>
            </RevealBlock>
            <RevealBlock line={line.chip}>
              <Chip tone="amber" className="mt-4 md:mt-5">
                {copy.accept.chip}
              </Chip>
            </RevealBlock>
          </ChapterCopy>
          {stills && (
            <div className="flex justify-center md:ml-auto">
              <StaticPhones
                phones={[
                  { screen: <ContractAcceptScreen />, owner: 'you' },
                  { screen: <ContractDetailScreen state="accepted" />, owner: 'you' },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
