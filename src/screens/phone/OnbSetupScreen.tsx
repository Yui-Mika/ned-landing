'use client';

import { useState } from 'react';
import { motion, useMotionValueEvent, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { scrollVh } from '@/motion/scroll';
import { ch02SetupStep } from '@/scene/poses';
import { FONT, Screen, StatusBar } from './parts';

/**
 * Port of docs/design-reference/phone/OnbSetup.dc.html (returning: false). Markup and inline styles 1:1.
 * The board advances a step every 1.1 s and spins the active ring with a CSS animation; here both come from
 * scroll (CH02_SETUP in poses.ts), so back-scroll and jumps stay exact (SPEC §5.1).
 */
const s = copy.screens.onbSetup;
const SPIN_DEG_PER_VH = 40;

function Spinner() {
  const rotate = useTransform(scrollVh, (vh) => vh * SPIN_DEG_PER_VH);
  return (
    <motion.div
      style={{
        width: 24,
        height: 24,
        boxSizing: 'border-box',
        borderRadius: 9999,
        border: '2px solid #E6E6EB',
        borderTopColor: '#6A22B0',
        flexShrink: 0,
        rotate,
      }}
    />
  );
}

export function OnbSetupScreen() {
  // Discrete step (changes 3 times over the beat), not a per-frame value.
  const [step, setStep] = useState(() => ch02SetupStep(scrollVh.get()));
  useMotionValueEvent(scrollVh, 'change', (vh) => {
    const next = ch02SetupStep(vh);
    if (next !== step) setStep(next);
  });
  const finished = step >= 3;

  return (
    <Screen name="onbSetup" style={{ background: '#F4F4F6', color: '#111116', display: 'flex', flexDirection: 'column' }}>
      <StatusBar variant="onb" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '70px 28px 0', position: 'relative', zIndex: 1 }}>
        <img src="/design-assets/teddy-thinking_3385a7c8.png" alt="" style={{ width: 200, height: 156, objectFit: 'contain' }} />
        <h1 style={{ margin: '26px 0 0', fontFamily: FONT.display, fontSize: 24, fontWeight: 700, textAlign: 'center' }}>
          {finished ? s.finished.heading : s.working.heading}
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, textAlign: 'center', color: '#5E5E6A' }}>
          {finished ? s.finished.sub : s.working.sub}
        </p>
        <div role="list" style={{ marginTop: 30, width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {s.steps.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div key={label} role="listitem" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {done && (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 9999,
                      background: '#E7F6EC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: 'none',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </div>
                )}
                {active && <Spinner />}
                {!done && !active && (
                  <div style={{ width: 24, height: 24, boxSizing: 'border-box', borderRadius: 9999, border: '2px solid #E6E6EB', flexShrink: 0 }} />
                )}
                <div style={{ fontSize: 15, fontWeight: active ? 600 : 500, color: done || active ? '#111116' : '#5E5E6A' }}>{label}</div>
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ width: '100%', paddingBottom: 28 }}>
          {finished ? (
            <a
              style={{
                height: 52,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                borderRadius: 9999,
                background: '#7B2FBE',
                fontSize: 16,
                fontWeight: 600,
                color: '#FFFFFF',
                textDecoration: 'none',
              }}
            >
              {s.continue}
            </a>
          ) : (
            <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12, color: '#5E5E6A' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5E5E6A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              {s.secured}
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
}
