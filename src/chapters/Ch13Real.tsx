'use client';

import { useState, type ReactNode } from 'react';
import { motion, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { chapterById } from '@/content/chapters';
import { scrollVh } from '@/motion/scroll';
import { useHydrated } from '@/motion/flags';
import { CH13 } from '@/scene/poses';
import { StaticPhones } from '@/components/StaticPhones';
import { ChapterCopy } from '@/components/text/ChapterCopy';
import { RevealBlock } from '@/components/text/RevealBlock';
import { SplitText } from '@/components/text/SplitText';
import { DisclosuresScreen } from '@/screens/phone/DisclosuresScreen';

const ch = chapterById('13');
const r = copy.real;

/**
 * Opacity 0 → 1 over `window` (a pure function of scroll). Fade only: disclosure text never slides or blurs (SPEC
 * §14.4). Server HTML and no-JS carry no style, so the text is never server-rendered hidden.
 */
function FadeIn({ window: w, children }: { window: [number, number]; children: ReactNode }) {
  const hydrated = useHydrated();
  const opacity = useTransform(scrollVh, w, [0, 1], { clamp: true });
  return <motion.div style={hydrated ? { opacity } : undefined}>{children}</motion.div>;
}

const label = 'font-mono text-[12px] tracking-wider text-accent';
const body = 'text-[13px] leading-snug text-muted md:text-[15px] md:leading-relaxed';

/**
 * Chapter 13 · What's real today (SPEC §6 row 13). Your phone shows Disclosures in the 3D stage (poses.ts, CH13): the
 * list scrolls with the page and each row lights as its NOT YET line appears here. Copy: the "Honest status" list of
 * SPEC §1 verbatim; NEXT is the timeline Now · Next · Then · Later. All text fades only (ChapterCopy fadeOnly).
 */
export function Ch13Real({ stills = false }: { stills?: boolean }) {
  const [headlineLines, setHeadlineLines] = useState(2);
  const line = {
    now: headlineLines,
    simulated: headlineLines + 1,
    notYet: headlineLines + 2,
    item: (i: number) => headlineLines + 3 + i,
    next: headlineLines + 3 + r.notYet.items.length,
  };
  const pinVh = ch.copyOut[1] - ch.start;

  return (
    <section
      id={`chapter-${ch.id}`}
      aria-labelledby="ch13-title"
      className="relative"
      style={{ height: `calc(var(--k) * ${ch.end - ch.start}vh)` }}
    >
      <div className="pointer-events-none" style={{ height: `calc(var(--k) * ${pinVh}vh + 100svh)` }}>
        <div className="sticky top-0 flex h-svh flex-col items-stretch justify-start gap-8 px-4 pt-20 md:flex-row md:items-center md:justify-start md:px-8 md:pt-0 lg:px-14">
          <ChapterCopy chapterId="13" lines={line.next + 1} fadeOnly className="pointer-events-auto relative z-10 w-full md:max-w-[34%] md:min-w-[320px]">
            <SplitText
              as="h2"
              id="ch13-title"
              text={r.headline}
              lineStart={0}
              onLines={setHeadlineLines}
              className="font-display text-[clamp(26px,3vw,44px)] leading-[1.06] font-bold tracking-[-0.02em] text-ink"
            />
            <RevealBlock line={line.now}>
              <p className={`mt-3 md:mt-5 ${body}`}>
                <span className={label}>{r.now.label}</span> {r.now.before}
                <strong className="font-semibold text-ink">{r.now.strong}</strong>
                {r.now.after}
                <code className="font-mono text-[0.92em] text-ink">{r.now.program}</code>
                {r.now.end}
              </p>
            </RevealBlock>
            <RevealBlock line={line.simulated}>
              <p className={`mt-1 ${body}`}>
                {r.simulated.before}
                <strong className="font-semibold text-ink">{r.simulated.strong}</strong>
                {r.simulated.after}
              </p>
            </RevealBlock>
            <RevealBlock line={line.notYet}>
              <p className={`mt-3 md:mt-4 ${label}`}>{r.notYet.label}</p>
            </RevealBlock>
            <ul className={`mt-1 ${body}`}>
              {r.notYet.items.map((item, i) => (
                <li key={item.text}>
                  <RevealBlock line={line.item(i)}>
                    <FadeIn window={CH13.notYet[i]}>{item.text}</FadeIn>
                  </RevealBlock>
                </li>
              ))}
            </ul>
            <RevealBlock line={line.next}>
              <FadeIn window={CH13.timeline}>
                <p className={`mt-3 md:mt-4 ${label}`}>{r.next.label}</p>
                <ol className={`mt-1 ${body}`}>
                  {r.next.steps.map((step) => (
                    <li key={step.k} className="flex gap-3">
                      <span className="w-12 shrink-0 font-mono text-[12px] leading-[inherit] text-ink">{step.k}</span>
                      <span>{step.v}</span>
                    </li>
                  ))}
                </ol>
              </FadeIn>
            </RevealBlock>
          </ChapterCopy>
          {stills && (
            <div className="flex justify-center md:ml-auto">
              <StaticPhones phones={[{ screen: <DisclosuresScreen />, owner: 'you' }]} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
