import type { CSSProperties, ReactNode } from 'react';
import { copy } from '@/content/copy';
import { FONT } from '@/screens/phone/parts';
import { WebHeader } from './WebHeader';

/**
 * Port of docs/design-reference/web/WebRecords.dc.html · who mia · view activity · period "All time" · filter "All"
 * · panel closed. Markup and inline styles 1:1; strings in copy.web.records. The page lives in [data-page] (scrolled by
 * the laptop; `rc-table` = the activity table). Left out: hover styles, the entrance / swap animations, the By-contract
 * view (not shown in this state) and links between boards.
 */
const s = copy.web.records;

/** Board renderVals TONE (web): [background, text, dot]; event kind → tone; event icons. */
const TONE = {
  purple: ['#F2EAFB', '#6A22B0', '#7B2FBE'],
  info: ['#EEEFFE', '#3730A3', '#4F46E5'],
  warning: ['#FFF5E1', '#8A5300', '#F59E0B'],
  success: ['#E7F6EC', '#127A3A', '#16A34A'],
  neutral: ['#EFEFF3', '#4B4B57', '#8A8A96'],
} as const;
type Kind = 'created' | 'accepted' | 'locked' | 'submitted' | 'review' | 'released' | 'closed';
const KTONE: Record<Kind, keyof typeof TONE> = { created: 'purple', accepted: 'purple', locked: 'purple', submitted: 'info', review: 'warning', released: 'success', closed: 'neutral' };
const ICON: Record<Kind, string> = {
  created: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6',
  accepted: 'M5 12.5l4.5 4.5L19 7.5',
  locked: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  submitted: 'M12 19V5M5 12l7-7 7 7',
  review: 'M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  released: 'M12 3v12M7 10l5 5 5-5M5 21h14',
  closed: 'M6 6l12 12M18 6 6 18',
};

const SHADOW = '0 1px 2px rgba(17,17,22,0.04), 0 6px 16px -6px rgba(17,17,22,0.10)';
const GRID = '1.1fr 2fr 1.6fr 1fr 1.2fr 0.6fr';
const navLink: CSSProperties = {
  height: 44,
  padding: '0 12px',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  borderRadius: 12,
  color: '#3F3F49',
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
};
const navIcon = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: '#3F3F49', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
const tabStyle = (on: boolean): CSSProperties => ({
  height: 36,
  padding: '0 16px',
  border: 'none',
  borderRadius: 9999,
  fontFamily: 'inherit',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  background: on ? '#FFFFFF' : 'transparent',
  color: on ? '#111116' : '#5E5E6A',
  boxShadow: on ? '0 1px 2px rgba(17,17,22,0.06), 0 4px 10px -4px rgba(17,17,22,0.12)' : 'none',
});
const pillStyle = (on: boolean): CSSProperties => ({
  height: 32,
  padding: '0 12px',
  border: 'none',
  borderRadius: 9999,
  fontFamily: 'inherit',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  background: on ? '#7B2FBE' : '#FFFFFF',
  color: on ? '#FFFFFF' : '#3F3F49',
});

function Nav() {
  const n = s.nav;
  return (
    <nav aria-label={n.label} style={{ flex: '1 1 200px', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <a style={navLink}>
        <svg {...navIcon}>
          <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
        </svg>
        {n.overview}
      </a>
      <a style={navLink}>
        <svg {...navIcon} strokeLinejoin={undefined}>
          <path d="M12 5v14M5 12h14" />
        </svg>
        {n.newContract}
      </a>
      <a style={navLink}>
        <svg {...navIcon}>
          <path d="M4 8h16v11H4zM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 13h16" />
        </svg>
        {n.jobs}
      </a>
      <a aria-current="page" style={{ ...navLink, background: '#FFFFFF', color: '#111116' }}>
        <svg {...navIcon} stroke="#7B2FBE" strokeLinejoin={undefined}>
          <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
        </svg>
        {n.records}
      </a>
      <button type="button" style={{ ...navLink, border: 'none', background: 'transparent', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
        <svg {...navIcon}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
        {n.settings}
        <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 500, color: '#5E5E6A' }}>{n.inWallet}</span>
      </button>
    </nav>
  );
}

function Main() {
  return (
    <main style={{ flex: '999 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: FONT.display, fontSize: 34, fontWeight: 700, letterSpacing: -0.8 }}>{s.title}</h1>
          <div style={{ marginTop: 4, fontSize: 14, color: '#5E5E6A' }}>{s.subtitle}</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <label htmlFor="rc-period" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            {s.periodLabel}
          </label>
          <select
            id="rc-period"
            defaultValue="all"
            style={{ height: 40, padding: '0 12px', border: 'none', borderRadius: 9999, background: '#FFFFFF', color: '#111116', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, boxShadow: SHADOW }}
          >
            <option value="all">{s.period[0]}</option>
            <option value="oct">{s.period[1]}</option>
            <option value="sep">{s.period[2]}</option>
          </select>
          <button
            type="button"
            style={{
              height: 40,
              padding: '0 16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              border: 'none',
              borderRadius: 9999,
              background: '#F2EAFB',
              color: '#6A22B0',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
            </svg>
            {s.export}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
        {s.stats.map((st) => (
          <div key={st.label} style={{ padding: 18, borderRadius: 20, background: '#FFFFFF', boxShadow: SHADOW }}>
            <div style={{ fontSize: 13, color: '#5E5E6A' }}>{st.label}</div>
            <div style={{ marginTop: 8, fontFamily: FONT.display, fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>{st.value}</div>
            <div style={{ marginTop: 4, fontSize: 12, color: '#5E5E6A' }}>{st.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div role="tablist" aria-label={s.viewsLabel} style={{ display: 'inline-flex', padding: 4, borderRadius: 9999, background: '#EBEBF0' }}>
          {s.views.map((v, i) => (
            <button key={v} type="button" role="tab" aria-selected={i === 1} style={tabStyle(i === 1)}>
              {v}
            </button>
          ))}
        </div>
        <div role="group" aria-label={s.filtersLabel} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {s.filters.map((f, i) => (
            <button key={f} type="button" aria-pressed={i === 0} style={pillStyle(i === 0)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div data-focus="rc-table" style={{ borderRadius: 20, background: '#FFFFFF', boxShadow: SHADOW, overflowX: 'auto' }}>
        <div role="table" aria-label={s.tableLabel} style={{ minWidth: 820 }}>
          <div role="row" style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '12px 20px', fontSize: 12, fontWeight: 600, color: '#5E5E6A' }}>
            {s.columns.map((c, i) => (
              <span key={c} role="columnheader" style={i >= 4 ? { textAlign: 'right' } : undefined}>
                {c}
              </span>
            ))}
          </div>
          {s.activity.map((a) => {
            const t = TONE[KTONE[a.kind as Kind]];
            return (
              <div
                key={a.when + a.title}
                role="row"
                style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #F0F0F3' }}
              >
                <span role="cell" style={{ fontSize: 13, color: '#3F3F49' }}>
                  {a.when}
                </span>
                <span role="cell" style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <span
                    aria-hidden="true"
                    style={{ width: 28, height: 28, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: t[0] }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t[1]} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={ICON[a.kind as Kind]} />
                    </svg>
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{a.title}</span>
                </span>
                <span role="cell" style={{ fontSize: 13, color: '#3F3F49' }}>
                  {a.contract}
                </span>
                <span role="cell" style={{ fontSize: 13, color: '#3F3F49' }}>
                  {a.party}
                </span>
                <span role="cell" style={{ textAlign: 'right', fontFamily: FONT.mono, fontSize: 13, fontWeight: 700 }}>
                  {a.amt}
                </span>
                <span role="cell" style={{ textAlign: 'right' }}>
                  <a style={{ fontSize: 13, fontWeight: 600, textDecoration: 'none', color: '#6A22B0' }}>{s.view}</a>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: '#5E5E6A' }}>{s.foot}</p>
    </main>
  );
}

type Props = { width: number; height: number; children?: ReactNode };

export function WebRecordsScreen({ width, height, children }: Props) {
  return (
    <div
      inert
      data-screen="webRecords"
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
        <WebHeader brand={s.brand} devnet={s.devnet} wallet={s.wallet} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: 24, boxSizing: 'border-box', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
          <Nav />
          <Main />
        </div>
      </div>
      {children}
    </div>
  );
}
