'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { MotionConfig, useReducedMotion } from 'motion/react';
import { copy } from '@/content/copy';
import { hasWebGL } from '@/motion/flags';
import { useRevealGate } from '@/motion/reveal';
import { SmoothScroll } from '@/components/SmoothScroll';
import { TopBar } from '@/components/TopBar';
import { ScrollCue } from '@/components/ScrollCue';
import { PhonePoster } from '@/components/PhonePoster';
import { Teddy } from '@/components/Teddy';
import { Ch00Hero } from '@/chapters/Ch00Hero';

// three.js and the scene load after first paint; the CSS poster holds the spot meanwhile.
const Stage = dynamic(() => import('@/scene/Stage'), { ssr: false });

export default function Page() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [stageReady, setStageReady] = useState(false);
  const onReady = useCallback(() => setStageReady(true), []);

  useEffect(() => setWebgl(hasWebGL()), []);
  // Chapter 00 load reveal: starts once fonts and the first poster frame are ready (≤ 1.2 s).
  useRevealGate();

  return (
    <MotionConfig reducedMotion="user">
      {/* Root is the 3D event source, so the phone can be dragged under the DOM layer. */}
      <div ref={root} className="relative">
        <a href="#main" className="skip-link">
          {copy.site.skipLink}
        </a>
        <SmoothScroll />

        {webgl && <Stage eventSource={root} reduced={reduced} onReady={onReady} />}
        <PhonePoster visible={!stageReady} />
        <Teddy />

        <TopBar />
        <ScrollCue />

        <main id="main" className="relative z-10">
          <Ch00Hero />

          {/* Placeholder until chapter 01 exists: gives the T1 glide room to finish. */}
          <section aria-label={copy.later.title} className="flex h-svh items-center justify-end px-4 md:px-14">
            <div className="max-w-sm text-right">
              <p className="font-mono text-[12px] tracking-wider text-accent uppercase">01 →</p>
              <h2 className="mt-2 font-display text-[28px] font-bold text-ink">{copy.later.title}</h2>
              <p className="mt-2 text-muted">{copy.later.body}</p>
            </div>
          </section>

          <footer className="px-4 pb-10 font-mono text-[12px] text-muted md:px-14">{copy.site.footer}</footer>
        </main>
      </div>
    </MotionConfig>
  );
}
