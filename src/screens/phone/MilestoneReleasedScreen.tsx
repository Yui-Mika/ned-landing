import type { ReactNode } from 'react';
import { copy } from '@/content/copy';
import { FONT, Screen, StatusBar, chipStyle, dotStyle } from './parts';

/**
 * Port of docs/design-reference/phone/MilestoneReleased.dc.html (contract A). Markup and inline styles 1:1.
 * `client`: who client · view intl (its prototype-only "DEMO · switch to @vinh's phone" removed).
 * `freelancerVN`: = phone/MilestoneReleasedVN, who freelancer · view vn.
 * Teddy (happy, on success) is the board's image. Receipt amounts carry `data-focus` for the amount chip (chapter 07).
 * Left out: the entrance animations.
 */
const s = copy.screens.milestoneReleased;

export type MilestoneReleasedVariant = 'client' | 'freelancerVN';

export function MilestoneReleasedScreen({ variant }: { variant: MilestoneReleasedVariant }) {
  const v = s[variant];
  let sub: ReactNode;
  if (variant === 'freelancerVN') {
    const f = s.freelancerVN;
    sub = (
      <>
        {f.subAmount}
        {/* SPEC text: never under 11 px on screen (scale set by Phone.tsx). */}
        <span style={{ fontSize: 'max(14px, calc(11px / var(--ned-screen-scale, 1)))' }}>{f.subEstimate}</span>
        {f.subRest}
      </>
    );
  } else sub = s.client.sub;

  return (
    <Screen
      name={variant === 'client' ? 'milestoneReleased' : 'milestoneReleasedVN'}
      style={{ background: '#F4F4F6', color: '#111116', display: 'flex', flexDirection: 'column' }}
    >
      <StatusBar />
      <div style={{ padding: '0 16px', display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            height: 24,
            padding: '0 9px',
            borderRadius: 9999,
            background: '#FFF5E1',
            fontSize: 11,
            fontWeight: 600,
            color: '#8A5300',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 9999, background: '#F59E0B' }} />
          {s.devnet}
        </span>
      </div>
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '10px 24px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <img src="/design-assets/teddy-happy_22f5490f.png" alt={s.teddyAlt} style={{ width: 150, height: 116, objectFit: 'contain' }} />
        <div style={{ marginTop: 14 }}>
          <span style={chipStyle('success')}>
            <span style={dotStyle('success')} />
            {s.chip}
          </span>
        </div>
        <h1 style={{ margin: '12px 0 0', fontFamily: FONT.display, fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>{v.headline}</h1>
        {variant === 'freelancerVN' && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', flexWrap: 'wrap', fontSize: 13, color: '#3F3F49' }}>
            {s.simLine}
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
        )}
        <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: '#3F3F49' }}>{sub}</p>
        <div
          role="group"
          aria-label={s.receiptLabel}
          style={{ marginTop: 18, width: '100%', padding: '4px 14px', boxSizing: 'border-box', textAlign: 'left', borderRadius: 20, background: '#FFFFFF' }}
        >
          {v.receipt.map((r, i) => (
            <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '11px 0', borderTop: i ? '1px solid #E6E6EB' : 'none' }}>
              <span style={{ fontSize: 13, color: '#5E5E6A' }}>{r.k}</span>
              <span data-focus={'focus' in r ? r.focus : undefined} style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>
                {r.v}
              </span>
            </div>
          ))}
          <a
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderTop: '1px solid #F0F0F3',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              color: '#6A22B0',
            }}
          >
            {s.explorer}{' '}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
            </svg>
          </a>
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: '#5E5E6A' }}>{s.fees}</div>
      </div>
      <div style={{ padding: '12px 24px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <a
          style={{
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
          {s.done}
        </a>
      </div>
    </Screen>
  );
}
