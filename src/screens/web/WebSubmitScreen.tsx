import type { CSSProperties, ReactNode } from 'react';
import { copy } from '@/content/copy';
import { FONT } from '@/screens/phone/parts';
import type { SubmitState } from '@/scene/poses';
import { WebHeader } from './WebHeader';
import { WebWalletPanel } from './WebWalletPanel';
import { briefFingerprint } from './WebContractNewScreen';

/**
 * Port of docs/design-reference/web/WebSubmit.dc.html (who vinh). Markup and inline styles 1:1.
 * State comes from scroll (ch06SubmitAt): each sample link is typed into the board's "https://" field and added
 * (the row shows the board's own sample label), the two sample files are dropped one by one (each row's fingerprint
 * shows once the landing-layer scan line has passed it), the four "Done when" boxes are ticked, then Submit → wallet
 * panel (sign · submit) → the board's done view. The page lives in [data-page] (scrolled by the laptop); the sign
 * panel and backdrop are `position: fixed` on the board, so they sit outside it here.
 * Left out: the prototype-only "DEMO · switch to @mia's computer" link, hover styles, entrance animations.
 */
const s = copy.web.submit;

/** Board renderVals: the delivery (links, file fingerprints, note) hashed like the brief (djb2, 0x1234…abcd). */
export function deliveryFingerprint(state: Pick<SubmitState, 'links' | 'files'>) {
  if (!state.links && !state.files) return '—';
  const delivery = JSON.stringify({
    l: s.links.list.slice(0, state.links).map((l) => l.url),
    f: s.files.list.slice(0, state.files).map((f) => f.name + ':' + f.sha),
    n: s.note.value,
  });
  return briefFingerprint(delivery);
}
/** The delivery as submitted (every link and file): the phone shows the same fingerprint. */
export const SUBMITTED_FP = deliveryFingerprint({ links: s.links.list.length, files: s.files.list.length });

const card: CSSProperties = { padding: 20, borderRadius: 20, background: '#FFFFFF' };
const h2: CSSProperties = { margin: 0, fontSize: 16, fontWeight: 600 };
const help: CSSProperties = { margin: '4px 0 0', fontSize: 13, lineHeight: 1.5, color: '#5E5E6A' };
const row: CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px 8px 12px', borderRadius: 12, background: '#F4F4F6' };
const removeBtn: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 9999,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const xIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5E5E6A" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
const doneRow: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderTop: '1px solid #F0F0F3', fontSize: 14 };

function Form({ state, fp }: { state: SubmitState; fp: string }) {
  const nOn = state.checks;
  const all = s.check.items.length;
  const empty = !state.links && !state.files;
  return (
    <>
      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: FONT.display, fontSize: 34, fontWeight: 700, letterSpacing: -0.8 }}>{s.heading}</h1>
          <div style={{ marginTop: 4, fontSize: 14, color: '#5E5E6A' }}>{s.sub}</div>
        </div>
        <span
          role="timer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 14px', borderRadius: 9999, background: '#FFF5E1', color: '#8A5300', fontSize: 14, fontWeight: 600 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A5300" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2.5 2M9 2h6" />
          </svg>
          {s.timer}
        </span>
      </div>

      <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: '999 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section aria-labelledby="sb-links" data-focus="sb-links" style={card}>
            <h2 id="sb-links" style={h2}>
              {s.links.heading}
            </h2>
            <p style={help}>{s.links.body}</p>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {s.links.list.slice(0, state.links).map((l) => (
                <div key={l.url} style={row}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3F3F49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
                  </svg>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>{l.label}</span>
                    <span style={{ display: 'block', fontFamily: FONT.mono, fontSize: 12, color: '#5E5E6A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.url}</span>
                  </span>
                  <span
                    style={{ height: 22, padding: '0 8px', display: 'inline-flex', alignItems: 'center', borderRadius: 9999, background: '#E7F6EC', color: '#127A3A', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}
                  >
                    {s.links.pinned}
                  </span>
                  <button type="button" aria-label={s.links.remove + l.label} style={removeBtn}>
                    {xIcon}
                  </button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8 }}>
                <label htmlFor="sb-link" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                  {s.links.addLabel}
                </label>
                <input
                  id="sb-link"
                  type="url"
                  readOnly
                  value={state.draft}
                  placeholder={s.links.placeholder}
                  style={{ flex: 1, minWidth: 0, height: 44, padding: '0 12px', borderRadius: 12, background: '#F4F4F6', color: '#111116', fontFamily: FONT.mono, fontSize: 13, border: 'none' }}
                />
                <button
                  type="button"
                  style={{ height: 44, padding: '0 16px', borderRadius: 9999, border: 'none', background: '#F2EAFB', color: '#6A22B0', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  {s.links.add}
                </button>
              </div>
            </div>
          </section>

          <section aria-labelledby="sb-files" data-focus="sb-files" style={card}>
            <h2 id="sb-files" style={h2}>
              {s.files.heading}
            </h2>
            <p style={help}>{s.files.body}</p>
            <button
              type="button"
              style={{
                marginTop: 12,
                width: '100%',
                height: 96,
                borderRadius: 16,
                background: '#F8F4FD',
                color: '#3F3F49',
                fontFamily: 'inherit',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                border: 'none',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6A22B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 15V3M7 8l5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
              </svg>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{s.files.drop}</span>
            </button>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {s.files.list.slice(0, state.files).map((f, i) => (
                <div key={f.name} data-file-row={i} style={row}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3F3F49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6" />
                  </svg>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
                    <span style={{ display: 'block', fontSize: 12, color: '#5E5E6A' }}>
                      {f.size}
                      {/* The fingerprint shows once the scan line has passed the row (CH06.scan). */}
                      {i < state.scanned && (
                        <>
                          {s.files.fingerprint}
                          <span style={{ fontFamily: FONT.mono }}>{f.sha}</span>
                        </>
                      )}
                    </span>
                  </span>
                  <button type="button" aria-label={s.files.remove + f.name} style={removeBtn}>
                    {xIcon}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="sb-note-h" style={card}>
            <h2 id="sb-note-h" style={h2}>
              <label htmlFor="sb-note">{s.note.label}</label>
            </h2>
            <textarea
              id="sb-note"
              readOnly
              value={s.note.value}
              rows={3}
              placeholder={s.note.placeholder}
              style={{
                marginTop: 10,
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 14px',
                borderRadius: 12,
                background: '#F4F4F6',
                color: '#111116',
                fontFamily: 'inherit',
                fontSize: 15,
                lineHeight: 1.55,
                resize: 'vertical',
                border: 'none',
              }}
            />
          </section>

          <section aria-labelledby="sb-check" data-focus="sb-check" style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
              <h2 id="sb-check" style={h2}>
                {s.check.heading}
              </h2>
              <span style={{ fontSize: 13, fontWeight: 600, color: nOn === all ? '#127A3A' : '#8A5300' }}>{s.check.count(nOn, all)}</span>
            </div>
            <p style={help}>{s.check.body}</p>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {s.check.items.map((t, i) => (
                <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, padding: '6px 12px', borderRadius: 12, background: '#F4F4F6', cursor: 'pointer' }}>
                  <input type="checkbox" readOnly checked={i < nOn} style={{ width: 18, height: 18, accentColor: '#7B2FBE', margin: 0 }} />
                  <span style={{ fontSize: 14, lineHeight: 1.4 }}>{t}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside aria-label={s.aside.label} style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={card}>
            <div style={{ fontSize: 13, color: '#5E5E6A' }}>{s.aside.comesLabel}</div>
            <div style={{ marginTop: 4, fontFamily: FONT.display, fontSize: 30, fontWeight: 700, letterSpacing: -0.6 }}>
              {s.aside.comesWhole}
              <span style={{ fontSize: 17 }}>{s.aside.comesUnit}</span>
            </div>
            <div style={{ marginTop: 4, fontSize: 13, color: '#5E5E6A' }}>
              {s.aside.comesSubEstimate}
              {s.aside.comesSubRest}
            </div>
          </div>
          <div style={{ padding: 18, borderRadius: 20, background: '#FFFFFF' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{s.aside.askedTitle}</div>
            <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.55, color: '#3F3F49' }}>{s.aside.asked}</p>
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <span style={{ color: '#5E5E6A' }}>{s.aside.briefFp}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: FONT.mono, fontWeight: 700 }}>{s.aside.briefFpV}</span>
                <span style={{ height: 20, padding: '0 7px', display: 'inline-flex', alignItems: 'center', borderRadius: 9999, background: '#E7F6EC', color: '#127A3A', fontWeight: 600 }}>
                  {s.aside.accepted}
                </span>
              </span>
            </div>
            <a style={{ marginTop: 8, display: 'inline-block', fontSize: 13, fontWeight: 600, textDecoration: 'none', color: '#6A22B0' }}>{s.aside.readBrief}</a>
          </div>
          <div style={{ padding: 18, borderRadius: 20, background: '#F2EAFB', border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#3F3F49' }}>{s.aside.deliveryFp}</span>
              <span style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 700 }}>{fp}</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.55, color: '#3F3F49' }}>{s.aside.deliveryNote}</div>
          </div>
          <div style={{ padding: '16px 18px', borderRadius: 20, background: '#FFFFFF', fontSize: 12, lineHeight: 1.6, color: '#5E5E6A' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111116' }}>{s.aside.onTimeTitle}</div>
            {s.aside.onTime}
          </div>
          {nOn < all && (
            <div role="status" style={{ padding: '10px 12px', borderRadius: 12, background: '#FFF5E1', color: '#8A5300', fontSize: 13, lineHeight: 1.45 }}>
              {s.aside.notAll}
            </div>
          )}
          <button
            type="button"
            disabled={empty}
            data-tap-target="sb-submit"
            data-focus="sb-submit"
            style={{
              height: 56,
              borderRadius: 9999,
              border: 'none',
              fontFamily: 'inherit',
              fontSize: 16,
              fontWeight: 600,
              cursor: empty ? 'not-allowed' : 'pointer',
              background: empty ? '#E6E6EB' : '#7B2FBE',
              color: empty ? '#5E5E6A' : '#FFFFFF',
            }}
          >
            {s.aside.submit}
          </button>
          <div style={{ fontSize: 12, lineHeight: 1.5, color: '#5E5E6A', textAlign: 'center' }}>{s.aside.submitNote}</div>
        </aside>
      </div>
    </>
  );
}

function Done({ fp }: { fp: string }) {
  const d = s.done;
  return (
    <div data-focus="sb-done" style={{ marginTop: 24, maxWidth: 720, padding: 28, borderRadius: 20, background: '#FFFFFF' }}>
      <div style={{ width: 56, height: 56, borderRadius: 9999, background: '#FFF5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8A5300" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </div>
      <h1 style={{ margin: '16px 0 0', fontFamily: FONT.display, fontSize: 30, fontWeight: 700 }}>{d.heading}</h1>
      <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.55, color: '#3F3F49' }}>{d.body}</p>
      <div style={{ marginTop: 16, borderRadius: 14, padding: '4px 14px', border: 'none', background: '#F7F7F9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', fontSize: 14 }}>
          <span style={{ color: '#5E5E6A' }}>{d.recorded}</span>
          <span style={{ fontWeight: 600 }}>{d.recordedV}</span>
        </div>
        <div style={doneRow}>
          <span style={{ color: '#5E5E6A' }}>{d.deadline}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            {d.deadlineV}{' '}
            <span style={{ height: 22, padding: '0 8px', display: 'inline-flex', alignItems: 'center', borderRadius: 9999, background: '#E7F6EC', color: '#127A3A', fontSize: 12 }}>
              {d.onTime}
            </span>
          </span>
        </div>
        <div style={doneRow}>
          <span style={{ color: '#5E5E6A' }}>{d.fingerprint}</span>
          <span style={{ fontFamily: FONT.mono, fontWeight: 700 }}>{fp}</span>
        </div>
        <div style={doneRow}>
          <span style={{ color: '#5E5E6A' }}>{d.comes}</span>
          <span style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontWeight: 600 }}>{d.comesV}</span>
            <span style={{ display: 'block', fontSize: 12, color: '#5E5E6A' }}>
              {d.comesSubEstimate}
              {d.comesSubRest}
            </span>
          </span>
        </div>
      </div>
      <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <a
          style={{
            height: 46,
            padding: '0 18px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            borderRadius: 9999,
            background: '#F2EAFB',
            color: '#6A22B0',
            fontSize: 15,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          {d.explorer}
        </a>
        <a style={{ height: 46, padding: '0 12px', display: 'inline-flex', alignItems: 'center', fontSize: 15, fontWeight: 600, textDecoration: 'none', color: '#6A22B0' }}>{d.back}</a>
      </div>
    </div>
  );
}

type Props = { state: SubmitState; width: number; height: number; children?: ReactNode };

export function WebSubmitScreen({ state, width, height, children }: Props) {
  const fp = deliveryFingerprint(state);
  return (
    <div
      inert
      data-screen="webSubmit"
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
        <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 64px', boxSizing: 'border-box' }}>
          <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: '#5E5E6A' }}>
            <a style={{ textDecoration: 'none', color: '#6A22B0' }}>{s.breadcrumb.root}</a> <span aria-hidden="true">{s.breadcrumb.sep}</span> {s.breadcrumb.contract}{' '}
            <span aria-hidden="true">{s.breadcrumb.sep}</span> {s.breadcrumb.here}
          </nav>
          {state.done ? <Done fp={fp} /> : <Form state={state} fp={fp} />}
        </main>
      </div>
      {state.panel === 'sign' && (
        <>
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 35, background: 'rgba(17,17,22,0.32)' }} />
          <div style={{ position: 'absolute', top: 76, right: Math.max(16, (width - 1280) / 2 + 24), zIndex: 40, maxWidth: width - 32 }}>
            <WebWalletPanel who="vinh" mode="sign" action="submit" fingerprint={fp} />
          </div>
        </>
      )}
      {children}
    </div>
  );
}
