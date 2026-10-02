import { useEffect, useState } from 'react';
import { motion, useTransform } from 'motion/react';
import { anchor } from '../motion/anchors';
import { storyVh as vh } from '../motion/useScrollVh';
import { within } from '../motion/timeline';
import { close, hero } from '../content/copy';

/**
 * Freelancer Teddy's speech bubbles, pinned over his head: "Hi, I'm Teddy." in the hero (01.7),
 * "…" while thinking (03.3), "See you soon." at the end (09.12). Decorative: aria-hidden.
 */
export function Bubbles({ ready, reduced }: { ready: boolean; reduced: boolean }) {
  const a = anchor('tf-head');
  const [helloOn, setHelloOn] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setHelloOn(true), reduced ? 0 : 700);
    return () => window.clearTimeout(t);
  }, [ready, reduced]);

  const hello = useTransform([vh, a.visible], ([v, vis]: number[]) => (helloOn ? within(v, [-50, 10], 3) * vis : 0));
  const think = useTransform([vh, a.visible], ([v, vis]: number[]) => within(v, [398, 468], 5) * vis);
  const bye = useTransform([vh, a.visible], ([v, vis]: number[]) => within(v, [2432, 2600], 4) * vis);
  const y = useTransform(a.y, (y) => y - 8);

  return (
    <motion.div className="bubbles" style={{ x: a.x, y }} aria-hidden="true">
      <motion.p className="bubble" style={{ opacity: hello }}>
        {hero.bubble}
      </motion.p>
      <motion.p className="bubble bubble-dots" style={{ opacity: think }}>
        …
      </motion.p>
      <motion.p className="bubble" style={{ opacity: bye }}>
        {close.bubble}
      </motion.p>
    </motion.div>
  );
}
