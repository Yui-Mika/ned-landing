import { copy } from '@/content/copy';
import { FONT, Screen } from './parts';

/**
 * Port of docs/design-reference/phone/OnbSplash.dc.html (variant mascot: waving Teddy on the lilac tile).
 * Markup and inline styles 1:1. Left out: the boards' entrance animation (`.ned-in`).
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
          color: '#111116',
          background: '#F4F4F6',
        }}
      >
        <div
          style={{
            width: 220,
            height: 190,
            borderRadius: 40,
            background: '#EDE3FB',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img src="/design-assets/teddy-waving_5bb51609.png" alt="" style={{ width: 200, height: 160, objectFit: 'contain' }} />
        </div>
        <div style={{ marginTop: 24, fontFamily: FONT.display, fontSize: 32, fontWeight: 700, letterSpacing: 6, paddingLeft: 6 }}>{s.wordmark}</div>
      </a>
    </Screen>
  );
}
