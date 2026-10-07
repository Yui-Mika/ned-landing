import { motion, useTransform } from 'motion/react';
import { anchor, signals } from '../motion/anchors';
import { storyVh as vh } from '../motion/useScrollVh';
import { seg } from '../motion/timeline';

/**
 * Teddy, in the hero only (decided 3 Oct). The 2D art stands beside the hero loop, waves, and leaves at
 * 30–60 vh as the two pebbles arrive. Hidden once the team's 3D model is in the scene.
 * Decorative: aria-hidden; never beside amount entry or confirmation.
 */
export function TeddyHero({ ready, reduced }: { ready: boolean; reduced: boolean }) {
  const a = anchor('teddy');
  const opacity = useTransform([vh, a.visible, signals.teddyModel], ([v, vis, model]: number[]) => (1 - seg(v, [30, 60])) * vis * (1 - model));
  const y = useTransform([a.y, vh], ([ay, v]: number[]) => ay - seg(v, [30, 60]) * 40);
  const base = import.meta.env.BASE_URL;
  return (
    <motion.div className="teddy-hero" style={{ x: a.x, y, opacity }} aria-hidden="true">
      <motion.img
        src={`${base}assets/teddy/waving.png`}
        alt=""
        className="teddy-img"
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        animate={ready ? { opacity: 1, y: 0, scale: 1, rotate: reduced ? 0 : [0, -5, 4, -5, 3, 0] } : {}}
        transition={{
          opacity: { duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.35 },
          y: { type: 'spring', stiffness: 140, damping: 22, delay: reduced ? 0 : 0.35 },
          scale: { type: 'spring', stiffness: 140, damping: 22, delay: reduced ? 0 : 0.35 },
          rotate: { duration: 1.8, delay: 0.9, ease: 'easeInOut' },
        }}
      />
    </motion.div>
  );
}
