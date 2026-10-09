import type { CSSProperties, ReactNode } from 'react';
import { copy } from '@/content/copy';
import { Avatar } from '@/screens/phone/Avatar';
import { FONT } from '@/screens/phone/parts';
import { WebHeader } from './WebHeader';
import { WebWalletPanel } from './WebWalletPanel';

/**
 * Port of docs/design-reference/web/WebWorkspace.dc.html (who: mia). Markup and inline styles 1:1; samples in
 * copy.web.workspace (chapter 05: before the lock). The page lives in [data-page] (scrolled by the laptop); the
 * wallet panel opens under the wallet button, as on the board (mode app: the phone screen at 86%).
 * Left out: hover styles, the entrance animations, links between boards.
 */
type Tone = keyof typeof TONE;
type Stat = { label: string; value: string; sub: string };
type Need = { title: string; sub: string; when: string; cta: string; icon: 'lock' | 'submit'; tone: Tone; wTone: Tone };
type Row = { seed: string; title: string; party: string; ms: string; next: string; amt: string; amtSub: string; status: string; tone: Tone };
/** The board's renderVals for one `who`, resolved in copy.ts. */
type WS = Omit<typeof copy.web.workspace, 'stats' | 'needs' | 'rows' | 'name' | 'cta' | 'ctaIcon' | 'isClient' | 'wallet' | 'table'> & {
  wallet: { handle: string; label: string; sub: string };
  name: string;
  cta: string;
  ctaIcon: 'plus' | 'share';
  isClient: boolean;
  stats: readonly Stat[];
  needs: readonly Need[];
  rows: readonly Row[];
  table: { label: string; cols: readonly string[] };
};
const WHO: Record<'mia' | 'vinh', WS> = { mia: copy.web.workspace, vinh: copy.web.workspaceVinh };

/** Board renderVals TONE (web): [background, text, dot]. */
const TONE = {
  info: ['#EEEFFE', '#3730A3', '#4F46E5'],
  purple: ['#F2EAFB', '#6A22B0', '#7B2FBE'],
  warning: ['#FFF5E1', '#8A5300', '#F59E0B'],
  success: ['#E7F6EC', '#127A3A', '#16A34A'],
} as const;
const chip = (t: keyof typeof TONE): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  minHeight: 26,
  padding: '3px 10px',
  boxSizing: 'border-box',
  borderRadius: 9999,
  fontSize: 12,
  fontWeight: 600,
  background: TONE[t][0],
  color: TONE[t][1],
});
const dot = (t: keyof typeof TONE): CSSProperties => ({ width: 6, height: 6, borderRadius: 9999, flexShrink: 0, background: TONE[t][2] });

const nav: CSSProperties = {
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
const GRID = '2.2fr 1.3fr 1fr 1.8fr 1.4fr 1.3fr';
/** Lock icon path (the boards' lock: web/WebWalletPanel request row). */
const LOCK = 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4';
const PLUS = 'M12 5v14M5 12h14';
/** Board renderVals P: the need icons and the freelancer's "Share" CTA icon. */
const NEED_ICON = { lock: LOCK, submit: 'M12 19V5M5 12l7-7 7 7' } as const;
const SHARE = 'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13';

function Nav({ s }: { s: WS }) {
  const n = s.nav;
  return (
    <nav aria-label={n.label} style={{ flex: '1 1 200px', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <a aria-current="page" style={{ ...nav, background: '#FFFFFF', color: '#111116' }}>
        <svg {...navIcon} stroke="#7B2FBE">
          <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
        </svg>
        {n.overview}
      </a>
      <a style={nav}>
        <svg {...navIcon}>
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6" />
        </svg>
        {n.contracts}
      </a>
      {s.isClient && (
        <a style={nav}>
          <svg {...navIcon} strokeLinejoin={undefined}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          {n.newContract}
        </a>
      )}
      <a style={nav}>
        <svg {...navIcon}>
          <path d="M4 8h16v11H4zM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 13h16" />
        </svg>
        {n.jobs}
      </a>
      <a style={nav}>
        <svg {...navIcon} strokeLinejoin={undefined}>
          <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
        </svg>
        {n.records}
      </a>
      <button type="button" style={{ ...nav, border: 'none', background: 'transparent', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
        <svg {...navIcon}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
        {n.settings}
        <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 500, color: '#5E5E6A' }}>{n.settingsSub}</span>
      </button>
      <div style={{ marginTop: 16, padding: 14, borderRadius: 16, background: '#FFFFFF' }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{s.phoneCard.title}</div>
        <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.5, color: '#5E5E6A' }}>{s.phoneCard.body}</div>
      </div>
    </nav>
  );
}

function Main({ s }: { s: WS }) {
  const mia = s.isClient;
  return (
    <main style={{ flex: '999 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <h1 style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#5E5E6A' }}>{s.greeting}</span>
          <span style={{ fontFamily: FONT.display, fontSize: 34, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.1 }}>{s.name}</span>
        </h1>
        <a
          style={{
            height: 48,
            padding: '0 20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 9999,
            background: '#7B2FBE',
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={s.ctaIcon === 'share' ? SHARE : PLUS} />
          </svg>
          {s.cta}
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {s.stats.map((st) => (
          <div key={st.label} style={{ padding: 18, borderRadius: 20, background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#5E5E6A' }}>{st.label}</span>
            </div>
            <div style={{ marginTop: 8, fontFamily: FONT.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>{st.value}</div>
            <div style={{ marginTop: 4, fontSize: 12, color: '#5E5E6A' }}>{st.sub}</div>
          </div>
        ))}
      </div>

      <section aria-labelledby="ws-needs">
        <h2 id="ws-needs" style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 600, color: '#5E5E6A' }}>
          {s.needsTitle}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
          {s.needs.map((n) => (
            <div key={n.title} style={{ padding: 18, borderRadius: 20, background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span
                  aria-hidden="true"
                  style={{ width: 40, height: 40, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: TONE[n.tone][0] }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TONE[n.tone][1]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={NEED_ICON[n.icon]} />
                  </svg>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{n.title}</div>
                  <div style={{ marginTop: 3, fontSize: 13, lineHeight: 1.45, color: '#5E5E6A' }}>{n.sub}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <span style={chip(n.wTone)}>
                  <span style={dot(n.wTone)} />
                  {n.when}
                </span>
                <a
                  data-tap-target={mia ? 'ws-lock' : undefined}
                  data-focus={mia ? 'ws-lock' : undefined}
                  style={{
                    height: 40,
                    padding: '0 16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: 9999,
                    background: '#F2EAFB',
                    color: '#6A22B0',
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  {n.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="ws-contracts-h">
        <div style={{ margin: '0 0 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 id="ws-contracts-h" style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#5E5E6A' }}>
            {s.contractsTitle}
          </h2>
          <a style={{ fontSize: 14, fontWeight: 600, textDecoration: 'none', color: '#6A22B0' }}>{s.history}</a>
        </div>
        <div style={{ borderRadius: 20, background: '#FFFFFF', overflowX: 'auto' }}>
          <div role="table" aria-label={s.table.label} style={{ minWidth: 760 }}>
            <div
              role="row"
              style={{
                display: 'grid',
                gridTemplateColumns: GRID,
                gap: 12,
                padding: '12px 18px',
                borderBottom: '1px solid #F0F0F3',
                fontSize: 12,
                fontWeight: 600,
                color: '#5E5E6A',
              }}
            >
              {s.table.cols.map((c, i) => (
                <span key={c} role="columnheader" style={i === 4 ? { textAlign: 'right' } : undefined}>
                  {c}
                </span>
              ))}
            </div>
            {s.rows.map((r) => (
              <a
                key={r.title}
                role="row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: GRID,
                  gap: 12,
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderBottom: '1px solid #F0F0F3',
                  color: '#111116',
                  textDecoration: 'none',
                }}
              >
                <span role="cell" style={{ fontSize: 14, fontWeight: 600 }}>
                  {r.title}
                </span>
                <span role="cell" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <Avatar seed={r.seed} size={28} />
                  {r.party}
                </span>
                <span role="cell" style={{ fontSize: 14, color: '#3F3F49' }}>
                  {r.ms}
                </span>
                <span role="cell" style={{ fontSize: 13, lineHeight: 1.4, color: '#3F3F49' }}>
                  {r.next}
                </span>
                <span role="cell" style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', fontFamily: FONT.mono, fontSize: 14, fontWeight: 700 }}>{r.amt}</span>
                  <span style={{ display: 'block', fontSize: 11, color: '#5E5E6A' }}>{r.amtSub}</span>
                </span>
                <span role="cell">
                  <span style={chip(r.tone)}>
                    <span style={dot(r.tone)} />
                    {r.status}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

type Props = {
  width: number;
  height: number;
  /** The phone screen shown in the open wallet panel (mode app), or null while the panel is closed. */
  panel: ReactNode | null;
  /** Ref to the panel wrapper: the laptop fades it in and out with scroll (T4 Dock crossfade). */
  panelRef?: React.Ref<HTMLDivElement>;
  /** Board prop `who`: mia (chapter 05) or vinh (chapter 11). */
  who?: 'mia' | 'vinh';
  children?: ReactNode;
};

export function WebWorkspaceScreen({ width, height, panel, panelRef, who = 'mia', children }: Props) {
  const s = WHO[who];
  return (
    <div
      inert
      data-screen="webWorkspace"
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
        <WebHeader
          brand={s.brand}
          devnet={s.devnet}
          wallet={s.wallet}
          panel={
            panel && (
              <div ref={panelRef} style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', zIndex: 40, maxWidth: width - 32 }}>
                <WebWalletPanel who={who} mode="app" screen={panel} />
              </div>
            )
          }
        />
        <div
          style={{ maxWidth: 1280, margin: '0 auto', padding: 24, boxSizing: 'border-box', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}
        >
          <Nav s={s} />
          <Main s={s} />
        </div>
      </div>
      {children}
    </div>
  );
}
