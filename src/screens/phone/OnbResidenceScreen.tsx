import type { CSSProperties, ReactNode } from 'react';
import { copy } from '@/content/copy';
import { FONT, Screen, StatusBar } from './parts';

/**
 * Port of docs/design-reference/phone/OnbResidence.dc.html (selected: vn). Markup and inline styles 1:1.
 */
const s = copy.screens.onbResidence;
const SHADOW = '0 1px 2px rgba(17,17,22,0.04), 0 6px 16px -6px rgba(17,17,22,0.10)';

/** Board renderVals o(k): option card, radio ring and dot for selected / not selected. */
const option = (on: boolean) => ({
  card: {
    display: 'block',
    width: '100%',
    padding: 16,
    boxSizing: 'border-box',
    borderRadius: 20,
    cursor: 'pointer',
    color: '#111116',
    fontFamily: 'inherit',
    textAlign: 'left',
    background: on ? '#F2EAFB' : '#FFFFFF',
    border: 'none',
    boxShadow: on ? 'none' : SHADOW,
  } satisfies CSSProperties,
  radio: {
    width: 22,
    height: 22,
    boxSizing: 'border-box',
    borderRadius: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '2px solid ' + (on ? '#6A22B0' : '#8A8A96'),
  } satisfies CSSProperties,
  dot: { width: 10, height: 10, borderRadius: 9999, background: on ? '#6A22B0' : 'transparent' } satisfies CSSProperties,
});

const badge: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 12,
  background: '#EEEEF2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  fontFamily: FONT.display,
  fontSize: 15,
  fontWeight: 700,
};
const title: CSSProperties = { flex: 1, fontFamily: FONT.display, fontSize: 17, fontWeight: 700 };
const body: CSSProperties = { marginTop: 10, fontSize: 13, lineHeight: 1.5, color: '#3F3F49', textAlign: 'left' };

function Option({ on, mark, label, text }: { on: boolean; mark: ReactNode; label: string; text: string }) {
  const o = option(on);
  return (
    <button type="button" role="radio" aria-checked={on} style={o.card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={badge}>{mark}</div>
        <div style={title}>{label}</div>
        <div style={o.radio}>
          <div style={o.dot} />
        </div>
      </div>
      <div style={body}>{text}</div>
    </button>
  );
}

const progressSeg: CSSProperties = { flex: 1, height: 4, borderRadius: 9999, background: '#7B2FBE' };

export function OnbResidenceScreen() {
  return (
    <Screen name="onbResidence" style={{ background: '#F4F4F6', color: '#111116', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div style={{ padding: '4px 20px 0', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 2 }}>
        <a
          aria-label={s.back}
          style={{
            width: 44,
            height: 44,
            background: '#FFFFFF',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            flexShrink: 0,
            border: 'none',
            boxShadow: SHADOW,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111116" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </a>
        <div role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={3} aria-label={s.progress} style={{ flex: 1, display: 'flex', gap: 6 }}>
          <div style={progressSeg} />
          <div style={progressSeg} />
          <div style={progressSeg} />
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '22px 24px 0', position: 'relative', zIndex: 1 }}>
        <h1 style={{ margin: 0, fontFamily: FONT.display, fontSize: 28, fontWeight: 700, letterSpacing: -0.6 }}>{s.headline}</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: '#5E5E6A' }}>{s.sub}</p>
        <div role="radiogroup" aria-label={s.groupLabel} style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Option on mark={s.vn.badge} label={s.vn.title} text={s.vn.body} />
          <Option
            on={false}
            mark={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111116" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
              </svg>
            }
            label={s.intl.title}
            text={s.intl.body}
          />
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#5E5E6A' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5E5E6A" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8v.5" />
          </svg>
          {s.note}
        </div>
      </div>
      <div style={{ padding: '12px 24px 28px', position: 'relative', zIndex: 1 }}>
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
          {s.continue}
        </a>
      </div>
    </Screen>
  );
}
