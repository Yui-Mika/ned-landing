'use client';

import type Lenis from 'lenis';
import { motionValue } from 'motion/react';
import { isPortrait, prefersReducedMotion } from './flags';
import { easeFn } from './tokens';

/**
 * The ONE scroll value. Story position in desktop vh (SPEC §6 ranges), already
 * divided by K on phones, so every chapter range reads the same on every device.
 * DOM reads it as a MotionValue; the 3D scene calls `scrollVh.get()` inside useFrame.
 */
export const scrollVh = motionValue(0);

/** Phones scale every vh range by 0.75 (SPEC §5.1). */
export const K_PORTRAIT = 0.75;

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

/** The Lenis instance (null under reduced motion), e.g. to stop smooth scrolling while a dialog is open. */
export const getLenis = () => lenis;

export const getK = () => (isPortrait() ? K_PORTRAIT : 1);

const pxPerVh = () => (window.innerHeight / 100) * getK();

export function syncScrollVh() {
  scrollVh.set(window.scrollY / pxPerVh());
}

/** Scroll to a story position (desktop vh). Smooth via Lenis unless reduced motion. */
export function scrollToVh(vh: number, durationS = 1) {
  const top = vh * pxPerVh();
  if (lenis && !prefersReducedMotion()) {
    lenis.scrollTo(top, { duration: durationS, easing: easeFn.ease });
  } else {
    window.scrollTo({ top, behavior: 'auto' });
  }
}
