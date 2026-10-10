'use client';

import { useState } from 'react';
import { copy } from '@/content/copy';
import { chapterById } from '@/content/chapters';
import { StaticPhones } from '@/components/StaticPhones';
import { ChapterCopy } from '@/components/text/ChapterCopy';
import { RevealBlock } from '@/components/text/RevealBlock';
import { SplitText } from '@/components/text/SplitText';
import { PortraitPages } from '@/components/text/PortraitPages';
import { ContractLockedScreen } from '@/screens/phone/ContractLockedScreen';

const ch = chapterById('12');
/** Portrait pages (vh): about a third of the chapter each, after the copy has come in. */
const PAGES = [ch.start + 56, ch.start + 104];
const d = copy.does;

const label = 'font-mono text-[12px] tracking-wider text-accent uppercase';
const item = 'text-[13px] leading-snug text-muted md:text-[15px] md:leading-relaxed';

/**
 * Chapter 12 · What N.E.D does and doesn't do (SPEC §6 row 12). Your phone turns slowly on ContractLocked in the 3D
 * stage (poses.ts, CH12); this is the copy column, on the left: headline, the two lists, then the proof row.
 */
export function Ch12Does({ stills = false }: { stills?: boolean }) {
  const [headlineLines, setHeadlineLines] = useState(2);
  const line = { does: headlineLines, doesnt: headlineLines + 1, proof: headlineLines + 2 };
  const pinVh = ch.copyOut[1] - ch.start;

  return (
    <section
      id={`chapter-${ch.id}`}
      aria-labelledby="ch12-title"
      className="relative"
      style={{ height: `calc(var(--k) * ${ch.end - ch.start}vh)` }}
    >
      <div className="pointer-events-none" style={{ height: `calc(var(--k) * ${pinVh}vh + 100svh)` }}>
        <div className="sticky top-0 flex h-svh flex-col items-stretch justify-start gap-8 px-4 pt-20 md:flex-row md:items-center md:justify-start md:px-8 md:pt-0 lg:px-14">
          <ChapterCopy chapterId="12" lines={line.proof + 1} className="pointer-events-auto relative z-10 w-full md:max-w-[34%] md:min-w-[320px]">
            <SplitText
              as="h2"
              id="ch12-title"
              text={d.headline}
              lineStart={0}
              onLines={setHeadlineLines}
              className="font-display text-[clamp(24px,3vw,44px)] leading-[1.06] font-bold tracking-[-0.02em] text-ink"
            />
            {/* Portrait: does, doesn't and the proof row take turns under the headline (the copy zone stays short). */}
            <PortraitPages bounds={PAGES}>
              <RevealBlock line={line.does}>
                <p className={`mt-3 md:mt-6 ${label}`}>{d.does.label}</p>
                <ul className={`mt-1 list-disc space-y-0.5 pl-5 md:space-y-1 ${item}`}>
                  {d.does.items.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </RevealBlock>
              <RevealBlock line={line.doesnt}>
                <p className={`mt-3 md:mt-4 ${label}`}>{d.doesnt.label}</p>
                <ul className={`mt-1 list-disc space-y-0.5 pl-5 md:space-y-1 ${item}`}>
                  {d.doesnt.items.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </RevealBlock>
              <RevealBlock line={line.proof}>
                <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-0.5 border-t border-white/10 pt-3 text-[13px] md:mt-5 md:pt-4 leading-relaxed text-ink md:text-[14px]">
                  {d.proof.map((t, i) => (
                    <li key={t}>
                      {i > 0 && (
                        <span aria-hidden="true" className="mr-3 text-muted">
                          ·
                        </span>
                      )}
                      {t}
                    </li>
                  ))}
                </ul>
              </RevealBlock>
            </PortraitPages>
          </ChapterCopy>
          {stills && (
            <div className="flex justify-center md:ml-auto">
              <StaticPhones phones={[{ screen: <ContractLockedScreen side="freelancerVN" />, owner: 'you' }]} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
