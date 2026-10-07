import { motion, useTransform } from 'motion/react';
import { seg } from '../motion/timeline';
import { storyVh as vh } from '../motion/useScrollVh';
import { Mustache } from './Mustache';

/**
 * Fallback when WebGL is not available: a still frame. The 2D Teddy art (fetched at build time by
 * scripts/fetch-teddy.mjs) stands in the hero only, like the 3D page; after that only the glow and the mustache
 * glyph remain. The story copy still reads in full on top.
 */
export function StaticScene() {
  const base = import.meta.env.BASE_URL;
  const teddy = useTransform(vh, (v) => 1 - seg(v, [30, 60]));
  return (
    <div className="static-scene">
      <div className="static-glow" />
      <motion.img className="static-teddy" src={`${base}assets/teddy/waving.png`} alt="" style={{ opacity: teddy }} />
      <div className="static-glyph">
        <Mustache />
      </div>
    </div>
  );
}
