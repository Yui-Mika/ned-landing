import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { Preloader } from './components/Preloader';
import { StaticScene } from './components/StaticScene';
import { Devices } from './components/Devices';
import { Bubbles } from './components/Bubbles';
import { TeddyHero } from './components/TeddyHero';
import { ctaHoverProps } from './components/ctaHover';
import { Hero } from './chapters/Hero';
import { Idea, Milestones, Problem, SceneLabels, TwoWays } from './chapters/Story';
import { AppChapter, Close, Real, Role } from './chapters/Ending';
import { site } from './content/copy';
import { DEMO_URL } from './config';
import { signals } from './motion/anchors';
import { DEBUG, IS_TOUCH, K, PRESENT, hasWebGL, isPhone } from './motion/flags';
import { CHAPTER, TOTAL, seg } from './motion/timeline';
import { storyVh, useScrollVh } from './motion/useScrollVh';
import { useSmoothScroll } from './motion/useSmoothScroll';

const SceneCanvas = lazy(() => import('./scene/SceneCanvas'));

const MIN_LOADER_MS = 900;
const MAX_LOADER_MS = 1200;
const MAX_LOADER_SLOW_FONTS_MS = 2000;

type Task = 'fonts' | 'scene';

export default function App() {
  const reduced = useReducedMotion() ?? false;
  useSmoothScroll();
  const { vh, velocity, dip } = useScrollVh(reduced);

  const [webgl] = useState(hasWebGL);
  const [phone] = useState(isPhone);
  const [ready, setReady] = useState(false);
  const progress = useMotionValue(0);
  const done = useRef<Record<Task, boolean>>({ fonts: false, scene: !webgl });
  const started = useRef(performance.now());

  const finish = useCallback(() => {
    const wait = Math.max(0, MIN_LOADER_MS - (performance.now() - started.current));
    window.setTimeout(() => setReady(true), wait);
  }, []);

  const mark = useCallback(
    (task: Task) => {
      if (done.current[task]) return;
      done.current[task] = true;
      const values = Object.values(done.current);
      const share = values.filter(Boolean).length / values.length;
      animate(progress, share, { duration: reduced ? 0 : 0.35, ease: 'easeOut' });
      if (share >= 1) finish();
    },
    [finish, progress, reduced],
  );

  // 00.6: exit at max(900 ms, everything ready); cap 1,200 ms, or 2,000 ms while fonts are slow.
  useEffect(() => {
    document.fonts?.ready.then(() => mark('fonts')).catch(() => mark('fonts'));
    const cap = window.setTimeout(() => {
      if (!done.current.fonts) return;
      animate(progress, 1, { duration: 0.2 });
      setReady(true);
    }, MAX_LOADER_MS);
    const hardCap = window.setTimeout(() => setReady(true), MAX_LOADER_SLOW_FONTS_MS);
    return () => {
      window.clearTimeout(cap);
      window.clearTimeout(hardCap);
    };
  }, [mark, progress]);

  useEffect(() => {
    signals.ready.set(ready ? 1 : 0);
  }, [ready]);

  useEffect(() => {
    document.documentElement.classList.toggle('present', PRESENT);
    document.documentElement.style.setProperty('--k', String(K));
  }, []);

  // Scroll is locked while the preloader is up (00.1).
  useEffect(() => {
    document.documentElement.classList.toggle('loading', !ready);
  }, [ready]);

  // 06: the scene dims behind the laptop and phone.
  const dim = useTransform(vh, (v) => 0.55 * seg(v, [1600, 1620]) * (1 - seg(v, [2050, 2075])));
  // 02.16 → 03.1: the slot of light fills the screen as the camera passes through.
  const glow = useTransform(vh, (v) => seg(v, [366, 380]) * (1 - seg(v, [380, 400])));

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
        <a className="skip-link" href="#demo">
          {site.skipLink}
        </a>

        <header className="topbar">
          <span className="wordmark">{site.wordmark}</span>
          <a className="topbar-link" href={DEMO_URL} target="_blank" rel="noopener" {...ctaHoverProps}>
            {site.demoLink} <span aria-hidden="true">↗</span>
          </a>
        </header>

        <div className={`scene-layer${ready ? ' is-ready' : ''}`} aria-hidden="true">
          {webgl ? (
            <Suspense fallback={null}>
              <SceneCanvas
                vh={vh}
                velocity={velocity}
                reduced={reduced}
                phone={phone}
                parallax={!IS_TOUCH && !PRESENT}
                onReady={() => mark('scene')}
              />
            </Suspense>
          ) : (
            <StaticScene />
          )}
        </div>
        <motion.div className="dim" style={{ opacity: dim }} aria-hidden="true" />
        <motion.div className="slot-glow" style={{ opacity: glow }} aria-hidden="true" />

        <AnimatePresence>{!ready && <Preloader key="preloader" progress={progress} />}</AnimatePresence>

        <main id="main" className="stage">
          <Hero ready={ready} reduced={reduced} />
          <Problem />
          <Idea />
          <Milestones />
          <TwoWays />
          <AppChapter />
          <Role />
          <Real />
          <Close />
        </main>

        <div className="labels" aria-hidden="true">
          <TeddyHero ready={ready} reduced={reduced} />
          <SceneLabels />
          <Bubbles ready={ready} reduced={reduced} />
        </div>
        <Devices />

        {reduced && <motion.div className="dip" style={{ opacity: dip }} aria-hidden="true" />}
        <div className="grain" aria-hidden="true" />
        {DEBUG && <Debug />}

        {/* The scroll track: the story is driven by how far this has been scrolled. */}
        <div className="scroll-track" style={{ height: `${TOTAL * K + 100}vh` }} aria-hidden="true" />
      </LayoutGroup>
    </MotionConfig>
  );
}

function Debug() {
  const text = useTransform(storyVh, (v) => {
    const name = Object.entries(CHAPTER).find(([, r]) => v >= r[0] && v < r[1])?.[0] ?? '';
    return `${v.toFixed(0)} vh · ${name}`;
  });
  return <motion.p className="debug mono">{text}</motion.p>;
}
