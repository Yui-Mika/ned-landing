import type { CSSProperties } from 'react';
import { copy } from '@/content/copy';
import { Avatar } from './Avatar';
import { DevnetChip, FONT, Screen, StatusBar, TONE, chipStyle, dotStyle, type Tone } from './parts';

/**
 * Port of docs/design-reference/phone/HomeVN.dc.html and HomeIntl.dc.html (one markup, `view` vn | intl).
 * Markup and inline styles 1:1; strings from copy.screens.homeVN / homeIntl (board strings, SPEC numbers).
 * Left out: the share sheet (closed in these states) and the boards' entrance animations.
 */
const V = copy.screens.homeVN;
const I = copy.screens.homeIntl;

/** Board icon paths (renderVals P). */
const ICON = {
  submit: 'M12 19V5M5 12l7-7 7 7',
} as const;

const qa: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minWidth: 0,
  height: 64,
  padding: '0 10px',
  boxSizing: 'border-box',
  borderRadius: 16,
  background: '#F4F4F6',
  color: '#111116',
  fontFamily: 'inherit',
  textAlign: 'left',
  textDecoration: 'none',
  cursor: 'pointer',
  border: 'none',
};
const qaIcon = (bg: string): CSSProperties => ({
  width: 32,
  height: 32,
  borderRadius: 9999,
  background: bg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});
const qaLabel: CSSProperties = { display: 'block', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const qaSub: CSSProperties = { display: 'block', marginTop: 2, fontSize: 12, color: '#5E5E6A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

const sectionHead: CSSProperties = { margin: '22px 4px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' };
const sectionTitle: CSSProperties = { margin: 0, fontSize: 15, fontWeight: 600, color: '#5E5E6A' };
const list: CSSProperties = { overflow: 'hidden', borderRadius: 20, background: '#FFFFFF' };

const card: CSSProperties = { flexShrink: 0, width: 168, height: 196, borderRadius: 20, position: 'relative', textDecoration: 'none' };
const cardText: CSSProperties = { position: 'absolute', left: 14, right: 14, bottom: 14, fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: '#111116' };
const cardIcon: CSSProperties = {
  position: 'absolute',
  left: 14,
  top: 14,
  width: 44,
  height: 44,
  borderRadius: 9999,
  background: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

/** Intl quick actions: 3 columns, icon above label. */
const qaCol: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  minWidth: 0,
  height: 84,
  padding: '0 6px',
  boxSizing: 'border-box',
  borderRadius: 16,
  background: '#F4F4F6',
  color: '#111116',
  fontFamily: 'inherit',
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.2,
  textAlign: 'center',
  textDecoration: 'none',
  cursor: 'pointer',
  border: 'none',
};
const qaColIcon = (bg: string): CSSProperties => ({
  width: 38,
  height: 38,
  borderRadius: 9999,
  background: bg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});
const qaColLabel: CSSProperties = { maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const qaColSvg = (stroke: string) =>
  ({ width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }) as const;

/** US flag, as drawn on the board (20 × 20 viewBox). */
function FlagUS() {
  const stripes = Array.from({ length: 13 }, (_, n) => (
    <rect key={n} y={((n * 20) / 13).toFixed(3)} width="20" height="1.538" fill={n % 2 ? '#FFFFFF' : '#B22234'} />
  ));
  const stars: [number, number][] = [];
  [0.9, 2.75, 4.6, 6.45, 8.3].forEach((cy, row) => {
    const xs = row % 2 ? [1.72, 3.37, 5.02, 6.67, 8.32] : [0.9, 2.55, 4.2, 5.85, 7.5, 9.15];
    xs.forEach((cx) => stars.push([cx, cy]));
  });
  return (
    <svg width="40" height="40" viewBox="0 0 20 20" role="img" aria-label={I.flagLabel} style={{ display: 'block' }}>
      {stripes}
      <rect width="10" height="10.769" fill="#3C3B6E" />
      {stars.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx.toFixed(2)} cy={cy.toFixed(2)} r="0.42" fill="#FFFFFF" />
      ))}
    </svg>
  );
}

const tab: CSSProperties = { flex: 1, height: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, textDecoration: 'none' };
const tabLabel: CSSProperties = { fontSize: 11, fontWeight: 500, color: '#5E5E6A' };

export function HomeScreen({ view }: { view: 'vn' | 'intl' }) {
  const vn = view === 'vn';
  const s = vn ? V : I;
  return (
    <Screen name={vn ? 'homeVN' : 'homeIntl'} style={{ background: '#F4F4F6', color: '#111116', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />

      <div style={{ padding: '6px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <h1 style={{ flex: 1, minWidth: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: FONT.body, fontSize: 14, fontWeight: 500, color: '#5E5E6A' }}>{s.greeting}</span>
          <span
            style={{
              fontFamily: FONT.display,
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: -0.5,
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {s.name}
          </span>
        </h1>
        <DevnetChip />
        <a
          aria-label={s.profileLabel}
          style={{ width: 44, height: 44, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0 }}
        >
          <Avatar seed={s.handle} size={40} />
        </a>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '16px 16px 110px' }}>
        {/* Main card */}
        <div style={{ padding: '18px 16px 6px', borderRadius: 20, background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 14, color: '#5E5E6A' }}>{s.heroLabel}</div>
              <div style={{ marginTop: 6, fontFamily: FONT.display, fontSize: 34, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.05 }}>
                {s.heroWhole}
                <span style={{ fontSize: 20 }}>{s.heroUnit}</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: '#5E5E6A' }}>
                {vn ? (
                  <>
                    {/* SPEC text: never under 11 px on screen, whatever the device scale (set by Phone.tsx). */}
                    <span style={{ fontSize: 'max(13px, calc(11px / var(--ned-screen-scale, 1)))' }}>{V.heroSubEstimate}</span>
                    {V.heroSubRest}
                  </>
                ) : (
                  I.heroSub
                )}
              </div>
            </div>
            <div title={s.flagTitle} style={{ width: 40, height: 40, borderRadius: 9999, overflow: 'hidden', flexShrink: 0 }}>
              {vn ? (
                <svg width="40" height="40" viewBox="0 0 20 20" role="img" aria-label={V.flagLabel} style={{ display: 'block' }}>
                  <rect width="20" height="20" fill="#DA251D" />
                  <polygon
                    points="10.00,4.00 11.35,8.15 15.71,8.15 12.18,10.71 13.53,14.85 10.00,12.29 6.47,14.85 7.82,10.71 4.29,8.15 8.65,8.15"
                    fill="#FFCD00"
                  />
                </svg>
              ) : (
                <FlagUS />
              )}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            {!vn && (
              <div role="group" aria-label={I.quickActions} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <a aria-label={I.actions.newContract.aria} style={qaCol}>
                  <span aria-hidden="true" style={qaColIcon('#7B2FBE')}>
                    <svg {...qaColSvg('#FFFFFF')}>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                  <span style={qaColLabel}>{I.actions.newContract.label}</span>
                </a>
                <a aria-label={I.actions.receive.aria} style={qaCol}>
                  <span aria-hidden="true" style={qaColIcon('#FFFFFF')}>
                    <svg {...qaColSvg('#6A22B0')}>
                      <path d="M12 4v13M6 11l6 6 6-6M5 20h14" />
                    </svg>
                  </span>
                  <span style={qaColLabel}>{I.actions.receive.label}</span>
                </a>
                <a aria-label={I.actions.send.aria} style={qaCol}>
                  <span aria-hidden="true" style={qaColIcon('#FFFFFF')}>
                    <svg {...qaColSvg('#6A22B0')}>
                      <path d="M12 20V7M6 13l6-6 6 6M5 4h14" />
                    </svg>
                  </span>
                  <span style={qaColLabel}>{I.actions.send.label}</span>
                </a>
              </div>
            )}
            {vn && (
            <div role="group" aria-label={V.quickActions} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button type="button" aria-label={V.share.aria} style={qa}>
                <span aria-hidden="true" style={qaIcon('#7B2FBE')}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />
                  </svg>
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={qaLabel}>{V.share.label}</span>
                  <span style={qaSub}>{V.share.sub}</span>
                </span>
              </button>
              <a aria-label={V.records.aria} style={qa}>
                <span aria-hidden="true" style={qaIcon('#FFFFFF')}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6A22B0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 20V10M10 20V4M16 20v-7M2 20h20" />
                  </svg>
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={qaLabel}>{V.records.label}</span>
                  <span style={qaSub}>{V.records.sub}</span>
                </span>
              </a>
            </div>
            )}
          </div>
          <div style={{ margin: '16px -16px 0', borderTop: '1px solid #F0F0F3' }} />
          <div style={{ padding: '12px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[s.statA, s.statB].map((st) => (
              <div key={st.label}>
                <div style={{ fontSize: 12, color: '#5E5E6A' }}>{st.label}</div>
                <div style={{ marginTop: 3, fontSize: 15, fontWeight: 600 }}>{st.value}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 12 }} />
        </div>

        <div style={sectionHead}>
          <h2 style={sectionTitle}>{s.needsTitle}</h2>
        </div>
        <div style={list}>
          {/* Board: <sc-for needs> then <sc-if noNeeds> with noNeedsText. */}
          {!vn && <div style={{ padding: 16, fontSize: 14, lineHeight: 1.5, color: '#5E5E6A' }}>{I.noNeedsText}</div>}
          {(vn ? V.needs : []).map((n) => {
            const c = TONE[n.tone as Tone];
            return (
              <a key={n.title} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', textDecoration: 'none', color: '#111116' }}>
                <div
                  style={{ width: 40, height: 40, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: c[0] }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c[2]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={ICON[n.icon as keyof typeof ICON]} />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{n.title}</div>
                  <div style={{ marginTop: 2, fontSize: 13, color: '#5E5E6A' }}>{n.sub}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A96" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </a>
            );
          })}
        </div>

        <div style={sectionHead}>
          <h2 style={sectionTitle}>{s.contractsTitle}</h2>
          {/* Board colour comes from its global `a{color:#6A22B0}`. */}
          <a style={{ fontSize: 14, fontWeight: 600, textDecoration: 'none', color: '#6A22B0' }}>{s.seeAll}</a>
        </div>
        <div style={list}>
          {s.rows.map((r) => (
            <a key={r.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', textDecoration: 'none', color: '#111116' }}>
              <Avatar seed={r.seed} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>{r.title}</div>
                <div style={{ marginTop: 2, fontSize: 13, lineHeight: 1.4, color: '#5E5E6A' }}>
                  {r.party} · {r.deadline}
                </div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
                  <span style={chipStyle(r.tone as Tone)}>
                    <span style={dotStyle(r.tone as Tone)} />
                    {r.status}
                  </span>
                  <span style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ display: 'block', fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap' }}>{r.total}</span>
                    <span style={{ display: 'block', marginTop: 1, fontSize: 11, color: '#5E5E6A', whiteSpace: 'nowrap' }}>{r.totalSub}</span>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div style={sectionHead}>
          <h2 style={sectionTitle}>{s.suggestedTitle}</h2>
        </div>
        <div style={{ margin: '0 -16px', padding: '0 16px', display: 'flex', gap: 10, overflow: 'hidden' }}>
          {vn ? (
            <button
              type="button"
              style={{ ...card, padding: 0, border: 'none', overflow: 'hidden', background: '#EDE3FB', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
            >
              <img
                src="/design-assets/teddy-waving_5bb51609.png"
                alt=""
                style={{ position: 'absolute', left: '50%', top: 18, width: 140, height: 110, marginLeft: -70, objectFit: 'contain' }}
              />
              <span style={cardText}>{V.suggested.share}</span>
            </button>
          ) : (
            <a style={{ ...card, overflow: 'hidden', background: '#EDE3FB' }}>
              <img
                src="/design-assets/teddy-happy_22f5490f.png"
                alt=""
                style={{ position: 'absolute', left: '50%', top: 18, width: 140, height: 110, marginLeft: -70, objectFit: 'contain' }}
              />
              <span style={cardText}>{I.suggested.lock}</span>
            </a>
          )}
          <a style={{ ...card, background: '#E3EDFC' }}>
            <div style={cardIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8v.5" />
              </svg>
            </div>
            <span style={cardText}>{s.suggested.devnet}</span>
          </a>
          <a style={{ ...card, background: '#E3F5EE' }}>
            <div style={cardIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#127A3A" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
              </svg>
            </div>
            <span style={cardText}>{s.suggested.records}</span>
          </a>
        </div>
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
        <div aria-current="page" style={tab}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B2FBE" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#7B2FBE' }}>{s.nav.home}</span>
        </div>
        <a style={tab}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5E5E6A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path d="M9 8h6M9 12h6M9 16h3" />
          </svg>
          <span style={tabLabel}>{s.nav.contracts}</span>
        </a>
        <a style={tab}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5E5E6A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
          </svg>
          <span style={tabLabel}>{s.nav.records}</span>
        </a>
        <a style={tab}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5E5E6A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
          <span style={tabLabel}>{s.nav.settings}</span>
        </a>
      </nav>
    </Screen>
  );
}

export const HomeVNScreen = () => <HomeScreen view="vn" />;
export const HomeIntlScreen = () => <HomeScreen view="intl" />;
