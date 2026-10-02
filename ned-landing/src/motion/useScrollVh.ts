import { useEffect } from 'react';
import { animate, motionValue, useScroll, useVelocity, type MotionValue } from 'motion/react';
import { K } from './flags';
import { reducedState } from './timeline';

/** Scroll position (px) → story vh. */
export const scrollToVh = (y: number) => (y / Math.max(1, window.innerHeight)) * (100 / K);
/** Story vh → scroll position (px). */
export const vhToScroll = (vh: number) => (vh / 100) * K * window.innerHeight;

// Module-level values so the 3D layer can read them without prop drilling.
export const storyVh = motionValue(0);
export const dip = motionValue(0);

/**
 * The page's scroll position in story vh. Both the page layer and the 3D scene read it.
 * Reduced motion: the value steps between key states behind a short dip instead of scrubbing.
 */
export function useScrollVh(reduced: boolean): {
  vh: MotionValue<number>;
  velocity: MotionValue<number>;
  dip: MotionValue<number>;
} {
  const { scrollY } = useScroll();
  const velocity = useVelocity(storyVh);

  useEffect(() => {
    let current = reduced ? reducedState(scrollToVh(scrollY.get())) : scrollToVh(scrollY.get());
    storyVh.set(current);
    let pending: number | null = null;
    const onChange = (y: number) => {
      const raw = scrollToVh(y);
      if (!reduced) {
        storyVh.set(raw);
        return;
      }
      const target = reducedState(raw);
      if (target === current || target === pending) return;
      pending = target;
      animate(dip, 1, { duration: 0.15 }).then(() => {
        if (pending === null) return;
        current = pending;
        pending = null;
        storyVh.set(current);
        animate(dip, 0, { duration: 0.15 });
      });
    };
    return scrollY.on('change', onChange);
  }, [reduced, scrollY]);

  return { vh: storyVh, velocity, dip };
}
