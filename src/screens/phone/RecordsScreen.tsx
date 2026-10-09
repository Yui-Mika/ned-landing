import type { CSSProperties } from 'react';
import { copy } from '@/content/copy';
import { DevnetChip, FONT, Screen, StatusBar, chipStyle, dotStyle } from './parts';

/**
 * Port of docs/design-reference/phone/Records.dc.html · view vn (not empty). Markup and inline styles 1:1; strings in
 * copy.screens.records. Left out: the entrance animations, the board's Export CSV state change and links to other
 * boards (the screen is a picture).
 */
const s = copy.screens.records;

const tab: CSSProperties = { flex: 1, height: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, textDecoration: 'none' };
const tabLabel: CSSProperties = { fontSize: 11, fontWeight: 500, color: '#5E5E6A' };
const navIcon = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: '#5E5E6A', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
const EXPLORER = 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5';

export function RecordsScreen() {
  return (
    <Screen name="records" style={{ background: '#F4F4F6', color: '#111116', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div style={{ padding: '4px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <h1 style={{ margin: 0, fontFamily: FONT.display, fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>{s.title}</h1>
        <DevnetChip />
      </div>
      <div style={{ flex: 1, overflow: 'hidden', padding: '12px 16px 120px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: '#3F3F49' }}>{s.intro}</div>
        <div
          style={{
            padding: 16,
            borderRadius: 20,
            background: '#FFFFFF',
            border: 'none',
            boxShadow: '0 1px 2px rgba(123,47,190,0.06), 0 10px 28px -10px rgba(123,47,190,0.30)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#3F3F49' }}>{s.month}</span>
            <button
              type="button"
              style={{
                height: 36,
                padding: '0 12px',
                borderRadius: 10,
                border: 'none',
                background: '#111116',
                color: '#FFFFFF',
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {s.export}
            </button>
          </div>
          <div style={{ marginTop: 8, fontFamily: FONT.display, fontSize: 30, fontWeight: 700 }}>{s.monthTotal}</div>
          <div style={{ marginTop: 2, fontSize: 12, color: '#3F3F49' }}>
            {/* SPEC text: never under 11 px on screen, whatever the device scale (set by Phone.tsx). */}
            <span style={{ fontSize: 'max(12px, calc(11px / var(--ned-screen-scale, 1)))' }}>{s.monthSubEstimate}</span>
            {s.monthSubRest}
          </div>
        </div>
        <div style={{ overflow: 'hidden', borderRadius: 20, background: '#FFFFFF' }}>
          {s.rows.map((r, i) => (
            <div key={r.title} style={{ padding: '12px 14px', borderTop: i ? '1px solid #F0F0F3' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</div>
                  <div style={{ marginTop: 2, fontSize: 12, color: '#5E5E6A' }}>{r.meta}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 700 }}>{r.amt}</div>
                  <div style={{ fontSize: 11, color: '#5E5E6A' }}>{r.sub}</div>
                </div>
              </div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={chipStyle('success')}>
                  <span style={dotStyle('success')} />
                  {r.status}
                </span>
                <a style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minHeight: 32, fontSize: 12, fontWeight: 600, textDecoration: 'none', color: '#6A22B0' }}>
                  {s.explorer}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={EXPLORER} />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, lineHeight: 1.5, color: '#5E5E6A' }}>{s.foot}</div>
      </div>
      <nav
        aria-label={s.nav.label}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 84,
          boxSizing: 'border-box',
          padding: '4px 8px 22px',
          display: 'flex',
          alignItems: 'center',
          background: '#FFFFFF',
          zIndex: 8,
          boxShadow: '0 -10px 30px -12px rgba(17,17,22,0.10)',
        }}
      >
        <a style={tab}>
          <svg {...navIcon}>
            <path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
          </svg>
          <span style={tabLabel}>{s.nav.home}</span>
        </a>
        <a style={tab}>
          <svg {...navIcon}>
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path d="M9 8h6M9 12h6M9 16h3" />
          </svg>
          <span style={tabLabel}>{s.nav.contracts}</span>
        </a>
        <div aria-current="page" style={tab}>
          <svg {...navIcon} stroke="#7B2FBE" strokeWidth={2.1}>
            <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#7B2FBE' }}>{s.nav.records}</span>
        </div>
        <a style={tab}>
          <svg {...navIcon}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
          <span style={tabLabel}>{s.nav.settings}</span>
        </a>
      </nav>
    </Screen>
  );
}
