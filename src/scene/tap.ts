import { TAPS } from './poses';
import { offsetIn } from './focus';

/** Size of the tap mark in screen CSS px. */
export const TAP_PX = 56;

/**
 * Tap mark (landing layer, not part of the screen): a pure function of scroll. Fades in, presses (scale 1 → 0.8 →
 * 1), fades out over its TAPS window, centred on the element with data-tap-target inside `root`.
 * `scrollY`: page scroll of the screen, subtracted for targets inside [data-page]. Reduced motion: opacity only.
 */
export function drawTap(mark: HTMLDivElement, root: HTMLElement, track: string, vh: number, reduced: boolean, scrollY = 0) {
  const tap = TAPS.find((t) => t.track === track && vh > t.start && vh < t.end);
  const target = tap ? root.querySelector<HTMLElement>(`[data-tap-target="${tap.target}"]`) : null;
  if (!tap || !target) {
    if (mark.style.opacity !== '0') mark.style.opacity = '0';
    return;
  }
  const p = (vh - tap.start) / (tap.end - tap.start);
  const opacity = Math.min(1, p / 0.2, (1 - p) / 0.25);
  const press = reduced ? 1 : 1 - 0.2 * Math.sin(Math.PI * Math.min(1, Math.max(0, (p - 0.25) / 0.4)));
  const { x, y } = offsetIn(target, root);
  const cx = x + target.offsetWidth / 2 - TAP_PX / 2;
  const cy = y + target.offsetHeight / 2 - TAP_PX / 2 - (target.closest('[data-page]') ? scrollY : 0);
  mark.style.opacity = opacity.toFixed(3);
  mark.style.transform = `translate(${cx}px, ${cy}px) scale(${press.toFixed(3)})`;
}
