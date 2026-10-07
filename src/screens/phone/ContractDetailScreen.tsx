import type { CSSProperties, ReactNode } from 'react';
import { copy } from '@/content/copy';
import { Avatar } from './Avatar';
import { FONT, Screen, StatusBar, chipStyle, dotStyle, type Tone } from './parts';

/**
 * Port of docs/design-reference/phone/ContractDetail.dc.html (contract A) in the states the story uses:
 * - `vinhNew`      = ContractDetailVinhNew: role freelancer · view vn · state created
 * - `vinhAccepted` = ContractDetailVinhAccepted: role freelancer · view vn · state accepted
 * - `miaAccepted`  = ContractDetailMiaAccepted: role client · view intl · state accepted
 * - `vinhLocked`   = ContractDetailVinhLocked: role freelancer · view vn · state locked
 * - `logoSubmitted` = role client · view intl · contract B · state submitted; `left` = seconds on its review clock
 *   (chapter 08 drives it by scroll instead of the board's 1 s timer); its Dispute action and "unless you dispute"
 *   are left out (disputes are not available, SPEC §12.5)
 * Markup and inline styles 1:1; each variant resolves the board's renderVals for its state. Left out: the
 * prototype-only "DEMO · switch to…" line, the board's 1 s timer (countdowns shown as at t = 0) and the entrance
 * animations. SPEC numbers.
 */
const s = copy.screens.contractDetail;
const mia = copy.screens.contractDetailMia;
const locked = copy.screens.contractDetailVinhLocked;
const logo = copy.screens.contractDetailLogo;
/** Board fmt() for under an hour: m:ss. */
const fmt = (sec: number) => (sec <= 0 ? '0:00' : `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`);
const SHADOW = '0 1px 2px rgba(17,17,22,0.04), 0 6px 16px -6px rgba(17,17,22,0.10)';
const simTag: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  height: 20,
  padding: '0 7px',
  borderRadius: 6,
  background: '#EEEEF2',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.4,
  color: '#3F3F49',
  whiteSpace: 'nowrap',
};
const footerRow: CSSProperties = {
  minHeight: 48,
  padding: '0 14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderTop: '1px solid #F0F0F3',
  textDecoration: 'none',
  color: '#111116',
  fontSize: 14,
  fontWeight: 600,
};

const btn: CSSProperties = {
  height: 52,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 9999,
  background: '#7B2FBE',
  fontSize: 16,
  fontWeight: 600,
  color: '#FFFFFF',
  textDecoration: 'none',
};
const btn2: CSSProperties = { ...btn, background: '#FFFFFF', border: 'none', boxShadow: SHADOW, color: '#111116' };

/** SPEC text "example, estimated": never under 11 px on screen (scale set by Phone.tsx). */
const estimate = (text: string, rest: string) => (
  <>
    <span style={{ fontSize: 'max(12px, calc(11px / var(--ned-screen-scale, 1)))' }}>{text}</span>
    {rest}
  </>
);

export type ContractDetailVariant = 'vinhNew' | 'vinhAccepted' | 'miaAccepted' | 'vinhLocked' | 'logoSubmitted';

type Milestone = { n: number; amt: string; amtSub: string; submitBy: string; reviewBy: string; cd?: string };
type View = {
  name: string;
  title?: string;
  cid?: string;
  /** Countdown row in the board's warning style (under 10% of the window left, or 0). */
  cdWarn?: boolean;
  status: { text: string; tone: Tone };
  wait?: string;
  party: { seed: string; other: string; role: string; facts: string };
  hero: { label: string; amt: string; sub: ReactNode; dest: string; destSim: boolean };
  /** funded: the vault row; otherwise the "not locked yet" line. */
  funded: boolean;
  notFunded: string;
  milestones: readonly Milestone[];
  msStatus: { text: string; tone: Tone };
  countdown?: string;
  actions: { label: string; primary: boolean; tap?: string }[];
};

function resolve(variant: ContractDetailVariant, left: number): View {
  const vinhParty = { seed: 'mia', other: s.other, role: s.otherRole, facts: s.otherFacts };
  switch (variant) {
    case 'logoSubmitted':
      return {
        name: 'cdLogoSubmitted',
        title: logo.title,
        cid: logo.cid,
        status: { text: logo.statusBefore + fmt(Math.max(0, left)), tone: 'warning' },
        party: { seed: 'vinh', other: logo.other, role: logo.otherRole, facts: logo.otherFacts },
        hero: { label: logo.heroLabel, amt: logo.heroAmt, sub: logo.heroSub, dest: logo.dest, destSim: true },
        funded: true,
        notFunded: '',
        milestones: logo.milestones.map((m) => ({ ...m, cd: left <= 0 ? logo.now : fmt(left) })),
        msStatus: { text: logo.msStatus, tone: 'warning' },
        countdown: logo.countdown,
        cdWarn: left <= 0 || left < 60 * 0.1,
        actions: [{ label: logo.actions.review, primary: true }],
      };
    case 'miaAccepted':
      return {
        name: 'cdMiaAccepted',
        status: { text: mia.status, tone: 'info' },
        party: { seed: 'vinh', other: mia.other, role: mia.otherRole, facts: mia.otherFacts },
        hero: { label: mia.heroLabel, amt: mia.heroAmt, sub: mia.heroSub, dest: mia.dest, destSim: true },
        funded: false,
        notFunded: mia.notFunded,
        milestones: mia.milestones,
        msStatus: { text: s.notLocked, tone: 'neutral' },
        actions: [
          { label: mia.actions.lock, primary: true },
          { label: mia.actions.close, primary: false },
        ],
      };
    case 'vinhLocked':
      return {
        name: 'cdVinhLocked',
        status: { text: locked.status, tone: 'purple' },
        party: vinhParty,
        hero: { label: locked.heroLabel, amt: locked.heroAmt, sub: estimate(locked.heroSubEstimate, locked.heroSubRest), dest: locked.dest, destSim: true },
        funded: true,
        notFunded: '',
        milestones: locked.milestones,
        msStatus: { text: locked.milestoneStatus, tone: 'purple' },
        countdown: locked.countdown,
        actions: [{ label: locked.action, primary: true }],
      };
    default: {
      const created = variant === 'vinhNew';
      return {
        name: created ? 'cdNew' : 'cdAccepted',
        status: { text: created ? s.status.created : s.status.accepted, tone: 'info' },
        wait: created ? undefined : s.wait.accepted,
        party: vinhParty,
        hero: {
          label: s.heroLabel,
          amt: s.heroAmt,
          sub: estimate(s.heroSubEstimate, s.heroSubRest),
          dest: created ? s.dest.created : s.dest.accepted,
          destSim: !created,
        },
        funded: false,
        notFunded: created ? s.notFunded.created : s.notFunded.accepted,
        milestones: s.milestones,
        msStatus: { text: s.notLocked, tone: 'neutral' },
        actions: created ? [{ label: s.action, primary: true, tap: 'accept' }] : [],
      };
    }
  }
}

export function ContractDetailScreen({ variant, left = 0 }: { variant: ContractDetailVariant; left?: number }) {
  const v = resolve(variant, left);
  return (
    <Screen name={v.name} style={{ background: '#F4F4F6', color: '#111116', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />

      <div style={{ padding: '4px 16px 0', display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 3 }}>
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
        <h1
          data-focus="cd-title"
          style={{ flex: 1, minWidth: 0, margin: 0, fontFamily: FONT.display, fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {v.title ?? s.title}
        </h1>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <span style={chipStyle(v.status.tone)}>
            <span style={dotStyle(v.status.tone)} />
            {v.status.text}
          </span>
          <span
            aria-label={s.devnet.aria}
            title={s.devnet.title}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              height: 24,
              padding: '0 9px',
              borderRadius: 9999,
              background: '#FFF5E1',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.3,
              color: '#8A5300',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 9999, background: '#F59E0B' }} />
            {s.devnet.label}
          </span>
        </div>

        {v.wait && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 16, background: '#EEEFFE', fontSize: 13, lineHeight: 1.5, color: '#3F3F49', border: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3730A3" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2.5 2M9 2h6" />
            </svg>
            <span>
              <strong style={{ color: '#3730A3' }}>{s.next}</strong>
              {v.wait}
            </span>
          </div>
        )}

        {/* Party */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 20, background: '#FFFFFF' }}>
          <Avatar seed={v.party.seed} size={42} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: FONT.mono, fontSize: 15, fontWeight: 700 }}>{v.party.other}</span>
              <span
                style={{
                  height: 20,
                  padding: '0 8px',
                  borderRadius: 6,
                  background: '#EEEEF2',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {v.party.role}
              </span>
            </div>
            <div style={{ marginTop: 3, fontSize: 12, color: '#5E5E6A' }}>{v.party.facts}</div>
          </div>
        </div>

        {/* Hero amount */}
        <div
          style={{
            padding: 16,
            borderRadius: 20,
            background: '#FFFFFF',
            border: 'none',
            boxShadow: '0 1px 2px rgba(123,47,190,0.06), 0 10px 28px -10px rgba(123,47,190,0.30)',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#3F3F49' }}>{v.hero.label}</div>
          <div style={{ marginTop: 8, fontFamily: FONT.display, fontSize: 32, fontWeight: 700, letterSpacing: -0.8 }}>{v.hero.amt}</div>
          <div style={{ marginTop: 4, fontSize: 12, color: '#3F3F49' }}>{v.hero.sub}</div>
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid #F0F0F3',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
              fontSize: 13,
            }}
          >
            <span style={{ color: '#3F3F49' }}>{s.destLabel}</span>
            <span style={{ fontWeight: 600 }}>{v.hero.dest}</span>
            {v.hero.destSim && <span style={simTag}>{s.simulated}</span>}
          </div>
          {v.funded ? (
            <a
              style={{
                marginTop: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minHeight: 44,
                padding: '8px 10px',
                boxSizing: 'border-box',
                borderRadius: 12,
                background: '#F2EAFB',
                textDecoration: 'none',
                color: '#111116',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6A22B0" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <span style={{ flex: 1, minWidth: 0, fontSize: 12, lineHeight: 1.4, color: '#3F3F49' }}>
                {locked.vault}
                <span style={{ fontFamily: FONT.mono }}>{locked.vaultAddress}</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#6A22B0', whiteSpace: 'nowrap' }}>
                {locked.explorer}{' '}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
                </svg>
              </span>
            </a>
          ) : (
            <div
              style={{
                marginTop: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 12,
                fontSize: 12,
                color: '#3F3F49',
                border: 'none',
                background: '#F4F4F6',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5E5E6A" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              {v.notFunded}
            </div>
          )}
        </div>

        {/* Milestones */}
        <h2 style={{ margin: '8px 4px 0', fontFamily: FONT.display, fontSize: 17, fontWeight: 700 }}>{s.milestonesTitle}</h2>
        {v.milestones.map((m) => (
          <div key={m.n} role="group" aria-label={`Milestone ${m.n}, ${v.msStatus.text}`} style={{ padding: 14, borderRadius: 20, background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700 }}>
                {s.milestone} {m.n}
              </span>
              <span style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: FONT.mono, fontSize: 15, fontWeight: 700 }}>{m.amt}</span>
                <span style={{ display: 'block', fontSize: 11, color: '#5E5E6A' }}>{m.amtSub}</span>
              </span>
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={chipStyle(v.msStatus.tone)}>
                <span style={dotStyle(v.msStatus.tone)} />
                {v.msStatus.text}
              </span>
            </div>
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: '#5E5E6A' }}>{s.submitBy}</div>
                <div style={{ marginTop: 2, fontSize: 13, fontWeight: 600 }}>{m.submitBy}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#5E5E6A' }}>{s.reviewBy}</div>
                <div style={{ marginTop: 2, fontSize: 13, fontWeight: 600 }}>{m.reviewBy}</div>
              </div>
            </div>
            {v.countdown && m.cd && (
              <div
                role="timer"
                aria-live="off"
                style={{
                  marginTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 10px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  background: v.cdWarn ? '#FFF5E1' : '#E6E6EB',
                  color: v.cdWarn ? '#8A5300' : '#3F3F49',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="13" r="8" />
                  <path d="M12 9v4l2.5 2M9 2h6" />
                </svg>
                <span>{v.countdown}</span>
                <span style={{ marginLeft: 'auto', fontFamily: FONT.mono, fontWeight: 700 }}>{m.cd}</span>
              </div>
            )}
          </div>
        ))}

        {/* Footer */}
        <div style={{ marginTop: 6, borderRadius: 20, background: '#FFFFFF', overflow: 'hidden' }}>
          <button
            type="button"
            aria-expanded={false}
            style={{
              width: '100%',
              minHeight: 52,
              padding: '0 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'transparent',
              border: 'none',
              color: '#111116',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {s.rules}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5E5E6A" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" style={{ transform: 'rotate(0deg)' }}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <a style={footerRow}>
            {s.disclosures}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5E5E6A" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </a>
          <div style={{ ...footerRow, padding: '0 6px 0 14px', fontSize: undefined, fontWeight: undefined }}>
            <span style={{ fontSize: 13, color: '#5E5E6A' }}>
              {s.contractId} <span style={{ fontFamily: FONT.mono, color: '#111116' }}>{v.cid ?? s.cid}</span>
            </span>
            <button
              type="button"
              style={{ height: 40, padding: '0 12px', borderRadius: 10, background: 'transparent', border: 'none', color: '#6A22B0', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              {s.copy}
            </button>
          </div>
        </div>
      </div>

      {v.actions.length > 0 && (
        <div style={{ padding: '10px 16px 26px', display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid #F0F0F3', background: '#FFFFFF' }}>
          {v.actions.map((a) => (
            <a key={a.label} data-tap-target={a.tap} style={a.primary ? btn : btn2}>
              {a.label}
            </a>
          ))}
        </div>
      )}
    </Screen>
  );
}
