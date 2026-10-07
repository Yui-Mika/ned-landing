import type { CSSProperties, ReactNode } from 'react';
import { copy } from '@/content/copy';
import { PHONE_SCREEN_PX } from './size';

/**
 * Pieces shared by the ported phone boards (docs/design-reference/phone/*.dc.html), copied 1:1.
 * Font stacks map the boards' Google fonts to the self-hosted next/font families.
 */
export const FONT = {
  body: "var(--font-sans), 'Inter', system-ui, sans-serif",
  display: "var(--font-display), 'Space Grotesk', sans-serif",
  mono: "var(--font-mono), 'Space Mono', monospace",
};

/** Board tone table (renderVals TONE): [background, background, text, dot]. */
export const TONE = {
  info: ['#EEEFFE', '#EEEFFE', '#3730A3', '#4F46E5'],
  purple: ['#F2EAFB', '#F2EAFB', '#6A22B0', '#7B2FBE'],
  warning: ['#FFF5E1', '#FFF5E1', '#8A5300', '#F59E0B'],
  success: ['#E7F6EC', '#E7F6EC', '#127A3A', '#16A34A'],
  neutral: ['#EFEFF3', '#EFEFF3', '#4B4B57', '#8A8A96'],
  error: ['#FDECEC', '#FDECEC', '#B42318', '#DC2626'],
} as const;
export type Tone = keyof typeof TONE;

export const chipStyle = (t: Tone): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  minHeight: 24,
  padding: '3px 10px',
  boxSizing: 'border-box',
  borderRadius: 9999,
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.3,
  background: TONE[t][0],
  color: TONE[t][2],
});

export const dotStyle = (t: Tone): CSSProperties => ({
  width: 6,
  height: 6,
  borderRadius: 9999,
  flexShrink: 0,
  background: TONE[t][3],
});

/**
 * `.ned-screen` root. `inert`: these screens are pictures inside the 3D stage, so none of their
 * links or buttons take focus or clicks. The boards' time-based entrance animations are left out
 * (screen states here are a pure function of scroll, SPEC §5.1).
 * lineHeight normal: the boards rely on the browser default, not the page's Tailwind 1.5.
 */
export function Screen({ name, style, children }: { name: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div
      inert
      data-screen={name}
      style={{
        width: PHONE_SCREEN_PX.w,
        height: PHONE_SCREEN_PX.h,
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: FONT.body,
        lineHeight: 'normal',
        userSelect: 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Status bar, identical on every phone board. */
export function StatusBar() {
  return (
    <div style={{ padding: '12px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111116' }}>{copy.screens.status.clock}</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
          <rect x="0" y="4" width="3" height="8" rx="1" fill="#111116" />
          <rect x="4" y="2" width="3" height="10" rx="1" fill="#111116" />
          <rect x="8" y="0" width="3" height="12" rx="1" fill="#111116" />
          <rect x="12" y="2" width="3" height="10" rx="1" fill="#C9C9D2" />
        </svg>
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none" aria-hidden="true">
          <rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="#8A8A96" />
          <rect x="2" y="2" width="15" height="8" rx="1" fill="#111116" />
          <rect x="22.5" y="3.5" width="2" height="5" rx="1" fill="#8A8A96" />
        </svg>
      </div>
    </div>
  );
}

/** "Devnet · test money" pill, as on the boards. */
export function DevnetChip() {
  return (
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
      {copy.screens.status.devnet}
    </span>
  );
}
