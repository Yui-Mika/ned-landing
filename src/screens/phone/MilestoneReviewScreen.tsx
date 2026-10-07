'use client';

import { useState, type CSSProperties } from 'react';
import { motion, useMotionValueEvent, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { scrollVh } from '@/motion/scroll';
import { CH07_SLIDE, ch07LinkChanged } from '@/scene/poses';
import { briefFingerprint } from '@/screens/web/WebContractNewScreen';
import { DevnetChip, FONT, Screen, StatusBar } from './parts';

/**
 * Port of docs/design-reference/phone/MilestoneReview.dc.html (review 3 days). Markup and inline styles 1:1.
 * From scroll: the link field holds the board's matching sample, or its changed sample during one flash
 * (ch07LinkChanged), and the check result follows the board's own rule (fingerprints compared); the slider thumb
 * follows CH07_SLIDE. Left out: the board's 1 s countdown timer (shown as at t = 0), the entrance animations and
 * the board's Dispute button and "unless you dispute" (disputes are not available, SPEC §12.5).
 */
const s = copy.screens.milestoneReview;
/** Thumb travel: track 358 px (390 − 2 × 16 gutter), padding 4 each side, thumb 50. */
const TRAVEL = 390 - 32 - 8 - 50;
/** Board renderVals: onchain = fp(the submitted link). */
const ONCHAIN = briefFingerprint(s.link);

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
  const x = useTransform(scrollVh, [CH07_SLIDE[0], CH07_SLIDE[1]], [0, TRAVEL], { clamp: true });
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

function useLink() {
  const [changed, setChanged] = useState(() => ch07LinkChanged(scrollVh.get()));
  useMotionValueEvent(scrollVh, 'change', (vh) => {
    const next = ch07LinkChanged(vh);
    if (next !== changed) setChanged(next);
  });
  return changed ? s.linkChanged : s.link;
}

export function MilestoneReviewScreen() {
  const link = useLink();
  const ok = briefFingerprint(link) === ONCHAIN;
  return (
    <Screen name="milestoneReview" style={{ background: '#F4F4F6', color: '#111116', display: 'flex', flexDirection: 'column' }}>
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
              <div style={{ marginTop: 3, fontSize: 12, color: '#5E5E6A' }}>{s.by}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 15, fontWeight: 700 }}>{s.amt}</div>
              <div style={{ fontSize: 11, color: '#5E5E6A' }}>{s.amtSub}</div>
            </div>
          </div>
        </div>
        <div role="timer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 14, fontSize: 13, background: '#FFFFFF', color: '#3F3F49' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2.5 2M9 2h6" />
          </svg>
          <span>
            {s.cdBefore}
            <strong style={{ fontFamily: FONT.mono }}>{s.cd}</strong>
          </span>
        </div>
        <div style={{ padding: 14, borderRadius: 20, background: '#FFFFFF' }}>
          <label htmlFor="rv-link" style={{ fontSize: 14, fontWeight: 600 }}>
            {s.checkLabel}
          </label>
          <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.45, color: '#5E5E6A' }}>{s.checkHelp}</div>
          <input
            id="rv-link"
            type="url"
            readOnly
            value={link}
            placeholder={s.placeholder}
            autoComplete="off"
            spellCheck={false}
            style={{
              marginTop: 10,
              width: '100%',
              boxSizing: 'border-box',
              height: 50,
              padding: '0 12px',
              borderRadius: 12,
              background: '#F4F4F6',
              color: '#111116',
              fontFamily: FONT.mono,
              fontSize: 13,
              outline: 'none',
              border: 'none',
            }}
          />
          <div
            role="status"
            data-link-check={ok ? 'match' : 'differs'}
            style={{ marginTop: 10, padding: '10px 12px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: ok ? '#E7F6EC' : '#FDECEC', color: ok ? '#127A3A' : '#B42318' }}
          >
            {ok ? s.match : s.noMatch}
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: '#5E5E6A' }}>
            {s.onchain}
            {ONCHAIN}
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
      <div style={{ padding: '10px 16px 26px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <a
          aria-label={s.slide}
          data-focus="release-slider"
          style={{ height: 58, padding: 4, boxSizing: 'border-box', display: 'flex', alignItems: 'center', borderRadius: 9999, background: '#F2EAFB', textDecoration: 'none' }}
        >
          <Thumb />
          <div style={{ flex: 1, textAlign: 'center', marginLeft: -50, fontSize: 16, fontWeight: 600, color: '#6A22B0' }}>{s.slide}</div>
        </a>
      </div>
    </Screen>
  );
}
