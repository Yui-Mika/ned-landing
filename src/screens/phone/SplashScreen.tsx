import { copy } from '@/content/copy';
import { LockGlyph } from '@/components/LockGlyph';
import { PHONE_SCREEN_PX } from './HomeScreen';

/**
 * N.E.D splash (end of chapter 01). Product design system (SPEC §12): background #F4F4F6, Space Grotesk,
 * no outlines / gradients / glows / shadows; status as text + colour.
 */
export function SplashScreen() {
  return (
    <div
      data-screen="splash"
      className="flex flex-col overflow-hidden rounded-[48px] bg-app font-sans text-app-ink select-none"
      style={{ width: PHONE_SCREEN_PX.w, height: PHONE_SCREEN_PX.h }}
    >
      <div className="flex justify-end px-6 pt-5">
        <span className="inline-flex h-7 items-center rounded-full bg-app-warning px-3 text-[13px] font-semibold text-app-warning-ink">
          {copy.screens.testNetwork}
        </span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-24">
        <span aria-hidden="true" className="grid size-20 place-items-center rounded-[20px] bg-app-primary-tint">
          <LockGlyph size={44} color="#6A22B0" />
        </span>
        {/* TODO(asset): real N.E.D wordmark */}
        <span className="font-display text-[44px] leading-none font-bold tracking-tight">{copy.site.wordmark}</span>
        <span className="text-[15px] text-app-ink-2">{copy.splash.product}</span>
      </div>
    </div>
  );
}
