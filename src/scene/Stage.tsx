'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { copy } from '@/content/copy';
import { CAMERA_LAMBDA } from '@/motion/tokens';
import { isPortrait } from '@/motion/flags';
import { Phone } from './Phone';
import { HtmlLayerContext } from './htmlLayer';

const CAMERA = { fov: 30, z: 6.2 };

/** Damped camera (λ = 6). Later chapters add camera keyframes to the poses table; the hero holds still. */
function CameraRig() {
  const camera = useThree((s) => s.camera);
  const target = useRef(new THREE.Vector3(0, 0, CAMERA.z));
  useFrame((_, dt) => {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.current.x, CAMERA_LAMBDA, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.current.y, CAMERA_LAMBDA, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.current.z, CAMERA_LAMBDA, dt);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Ready({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    onReady();
  });
  return null;
}

type Props = {
  eventSource: RefObject<HTMLElement | null>;
  reduced: boolean;
  onReady: () => void;
};

/** ONE persistent fixed canvas behind the page. Every scene reads the same scroll value. */
export default function Stage({ eventSource, reduced, onReady }: Props) {
  const htmlLayer = useRef<HTMLDivElement>(null);
  const [portrait, setPortrait] = useState(isPortrait);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onResize = () => setPortrait(isPortrait());
    const onVis = () => setHidden(document.hidden);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0" role="img" aria-label={copy.site.canvasLabel}>
      <Canvas
        eventSource={eventSource as RefObject<HTMLElement>}
        eventPrefix="client"        frameloop={hidden ? 'never' : 'always'}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: CAMERA.fov, position: [0, 0, CAMERA.z], near: 0.1, far: 50 }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[-3, 4, 5]} intensity={1.4} />
        <directionalLight position={[4, -1, -3]} intensity={2.2} color="#B87AED" />
        <Environment resolution={64} frames={1}>
          <Lightformer form="rect" intensity={3} position={[-3, 2, 4]} scale={[4, 2, 1]} />
          <Lightformer form="rect" intensity={2} color="#C084FC" position={[4, 0, -2]} scale={[2, 5, 1]} />
          <Lightformer form="ring" intensity={1.2} color="#818CF8" position={[0, -3, 3]} scale={2} />
        </Environment>
        <CameraRig />
        <HtmlLayerContext.Provider value={htmlLayer}>
          <Phone reduced={reduced} portrait={portrait} />
          {/* Second phone for T3 Split (chapter 01); hidden behind yours the rest of the time. */}
          <Phone reduced={reduced} portrait={portrait} track="phoneB" interactive={false} />
        </HtmlLayerContext.Provider>
        <Ready onReady={onReady} />
      </Canvas>
      {/* Stable target for drei <Html>, painted over the canvas but under the copy layer. Without it, drei
          mounts into the event source and re-creates its React roots when events connect (screens go blank). */}
      <div ref={htmlLayer} className="pointer-events-none absolute inset-0 overflow-hidden" />
    </div>
  );
}
