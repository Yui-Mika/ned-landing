import { Fragment } from 'react';
import { motion, useTransform } from 'motion/react';
import { hero } from '../content/copy';
import { Mustache } from '../components/Mustache';
import { Chapter } from '../components/Reveal';
import { storyVh as vh } from '../motion/useScrollVh';
import { seg } from '../motion/timeline';

/**
 * 01 · Hero (0–120 vh). Time-based entrance once the preloader exits (01.1–01.3): there is nothing to
 * scroll at 0 vh. Headline words are painted at 15 % from the first frame (an LCP candidate).
 * The glyph arrives from the preloader through a shared layoutId and becomes the underline (00.7).
 */
export function Hero({ ready, reduced }: { ready: boolean; reduced: boolean }) {
  const cue = useTransform(vh, (v) => 1 - seg(v, [0, 10]));
  const words = hero.headline.split(' ');
  const t = (delay: number) => ({ delay: reduced ? 0 : delay, duration: reduced ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] as const });

  return (
    <Chapter id="hero" label="Introduction" stage={[0, 28]} out={[28, 50]} outY={-60} focusAt={0} className="layer-hero">
      <div className="copy">
        <h1 className="display">
          {words.map((w, i) => (
            <Fragment key={`${w}-${i}`}>
              <motion.span
                className="word"
                initial={{ opacity: 0.15, y: 0 }}
                animate={{ opacity: ready ? 1 : 0.15, y: ready || reduced ? 0 : 8 }}
                transition={t(0.15 + i * 0.06)}
              >
                {w}
              </motion.span>
              {i < words.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </h1>
        <div className="glyph-slot">
          {ready && (
            <motion.div layoutId="ned-glyph" className="hero-glyph" transition={{ type: 'spring', stiffness: 260, damping: 32 }}>
              <Mustache />
            </motion.div>
          )}
        </div>
        <motion.p className="lede" initial={{ opacity: 0, y: 12 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={t(0.45)}>
          {hero.sub}
        </motion.p>
        <motion.p className="chip chip-warn" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={t(0.6)}>
          {hero.chip}
        </motion.p>
      </div>
      <motion.p className="scroll-cue mono" style={{ opacity: cue }} aria-hidden="true">
        <span>{hero.cue}</span>
        <motion.span
          className="cue-arrow"
          animate={reduced ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          ↓
        </motion.span>
      </motion.p>
    </Chapter>
  );
}
