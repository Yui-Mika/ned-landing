import type { CSSProperties, ReactNode } from 'react';
import { copy } from '@/content/copy';
import { Avatar } from '@/screens/phone/Avatar';
import { FONT } from '@/screens/phone/parts';
import type { BriefState } from '@/scene/poses';
import { WebWalletPanel } from './WebWalletPanel';

/**
 * Port of docs/design-reference/web/WebContractNew.dc.html (who: mia). Markup and inline styles 1:1.
 * State comes from scroll (ch03BriefAt): milestone 1's "Done when" items are typed into the board's own
 * "Add something you can check" field and added one by one; then Create → wallet panel (sign) → created.
 * The page lives in [data-page] (scrolled by the laptop); the panel and backdrop are `position: fixed` on the
 * board, so they sit outside it here. SPEC amounts: 250 + 250 USDC (board sample: 10 + 10).
 */
const s = copy.web.contractNew;
const noop = () => {};

/** Board fingerprint (renderVals fp): djb2-style hash shown as 0x1234…abcd. */
export function briefFingerprint(text: string) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
  const x = ('00000000' + h.toString(16)).slice(-8);
  return '0x' + x.slice(0, 4) + '…' + x.slice(4);
}

/** The brief as the board hashes it, plus the visible draft (so the fingerprint changes per keystroke). */
export function briefText(state: BriefState) {
  const ms = s.milestones.list.map((m, i) => [m.name, m.amt, m.date, m.review, i === 0 ? m.crit.slice(0, state.added) : m.crit]);
  return JSON.stringify({ t: s.job.title, s: s.job.scope, r: s.job.refs, m: ms }) + state.draft;
}

const srOnly: CSSProperties = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' };
const field: CSSProperties = { background: '#F4F4F6', color: '#111116', fontFamily: 'inherit', border: 'none' };
const card: CSSProperties = { padding: 20, borderRadius: 20, background: '#FFFFFF' };
const ghostBtn: CSSProperties = {
  borderRadius: 9999,
  border: 'none',
  background: '#F2EAFB',
  color: '#6A22B0',
  fontFamily: 'inherit',
  fontWeight: 600,
  cursor: 'pointer',
};
const xIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5E5E6A" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
const removeBtn = (size: number): CSSProperties => ({
  width: size,
  height: size,
  borderRadius: 9999,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

function Header() {
  const w = s.wallet;
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
            {s.brand.mark}
          </span>
          <span style={{ fontFamily: FONT.display, fontSize: 18, fontWeight: 700 }}>{s.brand.name}</span>
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
          {s.devnet}
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
        </div>
      </div>
    </header>
  );
}

function Milestone({ i, crit, draft }: { i: number; crit: readonly string[]; draft: string }) {
  const m = s.milestones.list[i];
  const L = s.milestones;
  const n = i + 1;
  const err = crit.length ? '' : L.errNoCrit;
  const label: CSSProperties = { fontSize: 12, fontWeight: 600, color: '#3F3F49' };
  const input: CSSProperties = { ...field, marginTop: 6, width: '100%', boxSizing: 'border-box', height: 44, padding: '0 12px', borderRadius: 12, fontSize: 14 };
  return (
    <div role="group" aria-label={`Milestone ${n}`} style={{ padding: 20, borderRadius: 20, background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 9999,
            background: '#F2EAFB',
            color: '#6A22B0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {n}
        </span>
        <label htmlFor={`cn-ms-name-${i}`} style={srOnly}>
          Milestone {n} name
        </label>
        <input
          id={`cn-ms-name-${i}`}
          value={m.name}
          onChange={noop}
          placeholder="Name this milestone"
          style={{ ...field, flex: 1, minWidth: 0, height: 44, padding: '0 12px', borderRadius: 12, fontSize: 15, fontWeight: 600 }}
        />
        <button type="button" aria-label={`Remove milestone ${n}`} style={removeBtn(40)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5E5E6A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </svg>
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
        <div>
          <label htmlFor={`cn-ms-amt-${i}`} style={label}>
            {L.amountLabel}
          </label>
          <input
            id={`cn-ms-amt-${i}`}
            inputMode="decimal"
            value={m.amt}
            onChange={noop}
            style={{ ...input, fontFamily: FONT.mono, fontSize: 15, fontWeight: 700 }}
          />
        </div>
        <div>
          <label htmlFor={`cn-ms-date-${i}`} style={label}>
            {L.dateLabel}
          </label>
          <input id={`cn-ms-date-${i}`} type="datetime-local" value={m.date} onChange={noop} style={input} />
        </div>
        <div>
          <label htmlFor={`cn-ms-rev-${i}`} style={label}>
            {L.reviewLabel}
          </label>
          <select id={`cn-ms-rev-${i}`} value={m.review} onChange={noop} style={{ ...input, padding: '0 10px' }}>
            {L.reviews.map((r) => (
              <option key={r.v} value={r.v}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div data-focus={i === 0 ? 'm1-done' : undefined}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#3F3F49' }}>{L.doneWhen}</span>
          <span style={{ fontSize: 12, color: '#5E5E6A' }}>{L.doneWhenNote}</span>
        </div>
        <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {crit.map((c) => (
            <li key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 6px 6px 12px', borderRadius: 12, background: '#F4F4F6' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6A22B0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <path d="m8 12.5 2.5 2.5L16 9.5" />
              </svg>
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, lineHeight: 1.4 }}>{c}</span>
              <button type="button" aria-label={`Remove: ${c}`} style={removeBtn(32)}>
                {xIcon}
              </button>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <label htmlFor={`cn-ms-crit-${i}`} style={srOnly}>
            Add a criterion to milestone {n}
          </label>
          <input
            id={`cn-ms-crit-${i}`}
            value={draft}
            onChange={noop}
            placeholder={L.critPlaceholder}
            style={{ ...field, flex: 1, minWidth: 0, height: 42, padding: '0 12px', borderRadius: 12, fontSize: 14 }}
          />
          <button type="button" style={{ ...ghostBtn, height: 42, padding: '0 16px', fontSize: 14 }}>
            {L.add}
          </button>
        </div>
        {err && (
          <div role="alert" style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: '#B42318' }}>
            {err}
          </div>
        )}
      </div>
    </div>
  );
}

function Form({ state, fp }: { state: BriefState; fp: string }) {
  const J = s.job;
  const S = s.summary;
  const list = s.milestones.list;
  const crit = (i: number) => (i === 0 ? list[0].crit.slice(0, state.added) : list[i].crit);
  const cant = crit(0).length === 0;
  const total = list.reduce((t, m) => t + (parseFloat(m.amt) || 0), 0).toFixed(2);
  const count = J.title.length;
  return (
    <>
      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <h1 style={{ margin: 0, fontFamily: FONT.display, fontSize: 34, fontWeight: 700, letterSpacing: -0.8 }}>{s.heading}</h1>
        <ol aria-label="Steps" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 12, fontWeight: 600 }}>
          {s.steps.map((step, i) => (
            <li
              key={step}
              style={{
                height: 28,
                padding: '0 10px',
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: 9999,
                background: i === 0 ? '#7B2FBE' : '#FFFFFF',
                color: i === 0 ? '#FFFFFF' : '#5E5E6A',
              }}
            >
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: '999 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section aria-labelledby="cn-fl" style={card}>
            <h2 id="cn-fl" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
              {s.freelancer.heading}
            </h2>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, background: '#F4F4F6' }}>
              <Avatar seed="vinh" size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {s.freelancer.name} <span style={{ fontWeight: 500, color: '#5E5E6A' }}>{s.freelancer.handle}</span>
                </div>
                <div style={{ marginTop: 2, fontSize: 13, color: '#5E5E6A' }}>{s.freelancer.sub}</div>
              </div>
              <a style={{ fontSize: 14, fontWeight: 600, textDecoration: 'none', color: '#6A22B0' }}>{s.freelancer.change}</a>
            </div>
          </section>

          <section aria-labelledby="cn-job" style={{ ...card, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 id="cn-job" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
              {J.heading}
            </h2>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label htmlFor="cn-title" style={{ fontSize: 13, fontWeight: 600, color: '#3F3F49' }}>
                  {J.titleLabel}
                </label>
                <span style={{ fontFamily: FONT.mono, fontSize: 12, color: count >= 32 ? '#8A5300' : '#5E5E6A' }}>{count}/32</span>
              </div>
              <input
                id="cn-title"
                value={J.title}
                onChange={noop}
                maxLength={32}
                style={{ ...field, marginTop: 6, width: '100%', boxSizing: 'border-box', height: 48, padding: '0 14px', borderRadius: 12, fontSize: 15 }}
              />
            </div>
            <div>
              <label htmlFor="cn-scope" style={{ fontSize: 13, fontWeight: 600, color: '#3F3F49' }}>
                {J.scopeLabel}
              </label>
              <textarea
                id="cn-scope"
                value={J.scope}
                onChange={noop}
                rows={5}
                placeholder={J.scopePlaceholder}
                style={{
                  ...field,
                  marginTop: 6,
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: 12,
                  fontSize: 15,
                  lineHeight: 1.55,
                  resize: 'vertical',
                  display: 'block',
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#3F3F49' }}>{J.refsLabel}</div>
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {J.refs.map((url) => (
                  <div key={url} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px 8px 12px', borderRadius: 12, background: '#F4F4F6' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3F3F49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
                    </svg>
                    <span style={{ flex: 1, minWidth: 0, fontFamily: FONT.mono, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{url}</span>
                    <button type="button" aria-label={`Remove ${url}`} style={removeBtn(32)}>
                      {xIcon}
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8 }}>
                  <label htmlFor="cn-ref" style={srOnly}>
                    {J.refAddLabel}
                  </label>
                  <input
                    id="cn-ref"
                    type="url"
                    value=""
                    onChange={noop}
                    placeholder={J.refPlaceholder}
                    style={{ ...field, flex: 1, minWidth: 0, height: 44, padding: '0 12px', borderRadius: 12, fontSize: 14 }}
                  />
                  <button type="button" style={{ ...ghostBtn, height: 44, padding: '0 16px', fontSize: 14 }}>
                    {J.add}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="cn-ms" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 4px' }}>
              <h2 id="cn-ms" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                {s.milestones.heading}
              </h2>
              <span style={{ fontSize: 13, color: '#5E5E6A' }}>{s.milestones.note}</span>
            </div>
            {list.map((_, i) => (
              <Milestone key={i} i={i} crit={crit(i)} draft={i === 0 ? state.draft : ''} />
            ))}
            <button type="button" style={{ ...ghostBtn, height: 52, borderRadius: 20, background: '#EBEBF0', fontSize: 15 }}>
              {s.milestones.addMilestone}
            </button>
          </section>
        </div>

        <aside aria-label="Summary" style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={card}>
            <div style={{ fontSize: 13, color: '#5E5E6A' }}>{S.total}</div>
            <div style={{ marginTop: 4, fontFamily: FONT.display, fontSize: 32, fontWeight: 700, letterSpacing: -0.6 }}>
              {total}
              <span style={{ fontSize: 18 }}>{S.unit}</span>
            </div>
            <div style={{ marginTop: 4, fontSize: 13, color: '#5E5E6A' }}>
              {list.length} milestones{S.after}
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #F0F0F3', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {list.map((m, i) => (
                <div key={m.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13 }}>
                  <span style={{ color: '#3F3F49', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {i + 1}. {m.name} · by {m.dateShort}
                  </span>
                  <span style={{ fontFamily: FONT.mono, fontWeight: 700, flexShrink: 0 }}>{(parseFloat(m.amt) || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          <div data-focus="fingerprint" style={{ padding: 18, borderRadius: 20, background: '#F2EAFB', border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#3F3F49' }}>{S.fingerprint}</span>
              <span data-fingerprint="" style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 700 }}>
                {fp}
              </span>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.55, color: '#3F3F49' }}>{S.fingerprintNote}</div>
          </div>
          <div style={{ padding: '16px 18px', borderRadius: 20, background: '#FFFFFF', fontSize: 12, lineHeight: 1.6, color: '#5E5E6A' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111116' }}>{S.checkedTitle}</div>
            {S.checked}
          </div>
          <button
            type="button"
            data-tap-target="create"
            disabled={cant}
            style={{
              height: 56,
              borderRadius: 9999,
              border: 'none',
              fontFamily: 'inherit',
              fontSize: 16,
              fontWeight: 600,
              cursor: cant ? 'not-allowed' : 'pointer',
              background: cant ? '#E6E6EB' : '#7B2FBE',
              color: cant ? '#5E5E6A' : '#FFFFFF',
            }}
          >
            {S.create}
          </button>
          <div style={{ fontSize: 12, lineHeight: 1.5, color: '#5E5E6A', textAlign: 'center' }}>{S.createNote}</div>
        </aside>
      </div>
    </>
  );
}

function Created({ fp }: { fp: string }) {
  const C = s.created;
  const total = s.milestones.list.reduce((t, m) => t + (parseFloat(m.amt) || 0), 0).toFixed(2);
  const tile: CSSProperties = { padding: 14, borderRadius: 14, background: '#F4F4F6' };
  return (
    <div style={{ marginTop: 24, maxWidth: 720, padding: 28, borderRadius: 20, background: '#FFFFFF' }}>
      <div style={{ width: 56, height: 56, borderRadius: 9999, background: '#E7F6EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#127A3A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <h1 style={{ margin: '16px 0 0', fontFamily: FONT.display, fontSize: 30, fontWeight: 700 }}>{C.heading}</h1>
      <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.55, color: '#3F3F49' }}>{C.body}</p>
      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <div
          data-focus="invite-link"
          style={{
            flex: '1 1 320px',
            minWidth: 0,
            height: 52,
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 14,
            background: '#F4F4F6',
            fontFamily: FONT.mono,
            fontSize: 14,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            border: 'none',
          }}
        >
          {C.link}
        </div>
        <button
          type="button"
          style={{
            height: 52,
            padding: '0 22px',
            borderRadius: 9999,
            border: 'none',
            background: '#7B2FBE',
            color: '#FFFFFF',
            fontFamily: 'inherit',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {C.copy}
        </button>
      </div>
      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
        <div style={tile}>
          <div style={{ fontSize: 12, color: '#5E5E6A' }}>{C.fingerprint}</div>
          <div style={{ marginTop: 4, fontFamily: FONT.mono, fontSize: 15, fontWeight: 700 }}>{fp}</div>
        </div>
        <div style={tile}>
          <div style={{ fontSize: 12, color: '#5E5E6A' }}>{C.next}</div>
          <div style={{ marginTop: 4, fontSize: 15, fontWeight: 600 }}>
            {C.nextText}
            {total} USDC
          </div>
        </div>
      </div>
      <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <a
          style={{
            height: 48,
            padding: '0 20px',
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 9999,
            background: '#F2EAFB',
            color: '#6A22B0',
            fontSize: 15,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          {C.view}
        </a>
        <a style={{ height: 48, padding: '0 12px', display: 'inline-flex', alignItems: 'center', fontSize: 15, fontWeight: 600, textDecoration: 'none', color: '#6A22B0' }}>
          {C.back}
        </a>
      </div>
    </div>
  );
}

type Props = { state: BriefState; width: number; height: number; children?: ReactNode };

/** The screen: page (scrolled by the laptop via [data-page]) + the fixed wallet panel when signing. */
export function WebContractNewScreen({ state, width, height, children }: Props) {
  const fp = briefFingerprint(briefText(state));
  return (
    <div
      inert
      data-screen="webContractNew"
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
        <Header />
        <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 64px', boxSizing: 'border-box' }}>
          <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: '#5E5E6A' }}>
            <a style={{ textDecoration: 'none', color: '#6A22B0' }}>{s.breadcrumb.root}</a> <span aria-hidden="true">{s.breadcrumb.sep}</span> {s.breadcrumb.here}
          </nav>
          {state.created ? <Created fp={fp} /> : <Form state={state} fp={fp} />}
        </main>
      </div>
      {state.panel === 'sign' && (
        <>
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 35, background: 'rgba(17,17,22,0.32)' }} />
          <div style={{ position: 'absolute', top: 76, right: Math.max(16, (width - 1280) / 2 + 24), zIndex: 40, maxWidth: width - 32 }}>
            <WebWalletPanel fingerprint={fp} />
          </div>
        </>
      )}
      {children}
    </div>
  );
}
