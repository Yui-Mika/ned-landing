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
import { LockStamp } from './LockStamp';
import { AmountChip } from './AmountChip';
import { HtmlLayerContext } from './htmlLayer';
import { cameraZoom, sampleCamera, type CameraPose } from './poses';
import { focusWorld } from './focus';
import { inset, safeArea } from './safeArea';

const CAMERA = { fov: 30, z: 6.2 };

/**
 * Damped camera (λ = 6) driven by the camera track in poses.ts. T5 Zoom: the camera pans straight (no turn) so
 * the focus element sits at the centre, and camera.zoom pushes in. Reduced motion: hard cuts, no damping.
 */
/**
 * Damped camera (λ = 6) driven by the camera track in poses.ts. T5 Zoom: the camera pans straight (no turn) so
 * the focus element sits where the keyframe puts it, and camera.zoom pushes in. A `fit` keyframe zooms as far as
 * the focus element still fits the safe area (max `fit`), centred in it. Reduced motion: hard cuts, no damping.
 */
function CameraRig({ reduced, portrait }: { reduced: boolean; portrait: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const viewport = useThree((s) => s.viewport);
  const tmp = useRef({ a: new THREE.Vector3(), b: new THREE.Vector3(), t: new THREE.Vector3() }).current;
  useFrame((_, dt) => {
    // Portrait (mobile layout pass): no camera zoom or pan. Every device fits the stage zone whole (scene/zone.ts),
    // so a zoomed device would spill over the copy; the active element is already in view.
    if (portrait) {
      const step = (from: number, to: number) => (reduced ? to : THREE.MathUtils.damp(from, to, CAMERA_LAMBDA, dt));
      camera.position.set(step(camera.position.x, 0), step(camera.position.y, 0), CAMERA.z);
      const zoom = step(camera.zoom, 1);
      if (Math.abs(zoom - camera.zoom) > 1e-5) {
        camera.zoom = zoom;
        camera.updateProjectionMatrix();
      }
      camera.lookAt(camera.position.x, camera.position.y, 0);
      return;
    }
    const cam = sampleCamera(scrollVh.get(), reduced, portrait);
    // Zoom and on-screen placement for one keyframe.
    const resolve = (k: CameraPose): { zoom: number; at: [number, number] } => {
      if (!k.fit || !k.focus) return { zoom: cameraZoom(k, portrait), at: k.at ? (portrait ? k.at.portrait : k.at.desktop) : [0, 0] };
      const el = document.querySelector<HTMLElement>(`[data-focus="${k.focus}"]`);
      if (!el) return { zoom: 1, at: [0, 0] };
      // A few px inside the safe area, so the damped camera never overshoots it.
      const area = inset(safeArea(k.copyId, portrait), 6);
      const r = el.getBoundingClientRect();
      // The rect was drawn at the current camera.zoom; its size at zoom 1 is rect / zoom.
      const w = r.width / camera.zoom;
      const h = r.height / camera.zoom;
      const zoom = Math.max(1, Math.min(k.fit, (area.r - area.l) / w, (area.b - area.t) / h));
      const cx = (area.l + area.r) / 2;
      const cy = (area.t + area.b) / 2;
      return { zoom, at: [(cx - area.vw / 2) / (area.vw / 2), -(cy - area.vh / 2) / (area.vh / 2)] };
    };
    const ka = resolve(cam.from);
    const kb = resolve(cam.to);
    // Camera spot for one keyframe: the focus placed at `at` on screen at that keyframe's zoom (or the origin).
    // Offsets are measured at the focus element's own depth (the laptop screen sits behind z = 0).
    const spot = (k: CameraPose, z: number, at: [number, number], out: THREE.Vector3) => {
      if (!k.focus || !focusWorld(k.focus, out)) return out.set(0, 0, 0);
      const d = viewport.getCurrentViewport(camera, [camera.position.x, camera.position.y, out.z]);
      return out.set(out.x - (at[0] * d.width) / 2 / z, out.y - (at[1] * d.height) / 2 / z, 0);
    };
    spot(cam.from, ka.zoom, ka.at, tmp.a);
    spot(cam.to, kb.zoom, kb.at, tmp.b);
    tmp.t.lerpVectors(tmp.a, tmp.b, cam.mix);
    const target = ka.zoom + (kb.zoom - ka.zoom) * cam.mix;
    const step = (from: number, to: number) => (reduced ? to : THREE.MathUtils.damp(from, to, CAMERA_LAMBDA, dt));
    camera.position.x = step(camera.position.x, tmp.t.x);
    camera.position.y = step(camera.position.y, tmp.t.y);
    camera.position.z = step(camera.position.z, CAMERA.z);
    const zoom = step(camera.zoom, target);
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
    <div data-stage="" className="fixed inset-0 z-0" role="img" aria-label={copy.site.canvasLabel}>
      <Canvas
        eventSource={eventSource as RefObject<HTMLElement>}
        eventPrefix="client"        frameloop={hidden ? 'never' : 'always'}
        // Portrait: pixel ratio at most 1.5 and no MSAA (the screens are DOM; the bodies are small).
        dpr={[1, portrait ? 1.5 : 1.75]}
        gl={{ antialias: !portrait, alpha: true, powerPreference: 'high-performance' }}
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
          {/* The lock glyph stamp (chapter 05). */}
          <LockStamp reduced={reduced} />
          {/* The amount chip (chapter 07). */}
          <AmountChip reduced={reduced} portrait={portrait} />
        </HtmlLayerContext.Provider>
        <Ready onReady={onReady} />
      </Canvas>
      {/* Stable target for drei <Html>, painted over the canvas but under the copy layer. Without it, drei
          mounts into the event source and re-creates its React roots when events connect (screens go blank). */}
      <div ref={htmlLayer} className="pointer-events-none absolute inset-0 overflow-hidden" />
    </div>
  );
}
