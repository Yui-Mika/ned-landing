'use client';

import { useState } from 'react';
import { copy } from '@/content/copy';
import { links, type ProductLink } from '@/content/links';
import { chapterById } from '@/content/chapters';
import { Chip } from '@/components/Chip';
import { StaticPhones } from '@/components/StaticPhones';
import { ChapterCopy } from '@/components/text/ChapterCopy';
import { RevealBlock } from '@/components/text/RevealBlock';
import { SplitText } from '@/components/text/SplitText';
import { HomeVNScreen } from '@/screens/phone/HomeScreen';

const ch = chapterById('14');
const c = copy.close;

/**
 * One product card from links.ts (SPEC §2): a live link opens in a new tab with rel="noopener"; an empty URL renders a
 * disabled card with a "Coming soon" chip and no href. Every card shows the "Test network" badge.
 */
function ProductCard({ link: l }: { link: ProductLink }) {
  const body = (
    <>
      <span className="flex items-center justify-between gap-2">
        <span className="text-[16px] font-semibold text-ink md:text-[17px]">{l.label}</span>
        {l.url && (
          <span aria-hidden="true" className="text-accent">
            ↗
          </span>
        )}
      </span>
      <span className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-muted">
        {l.product}
        <Chip tone="muted" size="xs">
          {copy.topBar.testNetwork}
        </Chip>
        {!l.url && (
          <Chip tone="amber" size="xs">
            {copy.topBar.comingSoon}
          </Chip>
        )}
      </span>
      {l.description && <span className="mt-1 block text-[13px] text-muted">{l.description}</span>}
    </>
  );
  const box = 'block rounded-2xl border border-white/10 bg-surface-2/80 px-4 py-3 md:py-3.5';
  return l.url ? (
    <a href={l.url} target="_blank" rel="noopener" data-product={l.id} className={`${box} transition-colors hover:border-accent/60 hover:bg-accent/10`}>
      {body}
    </a>
  ) : (
    <div aria-disabled="true" data-product={l.id} className={`${box} cursor-not-allowed opacity-60`}>
      {body}
    </div>
  );
}

/**
 * Chapter 14 · Close + product links (SPEC §6 row 14), the last chapter; it follows chapter 13.
 * Your phone (Home) and your computer (WebSignIn) rest side by side in the 3D stage (poses.ts, CH14); this is the copy
 * column, on the left: headline, the client line, then the three product cards (CTA 1, CTA 2, card 3). The copy never
 * exits, and the section holds its pinned screen, so the page footer comes after it.
 */
export function Ch14Close({ stills = false }: { stills?: boolean }) {
  const [headlineLines, setHeadlineLines] = useState(1);
  const line = { headline: 0, client: headlineLines, cards: headlineLines + 1 };
  const height = `calc(var(--k) * ${ch.end - ch.start}vh + 100svh)`;

  return (
    <section id={`chapter-${ch.id}`} aria-labelledby="ch14-title" className="relative" style={{ height }}>
      <div className="pointer-events-none" style={{ height }}>
        <div className="sticky top-0 flex h-svh flex-col items-stretch justify-start gap-8 px-4 pt-20 md:flex-row md:items-center md:justify-start md:px-8 md:pt-0 lg:px-14">
          <ChapterCopy chapterId="14" lines={line.cards + links.length} className="pointer-events-auto relative z-10 w-full md:max-w-[30%] md:min-w-[320px]">
            <SplitText
              as="h2"
              id="ch14-title"
              text={c.headline}
              lineStart={line.headline}
              onLines={setHeadlineLines}
              className="font-display text-[clamp(28px,3.4vw,50px)] leading-[1.04] font-bold tracking-[-0.02em] text-ink"
            />
            <RevealBlock line={line.client}>
              <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-muted md:mt-5 md:text-[17px]">{c.client}</p>
            </RevealBlock>
            <ul className="mt-4 flex flex-col gap-2 md:mt-6 md:gap-3">
              {links.map((l, i) => (
                <li key={l.id}>
                  <RevealBlock line={line.cards + i}>
                    <ProductCard link={l} />
                  </RevealBlock>
                </li>
              ))}
            </ul>
          </ChapterCopy>
          {stills && (
            <div className="flex justify-center md:ml-auto">
              <StaticPhones phones={[{ screen: <HomeVNScreen />, owner: 'you' }]} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
