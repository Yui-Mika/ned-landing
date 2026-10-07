'use client';

import type { CSSProperties } from 'react';
import { motion, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { scrollVh } from '@/motion/scroll';
import { CH05_SLIDE } from '@/scene/poses';
import { DevnetChip, FONT, Screen, StatusBar } from './parts';

/**
 * Port of docs/design-reference/phone/ContractLock.dc.html (balance enough). Markup and inline styles 1:1.
 * The slider thumb follows scroll (CH05_SLIDE): only its position moves, the board's markup is unchanged.
 * Left out: the not-enough state and the entrance animations. SPEC numbers (500.00 / 250.00 USDC).
 */
const s = copy.screens.contractLock;
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
const msRow: CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #F0F0F3' };
const feeRow: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderTop: '1px solid #F0F0F3' };
const ruleIcon: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 9999,
  background: '#F2EAFB',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};
const svgProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: '#6A22B0',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;
const RULE_ICONS = [
  <svg key="check" {...svgProps}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>,
  <svg key="refund" {...svgProps}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </svg>,
  <svg key="lock" {...svgProps}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>,
];

function Thumb() {
  const x = useTransform(scrollVh, [CH05_SLIDE[0], CH05_SLIDE[1]], [0, TRAVEL], { clamp: true });
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

export function ContractLockScreen() {
  return (
    <Screen name="contractLock" style={{ background: '#F4F4F6', color: '#111116', display: 'flex', flexDirection: 'column' }}>
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
        <div
          style={{
            padding: 18,
            textAlign: 'center',
            borderRadius: 20,
            background: '#FFFFFF',
            border: 'none',
            boxShadow: '0 1px 2px rgba(123,47,190,0.06), 0 10px 28px -10px rgba(123,47,190,0.30)',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#3F3F49' }}>{s.totalLabel}</div>
          <div style={{ marginTop: 8, fontFamily: FONT.display, fontSize: 36, fontWeight: 700 }}>{s.total}</div>
          <div style={{ marginTop: 4, fontSize: 13, color: '#3F3F49' }}>{s.totalSub}</div>
        </div>
        <div style={{ padding: '4px 14px', borderRadius: 20, background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '12px 0' }}>
            <span style={{ fontSize: 13, color: '#5E5E6A' }}>{s.destLabel}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
              {s.dest} <span style={sim}>{s.simulated}</span>
            </span>
          </div>
          {s.milestones.map((m) => (
            <div key={m.k} style={msRow}>
              <span style={{ fontSize: 13, color: '#5E5E6A' }}>{m.k}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{m.v}</span>
            </div>
          ))}
          <div style={msRow}>
            <span style={{ fontSize: 13, color: '#5E5E6A' }}>{s.reviewLabel}</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{s.review}</span>
          </div>
        </div>
        <div data-focus="lock-rules" style={{ padding: 14, borderRadius: 20, background: '#FFFFFF' }}>
          <div role="list" aria-label={s.rulesLabel} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {s.rules.map((rule, i) => (
              <div key={rule} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={ruleIcon}>{RULE_ICONS[i]}</div>
                <div style={{ fontSize: 14, lineHeight: 1.45, color: '#3F3F49', paddingTop: 6 }}>{rule}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: 14, borderRadius: 18, background: '#FFFFFF', boxShadow: '0 1px 2px rgba(17,17,22,0.04), 0 6px 16px -6px rgba(17,17,22,0.10)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#5E5E6A' }}>{s.balanceLabel}</span>
            <span style={{ fontFamily: FONT.mono, fontWeight: 700 }}>{s.balance}</span>
          </div>
          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#5E5E6A' }}>{s.afterLabel}</span>
            <span style={{ fontFamily: FONT.mono, fontWeight: 700 }}>{s.after}</span>
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
          data-focus="lock-slider"
          style={{ height: 58, padding: 4, boxSizing: 'border-box', display: 'flex', alignItems: 'center', borderRadius: 9999, background: '#F2EAFB', textDecoration: 'none' }}
        >
          <Thumb />
          <div style={{ flex: 1, textAlign: 'center', marginLeft: -50, fontSize: 16, fontWeight: 600, color: '#6A22B0' }}>{s.slide}</div>
        </a>
      </div>
    </Screen>
  );
}
