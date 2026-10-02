import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { MotionValue } from 'motion/react';
import { CameraRig } from './CameraRig';
import { Fund } from './Fund';
import { Coins } from './Coins';
import { Hand } from './Hand';
import { Figures } from './Figures';

export type SceneProps = {
  vh: MotionValue<number>;
  reduced: boolean;
  phone: boolean;
  parallax: boolean;
  coinCount: number;
  onReady: () => void;
};

/** Calls onReady once the first frame has rendered. */
function FirstFrame({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(onReady);
  });
  return null;
}

/**
 * The one persistent 3D scene behind the page. Loaded lazily so three.js stays out of the
 * initial bundle. DPR capped at 1.75 (1.5 on phones); rendering pauses while the tab is hidden.
 * No bloom pass in this prototype (needs @react-three/postprocessing; added with chapter 03).
 */
export default function Scene({ vh, reduced, phone, parallax, coinCount, onReady }: SceneProps) {
  const [frameloop, setFrameloop] = useState<'always' | 'never'>(() => (document.hidden ? 'never' : 'always'));

  useEffect(() => {
    const onVis = () => setFrameloop(document.hidden ? 'never' : 'always');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <Canvas
      dpr={[1, phone ? 1.5 : 1.75]}
      frameloop={frameloop}
      camera={{ position: [0, 0.2, 10], fov: 40, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 6]} intensity={1.8} />
      <pointLight position={[-3, 2, -2]} color="#B87AED" intensity={40} distance={18} decay={2} />
      <pointLight position={[0, -5, 5]} color="#6366F1" intensity={18} distance={16} decay={2} />
      <CameraRig vh={vh} reduced={reduced} parallax={parallax} />
      <Fund vh={vh} reduced={reduced} />
      <Coins vh={vh} count={coinCount} reduced={reduced} />
      <Hand vh={vh} />
      <Figures vh={vh} />
      <FirstFrame onReady={onReady} />
    </Canvas>
  );
}
