import { useEffect, useRef } from 'react';
import type { MotionValue } from 'motion/react';
import { Stage } from './Stage';

type Props = {
  vh: MotionValue<number>;
  velocity: MotionValue<number>;
  reduced: boolean;
  phone: boolean;
  parallax: boolean;
  coinCount: number;
  onReady: () => void;
};

/** Lazy-loaded wrapper: owns the canvas and the three.js stage. */
export default function SceneCanvas({ vh, velocity, reduced, phone, parallax, coinCount, onReady }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ready = useRef(onReady);
  ready.current = onReady;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const stage = new Stage({ canvas, vh, velocity, reduced, phone, parallax, coinCount, onReady: () => ready.current() });
    stage.start();
    return () => stage.dispose();
  }, [vh, velocity, reduced, phone, parallax, coinCount]);

  return <canvas ref={ref} className="scene-canvas" />;
}
