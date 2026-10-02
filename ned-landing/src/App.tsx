import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import { Preloader } from './components/Preloader';
import { Teddy } from './components/Teddy';
import { StaticScene } from './components/StaticScene';
import { ctaHoverProps } from './components/ctaHover';
import { Hero } from './chapters/Hero';
import { Problem } from './chapters/Problem';
import { PrototypeEnd } from './chapters/PrototypeEnd';
import { site } from './content/hero';
import { COIN_COUNT, DEMO_URL } from './config';
import { IS_TOUCH, PRESENT, hasWebGL, isPhone } from './motion/flags';
import { useScrollVh } from './motion/useScrollVh';
import { useSmoothScroll } from './motion/useSmoothScroll';

const Scene = lazy(() => import('./scene/Scene'));

const MIN_LOADER_MS = 600;
const MAX_LOADER_MS = 2500;

type Task = 'fonts' | 'teddy' | 'scene';

export default function App() {
  const reduced = useReducedMotion() ?? false;
  useSmoothScroll();
  const { vh, velocity } = useScrollVh();

  const [webgl] = useState(hasWebGL);
  const [phone] = useState(isPhone);
  const [ready, setReady] = useState(false);
  const progress = useMotionValue(0);
  const done = useRef<Record<Task, boolean>>({ fonts: false, teddy: false, scene: !webgl });
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

  useEffect(() => {
    document.fonts?.ready.then(() => mark('fonts')).catch(() => mark('fonts'));
    const img = new Image();
    img.src = `${import.meta.env.BASE_URL}assets/teddy/waving.png`;
    img.decode().then(() => mark('teddy')).catch(() => mark('teddy'));
    // Never hold the page longer than the cap.
    const cap = window.setTimeout(() => {
      animate(progress, 1, { duration: 0.2 });
      setReady(true);
    }, MAX_LOADER_MS);
    return () => window.clearTimeout(cap);
  }, [mark, progress]);

  useEffect(() => {
    document.documentElement.classList.toggle('present', PRESENT);
  }, []);

  // Reduced motion: chapters swap behind a short dip instead of a camera move.
  const dip = useTransform(vh, [105, 120, 135], [0, 1, 0]);

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
              <Scene
                vh={vh}
                reduced={reduced}
                phone={phone}
                parallax={!IS_TOUCH && !PRESENT}
                coinCount={phone ? COIN_COUNT.phone : COIN_COUNT.desktop}
                onReady={() => mark('scene')}
              />
            </Suspense>
          ) : (
            <StaticScene />
          )}
        </div>
        {reduced && <motion.div className="dip" style={{ opacity: dip }} aria-hidden="true" />}
        <div className="grain" aria-hidden="true" />

        <AnimatePresence>{!ready && <Preloader key="preloader" progress={progress} />}</AnimatePresence>

        <main id="main">
          <Hero vh={vh} ready={ready} reduced={reduced} />
          <Problem vh={vh} reduced={reduced} />
          <PrototypeEnd />
        </main>

        <Teddy vh={vh} velocity={velocity} ready={ready} reduced={reduced} />
      </LayoutGroup>
    </MotionConfig>
  );
}
