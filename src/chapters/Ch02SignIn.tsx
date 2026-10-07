'use client';

import { useState } from 'react';
import { copy } from '@/content/copy';
import { chapterById } from '@/content/chapters';
import { StaticPhones } from '@/components/StaticPhones';
import { ChapterCopy } from '@/components/text/ChapterCopy';
import { RevealBlock } from '@/components/text/RevealBlock';
import { SplitText } from '@/components/text/SplitText';
import { OnbResidenceScreen } from '@/screens/phone/OnbResidenceScreen';
import { HomeVNScreen } from '@/screens/phone/HomeScreen';

const ch = chapterById('02');

/**
 * Chapter 02 · Sign in, say where you live (360–560 vh). The phone lives in the 3D stage (poses.ts: Welcome →
 * tap → Setup → Residence → Home, then T2 Flip to the client's Home, parked right); this is the copy column, on
 * the left. Copy enters and exits scrubbed by scroll (§14.2); no load reveal.
 */
export function Ch02SignIn({ stills = false }: { stills?: boolean }) {
  // Scrub lines, top to bottom: headline lines · line 1 · line 2 · small.
  const [headlineLines, setHeadlineLines] = useState(2);
  const line = { headline: 0, l1: headlineLines, l2: headlineLines + 1, small: headlineLines + 2 };
  const pinVh = ch.copyOut[1] - ch.start;

  return (
    <section
      id={`chapter-${ch.id}`}
      aria-labelledby="ch02-title"
      className="relative"
      style={{ height: `calc(var(--k) * ${ch.end - ch.start}vh)` }}
    >
      <div className="pointer-events-none" style={{ height: `calc(var(--k) * ${pinVh}vh + 100svh)` }}>
        <div className="sticky top-0 flex h-svh flex-col items-stretch justify-start gap-8 px-4 pt-20 md:flex-row md:items-center md:justify-start md:px-8 md:pt-0 lg:px-14">
          <ChapterCopy chapterId="02" lines={line.small + 1} className="pointer-events-auto relative z-10 w-full md:max-w-[34%] md:min-w-[340px]">
            <SplitText
              as="h2"
              id="ch02-title"
              text={copy.signIn.headline}
              lineStart={line.headline}
              onLines={setHeadlineLines}
              className="font-display text-[clamp(28px,3.4vw,50px)] leading-[1.04] font-bold tracking-[-0.02em] text-ink"
            />
            <RevealBlock line={line.l1}>
              <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-muted md:mt-6 md:text-[17px]">{copy.signIn.l1}</p>
            </RevealBlock>
            <RevealBlock line={line.l2}>
              <p className="mt-2 max-w-[40ch] text-[15px] leading-relaxed text-muted md:text-[17px]">{copy.signIn.l2}</p>
            </RevealBlock>
            <RevealBlock line={line.small}>
              <p className="mt-3 text-[13px] text-muted md:mt-4">{copy.signIn.small}</p>
            </RevealBlock>
          </ChapterCopy>
          {stills && (
            <div className="flex justify-center md:ml-auto">
              <StaticPhones
                phones={[
                  { screen: <OnbResidenceScreen />, owner: 'you' },
                  { screen: <HomeVNScreen />, owner: 'you' },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
