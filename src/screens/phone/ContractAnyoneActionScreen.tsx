'use client';

import { useState, type CSSProperties } from 'react';
import { motion, useMotionValueEvent, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { scrollVh } from '@/motion/scroll';
import { CH08, ch08ClockLeft } from '@/scene/poses';
import { DevnetChip, FONT, Screen, StatusBar } from './parts';
import { ContractDetailScreen } from './ContractDetailScreen';

/**
 * Port of docs/design-reference/phone/ContractAnyoneAction.dc.html: `release` (kind release) and `refund`
 * (= phone/ContractAnyoneActionRefund). Markup and inline styles 1:1, including the board's dimmed, blurred background
 * card under the sheet. The slider thumb follows scroll (CH08.slideB / slideC); on phone B the landing-layer tap mark
 * presses it first (CH08.tapB).
 * Left out: the sheet / backdrop entrance animations.
 */
const s = copy.screens.anyoneAction;
/** Thumb travel: track 350 px (390 − 2 × 20 sheet gutter), padding 5 each side, thumb 50. */
const TRAVEL = 390 - 40 - 10 - 50;

const feeRow: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderTop: '1px solid #F0F0F3' };

function Thumb({ window: w, tap }: { window: [number, number]; tap?: string }) {
  const x = useTransform(scrollVh, w, [0, TRAVEL], { clamp: true });
  return (
    <motion.div
      data-slider-thumb=""
      data-tap-target={tap}
      style={{
        x,
        width: 50,
        height: 50,
        borderRadius: 9999,
        background: '#7B2FBE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </motion.div>
  );
}

export function ContractAnyoneActionScreen({ kind }: { kind: 'release' | 'refund' }) {
  const k = s[kind];
  const rel = kind === 'release';
  return (
    <Screen name={rel ? 'anyoneRelease' : 'anyoneRefund'} style={{ background: '#F4F4F6', color: '#111116', display: 'flex', flexDirection: 'column' }}>
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
          {k.bgHead}
        </h1>
        <DevnetChip />
      </div>

      <div aria-hidden="true" style={{ flex: 1, padding: '14px 16px', opacity: 0.35, filter: 'blur(1px)' }}>
        <div style={{ padding: 14, borderRadius: 20, background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <div>
              <div style={{ fontFamily: FONT.display, fontSize: 17, fontWeight: 700 }}>{k.bgTitle}</div>
              <div style={{ marginTop: 3, fontSize: 12, color: '#5E5E6A' }}>{s.parties}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 15, fontWeight: 700 }}>{s.bgAmt}</div>
              <div style={{ fontSize: 11, color: '#5E5E6A' }}>{k.bgStatus}</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(17,17,22,0.36)' }} />
      <div
        role="dialog"
        aria-label={s.sheetLabel}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 11,
          maxHeight: 690,
          overflow: 'hidden',
          padding: '10px 20px 28px',
          borderRadius: '28px 28px 0 0',
          background: '#FFFFFF',
          borderTop: '1px solid #F0F0F3',
        }}
      >
        <div style={{ width: 40, height: 5, margin: '0 auto 14px', borderRadius: 9999, background: '#E6E6EB' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontFamily: FONT.display, fontSize: 21, fontWeight: 700 }}>{k.title}</span>
          <DevnetChip />
        </div>
        <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.55, color: '#3F3F49' }}>{k.text}</div>
        <div style={{ marginTop: 14, padding: '4px 14px', borderRadius: 20, background: '#FFFFFF' }}>
          {k.rows.map((r, i) => (
            <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '11px 0', borderTop: i ? '1px solid #E6E6EB' : 'none' }}>
              <span style={{ fontSize: 13, color: '#5E5E6A' }}>{r.k}</span>
              <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{r.v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10 }}>
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
            {rel && (
              <div style={feeRow}>
                <span style={{ fontSize: 14, color: '#5E5E6A' }}>{s.fees.partner}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{s.fees.partnerV}</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      height: 20,
                      padding: '0 7px',
                      borderRadius: 6,
                      background: '#EEEEF2',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 0.4,
                      color: '#3F3F49',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.simulated}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <a
            aria-label={k.slide}
            style={{ height: 60, padding: 5, boxSizing: 'border-box', display: 'flex', alignItems: 'center', borderRadius: 9999, background: '#F2EAFB', textDecoration: 'none', border: 'none' }}
          >
            <Thumb window={rel ? CH08.slideB : CH08.slideC} tap={rel ? 'anyone-release' : undefined} />
            <div style={{ flex: 1, textAlign: 'center', marginLeft: -50, fontFamily: FONT.display, fontSize: 16, fontWeight: 700, color: '#111116' }}>{k.slide}</div>
          </a>
          <a
            style={{
              marginTop: 8,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderRadius: 9999,
              background: '#F2EAFB',
              border: 'none',
              fontFamily: FONT.body,
              fontSize: 16,
              fontWeight: 600,
              color: '#6A22B0',
              textDecoration: 'none',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            {s.cancel}
          </a>
        </div>
      </div>
    </Screen>
  );
}

/** Chapter 08 phone B before the sheet: ContractDetail (contract B, submitted) with its review clock counting by scroll. */
export function ContractDetailLogoClock() {
  const [left, setLeft] = useState(() => ch08ClockLeft(scrollVh.get()));
  useMotionValueEvent(scrollVh, 'change', (vh) => {
    const next = ch08ClockLeft(vh);
    if (next !== left) setLeft(next);
  });
  return <ContractDetailScreen variant="logoSubmitted" left={left} />;
}
