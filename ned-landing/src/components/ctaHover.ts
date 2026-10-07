import { signals } from '../motion/anchors';

// Is the pointer (or focus) on a call to action? Freelancer Teddy leans in, curious (motion map 09.9).

/** Spread onto any CTA element. */
export const ctaHoverProps = {
  onPointerEnter: () => signals.ctaHover.set(1),
  onPointerLeave: () => signals.ctaHover.set(0),
  onFocus: () => signals.ctaHover.set(1),
  onBlur: () => signals.ctaHover.set(0),
};
