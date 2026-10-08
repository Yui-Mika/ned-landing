'use client';

import { useState } from 'react';
import { copy } from '@/content/copy';
import { chapterById } from '@/content/chapters';
import { StaticPhones } from '@/components/StaticPhones';
import { ChapterCopy } from '@/components/text/ChapterCopy';
import { RevealBlock } from '@/components/text/RevealBlock';
import { SplitText } from '@/components/text/SplitText';
import { HomeIntlReleasedScreen, HomeVNReleasedScreen } from '@/screens/phone/HomeScreen';

const ch = chapterById('09');
const r = copy.receive;

/**
 * Chapter 09 · Two ways to receive (SPEC §6 row 09). The T3 Split lives in the 3D stage (poses.ts, CH09): left "Your
 * phone · Vietnam" on HomeVN (released), right "Your phone · abroad" on HomeIntl (released); the ₫ / $ tints behind
 * them are CurrencyTints (page level, behind the canvas). This is the copy column, on the left.
 */
export function Ch09Receive({ stills = false }: { stills?: boolean }) {
  const [headlineLines, setHeadlineLines] = useState(2);
  const line = { headline: 0, small: headlineLines };
  const pinVh = ch.copyOut[1] - ch.start;

  return (
    <section
      id={`chapter-${ch.id}`}
      aria-labelledby="ch09-title"
      className="relative"
      style={{ height: `calc(var(--k) * ${ch.end - ch.start}vh)` }}
    >
      <div className="pointer-events-none" style={{ height: `calc(var(--k) * ${pinVh}vh + 100svh)` }}>
        <div className="sticky top-0 flex h-svh flex-col items-stretch justify-start gap-8 px-4 pt-20 md:flex-row md:items-center md:justify-start md:px-8 md:pt-0 lg:px-14">
          <ChapterCopy chapterId="09" lines={line.small + 1} className="pointer-events-auto relative z-10 w-full md:max-w-[30%] md:min-w-[320px]">
            <SplitText
              as="h2"
              id="ch09-title"
              text={r.headline}
              lineStart={line.headline}
              onLines={setHeadlineLines}
              className="font-display text-[clamp(28px,3.4vw,50px)] leading-[1.04] font-bold tracking-[-0.02em] text-ink"
            />
            <RevealBlock line={line.small}>
              <p className="mt-4 max-w-[40ch] text-[13px] leading-relaxed text-muted md:mt-6 md:text-[14px]">{r.small}</p>
            </RevealBlock>
          </ChapterCopy>
          {stills && (
            <div className="flex justify-center md:ml-auto">
              <StaticPhones
                phones={[
                  { screen: <HomeVNReleasedScreen />, owner: 'you' },
                  { screen: <HomeIntlReleasedScreen />, owner: 'you' },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
