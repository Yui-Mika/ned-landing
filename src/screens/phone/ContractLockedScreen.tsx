import type { CSSProperties } from 'react';
import { copy } from '@/content/copy';
import { DevnetChip, FONT, Screen, StatusBar } from './parts';

/**
 * Port of docs/design-reference/phone/ContractLocked.dc.html (side client).
 * Markup and inline styles 1:1; strings from copy.screens.contractLocked. Left out: the prototype-only
 * "DEMO · switch to @vinh's phone" link (its empty wrapper with margin-top 14 stays, as on the board)
 * and the boards' entrance animations. Hrefs to other boards are dropped (the screen is a picture).
 */
const s = copy.screens.contractLocked;

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
const ruleText: CSSProperties = { fontSize: 14, lineHeight: 1.45, color: '#3F3F49', paddingTop: 6 };
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

const pill: CSSProperties = {
  height: 52,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  borderRadius: 9999,
  border: 'none',
  fontFamily: FONT.body,
  fontSize: 16,
  fontWeight: 600,
  textDecoration: 'none',
  cursor: 'pointer',
  width: '100%',
};

export function ContractLockedScreen() {
  return (
    <Screen name="contractLocked" style={{ background: '#F4F4F6', color: '#111116', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div style={{ padding: '0 16px', display: 'flex', justifyContent: 'flex-end' }}>
        <DevnetChip />
      </div>
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '20px 24px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div>
          <div style={{ width: 84, height: 84, borderRadius: 26, background: '#7B2FBE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
        </div>
        <h1 style={{ margin: '20px 0 0', fontFamily: FONT.display, fontSize: 28, fontWeight: 700 }}>{s.headline}</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: '#3F3F49' }}>{s.sub}</p>
        <div style={{ marginTop: 22, width: '100%', textAlign: 'left' }}>
          <a
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minHeight: 60,
              padding: '12px 16px',
              boxSizing: 'border-box',
              borderRadius: 20,
              background: '#FFFFFF',
              textDecoration: 'none',
              color: '#111116',
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 9999, background: '#F2EAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6A22B0" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{s.vaultTitle}</div>
              <div style={{ marginTop: 2, fontSize: 12, color: '#5E5E6A' }}>
                {s.vaultSub}
                <span style={{ fontFamily: FONT.mono }}>{s.vaultAddress}</span>
              </div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#6A22B0' }}>
              {s.explorer}{' '}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
              </svg>
            </span>
          </a>
        </div>
        <div style={{ marginTop: 10, width: '100%', padding: 14, boxSizing: 'border-box', textAlign: 'left', borderRadius: 20, background: '#FFFFFF' }}>
          <div role="list" aria-label={s.rulesLabel} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {s.rules.map((rule, i) => (
              <div key={rule} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={ruleIcon}>{RULE_ICONS[i]}</div>
                <div style={ruleText}>{rule}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 14 }} />
      </div>
      <div style={{ padding: '12px 24px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <a style={{ ...pill, background: '#7B2FBE', color: '#FFFFFF' }}>{s.primary}</a>
        <a style={{ ...pill, background: '#F2EAFB', color: '#6A22B0' }}>{s.secondary}</a>
      </div>
    </Screen>
  );
}
