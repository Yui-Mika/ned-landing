'use client';

import { copy } from '@/content/copy';
import { chapterById } from '@/content/chapters';
import { Chip } from '@/components/Chip';
import { StaticPhones } from '@/components/StaticPhones';
import { ChapterCopy } from '@/components/text/ChapterCopy';
import { RevealBlock } from '@/components/text/RevealBlock';
import { SplitText } from '@/components/text/SplitText';
import { MilestoneReleasedScreen } from '@/screens/phone/MilestoneReleasedScreen';
import { ContractAnyoneActionScreen } from '@/screens/phone/ContractAnyoneActionScreen';

const ch = chapterById('08');
const q = copy.quiet;

/**
 * Chapter 08 · If someone goes quiet (1900–2200 vh). The three phones live in the 3D stage (poses.ts, CH08: T6 Fan,
 * A approved, B review clock → anyone releases, C missed deadline → anyone refunds); this is the copy column, on the
 * left. SPEC row 08 has three lines and no headline: the first line leads (as the h2), the other two follow, then the
 * landing-layer chip "No neutral arbiter yet.".
 */
export function Ch08Quiet({ stills = false }: { stills?: boolean }) {
  const pinVh = ch.copyOut[1] - ch.start;
  return (
    <section
      id={`chapter-${ch.id}`}
      aria-labelledby="ch08-title"
      className="relative"
      style={{ height: `calc(var(--k) * ${ch.end - ch.start}vh)` }}
    >
      <div className="pointer-events-none" style={{ height: `calc(var(--k) * ${pinVh}vh + 100svh)` }}>
        <div className="sticky top-0 flex h-svh flex-col items-stretch justify-start gap-8 px-4 pt-20 md:flex-row md:items-center md:justify-start md:px-8 md:pt-0 lg:px-14">
          <ChapterCopy chapterId="08" lines={6} className="pointer-events-auto relative z-10 w-full md:max-w-[28%] md:min-w-[300px]">
            <SplitText
              as="h2"
              id="ch08-title"
              text={q.l1}
              lineStart={0}
              className="font-display text-[clamp(22px,2.4vw,34px)] leading-[1.1] font-bold tracking-[-0.01em] text-ink"
            />
            <RevealBlock line={3}>
              <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-muted md:mt-5 md:text-[17px]">{q.l2}</p>
            </RevealBlock>
            <RevealBlock line={4}>
              <p className="mt-2 max-w-[40ch] text-[15px] leading-relaxed text-muted md:text-[17px]">{q.l3}</p>
            </RevealBlock>
            <RevealBlock line={5}>
              <Chip tone="muted" className="mt-4 md:mt-5">
                {q.chip}
              </Chip>
            </RevealBlock>
          </ChapterCopy>
          {stills && (
            <div className="flex justify-center md:ml-auto">
              <StaticPhones
                scale={0.3}
                phones={[
                  { screen: <MilestoneReleasedScreen variant="client" />, owner: 'client' },
                  { screen: <ContractAnyoneActionScreen kind="release" />, owner: 'anyone' },
                  { screen: <ContractAnyoneActionScreen kind="refund" />, owner: 'anyone' },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
