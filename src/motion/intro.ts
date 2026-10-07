'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { prefersReducedMotion } from './flags';
import { intro } from './tokens';
import { useRevealPhase } from './reveal';

/**
 * Hero intro (SPEC §16): introPhase = 'pending' | 'sweeping' | 'done'.
 * The phone, poster, Teddy, hint and tag stay hidden until 'done'; after that they never hide again.
 * Time-based on purpose (decorative exception to §5.1, like the load reveal).
 */
export type IntroPhase = 'pending' | 'sweeping' | 'done';

type IntroState = {
  phase: IntroPhase;
  /** performance.now() when sweep 1 started / the intro finished. */
  sweepAt: number | null;
  doneAt: number | null;
  /** True when the intro was cut short (input, mid-page load, reduced motion). */
  skipped: boolean;
};

let state: IntroState = { phase: 'pending', sweepAt: null, doneAt: null, skipped: false };
const listeners = new Set<() => void>();

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

function set(next: Partial<IntroState>) {
  state = { ...state, ...next };
  listeners.forEach((fn) => fn());
}

export const getIntro = () => state;

// Dev-only probe for the acceptance tests (SPEC tests 17–21).
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as { __nedIntro?: () => IntroState }).__nedIntro = getIntro;
}

const SERVER: IntroState = { phase: 'pending', sweepAt: null, doneAt: null, skipped: false };
export const useIntro = () => useSyncExternalStore(subscribe, getIntro, () => SERVER);

function startSweep() {
  if (state.phase !== 'pending') return;
  performance.mark('ned:intro:sweeping');
  set({ phase: 'sweeping', sweepAt: performance.now() });
}

/** Finish the intro (once). `skipped` = cut short; the band then glides into its loop without a jump. */
export function finishIntro(skipped: boolean) {
  if (state.phase === 'done') return;
  performance.mark(skipped ? 'ned:intro:skipped' : 'ned:intro:done');
  set({ phase: 'done', doneAt: performance.now(), skipped });
  // Lift the pre-paint CSS guard (inline styles hold the start states by now).
  requestAnimationFrame(() => document.documentElement.classList.add('intro-done'));
}

const SKIP_EVENTS = ['wheel', 'scroll', 'keydown', 'pointerdown', 'touchstart'] as const;

/**
 * Runs the intro timeline from the load reveal: play → sweep after `sweepDelay`, done after the sweep.
 * Reveal skipped (mid-page load) or reduced motion → done at once. Any scroll / click / key / touch skips.
 */
export function useIntroController() {
  const reveal = useRevealPhase();

  // Reduced motion: no sweep, phone visible immediately (it fades in over 200 ms).
  useEffect(() => {
    if (prefersReducedMotion()) finishIntro(true);
  }, []);

  useEffect(() => {
    if (reveal === 'pending') return;
    if (reveal === 'skip') {
      finishIntro(true);
      return;
    }
    const t1 = window.setTimeout(startSweep, intro.sweepDelay);
    // Normally the band's sweep ends the intro (so the phone never beats the light). Fallback if it can't
    // (no band, stalled frames): never keep the phone away much longer than planned.
    const t2 = window.setTimeout(() => finishIntro(false), intro.sweepDelay + intro.sweepDuration + intro.fallbackGrace);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reveal]);

  useEffect(() => {
    const skip = () => finishIntro(true);
    const opts = { passive: true, capture: true } as const;
    SKIP_EVENTS.forEach((e) => window.addEventListener(e, skip, opts));
    const unsub = subscribe(() => {
      if (state.phase === 'done') SKIP_EVENTS.forEach((e) => window.removeEventListener(e, skip, opts));
    });
    return () => {
      unsub();
      SKIP_EVENTS.forEach((e) => window.removeEventListener(e, skip, opts));
    };
  }, []);
}

/** 0 → 1 progress of an entrance that starts `delayMs` after the intro finished (or after `notBefore`). */
export function entranceProgress(now: number, durationMs: number, delayMs = 0, notBefore = 0) {
  if (state.phase !== 'done' || state.doneAt === null) return 0;
  const start = Math.max(state.doneAt, notBefore) + delayMs;
  return Math.min(1, Math.max(0, (now - start) / durationMs));
}
