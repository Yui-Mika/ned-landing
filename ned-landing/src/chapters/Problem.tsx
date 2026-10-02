import { motion, useTransform, type MotionValue } from 'motion/react';
import { problem } from '../content/problem';
import { SEGMENT } from '../config';
import { TIMELINE, type Range } from '../motion/timeline';

type Props = { vh: MotionValue<number>; reduced: boolean };

function useLine(vh: MotionValue<number>, r: Range, reduced: boolean) {
  const opacity = useTransform(vh, [r[0], r[1]], [0, 1]);
  const y = useTransform(vh, [r[0], r[1]], [reduced ? 0 : 24, 0]);
  return { opacity, y };
}

/**
 * Chapter 02 · The problem (120–400 vh, pinned). Copy comes from /src/content/problem.ts
 * through the SEGMENT flag. The 3D figures, coins and the fading centre figure live in the scene.
 */
export function Problem({ vh, reduced }: Props) {
  const copy = problem[SEGMENT];
  const t = TIMELINE.problem;
  const l1 = useLine(vh, t.line1, reduced);
  const l2 = useLine(vh, t.line2, reduced);
  const l3 = useLine(vh, t.line3, reduced);
  const out = useTransform(vh, [372, 398], [1, 0]);

  return (
    <section id="problem" className="chapter chapter-problem" aria-labelledby="problem-title">
      <div className="pin">
        <motion.div className="problem-copy" style={{ opacity: out }}>
          <motion.h2 id="problem-title" className="headline" style={l1}>
            {copy.line1}
          </motion.h2>
          <motion.p className="lede" style={l2}>
            {copy.line2}
          </motion.p>
          <motion.p className="lede strong" style={l3}>
            {copy.line3}
          </motion.p>
          {copy.figure && (
            <motion.p className="source mono" style={l3}>
              {copy.figure.text} <span>{copy.figure.source}</span>
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
