'use client';

import { useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type AnimationPlaybackControls } from 'motion/react';
import { useReducedMotionSafe } from '@/motion/flags';
import { scrollVh } from '@/motion/scroll';
import { finishIntro, getIntro, useIntro } from '@/motion/intro';
import { useIsMobile } from '@/motion/reveal';
import { band, EASE, intro } from '@/motion/tokens';

const c = band.colors;

/** The light: brightest at the centre, fading through the purples to the page background on both sides. */
const LIGHT = `linear-gradient(90deg, ${c.bg}00 0%, ${c.deepest} 14%, ${c.deep} 30%, ${c.mid} 42%, ${c.light} 50%, ${c.mid} 58%, ${c.deep} 70%, ${c.deepest} 86%, ${c.bg}00 100%)`;

/** Lens shading per rib: darker at the edges, a little lighter in the middle. Purple palette + page bg only. */
const ribShade = (rib: number) =>
  `repeating-linear-gradient(90deg, ${c.bg}8c 0px, ${c.bg}1a ${rib * 0.25}px, ${c.light}0d ${rib * 0.5}px, ${c.bg}1a ${rib * 0.75}px, ${c.bg}8c ${rib}px)`;

/** Mask showing the right half of every rib (where the shifted "refracted" slice lives). */
const ribHalves = (rib: number) =>
  `repeating-linear-gradient(90deg, transparent 0px, transparent ${rib / 2}px, #000 ${rib / 2}px, #000 ${rib}px)`;

/** Static film grain, tinted with the lightest purple (feTurbulence alone would add green specks). */
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.831  0 0 0 0 0.71  0 0 0 0 0.969  1 0 0 0 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
)}")`;

/**
 * Hero background: a band of purple light seen through fluted glass (SPEC §16, version 1: DOM only).
 * Sits behind the 3D canvas and the copy. Decorative: aria-hidden, no pointer events.
 * Moves with transform only; the intro sweep and the ping-pong loop are time-based.
 */
export function RefractionBand() {
  const reduced = useReducedMotionSafe();
  const mobile = useIsMobile();
  const { phase, skipped } = useIntro();
  const rib = mobile ? band.ribPxMobile : band.ribPx;

  // Band centre in vw. Server value = the still band, so no-JS shows a static gradient.
  const x = useMotionValue<number>(band.staticAt);
  // translateX only (GPU). Each light element is parked at left: −width, so x is the band centre.
  const tx = useTransform(x, (v) => `${v}vw`);
  const fade = useTransform(scrollVh, [band.fadeVh[0], band.fadeVh[1]], [reduced ? band.staticOpacity : 1, 0]);

  const anim = useRef<AnimationPlaybackControls | null>(null);
  const paused = useRef(false);
  /** Bumped on every new run, so a stopped animation's completion can't start anything. */
  const gen = useRef(0);

  const leg = mobile ? band.legSecondsMobile : band.legSeconds;

  const run = (controls: AnimationPlaybackControls, then?: () => void) => {
    const my = ++gen.current;
    anim.current?.stop();
    anim.current = controls;
    if (paused.current) controls.pause();
    if (then) controls.finished.then(() => my === gen.current && then());
  };

  // Ping-pong forever: right → left → right…, starting wherever the band is now (no jump).
  const startLoop = () => {
    const pingPong = () =>
      run(animate(x, [band.loopFrom, band.loopTo, band.loopFrom], { duration: leg * 2, ease: [band.loopEase, band.loopEase], repeat: Infinity }));
    const from = x.get();
    if (from >= band.loopFrom - 0.01) return pingPong();
    // Not at the right end yet (skipped mid-sweep or before it): keep going right at loop speed.
    const remaining = Math.max(0.4, (leg * (band.loopFrom - from)) / (band.loopFrom - band.loopTo));
    run(animate(x, band.loopFrom, { duration: remaining, ease: band.loopEase }), pingPong);
  };

  // Before the sweep: park off-screen left (the CSS guard hides the light until this has run).
  useEffect(() => {
    if (reduced) {
      x.set(band.staticAt);
    } else if (getIntro().phase === 'pending') {
      x.set(band.sweepFrom);
    }
    document.documentElement.classList.add('band-ready');
    return () => {
      gen.current++;
      anim.current?.stop();
    };
  }, [reduced, x]);

  useEffect(() => {
    if (reduced) {
      gen.current++;
      anim.current?.stop();
      x.set(band.staticAt);
      return;
    }
    // Sweep 1, left → right. Its end is what lets the phone in (the controller's timer is only a fallback),
    // then it hands over to the loop at the right end, at rest: no jump, no gap.
    if (phase === 'sweeping')
      run(animate(x, band.loopFrom, { duration: intro.sweepDuration / 1000, ease: EASE }), () => {
        finishIntro(false);
        startLoop();
      });
    // Cut short (input, mid-page load): glide on into the loop from wherever the band is.
    if (phase === 'done' && skipped) startLoop();
    // run / startLoop read refs and tokens only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, skipped, reduced]);

  // Pause when the tab is hidden or the hero is far off screen.
  const sync = () => {
    const shouldPause = document.hidden || scrollVh.get() > band.pauseAfterVh;
    if (shouldPause === paused.current) return;
    paused.current = shouldPause;
    if (shouldPause) anim.current?.pause();
    else anim.current?.play();
  };
  useMotionValueEvent(scrollVh, 'change', sync);
  useEffect(() => {
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dev-only test hook (contrast measurement pins the band at a given centre).
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    (window as unknown as { __nedBand?: unknown }).__nedBand = {
      pin: (vw: number) => {
        gen.current++;
        anim.current?.stop();
        x.set(vw);
      },
      get: () => x.get(),
      /** Play the current band animation faster (to observe whole loop legs in a test). */
      speed: (s: number) => {
        if (anim.current) anim.current.speed = s;
      },
    };
  }, [x]);

  return (
    <motion.div
      aria-hidden="true"
      className="refraction-band pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ opacity: fade, ['--cap' as string]: band.copyCap }}
    >
      {/* Base light (moves). */}
      <motion.div
        data-band-light=""
        className="absolute inset-y-0"
        style={{ x: tx, left: `-${band.widthVw}vw`, width: `${band.widthVw * 2}vw`, background: LIGHT, willChange: 'transform' }}
      />
      {/* Refracted slice in each rib: the same light shifted a little, shown in half of every rib (desktop). */}
      {!mobile && (
        <div className="absolute inset-0" style={{ maskImage: ribHalves(rib), WebkitMaskImage: ribHalves(rib) }}>
          <motion.div
            data-band-light=""
            className="absolute inset-y-0"
            style={{
              x: tx,
              left: `calc(-${band.widthVw}vw + ${band.refractShiftPx}px)`,
              width: `${band.widthVw * 2}vw`,
              background: LIGHT,
              willChange: 'transform',
            }}
          />
        </div>
      )}
      {/* Glass ribs (static). */}
      <div className="absolute inset-0" style={{ background: ribShade(rib) }} />
      {/* Film grain (static). */}
      <div className="absolute inset-0" style={{ backgroundImage: GRAIN, opacity: band.grainOpacity }} />
    </motion.div>
  );
}
