import type { CSSProperties, ReactNode } from 'react';
import { copy } from '@/content/copy';
import { Avatar } from './Avatar';
import { DevnetChip, FONT, Screen, StatusBar } from './parts';

/**
 * Ports of docs/design-reference/phone/ContractNew1Freelancer (search: found), ContractNew2Milestones
 * (2 milestones, no error) and ContractNew3Review. Markup and inline styles 1:1; SPEC amounts (250 / 500 USDC).
 */
const c1 = copy.screens.cn1;
const c2 = copy.screens.cn2;
const c3 = copy.screens.cn3;

const pill: CSSProperties = {
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
};
const SHADOW = '0 1px 2px rgba(17,17,22,0.04), 0 6px 16px -6px rgba(17,17,22,0.10)';

/** Shared top: back arrow, title, Devnet chip; then the 3-step progress bar. */
function Top({ back, title, step }: { back: string; title: string; step: 1 | 2 | 3 }) {
  return (
    <>
      <div style={{ padding: '2px 16px 0', display: 'flex', alignItems: 'center', gap: 6, position: 'relative', zIndex: 3 }}>
        <a
          aria-label={back}
          style={{
            width: 44,
            height: 44,
            marginLeft: -8,
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111116" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </a>
        <h1
          style={{
            flex: 1,
            minWidth: 0,
            margin: 0,
            fontFamily: FONT.display,
            fontSize: 18,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </h1>
        <DevnetChip />
      </div>
      <div style={{ padding: '10px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step} aria-label={`Step ${step} of 3`} style={{ flex: 1, display: 'flex', gap: 6 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ flex: 1, height: 4, borderRadius: 9999, background: n <= step ? '#7B2FBE' : '#EEEEF2' }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: '#5E5E6A' }}>{`Step ${step} of 3`}</span>
      </div>
    </>
  );
}

function Frame({ name, children }: { name: string; children: ReactNode }) {
  return (
    <Screen name={name} style={{ background: '#F4F4F6', color: '#111116', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      {children}
    </Screen>
  );
}

export function ContractNew1Screen() {
  return (
    <Frame name="cn1">
      <Top back={c1.back} title={c1.title} step={1} />
      <div style={{ flex: 1, overflow: 'hidden', padding: '16px 20px 0' }}>
        <h2 style={{ margin: 0, fontFamily: FONT.display, fontSize: 22, fontWeight: 700 }}>{c1.heading}</h2>
        <label htmlFor="nf-search" style={{ display: 'block', marginTop: 14, fontSize: 13, fontWeight: 600, color: '#3F3F49' }}>
          {c1.searchLabel}
        </label>
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 54,
            padding: '0 14px',
            borderRadius: 14,
            background: '#FFFFFF',
            border: 'none',
            boxShadow: '0 0 0 3px rgba(22,163,74,0.16)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5E5E6A" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="nf-search"
            value={c1.query}
            readOnly
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={c1.placeholder}
            style={{
              flex: 1,
              minWidth: 0,
              height: 50,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#111116',
              fontFamily: FONT.mono,
              fontSize: 16,
            }}
          />
        </div>

        <div style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: '#5E5E6A' }}>{c1.result}</div>
        <a style={{ marginTop: 8, display: 'block', padding: 14, textDecoration: 'none', color: '#111116', borderRadius: 18, background: '#F2EAFB', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar seed="vinh" size={46} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: FONT.mono, fontSize: 16, fontWeight: 700 }}>{c1.handle}</span>
                <span
                  style={{ height: 20, padding: '0 7px', borderRadius: 6, background: '#F2EAFB', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}
                >
                  {c1.badge}
                </span>
              </div>
              <div style={{ marginTop: 2, fontSize: 12, color: '#5E5E6A' }}>{c1.who}</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6A22B0" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid #F0F0F3',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px 14px',
            }}
          >
            {c1.facts.map((f) => (
              <div key={f.k}>
                <div style={{ fontSize: 11, color: '#5E5E6A' }}>{f.k}</div>
                <div
                  style={
                    'mono' in f && f.mono
                      ? { marginTop: 2, fontFamily: FONT.mono, fontSize: 12, fontWeight: 700 }
                      : { marginTop: 2, fontSize: 13, fontWeight: 600, color: 'warn' in f && f.warn ? '#8A5300' : undefined }
                  }
                >
                  {f.v}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, lineHeight: 1.4, color: '#5E5E6A' }}>{c1.factsNote}</div>
        </a>
      </div>
      <div style={{ padding: '12px 20px 28px' }}>
        <a style={pill}>{c1.continue}</a>
      </div>
    </Frame>
  );
}

export function ContractNew2Screen() {
  return (
    <Frame name="cn2">
      <Top back={c2.back} title={c2.title} step={2} />
      <div style={{ flex: 1, overflow: 'hidden', padding: '16px 20px 16px' }}>
        <h2 style={{ margin: 0, fontFamily: FONT.display, fontSize: 22, fontWeight: 700 }}>{c2.heading}</h2>
        <div style={{ marginTop: 4, fontSize: 13, color: '#5E5E6A' }}>{c2.forWho}</div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <label htmlFor="nc-title" style={{ fontSize: 13, fontWeight: 600, color: '#3F3F49' }}>
            {c2.titleLabel}
          </label>
          <span style={{ fontFamily: FONT.mono, fontSize: 12, color: '#5E5E6A' }}>{c2.titleValue.length}/32</span>
        </div>
        <input
          id="nc-title"
          value={c2.titleValue}
          readOnly
          maxLength={32}
          aria-describedby="nc-title-hint"
          style={{
            marginTop: 8,
            width: '100%',
            height: 52,
            boxSizing: 'border-box',
            padding: '0 14px',
            borderRadius: 14,
            background: '#FFFFFF',
            color: '#111116',
            fontFamily: 'inherit',
            fontSize: 16,
            outline: 'none',
            border: 'none',
            boxShadow: SHADOW,
          }}
        />
        <div id="nc-title-hint" style={{ marginTop: 6, display: 'flex', gap: 6, fontSize: 12, color: '#5E5E6A' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5E5E6A" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8v.5" />
          </svg>
          {c2.titleHint}
        </div>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {c2.milestones.map((m) => (
            <div key={m.n} role="group" aria-label={`Milestone ${m.n}`} style={{ padding: 14, borderRadius: 20, background: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700 }}>
                  {c2.milestone} {m.n}
                </span>
                <button
                  type="button"
                  aria-label={`Remove milestone ${m.n}`}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    border: 'none',
                    background: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#5E5E6A',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                  </svg>
                </button>
              </div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label htmlFor={`ms-amt-${m.n - 1}`} style={{ fontSize: 12, color: '#5E5E6A' }}>
                    {c2.amount}
                  </label>
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', borderRadius: 12, background: '#F4F4F6', border: 'none' }}>
                    <input
                      id={`ms-amt-${m.n - 1}`}
                      inputMode="decimal"
                      value={m.amt}
                      readOnly
                      style={{
                        flex: 1,
                        minWidth: 0,
                        height: 44,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#111116',
                        fontFamily: FONT.mono,
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    />
                    <span style={{ fontSize: 12, color: '#5E5E6A' }}>{c2.unit}</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: '#5E5E6A' }}>{c2.submitBy}</span>
                  <button
                    type="button"
                    style={{
                      marginTop: 6,
                      width: '100%',
                      height: 46,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '0 10px',
                      boxSizing: 'border-box',
                      borderRadius: 12,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#111116',
                      background: '#F4F4F6',
                      border: 'none',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5E5E6A" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M3 10h18M8 3v4M16 3v4" />
                    </svg>
                    <span>{m.date}</span>
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: '#5E5E6A' }}>{c2.reviewTime}</div>
              <div role="radiogroup" aria-label={`Review time for milestone ${m.n}`} style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                {c2.reviews.map((label, i) => {
                  const on = i === c2.reviewOn;
                  return (
                    <button
                      key={label}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      style={{
                        flex: 1,
                        height: 38,
                        borderRadius: 10,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 12,
                        fontWeight: 600,
                        color: on ? '#111116' : '#3F3F49',
                        background: on ? '#F2EAFB' : '#F4F4F6',
                        border: 'none',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          style={{
            marginTop: 10,
            width: '100%',
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderRadius: 14,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 600,
            background: '#F2EAFB',
            border: 'none',
            color: '#6A22B0',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {c2.add}
        </button>
      </div>
      <div style={{ padding: '12px 20px 26px', borderTop: '1px solid #F0F0F3', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 13, color: '#5E5E6A' }}>{c2.totalLabel}</span>
          <span style={{ fontFamily: FONT.mono, fontSize: 20, fontWeight: 700, color: '#111116' }}>{c2.total}</span>
        </div>
        <div style={{ marginTop: 10 }}>
          <a style={pill}>{c2.next}</a>
        </div>
      </div>
    </Frame>
  );
}

export function ContractNew3Screen() {
  const card: CSSProperties = { padding: 14, borderRadius: 20, background: '#FFFFFF' };
  const feeRow: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderTop: '1px solid #F0F0F3' };
  const F = c3.fees;
  return (
    <Frame name="cn3">
      <Top back={c3.back} title={c3.title} step={3} />
      <div style={{ flex: 1, overflow: 'hidden', padding: '16px 20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar seed="vinh" size={42} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 15, fontWeight: 700 }}>{c3.handle}</div>
              <div style={{ marginTop: 2, fontSize: 12, color: '#5E5E6A' }}>{c3.who}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F0F0F3' }}>
            <div style={{ fontSize: 12, color: '#5E5E6A' }}>{c3.titleLabel}</div>
            <div style={{ marginTop: 3, fontFamily: FONT.display, fontSize: 18, fontWeight: 700 }}>{c3.titleValue}</div>
          </div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#5E5E6A', marginBottom: 12 }}>{c3.milestonesLabel}</div>
          {c3.milestones.map((m, i) => {
            const last = i === c3.milestones.length - 1;
            return (
              <div key={m.n} style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 9999,
                      background: '#F2EAFB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      border: 'none',
                    }}
                  >
                    {m.n}
                  </div>
                  {!last && <div style={{ flex: 1, width: 2, margin: '4px 0', background: '#D9C4F3' }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: last ? 0 : 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</span>
                    <span style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 700 }}>{m.amt}</span>
                  </div>
                  <div style={{ marginTop: 3, fontSize: 12, color: '#5E5E6A' }}>{m.sub}</div>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F0F0F3', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{c3.totalLabel}</span>
            <span style={{ fontFamily: FONT.mono, fontSize: 20, fontWeight: 700 }}>{c3.total}</span>
          </div>
        </div>
        <div role="group" aria-label={c3.feesLabel} style={{ padding: '4px 16px', borderRadius: 20, background: '#FFFFFF' }}>
          <div style={{ padding: '12px 0 8px', fontSize: 15, fontWeight: 600 }}>{c3.feesLabel}</div>
          <div style={feeRow}>
            <span style={{ fontSize: 14, color: '#5E5E6A' }}>{F.ned}</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{F.nedV}</div>
            </div>
          </div>
          <div style={feeRow}>
            <span style={{ fontSize: 14, color: '#5E5E6A' }}>{F.network}</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{F.networkV}</div>
              <div style={{ fontSize: 12, color: '#5E5E6A' }}>{F.networkSub}</div>
            </div>
          </div>
          <div style={feeRow}>
            <span style={{ fontSize: 14, color: '#5E5E6A' }}>{F.partner}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{F.partnerV}</span>
              <span
                style={{
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
                }}
              >
                {F.simulated}
              </span>
            </div>
          </div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#5E5E6A', marginBottom: 10 }}>{c3.nextLabel}</div>
          <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {c3.next.map((t, i) => (
              <div key={t} role="listitem" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 9999,
                    background: '#EEEEF2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ fontSize: 13, lineHeight: 1.45, color: '#3F3F49', paddingTop: 2 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 20px 28px' }}>
        <a
          aria-label={c3.slide}
          style={{ height: 58, padding: 4, boxSizing: 'border-box', display: 'flex', alignItems: 'center', borderRadius: 9999, background: '#F2EAFB', textDecoration: 'none' }}
        >
          <div style={{ width: 50, height: 50, borderRadius: 9999, background: '#7B2FBE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
          <div style={{ flex: 1, textAlign: 'center', marginLeft: -50, fontSize: 16, fontWeight: 600, color: '#6A22B0' }}>{c3.slide}</div>
        </a>
        <div style={{ marginTop: 8, textAlign: 'center', fontSize: 11, color: '#5E5E6A' }}>{c3.slideNote}</div>
      </div>
    </Frame>
  );
}
