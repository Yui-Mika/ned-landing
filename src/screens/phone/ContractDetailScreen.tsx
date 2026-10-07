import type { CSSProperties } from 'react';
import { copy } from '@/content/copy';
import { Avatar } from './Avatar';
import { FONT, Screen, StatusBar, chipStyle, dotStyle } from './parts';

/**
 * Port of docs/design-reference/phone/ContractDetail.dc.html as used by ContractDetailVinhNew (state created) and
 * ContractDetailVinhAccepted (state accepted): role freelancer · view vn · contract A; and by
 * ContractDetailMiaAccepted (`client`): role client · view intl · state accepted. Markup and inline styles 1:1.
 * Left out: the prototype-only "DEMO · switch to…" line, the board's 1 s timer (no countdowns in these states)
 * and the entrance animations. SPEC numbers.
 */
const s = copy.screens.contractDetail;
const mia = copy.screens.contractDetailMia;
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

export function ContractDetailScreen({ state, role = 'freelancer' }: { state: 'created' | 'accepted'; role?: 'freelancer' | 'client' }) {
  const created = state === 'created';
  const client = role === 'client';
  const milestones = client ? mia.milestones : s.milestones;
  return (
    <Screen name={client ? 'cdMiaAccepted' : created ? 'cdNew' : 'cdAccepted'} style={{ background: '#F4F4F6', color: '#111116', display: 'flex', flexDirection: 'column' }}>
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
          {s.title}
        </h1>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <span style={chipStyle('info')}>
            <span style={dotStyle('info')} />
            {client ? mia.status : created ? s.status.created : s.status.accepted}
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

        {!created && !client && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 16, background: '#EEEFFE', fontSize: 13, lineHeight: 1.5, color: '#3F3F49', border: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3730A3" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2.5 2M9 2h6" />
            </svg>
            <span>
              <strong style={{ color: '#3730A3' }}>{s.next}</strong>
              {s.wait.accepted}
            </span>
          </div>
        )}

        {/* Party */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 20, background: '#FFFFFF' }}>
          <Avatar seed={client ? 'vinh' : 'mia'} size={42} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: FONT.mono, fontSize: 15, fontWeight: 700 }}>{client ? mia.other : s.other}</span>
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
                {client ? mia.otherRole : s.otherRole}
              </span>
            </div>
            <div style={{ marginTop: 3, fontSize: 12, color: '#5E5E6A' }}>{client ? mia.otherFacts : s.otherFacts}</div>
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
          <div style={{ fontSize: 13, fontWeight: 600, color: '#3F3F49' }}>{client ? mia.heroLabel : s.heroLabel}</div>
          <div style={{ marginTop: 8, fontFamily: FONT.display, fontSize: 32, fontWeight: 700, letterSpacing: -0.8 }}>{client ? mia.heroAmt : s.heroAmt}</div>
          <div style={{ marginTop: 4, fontSize: 12, color: '#3F3F49' }}>
            {client ? (
              mia.heroSub
            ) : (
              <>
                {/* SPEC text: never under 11 px on screen (scale set by Phone.tsx). */}
                <span style={{ fontSize: 'max(12px, calc(11px / var(--ned-screen-scale, 1)))' }}>{s.heroSubEstimate}</span>
                {s.heroSubRest}
              </>
            )}
          </div>
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
            <span style={{ fontWeight: 600 }}>{client ? mia.dest : created ? s.dest.created : s.dest.accepted}</span>
            {!created && <span style={simTag}>{s.simulated}</span>}
          </div>
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
            {client ? mia.notFunded : created ? s.notFunded.created : s.notFunded.accepted}
          </div>
        </div>

        {/* Milestones */}
        <h2 style={{ margin: '8px 4px 0', fontFamily: FONT.display, fontSize: 17, fontWeight: 700 }}>{s.milestonesTitle}</h2>
        {milestones.map((m) => (
          <div key={m.n} role="group" aria-label={`Milestone ${m.n}, ${s.notLocked}`} style={{ padding: 14, borderRadius: 20, background: '#FFFFFF' }}>
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
              <span style={chipStyle('neutral')}>
                <span style={dotStyle('neutral')} />
                {s.notLocked}
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
              {s.contractId} <span style={{ fontFamily: FONT.mono, color: '#111116' }}>{s.cid}</span>
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

      {(created || client) && (
        <div style={{ padding: '10px 16px 26px', display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid #F0F0F3', background: '#FFFFFF' }}>
          {client ? (
            <>
              <a style={btn}>{mia.actions.lock}</a>
              <a style={btn2}>{mia.actions.close}</a>
            </>
          ) : (
            <a data-tap-target="accept" style={btn}>
              {s.action}
            </a>
          )}
        </div>
      )}
    </Screen>
  );
}
