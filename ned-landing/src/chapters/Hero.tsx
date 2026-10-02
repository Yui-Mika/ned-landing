import { Fragment } from 'react';
import { motion, useTransform, type MotionValue } from 'motion/react';
import { hero } from '../content/hero';
import { Mustache } from '../components/Mustache';
import { TIMELINE } from '../motion/timeline';

type Props = { vh: MotionValue<number>; ready: boolean; reduced: boolean };

/**
 * Chapter 01 · Hero (0–120 vh). Headline words are painted at 15% opacity from the first frame
 * (an LCP candidate), then revealed one by one once loading ends.
 * The glyph arrives from the preloader through a shared layoutId and becomes the underline.
 */
export function Hero({ vh, ready, reduced }: Props) {
  const [a, b] = TIMELINE.hero.copyOut;
  const opacity = useTransform(vh, [a, b], [1, 0]);
  const y = useTransform(vh, [a, b], [0, reduced ? 0 : -60]);
  const cueOpacity = useTransform(vh, [0, 12], [1, 0]);
  const words = hero.headline.split(' ');

  return (
    <section id="hero" className="chapter chapter-hero" aria-labelledby="hero-title">
      <div className="pin">
        <motion.div className="hero-copy" style={{ opacity, y }}>
          <h1 id="hero-title" className="display">
            {words.map((w, i) => (
              <Fragment key={`${w}-${i}`}>
                <motion.span
                  className="word"
                  initial={{ opacity: 0.15 }}
                  animate={{ opacity: ready ? 1 : 0.15, y: ready || reduced ? 0 : 6 }}
                  transition={{ delay: reduced ? 0 : 0.25 + i * 0.06, duration: reduced ? 0 : 0.5, ease: 'easeOut' }}
                >
                  {w}
                </motion.span>
                {i < words.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </h1>
          <div className="glyph-slot">
            {ready && (
              <motion.div layoutId="ned-glyph" className="hero-glyph" transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                <Mustache />
              </motion.div>
            )}
          </div>
          <p className="lede">{hero.sub}</p>
          <p className="chip chip-warn">{hero.chip}</p>
        </motion.div>
        <motion.p className="scroll-cue mono" style={{ opacity: cueOpacity }} aria-hidden="true">
          {hero.cue} ↓
        </motion.p>
      </div>
    </section>
  );
}
