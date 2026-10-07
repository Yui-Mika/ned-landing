'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { copy } from '@/content/copy';
import { CAMERA_LAMBDA } from '@/motion/tokens';
import { isPortrait } from '@/motion/flags';
import { scrollVh } from '@/motion/scroll';
import { Phone } from './Phone';
import { Laptop } from './Laptop';
import { InviteChip } from './InviteChip';
import { HtmlLayerContext } from './htmlLayer';
import { cameraZoom, sampleCamera, type CameraPose } from './poses';
import { focusWorld } from './focus';

const CAMERA = { fov: 30, z: 6.2 };

/**
 * Damped camera (λ = 6) driven by the camera track in poses.ts. T5 Zoom: the camera pans straight (no turn) so
 * the focus element sits at the centre, and camera.zoom pushes in. Reduced motion: hard cuts, no damping.
 */
function CameraRig({ reduced, portrait }: { reduced: boolean; portrait: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const viewport = useThree((s) => s.viewport);
  const tmp = useRef({ a: new THREE.Vector3(), b: new THREE.Vector3(), t: new THREE.Vector3() }).current;
  useFrame((_, dt) => {
    const cam = sampleCamera(scrollVh.get(), reduced, portrait);
    const vp = viewport.getCurrentViewport(camera, [camera.position.x, camera.position.y, 0]);
    // Camera spot for one keyframe: the focus placed at `at` on screen at that keyframe's zoom (or the origin).
    const spot = (k: CameraPose, out: THREE.Vector3) => {
      if (!k.focus || !focusWorld(k.focus, out)) return out.set(0, 0, 0);
      const at = k.at ? (portrait ? k.at.portrait : k.at.desktop) : [0, 0];
      const z = cameraZoom(k, portrait);
      return out.set(out.x - (at[0] * vp.width) / 2 / z, out.y - (at[1] * vp.height) / 2 / z, 0);
    };
    spot(cam.from, tmp.a);
    spot(cam.to, tmp.b);
    tmp.t.lerpVectors(tmp.a, tmp.b, cam.mix);
    const step = (from: number, to: number) => (reduced ? to : THREE.MathUtils.damp(from, to, CAMERA_LAMBDA, dt));
    camera.position.x = step(camera.position.x, tmp.t.x);
    camera.position.y = step(camera.position.y, tmp.t.y);
    camera.position.z = step(camera.position.z, CAMERA.z);
    const zoom = step(camera.zoom, cam.zoom);
    if (Math.abs(zoom - camera.zoom) > 1e-5) {
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(camera.position.x, camera.position.y, 0);
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
        <CameraRig reduced={reduced} portrait={portrait} />
        <HtmlLayerContext.Provider value={htmlLayer}>
          <Phone reduced={reduced} portrait={portrait} />
          {/* Second phone for T3 Split (chapter 01); hidden behind yours the rest of the time. */}
          <Phone reduced={reduced} portrait={portrait} track="phoneB" interactive={false} />
          {/* Third phone for T6 Fan (chapter 03). */}
          <Phone reduced={reduced} portrait={portrait} track="phoneC" interactive={false} />
          {/* Client's computer (chapter 03 on); a cropped browser card on portrait. */}
          <Laptop reduced={reduced} portrait={portrait} />
          {/* The invite-link chip (T8 Lift-off). */}
          <InviteChip reduced={reduced} portrait={portrait} />
        </HtmlLayerContext.Provider>
        <Ready onReady={onReady} />
      </Canvas>
      {/* Stable target for drei <Html>, painted over the canvas but under the copy layer. Without it, drei
          mounts into the event source and re-creates its React roots when events connect (screens go blank). */}
      <div ref={htmlLayer} className="pointer-events-none absolute inset-0 overflow-hidden" />
    </div>
  );
}
