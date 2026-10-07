import { copy } from '@/content/copy';
import { DevnetChip, FONT, Screen, StatusBar } from './parts';

/**
 * Port of docs/design-reference/phone/MilestoneSubmitted.dc.html = phone/MilestoneSubmit · view vn · done.
 * Markup and inline styles 1:1. Left out: the prototype-only "DEMO · switch to @mia's phone" link (its empty wrapper
 * with margin-top 14 stays, as on the board) and the entrance animation. `fingerprint`: the board hashes its own
 * sample link; here it is the delivery fingerprint submitted from the Workspace (chapter 06), so both devices agree.
 */
const s = copy.screens.milestoneSubmitted;

export function MilestoneSubmittedScreen({ fingerprint }: { fingerprint: string }) {
  return (
    <Screen name="milestoneSubmitted" style={{ background: '#F4F4F6', color: '#111116', display: 'flex', flexDirection: 'column' }}>
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

      <div style={{ flex: 1, padding: '30px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: 84, height: 84, borderRadius: 9999, background: '#FFF5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8A5300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </div>
        <h1 style={{ margin: '20px 0 0', fontFamily: FONT.display, fontSize: 26, fontWeight: 700 }}>{s.headline}</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: '#3F3F49' }}>{s.sub}</p>
        <div style={{ marginTop: 18, width: '100%', padding: 14, boxSizing: 'border-box', textAlign: 'left', borderRadius: 20, background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#5E5E6A' }}>{s.fingerprint}</span>
            <span style={{ fontFamily: FONT.mono, fontWeight: 700 }}>{fingerprint}</span>
          </div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#5E5E6A' }}>{s.reviewBy}</span>
            <span style={{ fontWeight: 600 }}>{s.reviewByV}</span>
          </div>
          <a style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#6A22B0' }}>
            {s.explorer}{' '}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
            </svg>
          </a>
        </div>
        <div style={{ marginTop: 14 }} />
        <div style={{ flex: 1 }} />
        <a
          style={{
            marginBottom: 28,
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderRadius: 9999,
            background: '#F2EAFB',
            border: 'none',
            fontFamily: FONT.body,
            fontSize: 16,
            fontWeight: 600,
            color: '#6A22B0',
            textDecoration: 'none',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          {s.home}
        </a>
      </div>
    </Screen>
  );
}
