import { useEffect, useState } from 'react';
import { motion, useTransform } from 'motion/react';
import { anchor } from '../motion/anchors';
import { storyVh as vh } from '../motion/useScrollVh';
import { within } from '../motion/timeline';
import { hero } from '../content/copy';

/** Teddy's one line, "Hi, I'm Teddy.", above him in the hero (01.7). Decorative: aria-hidden. */
export function Bubbles({ ready, reduced }: { ready: boolean; reduced: boolean }) {
  const a = anchor('teddy-top');
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setOn(true), reduced ? 0 : 1000);
    return () => window.clearTimeout(t);
  }, [ready, reduced]);
  const opacity = useTransform([vh, a.visible], ([v, vis]: number[]) => (on ? within(v, [-50, 12], 4) * vis : 0));
  return (
    <motion.div className="bubbles" style={{ x: a.x, y: a.y }} aria-hidden="true">
      <motion.p className="bubble" style={{ opacity }}>
        {hero.bubble}
      </motion.p>
    </motion.div>
  );
}
