'use client';

import { useEffect, useRef } from 'react';
import { motion, useAnimationControls, useSpring, useTransform } from 'motion/react';
import { scrollVh } from '@/motion/scroll';
import { isTouch, useReducedMotionSafe } from '@/motion/flags';
import { useIntro } from '@/motion/intro';
import { EASE_OUT, intro, spring } from '@/motion/tokens';

/**
 * Teddy, hero only (SPEC §4, §12.4). Decorative: aria-hidden, no information lives only in him.
 * Hidden until the hero intro is done; enters (and waves) 300 ms after the phone (§16.1).
 * Art: 2D set from the product repo (~240 px). TODO(asset): swap for the layered/hi-res art or a glb.
 */
export function Teddy() {
  const reduced = useReducedMotionSafe();
  const { phase, doneAt } = useIntro();
  const controls = useAnimationControls();
  const box = useRef<HTMLDivElement>(null);
  const tilt = useSpring(0, spring.soft);
  const lean = useSpring(0, spring.soft);

  // Leaves as the phone starts its T1 glide.
  const opacity = useTransform(scrollVh, [85, 112], [1, 0]);
  const y = useTransform(scrollVh, [85, 112], [0, reduced ? 0 : 60]);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? 'hidden' : 'visible'));

  // Enters with the hint, just after the phone (§16.1); the wave starts then, not at the headline.
  useEffect(() => {
    if (phase !== 'done' || doneAt === null) return;
    const start = Math.max(0, doneAt + intro.companionsDelay - performance.now()) / 1000;
    if (reduced) {
      controls.start({ opacity: 1, y: 0, transition: { duration: intro.reducedFade / 1000 } });
      return;
    }
    controls.start({
      opacity: 1,
      y: 0,
      rotate: [0, -6, 6, -4, 3, 0],
      transition: {
        opacity: { duration: 0.4, delay: start },
        y: { duration: 0.6, delay: start, ease: EASE_OUT },
        rotate: { duration: 1.6, delay: start + 0.2, ease: 'easeInOut' },
      },
    });
  }, [phase, doneAt, reduced, controls]);

  // Head follows the cursor (desktop only).
  useEffect(() => {
    if (reduced || isTouch()) return;
    const onMove = (e: PointerEvent) => {
      if (!box.current) return;
      const r = box.current.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      tilt.set(Math.max(-8, Math.min(8, dx * 18)));
      lean.set(Math.max(-5, Math.min(5, dy * 10)));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced, tilt, lean]);

  return (
    <motion.div
      ref={box}
      aria-hidden="true"
      style={{ opacity, y, visibility }}
      className="pointer-events-none fixed bottom-[12vh] left-[calc(70vw-15vh-200px)] z-10 hidden w-[180px] lg:block"
    >
      <motion.div style={{ rotate: tilt, x: lean, transformOrigin: '50% 90%' }}>
        {/* Decorative, so it may start hidden on the server (no copy lives here). */}
        <motion.img
          data-teddy=""
          src="/teddy/waving.png"
          alt=""
          width={239}
          height={182}
          draggable={false}
          className="h-auto w-full drop-shadow-[0_18px_30px_rgba(123,47,190,0.35)]"
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={controls}
          style={{ transformOrigin: '50% 90%' }}
        />
      </motion.div>
    </motion.div>
  );
}
