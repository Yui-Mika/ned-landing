'use client';

import { useEffect, useRef } from 'react';
import { motion, useAnimationControls, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { scrollVh } from '@/motion/scroll';
import { isTouch } from '@/motion/flags';
import { useRevealPhase } from '@/motion/reveal';
import { EASE_OUT, spring, text } from '@/motion/tokens';

/**
 * Teddy, hero only (SPEC §4, §12.4). Decorative: aria-hidden, no information lives only in him.
 * His wave starts with the headline (reveal step 3).
 * Art: 2D set from the product repo (~240 px). TODO(asset): swap for the layered/hi-res art or a glb.
 */
export function Teddy() {
  const reduced = useReducedMotion() ?? false;
  const phase = useRevealPhase();
  const controls = useAnimationControls();
  const box = useRef<HTMLDivElement>(null);
  const tilt = useSpring(0, spring.soft);
  const lean = useSpring(0, spring.soft);

  // Leaves as the phone starts its T1 glide.
  const opacity = useTransform(scrollVh, [85, 112], [1, 0]);
  const y = useTransform(scrollVh, [85, 112], [0, reduced ? 0 : 60]);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? 'hidden' : 'visible'));

  useEffect(() => {
    if (phase === 'pending') return;
    if (phase === 'skip' || reduced) {
      controls.start({ opacity: 1, y: 0, transition: { duration: text.reveal.reducedDuration / 1000 } });
      return;
    }
    const start = text.reveal.headline.delay / 1000;
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
  }, [phase, reduced, controls]);

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
