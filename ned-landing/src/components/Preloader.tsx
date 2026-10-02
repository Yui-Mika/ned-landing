import { motion, type MotionValue } from 'motion/react';
import { Mustache } from './Mustache';

type Props = { progress: MotionValue<number> };

/**
 * Chapter 00. The glyph draws itself as assets load. It sits over the 3D layer only:
 * the headline is already painted underneath, so it still counts for LCP.
 * On exit the glyph's layoutId hands it to the hero, where it becomes the underline.
 */
export function Preloader({ progress }: Props) {
  return (
    <motion.div
      className="preloader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.2 } }}
    >
      <div role="status" aria-live="polite" className="sr-only">
        Loading N.E.D
      </div>
      <motion.div layoutId="ned-glyph" className="preloader-glyph" transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <Mustache draw={progress} />
      </motion.div>
      <p className="preloader-word" aria-hidden="true">
        N.E.D
      </p>
    </motion.div>
  );
}
