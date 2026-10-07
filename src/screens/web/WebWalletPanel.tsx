import type { CSSProperties } from 'react';
import { copy } from '@/content/copy';
import { Avatar } from '@/screens/phone/Avatar';
import { FONT } from '@/screens/phone/parts';

/**
 * Port of docs/design-reference/web/WebWalletPanel.dc.html in the state chapter 03 uses: who mia · mode sign ·
 * action create, opened from WebContractNew (so it has a close button). Markup and inline styles 1:1.
 * Width: 390 × 0.86 = 335 px (the board's default scale). Left out: the `.ned-pop` entrance animation.
 */
const s = copy.web.walletPanel;
const W = Math.round(390 * 0.86);
const SHORT_ADDR = '9PZw…rhkW';

const iconBtn: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 9999,
  border: 'none',
  background: '#F4F4F6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  textDecoration: 'none',
};

export function WebWalletPanel({ fingerprint }: { fingerprint: string }) {
  return (
    <div
      role="dialog"
      aria-label={s.dialog}
      style={{
        width: W,
        maxWidth: '100%',
        boxSizing: 'border-box',
        background: '#FFFFFF',
        color: '#111116',
        borderRadius: 20,
        boxShadow: '0 18px 48px rgba(17,17,22,0.16), 0 2px 6px rgba(17,17,22,0.06)',
        fontFamily: FONT.body,
        overflow: 'hidden',
        border: 'none',
      }}
    >
      {/* Extension header (signed in) */}
      <div style={{ height: 52, padding: '0 8px', display: 'flex', alignItems: 'center', gap: 6, background: '#FFFFFF' }}>
        <span
          aria-hidden="true"
          style={{
            width: 32,
            height: 32,
            marginLeft: 2,
            borderRadius: 9,
            background: '#7B2FBE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT.display,
            fontSize: 10,
            fontWeight: 700,
            color: '#FFFFFF',
            flexShrink: 0,
          }}
        >
          N.E.D
        </span>
        <Avatar seed={s.handle} size={28} />
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{s.handle}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#5E5E6A' }}>
            <span style={{ width: 6, height: 6, borderRadius: 9999, background: '#F59E0B' }} />
            Devnet · <span style={{ fontFamily: FONT.mono }}>{SHORT_ADDR}</span>
          </div>
        </div>
        <a aria-label="Open in full view" title="Open in full view" style={iconBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3F3F49" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </a>
        <button type="button" aria-label="Close wallet" style={iconBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3F3F49" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      {/* Confirm request (like an extension's approve window) */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: '#F4F4F6', fontSize: 12, color: '#3F3F49' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3F3F49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <span>
            {s.request.before}
            <strong>{s.request.app}</strong>
            {s.request.after}
          </span>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: '#6A22B0' }}>{s.kicker}</div>
          <div style={{ marginTop: 4, fontFamily: FONT.display, fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>{s.title}</div>
        </div>
        <div style={{ borderRadius: 14, padding: '2px 12px', border: 'none', background: '#F7F7F9' }}>
          {s.rows.map((r, i) => (
            <div
              key={r.k}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
                padding: '9px 0',
                borderTop: i ? '1px solid #F0F0F3' : undefined,
              }}
            >
              <span style={{ fontSize: 13, color: '#5E5E6A', flexShrink: 0 }}>{r.k}</span>
              <span style={{ textAlign: 'right', minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'mono' in r && r.mono ? FONT.mono : undefined }}>
                  {r.v === '{fp}' ? fingerprint : r.v}
                </span>
                {'sub' in r && r.sub && <span style={{ display: 'block', marginTop: 1, fontSize: 11, color: '#5E5E6A' }}>{r.sub}</span>}
              </span>
            </div>
          ))}
        </div>
        <div role="note" style={{ padding: '10px 12px', borderRadius: 12, fontSize: 12, lineHeight: 1.5, background: '#F2EAFB', color: '#6A22B0' }}>
          {s.note}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          <button
            type="button"
            style={{ height: 50, borderRadius: 9999, border: 'none', background: '#F2EAFB', color: '#6A22B0', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >
            {s.cancel}
          </button>
          <button
            type="button"
            data-tap-target="panel-create"
            style={{ height: 50, borderRadius: 9999, border: 'none', background: '#7B2FBE', color: '#FFFFFF', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >
            {s.confirm}
          </button>
        </div>
        <div style={{ fontSize: 11, lineHeight: 1.5, color: '#5E5E6A', textAlign: 'center' }}>{s.footer}</div>
      </div>
    </div>
  );
}
