import type { CSSProperties, ReactNode } from 'react';
import { copy } from '@/content/copy';
import { FONT, Screen, StatusBar } from './parts';

/**
 * Port of docs/design-reference/phone/OnbWelcome.dc.html. Markup and inline styles 1:1.
 * `data-tap-target="google"` on the button only anchors the landing-layer tap mark (not part of the UI).
 */
const s = copy.screens.onbWelcome;

const tile: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 10,
  background: '#F2EAFB',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  border: 'none',
};
const icon = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: '#6A22B0', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const ICONS: ReactNode[] = [
  <svg key="lock" {...icon}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>,
  <svg key="globe" {...icon}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>,
  <svg key="timer" {...icon}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2M9 2h6" />
  </svg>,
];

// Board links keep the browser's default underline (the page's Tailwind reset removes it).
const legalLink: CSSProperties = { color: '#6A22B0', textDecoration: 'underline' };

export function OnbWelcomeScreen() {
  return (
    <Screen name="onbWelcome" style={{ background: '#F4F4F6', color: '#111116', display: 'flex', flexDirection: 'column' }}>
      <StatusBar variant="onb" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
          <div
            style={{
              width: '100%',
              height: 220,
              borderRadius: 28,
              background: '#EDE3FB',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <img
              src="/design-assets/teddy-waving_5bb51609.png"
              alt={s.teddyAlt}
              style={{ width: 230, height: 180, objectFit: 'contain', marginBottom: 8 }}
            />
          </div>
        </div>
        <h1 style={{ margin: '26px 0 0', fontFamily: FONT.display, fontSize: 32, fontWeight: 700, lineHeight: 1.12, letterSpacing: -1 }}>{s.headline}</h1>
        <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.5, color: '#5E5E6A' }}>{s.sub}</p>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {s.points.map((point, i) => (
            <div key={point} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={tile}>{ICONS[i]}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#111116' }}>{point}</div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <a
          data-tap-target="google"
          style={{
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            borderRadius: 9999,
            background: '#111116',
            fontSize: 16,
            fontWeight: 600,
            color: '#FFFFFF',
            textDecoration: 'none',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: 24,
              height: 24,
              borderRadius: 9999,
              border: '2px solid #FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT.body,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {s.googleMark}
          </div>
          {s.google}
        </a>
        <p style={{ margin: '14px 0 28px', fontSize: 11, lineHeight: 1.5, textAlign: 'center', color: '#5E5E6A' }}>
          {s.legal.before}
          <a style={legalLink}>{s.legal.terms}</a>
          {s.legal.and}
          <a style={legalLink}>{s.legal.privacy}</a>
          {s.legal.after}
        </p>
      </div>
    </Screen>
  );
}
