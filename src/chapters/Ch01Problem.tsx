'use client';

import { useState } from 'react';
import { copy } from '@/content/copy';
import { chapterById } from '@/content/chapters';
import { DeviceTag } from '@/components/DeviceTag';
import { ChapterCopy } from '@/components/text/ChapterCopy';
import { RevealBlock } from '@/components/text/RevealBlock';
import { SplitText } from '@/components/text/SplitText';
import { PHONE_SCREEN_PX } from '@/screens/phone/HomeScreen';
import { ChatClientScreen, ChatYouScreen } from '@/screens/phone/ChatScreen';

const ch = chapterById('01');

/** No-WebGL fallback (SPEC §8): the two phones of the split as still screens beside the copy. */
function Stills() {
  const scale = 0.42;
  const still = (screen: React.ReactNode, owner: 'you' | 'client') => (
    <figure className="flex flex-col items-center gap-3">
      <div
        className="overflow-hidden rounded-[22px] bg-[#1A1A22] p-[6px]"
        style={{ width: PHONE_SCREEN_PX.w * scale + 12, height: PHONE_SCREEN_PX.h * scale + 12 }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>{screen}</div>
      </div>
      <DeviceTag owner={owner} />
    </figure>
  );
  return (
    <div aria-hidden="true" className="flex gap-4 md:gap-8">
      {still(<ChatYouScreen />, 'you')}
      {still(<ChatClientScreen />, 'client')}
    </div>
  );
}

/**
 * Chapter 01 · The problem (140–360 vh). The phones live in the 3D stage (poses.ts); this is the copy
 * column, on the right because the hero's T1 glide parks your phone on the left. Copy enters and exits
 * scrubbed by scroll (§14.2); no load reveal.
 */
export function Ch01Problem({ stills = false }: { stills?: boolean }) {
  // Scrub lines, top to bottom: headline lines · line 1 · line 2.
  const [headlineLines, setHeadlineLines] = useState(2);
  const line = { headline: 0, l1: headlineLines, l2: headlineLines + 1 };
  // The copy stays pinned until its exit window ends, then the section scrolls on.
  const pinVh = ch.copyOut[1] - ch.start;

  return (
    <section
      id={`chapter-${ch.id}`}
      aria-labelledby="ch01-title"
      className="relative"
      style={{ height: `calc(var(--k) * ${ch.end - ch.start}vh)` }}
    >
      <div className="pointer-events-none" style={{ height: `calc(var(--k) * ${pinVh}vh + 100svh)` }}>
        <div className="sticky top-0 flex h-svh flex-col items-stretch justify-start gap-8 px-4 pt-20 md:flex-row md:items-center md:justify-end md:px-8 md:pt-0 lg:px-14">
          {stills && (
            <div className="order-2 flex justify-center md:order-1 md:mr-auto">
              <Stills />
            </div>
          )}
          <ChapterCopy
            chapterId="01"
            lines={line.l2 + 1}
            className="pointer-events-auto relative z-10 order-1 w-full md:order-2 md:max-w-[34%] md:min-w-[340px]"
          >
            <SplitText
              as="h2"
              id="ch01-title"
              text={copy.problem.headline}
              lineStart={line.headline}
              onLines={setHeadlineLines}
              className="font-display text-[clamp(28px,3.4vw,50px)] leading-[1.04] font-bold tracking-[-0.02em] text-ink"
            />
            <RevealBlock line={line.l1}>
              <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-muted md:mt-6 md:text-[17px]">{copy.problem.l1}</p>
            </RevealBlock>
            <RevealBlock line={line.l2}>
              <p className="mt-2 max-w-[40ch] text-[15px] leading-relaxed text-muted md:text-[17px]">{copy.problem.l2}</p>
            </RevealBlock>
          </ChapterCopy>
        </div>
      </div>
    </section>
  );
}
