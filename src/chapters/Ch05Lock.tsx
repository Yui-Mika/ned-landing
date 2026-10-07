'use client';

import { useState } from 'react';
import { motion, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { scrollVh } from '@/motion/scroll';
import { useHydrated } from '@/motion/flags';
import { CH05 } from '@/scene/poses';
import { chapterById } from '@/content/chapters';
import { Chip } from '@/components/Chip';
import { StaticPhones } from '@/components/StaticPhones';
import { ChapterCopy } from '@/components/text/ChapterCopy';
import { RevealBlock } from '@/components/text/RevealBlock';
import { SplitText } from '@/components/text/SplitText';
import { ContractLockScreen } from '@/screens/phone/ContractLockScreen';
import { ContractLockedScreen } from '@/screens/phone/ContractLockedScreen';

const ch = chapterById('05');

/**
 * While the camera pushes onto the wallet panel (T5 Zoom, CH05.zoom) the rest of the laptop screen spreads under the
 * copy column. A soft page-colour scrim (landing layer) keeps the copy readable: left on desktop, top on portrait.
 */
function ZoomScrim() {
  const hydrated = useHydrated();
  const opacity = useTransform(scrollVh, CH05.zoom, [0, 1, 1, 0]);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? 'hidden' : 'visible'));
  if (!hydrated) return null;
  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{ opacity, visibility, background: 'linear-gradient(90deg, #06060E 0%, #06060E 78%, rgb(6 6 14 / 0) 100%)' }}
        className="pointer-events-none fixed inset-y-0 left-0 w-[40vw] max-md:hidden portrait:max-lg:hidden"
      />
      <motion.div
        aria-hidden="true"
        style={{ opacity, visibility, background: 'linear-gradient(180deg, #06060E 0%, #06060E 78%, rgb(6 6 14 / 0) 100%)' }}
        className="pointer-events-none fixed inset-x-0 top-0 hidden h-[50svh] max-md:block portrait:max-lg:block"
      />
    </>
  );
}

/**
 * Chapter 05 · Lock (1120–1360 vh). The devices live in the 3D stage (poses.ts, CH05: T2 Flip to the client's phone,
 * the client's computer on the Workspace, T4 Dock into the wallet panel, T5 Zoom, slide to lock, the lock glyph stamp,
 * T4 undock, T2 Flip back to your phone on Locked); this is the copy column, on the left.
 */
export function Ch05Lock({ stills = false }: { stills?: boolean }) {
  const [headlineLines, setHeadlineLines] = useState(2);
  const line = { headline: 0, l1: headlineLines, l2: headlineLines + 1, chip: headlineLines + 2 };
  const pinVh = ch.copyOut[1] - ch.start;

  return (
    <section
      id={`chapter-${ch.id}`}
      aria-labelledby="ch05-title"
      className="relative"
      style={{ height: `calc(var(--k) * ${ch.end - ch.start}vh)` }}
    >
      <div className="pointer-events-none" style={{ height: `calc(var(--k) * ${pinVh}vh + 100svh)` }}>
        <div className="sticky top-0 flex h-svh flex-col items-stretch justify-start gap-8 px-4 pt-20 md:flex-row md:items-center md:justify-start md:px-8 md:pt-0 lg:px-14">
          {!stills && <ZoomScrim />}
          <ChapterCopy chapterId="05" lines={line.chip + 1} className="pointer-events-auto relative z-10 w-full md:max-w-[30%] md:min-w-[320px]">
            <SplitText
              as="h2"
              id="ch05-title"
              text={copy.lock.headline}
              lineStart={line.headline}
              onLines={setHeadlineLines}
              className="font-display text-[clamp(28px,3.4vw,50px)] leading-[1.04] font-bold tracking-[-0.02em] text-ink"
            />
            <RevealBlock line={line.l1}>
              <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-muted md:mt-6 md:text-[17px]">{copy.lock.l1}</p>
            </RevealBlock>
            <RevealBlock line={line.l2}>
              <p className="mt-2 max-w-[40ch] text-[15px] leading-relaxed text-muted md:text-[17px]">{copy.lock.l2}</p>
            </RevealBlock>
            <RevealBlock line={line.chip}>
              <Chip className="mt-4 md:mt-5">{copy.lock.chip}</Chip>
            </RevealBlock>
          </ChapterCopy>
          {stills && (
            <div className="flex justify-center md:ml-auto">
              <StaticPhones
                phones={[
                  { screen: <ContractLockScreen />, owner: 'client' },
                  { screen: <ContractLockedScreen side="freelancerVN" />, owner: 'you' },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
