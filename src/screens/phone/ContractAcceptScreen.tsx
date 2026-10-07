'use client';

import type { CSSProperties } from 'react';
import { motion, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { scrollVh } from '@/motion/scroll';
import { CH04_SLIDE } from '@/scene/poses';
import { FONT, Screen, StatusBar, DevnetChip } from './parts';

/**
 * Port of docs/design-reference/phone/ContractAccept.dc.html (view vn, not too late). Markup and inline styles 1:1.
 * The board's VN view shows only the VND option (selected) plus a "VND only" note; the USDC option is not shown.
 * The slider thumb follows scroll (CH04_SLIDE): only its position moves, the board's markup is unchanged.
 */
const s = copy.screens.contractAccept;
/** Thumb travel: track 358 px (390 − 2 × 16 gutter), padding 4 each side, thumb 50. */
const TRAVEL = 390 - 32 - 8 - 50;

const sim: CSSProperties = {
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
};
const feeRow: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderTop: '1px solid #F0F0F3' };

function Thumb() {
  const x = useTransform(scrollVh, [CH04_SLIDE[0], CH04_SLIDE[1]], [0, TRAVEL], { clamp: true });
  return (
    <motion.div
      data-slider-thumb=""
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

export function ContractAcceptScreen() {
  return (
    <Screen name="accept" style={{ background: '#F4F4F6', color: '#111116', display: 'flex', flexDirection: 'column' }}>
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

      <div style={{ flex: 1, overflow: 'hidden', padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ padding: 14, borderRadius: 20, background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <div>
              <div style={{ fontFamily: FONT.display, fontSize: 17, fontWeight: 700 }}>{s.job}</div>
              <div style={{ marginTop: 3, fontSize: 12, color: '#5E5E6A' }}>{s.from}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 15, fontWeight: 700 }}>{s.total}</div>
              <div style={{ fontSize: 11, color: '#5E5E6A' }}>
                {/* SPEC text: never under 11 px on screen (scale set by Phone.tsx). */}
                <span style={{ fontSize: 'max(11px, calc(11px / var(--ned-screen-scale, 1)))' }}>{s.totalSubEstimate}</span>
                {s.totalSubRest}
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 20, background: '#FFFFFF', fontSize: 12, lineHeight: 1.6, color: '#3F3F49' }}>
          {s.milestones[0]}
          <br />
          {s.milestones[1]}
        </div>
        <h2 style={{ margin: '8px 4px 0', fontFamily: FONT.display, fontSize: 17, fontWeight: 700 }}>{s.question}</h2>
        <div data-focus="dest-cards" role="radiogroup" aria-label={s.groupLabel} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            role="radio"
            aria-checked
            style={{
              display: 'block',
              width: '100%',
              padding: 14,
              boxSizing: 'border-box',
              borderRadius: 18,
              cursor: 'pointer',
              color: '#111116',
              fontFamily: 'inherit',
              textAlign: 'left',
              background: '#F2EAFB',
              border: 'none',
              boxShadow: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: '#EEEEF2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111116" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />
                </svg>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700 }}>{s.vnd.title}</span>
                <span style={sim}>{s.simulated}</span>
              </div>
              <div
                style={{
                  width: 22,
                  height: 22,
                  boxSizing: 'border-box',
                  borderRadius: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '2px solid #6A22B0',
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: 9999, background: '#6A22B0' }} />
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5, color: '#3F3F49' }}>{s.vnd.body}</div>
          </button>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 16, background: '#EEEEF2', fontSize: 12, lineHeight: 1.5, color: '#3F3F49' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5E5E6A" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5M12 8v.5" />
            </svg>
            <span>{s.vnOnly}</span>
          </div>
        </div>
        <div role="note" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 16, background: '#FFF5E1', border: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A5300" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
            <path d="M12 3 2 20h20zM12 10v4M12 17v.5" />
          </svg>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: '#111116' }}>
            <strong style={{ color: '#8A5300' }}>{s.warn.strong}</strong>
            {s.warn.rest}
          </div>
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
          <div style={feeRow}>
            <span style={{ fontSize: 14, color: '#5E5E6A' }}>{s.fees.partner}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{s.fees.partnerV}</span>
              <span style={sim}>{s.simulated}</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: '10px 16px 26px' }}>
        <a
          aria-label={s.slide}
          style={{ height: 58, padding: 4, boxSizing: 'border-box', display: 'flex', alignItems: 'center', borderRadius: 9999, background: '#F2EAFB', textDecoration: 'none' }}
        >
          <Thumb />
          <div style={{ flex: 1, textAlign: 'center', marginLeft: -50, fontSize: 16, fontWeight: 600, color: '#6A22B0' }}>{s.slide}</div>
        </a>
      </div>
    </Screen>
  );
}
