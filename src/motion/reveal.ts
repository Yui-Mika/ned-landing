'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useAnimationControls, type TargetAndTransition } from 'motion/react';
import { PORTRAIT_QUERY, useReducedMotionSafe } from './flags';
import { EASE_OUT, text } from './tokens';

/**
 * Chapter 00 load reveal (SPEC §14.1). One phase for the whole page:
 *   pending → play (top of the page) or skip (loaded mid-page: scroll restoration, anchor, jump).
 * Text is never server-rendered hidden: the inline <head> script adds `is-motion` to <html>
 * before first paint, and globals.css hides `[data-reveal]` only while `is-motion:not(.reveal-done)`.
 */
export type RevealPhase = 'pending' | 'play' | 'skip';

let phase: RevealPhase = 'pending';
const listeners = new Set<() => void>();

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

function setPhase(next: RevealPhase) {
  if (phase !== 'pending') return;
  phase = next;
  performance.mark(`ned:reveal:${next}`);
  listeners.forEach((fn) => fn());
  // Inline styles now hold every hidden start state; the CSS pre-paint guard can go.
  requestAnimationFrame(() => document.documentElement.classList.add('reveal-done'));
}

export const useRevealPhase = () => useSyncExternalStore(subscribe, () => phase, () => 'pending' as const);

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/** Wait for fonts + the first frame of the poster/3D, but never past `maxWaitMs` after navigation start. */
export function useRevealGate() {
  useEffect(() => {
    let cancelled = false;
    const deadline = new Promise<void>((r) => setTimeout(r, Math.max(0, text.reveal.maxWaitMs - performance.now())));
    const ready = Promise.all([document.fonts?.ready ?? Promise.resolve(), nextFrame().then(nextFrame)]);
    Promise.race([ready, deadline]).then(() => {
      if (cancelled) return;
      const midPage = window.scrollY > 4 || window.location.hash.length > 1;
      setPhase(midPage ? 'skip' : 'play');
    });
    return () => {
      cancelled = true;
    };
  }, []);
}

/** Narrow / touch layout: no blur, shorter stagger, smaller rise (§14.4). */
export function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(PORTRAIT_QUERY);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return mobile;
}

type RevealStep = {
  /** False → the element has no load reveal (chapters 01–14); the hook does nothing. */
  enabled?: boolean;
  /** Start offset in ms from the reveal start. */
  delay: number;
  duration: number;
  /** Hidden start state (opacity 0 is added). */
  from?: TargetAndTransition;
  /** Called once the step finishes (used for performance marks). */
  onDone?: () => void;
};

/**
 * Drive one element's part of the load reveal. Returns animation controls for a `motion.*` element
 * that also carries `data-reveal`. Nothing is set on the server; hidden states are applied on mount.
 */
export function useLoadReveal({ enabled = true, delay, duration, from = {}, onDone }: RevealStep) {
  const controls = useAnimationControls();
  const current = useRevealPhase();
  const reduced = useReducedMotionSafe();

  const hidden: TargetAndTransition = reduced ? { opacity: 0 } : { opacity: 0, ...from };
  const shown: TargetAndTransition = { opacity: 1, y: 0, filter: 'blur(0px)' };
  // No blur in this state (reduced motion, mobile), but an earlier render may already have set one: the
  // hydration-safe flags read false on the first render, so the pending start state can carry blur(8px).
  // Clear it explicitly instead of leaving the element blurred.
  if (!('filter' in hidden)) {
    hidden.filter = 'none';
    shown.filter = 'none';
  }

  useEffect(() => {
    if (!enabled) return;
    if (current === 'pending') {
      if (document.documentElement.classList.contains('is-motion')) controls.set(hidden);
      return;
    }
    if (current === 'skip') {
      controls.set(shown);
      onDone?.();
      return;
    }
    controls.set(hidden);
    controls
      .start({
        ...shown,
        transition: reduced
          ? { duration: text.reveal.reducedDuration / 1000, ease: EASE_OUT }
          : { duration: duration / 1000, delay: delay / 1000, ease: EASE_OUT },
      })
      .then(() => onDone?.());
    // Phase changes once; the step values are constants from tokens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, enabled]);

  return controls;
}
