'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { motion, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { scrollVh } from '@/motion/scroll';
import { CH13 } from '@/scene/poses';
import { DevnetChip, FONT, Screen, StatusBar } from './parts';

/**
 * Port of docs/design-reference/phone/Disclosures.dc.html. Markup and inline styles 1:1. Left out: the row "Disputes
 * have no neutral arbiter" (disputes are not available, SPEC §7 / §12.5) and the entrance animations.
 * Chapter 13, by scroll: the list scrolls from top to end (CH13.scroll), and each row named by a NOT YET item is dimmed
 * until that item appears, then lights (CH13.notYet).
 */
const s = copy.screens.disclosures;
/** A row waiting for its NOT YET line. */
const DIM = 0.35;
/** Row id → the window in which it lights. */
const LIGHT = new Map<string, [number, number]>(
  copy.real.notYet.items.flatMap((item, i) => (item.row ? [[item.row, CH13.notYet[i]] as [string, [number, number]]] : [])),
);

/** Board icon per row (paths and shapes as drawn on the board). */
const ICON: Record<string, React.ReactNode> = {
  devnet: <path d="M12 3 2 20h20zM12 10v4M12 17v.5" />,
  kyc: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  phone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  ),
  audit: <path d="M9 3h6l1 4H8zM6 7h12l-1 14H7z" />,
  partner: <path d="M3 10 12 4l9 6M5 10v8M19 10v8M3 20h18" />,
  fees: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12h6" />
    </>
  ),
  vn: <path d="M4 12h16M14 6l6 6-6 6" />,
  circle: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  public: <path d="M4 4h16v16H4zM8 9h8M8 13h8M8 17h5" />,
  advice: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8v.5" />
    </>
  ),
};

const rowStyle = (first: boolean): CSSProperties => ({ display: 'flex', gap: 12, padding: '13px 14px', borderTop: first ? 'none' : '1px solid #F0F0F3' });

function RowBody({ id, title, text }: { id: string; title: string; text: string }) {
  return (
    <>
      <div
        style={{ width: 32, height: 32, borderRadius: 10, background: '#F2EAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6A22B0" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {ICON[id]}
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        <div style={{ marginTop: 2, fontSize: 12, lineHeight: 1.5, color: '#5E5E6A' }}>{text}</div>
      </div>
    </>
  );
}

function LitRow({ window: w, first, ...row }: { window: [number, number]; first: boolean; id: string; title: string; text: string }) {
  const opacity = useTransform(scrollVh, w, [DIM, 1], { clamp: true });
  return (
    <motion.div role="listitem" data-row={row.id} style={{ ...rowStyle(first), opacity }}>
      <RowBody {...row} />
    </motion.div>
  );
}

export function DisclosuresScreen() {
  const list = useRef<HTMLDivElement>(null);
  // The list scrolls with the page: a pure function of scroll (DOM write, no React state).
  useEffect(() => {
    const [a, b] = CH13.scroll;
    const apply = (vh: number) => {
      const el = list.current;
      if (!el) return;
      const p = Math.min(1, Math.max(0, (vh - a) / (b - a)));
      el.scrollTop = p * (el.scrollHeight - el.clientHeight);
    };
    apply(scrollVh.get());
    return scrollVh.on('change', apply);
  }, []);

  return (
    <Screen name="disclosures" style={{ background: '#F4F4F6', color: '#111116', display: 'flex', flexDirection: 'column' }}>
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

      <div ref={list} style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '12px 16px 28px' }}>
        <p style={{ margin: '0 4px 12px', fontSize: 13, lineHeight: 1.5, color: '#3F3F49' }}>{s.intro}</p>
        <div role="list" style={{ overflow: 'hidden', borderRadius: 20, background: '#FFFFFF' }}>
          {s.rows.map((row, i) => {
            const w = LIGHT.get(row.id);
            return w ? (
              <LitRow key={row.id} window={w} first={i === 0} {...row} />
            ) : (
              <div key={row.id} role="listitem" data-row={row.id} style={rowStyle(i === 0)}>
                <RowBody {...row} />
              </div>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}
