import type { ReactNode } from 'react';
import { Avatar } from '@/screens/phone/Avatar';
import { FONT } from '@/screens/phone/parts';

/**
 * The Workspace header shared 1:1 by the web boards (WebContractNew, WebWorkspace, WebSubmit): brand, devnet chip and
 * the wallet button. `panel`: the wallet panel, opened under the button (board: absolute, right 0, 10 px below).
 */
type Props = {
  brand: { mark: string; name: string };
  devnet: string;
  wallet: { handle: string; label: string; sub: string };
  panel?: ReactNode;
};

export function WebHeader({ brand, devnet, wallet: w, panel }: Props) {
  return (
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
            {brand.mark}
          </span>
          <span style={{ fontFamily: FONT.display, fontSize: 18, fontWeight: 700 }}>{brand.name}</span>
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
          {devnet}
        </span>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            aria-label={w.label}
            style={{
              height: 44,
              padding: '0 12px 0 4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 9999,
              background: '#F4F4F6',
              color: '#111116',
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <Avatar seed={w.handle} size={34} />
            <span style={{ textAlign: 'left', lineHeight: 1.15 }}>
              <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>@{w.handle}</span>
              <span style={{ display: 'block', fontSize: 11, color: '#5E5E6A' }}>{w.sub}</span>
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3F3F49" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {panel}
        </div>
      </div>
    </header>
  );
}
