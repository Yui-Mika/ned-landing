import type { CSSProperties, ReactNode } from 'react';
import { copy } from '@/content/copy';
import { FONT } from '@/screens/phone/parts';

/**
 * Port of docs/design-reference/web/WebSignIn.dc.html in its panelOpen = false state (the signed-out wallet panel it
 * opens is a separate board). Markup and inline styles 1:1; strings in copy.web.signIn. The page lives in [data-page]
 * (scrolled by the laptop). Left out: hover / focus styles, the entrance animations, links between boards.
 */
const s = copy.web.signIn;

const card: CSSProperties = { padding: 22, borderRadius: 20, background: '#FFFFFF' };
const cardIcon: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 9999,
  background: '#F2EAFB',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const svg = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
/** Board icons for the three cards, in order. */
const CARD_ICON = [
  'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5',
  'M12 19V5M5 12l7-7 7 7',
  'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
];

type Props = { width: number; height: number; children?: ReactNode };

export function WebSignInScreen({ width, height, children }: Props) {
  return (
    <div
      inert
      data-screen="webSignIn"
      data-focus="laptop-screen"
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        background: '#F4F4F6',
        color: '#111116',
        fontFamily: FONT.body,
        lineHeight: 'normal',
        userSelect: 'none',
      }}
    >
      <div data-page="" style={{ minHeight: height, background: '#F4F4F6' }}>
        <header style={{ position: 'relative', zIndex: 30, background: '#FFFFFF' }}>
          <div
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              padding: '12px 24px',
              boxSizing: 'border-box',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '12px 20px',
            }}
          >
            <a style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#111116' }}>
              <span
                aria-hidden="true"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#7B2FBE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: FONT.display,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                {s.brand.mark}
              </span>
              <span style={{ fontFamily: FONT.display, fontSize: 18, fontWeight: 700 }}>{s.brand.name}</span>
            </a>
            <div style={{ flex: 1 }} />
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                height: 26,
                padding: '0 10px',
                borderRadius: 9999,
                background: '#FFF5E1',
                fontSize: 12,
                fontWeight: 600,
                color: '#8A5300',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: '#F59E0B' }} />
              {s.devnet}
            </span>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                aria-expanded="false"
                aria-haspopup="dialog"
                style={{
                  height: 44,
                  padding: '0 18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 9999,
                  border: 'none',
                  background: '#7B2FBE',
                  color: '#FFFFFF',
                  fontFamily: 'inherit',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <svg {...svg} stroke="#FFFFFF" aria-hidden="true">
                  <rect x="3" y="6" width="18" height="13" rx="2" />
                  <path d="M16 12.5h2M3 9h18" />
                </svg>
                {s.signInButton}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px 64px', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: 640 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: 30,
                padding: '0 12px',
                borderRadius: 9999,
                background: '#F2EAFB',
                fontSize: 13,
                fontWeight: 600,
                color: '#6A22B0',
              }}
            >
              {s.chip}
            </div>
            <h1 style={{ margin: '18px 0 0', fontFamily: FONT.display, fontSize: 52, fontWeight: 700, letterSpacing: -1.4, lineHeight: 1.04 }}>{s.headline}</h1>
            <p style={{ margin: '18px 0 0', fontSize: 18, lineHeight: 1.55, color: '#3F3F49' }}>{s.lead}</p>
            <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <button
                type="button"
                style={{
                  height: 52,
                  padding: '0 24px',
                  borderRadius: 9999,
                  border: 'none',
                  background: '#7B2FBE',
                  color: '#FFFFFF',
                  fontFamily: 'inherit',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {s.cta}
              </button>
              <span style={{ fontSize: 14, color: '#5E5E6A' }}>{s.ctaNote}</span>
            </div>
          </div>

          <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {s.cards.map((c, i) => (
              <div key={c.title} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span aria-hidden="true" style={cardIcon}>
                    <svg {...svg} stroke="#6A22B0">
                      <path d={CARD_ICON[i]} />
                    </svg>
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#5E5E6A' }}>{c.role}</span>
                </div>
                <h2 style={{ margin: '16px 0 0', fontFamily: FONT.display, fontSize: 20, fontWeight: 700 }}>{c.title}</h2>
                <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.55, color: '#3F3F49' }}>{c.text}</p>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 16,
              padding: '18px 22px',
              borderRadius: 20,
              background: '#FFFFFF',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '12px 20px',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 40,
                height: 40,
                borderRadius: 9999,
                background: '#F4F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg {...svg} stroke="#3F3F49">
                <rect x="7" y="2" width="10" height="20" rx="2" />
                <path d="M11 18h2" />
              </svg>
            </span>
            <div style={{ flex: '1 1 360px', minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{s.phone.title}</div>
              <div style={{ marginTop: 2, fontSize: 14, lineHeight: 1.5, color: '#5E5E6A' }}>{s.phone.text}</div>
            </div>
          </div>

          <p style={{ margin: '40px 0 0', fontSize: 13, lineHeight: 1.6, color: '#5E5E6A' }}>{s.footnote}</p>
        </main>
      </div>
      {children}
    </div>
  );
}
