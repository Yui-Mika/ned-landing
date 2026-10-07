import { copy } from '@/content/copy';
import { FONT, Screen } from './parts';

/**
 * Port of docs/design-reference/phone/OnbSplash.dc.html (variant mark). Markup and inline styles 1:1.
 * Left out: the boards' entrance animation (`.ned-in`).
 */
const s = copy.screens.onbSplash;

export function OnbSplashScreen() {
  return (
    <Screen name="onbSplash">
      <a
        aria-label={s.aria}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          color: '#FFFFFF',
          background: '#7B2FBE',
        }}
      >
        <div
          style={{
            width: 112,
            height: 112,
            borderRadius: 32,
            background: 'rgba(255,255,255,0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* TODO(asset): the board's mark image (88 × 90) has no source yet (src="#E6E6EB"); slot kept empty. */}
          <div style={{ width: 88, height: 90 }} />
        </div>
        <div style={{ marginTop: 22, fontFamily: FONT.display, fontSize: 32, fontWeight: 700, letterSpacing: 6, paddingLeft: 6 }}>{s.wordmark}</div>
        <div style={{ position: 'absolute', bottom: 40, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{s.tagline}</div>
      </a>
    </Screen>
  );
}
