import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { teddyBubbles, type Mood } from '../content/teddy';
import { useCtaHover } from './ctaHover';
import { IS_TOUCH, PRESENT } from '../motion/flags';
import { TIMELINE } from '../motion/timeline';

type Props = {
  vh: MotionValue<number>;
  velocity: MotionValue<number>;
  ready: boolean;
  reduced: boolean;
};

const FAST_VH_PER_S = 300; // three screens a second
const IDLE_MS = 20_000;
const MOODS: Mood[] = ['waving', 'thinking', 'surprised', 'sleepy', 'curious'];

/**
 * Teddy, chapter 01 only in this prototype. Decorative: aria-hidden, no information lives only in him.
 * Priority (top wins): key moment (intro wave) > fast scroll > scroll up > CTA hover > idle > base.
 * Prototype note: drawn as one DOM image per mood until the layered 1024 px art exists;
 * the props stay the same when he moves into the 3D scene as layered planes.
 */
export function Teddy({ vh, velocity, ready, reduced }: Props) {
  const src = (m: Mood) => `${import.meta.env.BASE_URL}assets/teddy/${m}.png`;
  const [intro, setIntro] = useState(true);
  const [fast, setFast] = useState(false);
  const [up, setUp] = useState(false);
  const [idle, setIdle] = useState(false);
  const hover = useCtaHover();
  const timers = useRef<{ fast?: number; up?: number; idle?: number }>({});
  const box = useRef<HTMLDivElement>(null);

  const [outStart, outEnd] = TIMELINE.hero.teddyOut;
  const opacity = useTransform(vh, [outStart, outEnd], [1, 0]);
  const y = useTransform(vh, [outStart, outEnd], [0, reduced ? 0 : 80]);
  const visibility = useTransform(opacity, (o) => (o <= 0.01 ? 'hidden' : 'visible'));

  // Cursor follow (desktop only, confirmed 2 Oct): head tilt ±6°, slight lean.
  const tilt = useSpring(0, { stiffness: 120, damping: 20 });
  const lean = useSpring(0, { stiffness: 120, damping: 20 });

  useEffect(() => {
    MOODS.forEach((m) => {
      const img = new Image();
      img.src = src(m);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setIntro(false), 2400);
    return () => window.clearTimeout(t);
  }, [ready]);

  useEffect(() => {
    if (PRESENT) return;
    const reset = () => {
      setIdle(false);
      window.clearTimeout(timers.current.idle);
      timers.current.idle = window.setTimeout(() => setIdle(true), IDLE_MS);
    };
    const onMove = (e: PointerEvent) => {
      reset();
      if (IS_TOUCH || reduced || !box.current) return;
      const r = box.current.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      tilt.set(Math.max(-6, Math.min(6, dx * 14)));
      lean.set(Math.max(-4, Math.min(4, dy * 8)));
    };
    reset();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('keydown', reset);
    window.addEventListener('scroll', reset, { passive: true });
    window.addEventListener('touchstart', reset, { passive: true });
    return () => {
      window.clearTimeout(timers.current.idle);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('keydown', reset);
      window.removeEventListener('scroll', reset);
      window.removeEventListener('touchstart', reset);
    };
  }, [reduced, tilt, lean]);

  useMotionValueEvent(velocity, 'change', (v) => {
    if (v > FAST_VH_PER_S) {
      setFast(true);
      window.clearTimeout(timers.current.fast);
      timers.current.fast = window.setTimeout(() => setFast(false), 800);
    }
    if (v < -15) {
      setUp(true);
      window.clearTimeout(timers.current.up);
      timers.current.up = window.setTimeout(() => setUp(false), 700);
    }
  });

  const mood: Mood = intro ? 'waving' : fast ? 'surprised' : up ? 'thinking' : hover ? 'curious' : idle ? 'sleepy' : 'waving';
  const bubble = intro && ready ? teddyBubbles.waving : mood === 'waving' ? null : teddyBubbles[mood] ?? null;
  const waving = intro && ready && !reduced;

  return (
    <motion.div className="teddy" aria-hidden="true" style={{ opacity, y, visibility }} ref={box}>
      <AnimatePresence>
        {bubble && ready && (
          <motion.p
            key={bubble}
            className="teddy-bubble"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {bubble}
          </motion.p>
        )}
      </AnimatePresence>
      <motion.div
        className="teddy-body"
        style={{ rotate: tilt, x: lean }}
        animate={reduced ? undefined : { scaleY: [1, 1.025, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          animate={waving ? { rotate: [0, -6, 6, -4, 3, 0] } : { rotate: hover ? -6 : 0 }}
          transition={waving ? { duration: 1.4, ease: 'easeInOut' } : { type: 'spring', stiffness: 300, damping: 30 }}
          style={{ transformOrigin: '50% 90%' }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.img
              key={mood}
              src={src(mood)}
              alt=""
              className="teddy-img"
              draggable={false}
              initial={{ opacity: 0 }}
              animate={{ opacity: ready ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
