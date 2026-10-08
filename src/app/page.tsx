'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { MotionConfig } from 'motion/react';
import { copy } from '@/content/copy';
import { hasWebGL, useReducedMotionSafe } from '@/motion/flags';
import { useRevealGate } from '@/motion/reveal';
import { useIntroController } from '@/motion/intro';
import { SmoothScroll } from '@/components/SmoothScroll';
import { TopBar } from '@/components/TopBar';
import { ScrollCue } from '@/components/ScrollCue';
import { PhonePoster } from '@/components/PhonePoster';
import { Teddy } from '@/components/Teddy';
import { RefractionBand } from '@/components/hero/RefractionBand';
import { ChapterGlow } from '@/components/ChapterGlow';
import { CurrencyTints } from '@/components/CurrencyTints';
import { Ch00Hero } from '@/chapters/Ch00Hero';
import { Ch01Problem } from '@/chapters/Ch01Problem';
import { Ch02SignIn } from '@/chapters/Ch02SignIn';
import { Ch03Brief } from '@/chapters/Ch03Brief';
import { Ch04Accept } from '@/chapters/Ch04Accept';
import { Ch05Lock } from '@/chapters/Ch05Lock';
import { Ch06Submit } from '@/chapters/Ch06Submit';
import { Ch07Release } from '@/chapters/Ch07Release';
import { Ch08Quiet } from '@/chapters/Ch08Quiet';
import { Ch09Receive } from '@/chapters/Ch09Receive';
import { Ch13Real } from '@/chapters/Ch13Real';
import { Ch14Close } from '@/chapters/Ch14Close';

// three.js and the scene load after first paint; the CSS poster holds the spot meanwhile.
const Stage = dynamic(() => import('@/scene/Stage'), { ssr: false });

export default function Page() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSafe();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [stageReady, setStageReady] = useState(false);
  const onReady = useCallback(() => setStageReady(true), []);

  useEffect(() => setWebgl(hasWebGL()), []);
  // Chapter 00 load reveal: starts once fonts and the first poster frame are ready (≤ 1.2 s).
  useRevealGate();
  // Hero intro (§16): sweep, then the phone enters. Input or a mid-page load skips it.
  useIntroController();

  return (
    <MotionConfig reducedMotion="user">
      {/* Root is the 3D event source, so the phone can be dragged under the DOM layer. */}
      <div ref={root} className="relative">
        <a href="#main" className="skip-link">
          {copy.site.skipLink}
        </a>
        <SmoothScroll />

        {/* Back to front: light band / chapter glows, 3D canvas (transparent), poster, copy. */}
        <RefractionBand />
        <ChapterGlow chapterId="01" />
        <CurrencyTints />
        {webgl && <Stage eventSource={root} reduced={reduced} onReady={onReady} />}
        <PhonePoster stageReady={stageReady} />
        <Teddy />

        <TopBar />
        <ScrollCue />

        <main id="main" className="relative z-10">
          <Ch00Hero />
          <Ch01Problem stills={webgl === false} />
          <Ch02SignIn stills={webgl === false} />
          <Ch03Brief stills={webgl === false} />
          <Ch04Accept stills={webgl === false} />
          <Ch05Lock stills={webgl === false} />
          <Ch06Submit stills={webgl === false} />
          <Ch07Release stills={webgl === false} />
          <Ch08Quiet stills={webgl === false} />
          <Ch09Receive stills={webgl === false} />
          <Ch13Real stills={webgl === false} />
          <Ch14Close stills={webgl === false} />

          <footer className="px-4 pb-10 font-mono text-[12px] text-muted md:px-14">{copy.site.footer}</footer>
        </main>
      </div>
    </MotionConfig>
  );
}
