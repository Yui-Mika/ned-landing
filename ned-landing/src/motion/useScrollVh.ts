import { useScroll, useTransform, useVelocity, type MotionValue } from 'motion/react';
import { scrollToVh } from './timeline';

/**
 * The page's scroll position in vh, as a motion value. Both the DOM and the 3D scene read it.
 * Velocity is in vh per second (300 ≈ three screens a second).
 */
export function useScrollVh(): { vh: MotionValue<number>; velocity: MotionValue<number> } {
  const { scrollY } = useScroll();
  const vh = useTransform(scrollY, (y) => scrollToVh(y));
  const velocity = useVelocity(vh);
  return { vh, velocity };
}
