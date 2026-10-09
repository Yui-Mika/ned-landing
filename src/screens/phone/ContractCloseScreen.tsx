'use client';

import type { CSSProperties } from 'react';
import { motion, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { scrollVh } from '@/motion/scroll';
import { CH10 } from '@/scene/poses';
import { DevnetChip, FONT, Screen, StatusBar } from './parts';

/**
 * Port of docs/design-reference/phone/ContractClose.dc.html: `done` false (ask) and true (= phone/ContractClosed).
 * Markup and inline styles 1:1; strings in copy.screens.contractClose. The slider thumb follows scroll (CH10.slide,
 * SPEC §5.1). Left out: the entrance / swap animations and links to other boards (the screen is a picture).
 */
const s = copy.screens.contractClose;
/** Thumb travel: track 358 px (390 − 2 × 16 gutter), padding 4 each side, thumb 50. */
const TRAVEL = 390 - 32 - 8 - 50;
const EXPLORER = 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5';
const feeRow: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderTop: '1px solid #F0F0F3' };

function Thumb() {
  const x = useTransform(scrollVh, CH10.slide, [0, TRAVEL], { clamp: true });
  return (
    <motion.div
      data-slider-thumb=""
      style={{ x, width: 50, height: 50, borderRadius: 9999, background: '#7B2FBE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </motion.div>
  );
}

function Ask() {
  return (
    <>
      <div style={{ flex: 1, overflow: 'hidden', padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ padding: 14, borderRadius: 20, background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <div>
              <div style={{ fontFamily: FONT.display, fontSize: 17, fontWeight: 700 }}>{s.job}</div>
              <div style={{ marginTop: 3, fontSize: 12, color: '#5E5E6A' }}>{s.party}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 15, fontWeight: 700 }}>{s.amt}</div>
              <div style={{ fontSize: 11, color: '#5E5E6A' }}>{s.amtSub}</div>
            </div>
          </div>
        </div>
        <div style={{ padding: 16, borderRadius: 20, background: '#FFFFFF' }}>
          <div style={{ fontFamily: FONT.display, fontSize: 18, fontWeight: 700 }}>{s.closeTitle}</div>
          <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.5, color: '#3F3F49' }}>
            {s.closeBefore}
            <strong>{s.closeStrong}</strong>
            {s.closeAfter}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.5, color: '#5E5E6A' }}>{s.closeNote}</div>
        </div>
        <div role="group" aria-label={s.fees.label} style={{ padding: '4px 16px', borderRadius: 20, background: '#FFFFFF' }}>
          <div style={{ padding: '12px 0 8px', fontSize: 15, fontWeight: 600 }}>{s.fees.label}</div>
          <div style={feeRow}>
            <span style={{ fontSize: 14, color: '#5E5E6A' }}>{s.fees.ned}</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{s.fees.nedV}</div>
            </div>
          </div>
          <div style={feeRow}>
            <span style={{ fontSize: 14, color: '#5E5E6A' }}>{s.fees.network}</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{s.fees.networkV}</div>
              <div style={{ fontSize: 12, color: '#5E5E6A' }}>{s.fees.networkSub}</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: '10px 16px 26px' }}>
        <a
          aria-label={s.slide}
          data-focus="close-slider"
          style={{ height: 58, padding: 4, boxSizing: 'border-box', display: 'flex', alignItems: 'center', borderRadius: 9999, background: '#F2EAFB', textDecoration: 'none' }}
        >
          <Thumb />
          <div style={{ flex: 1, textAlign: 'center', marginLeft: -50, fontSize: 16, fontWeight: 600, color: '#6A22B0' }}>{s.slide}</div>
        </a>
      </div>
    </>
  );
}

function Done() {
  const d = s.done;
  return (
    <div style={{ flex: 1, padding: '40px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: 9999, background: '#E7F6EC', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#127A3A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <h1 style={{ margin: '18px 0 0', fontFamily: FONT.display, fontSize: 26, fontWeight: 700 }}>{d.title}</h1>
      <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: '#3F3F49' }}>{d.body}</p>
      <a style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#6A22B0' }}>
        {d.explorer}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={EXPLORER} />
        </svg>
      </a>
      <div style={{ flex: 1 }} />
      <a
        style={{
          marginBottom: 28,
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 9999,
          background: '#7B2FBE',
          fontFamily: FONT.body,
          fontSize: 16,
          fontWeight: 600,
          color: '#FFFFFF',
          textDecoration: 'none',
          border: 'none',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        {d.back}
      </a>
    </div>
  );
}

export function ContractCloseScreen({ done = false }: { done?: boolean }) {
  return (
    <Screen name={done ? 'contractClosed' : 'contractClose'} style={{ background: '#F4F4F6', color: '#111116', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div style={{ padding: '2px 16px 0', display: 'flex', alignItems: 'center', gap: 6, position: 'relative', zIndex: 3 }}>
        <a
          aria-label={s.back}
          style={{ width: 44, height: 44, marginLeft: -8, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111116" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </a>
        <h1 style={{ flex: 1, minWidth: 0, margin: 0, fontFamily: FONT.display, fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {s.title}
        </h1>
        <DevnetChip />
      </div>
      {done ? <Done /> : <Ask />}
    </Screen>
  );
}
