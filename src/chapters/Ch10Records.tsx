'use client';

import { useState } from 'react';
import { copy } from '@/content/copy';
import { chapterById } from '@/content/chapters';
import { StaticPhones } from '@/components/StaticPhones';
import { ChapterCopy } from '@/components/text/ChapterCopy';
import { RevealBlock } from '@/components/text/RevealBlock';
import { SplitText } from '@/components/text/SplitText';
import { RecordsScreen } from '@/screens/phone/RecordsScreen';
import { ContractCloseScreen } from '@/screens/phone/ContractCloseScreen';

const ch = chapterById('10');
const r = copy.records;

/**
 * Chapter 10 · Records, then close (SPEC §6 row 10). One device at a time in the 3D stage (poses.ts, CH10): your
 * phone on Records leans back (T7 Tilt), the client's computer on WebRecords, then the client's phone on
 * ContractClose → ContractClosed. This is the copy column, on the left.
 */
export function Ch10Records({ stills = false }: { stills?: boolean }) {
  const [headlineLines, setHeadlineLines] = useState(1);
  const line = { headline: 0, l1: headlineLines, l2: headlineLines + 1, small: headlineLines + 2 };
  const pinVh = ch.copyOut[1] - ch.start;

  return (
    <section
      id={`chapter-${ch.id}`}
      aria-labelledby="ch10-title"
      className="relative"
      style={{ height: `calc(var(--k) * ${ch.end - ch.start}vh)` }}
    >
      <div className="pointer-events-none" style={{ height: `calc(var(--k) * ${pinVh}vh + 100svh)` }}>
        <div className="sticky top-0 flex h-svh flex-col items-stretch justify-start gap-8 px-4 pt-20 md:flex-row md:items-center md:justify-start md:px-8 md:pt-0 lg:px-14">
          <ChapterCopy chapterId="10" lines={line.small + 1} className="pointer-events-auto relative z-10 w-full md:max-w-[30%] md:min-w-[320px]">
            <SplitText
              as="h2"
              id="ch10-title"
              text={r.headline}
              lineStart={line.headline}
              onLines={setHeadlineLines}
              className="font-display text-[clamp(28px,3.4vw,50px)] leading-[1.04] font-bold tracking-[-0.02em] text-ink"
            />
            <RevealBlock line={line.l1}>
              <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-muted md:mt-6 md:text-[17px]">{r.l1}</p>
            </RevealBlock>
            <RevealBlock line={line.l2}>
              <p className="mt-2 max-w-[40ch] text-[15px] leading-relaxed text-muted md:text-[17px]">{r.l2}</p>
            </RevealBlock>
            <RevealBlock line={line.small}>
              <p className="mt-4 text-[13px] text-muted md:mt-5">{r.small}</p>
            </RevealBlock>
          </ChapterCopy>
          {stills && (
            <div className="flex justify-center md:ml-auto">
              <StaticPhones
                phones={[
                  { screen: <RecordsScreen />, owner: 'you' },
                  { screen: <ContractCloseScreen done />, owner: 'client' },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
