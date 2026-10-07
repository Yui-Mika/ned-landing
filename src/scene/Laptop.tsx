'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useMotionValueEvent } from 'motion/react';
import * as THREE from 'three';
import { scrollVh } from '@/motion/scroll';
import { copy } from '@/content/copy';
import { DeviceTag } from '@/components/DeviceTag';
import { WebContractNewScreen } from '@/screens/web/WebContractNewScreen';
import { ch03BriefAt, laptopTracks, sampleLaptop, type BriefState, type PageScroll } from './poses';
import { registerFocusResolver, screenPointToWorld, offsetIn } from './focus';
import { TAP_PX, drawTap } from './tap';
import { SceneHtml } from './htmlLayer';
import { stageViewport } from './viewport';
import { inset, safeArea } from './safeArea';

/** Generic laptop body in world units (no real brand shape): base (keyboard deck) + lid on a hinge. */
export const LAPTOP = {
  base: { w: 3.3, d: 2.2, t: 0.09 },
  lid: { w: 3.3, h: 2.12, t: 0.06 },
};
/** The screen shows a 1440 × 900 CSS px web page (16:10); 1440 px fill 3.06 world units. */
const PAGE = { desktop: { w: 1440, h: 900 }, portrait: { w: 480, h: 640 } };
const SCREEN_W = 3.06;
export const PX_PER_UNIT = PAGE.desktop.w / SCREEN_W;
/** Portrait browser card: frame + bar around a 480 × 640 page (the board's own narrower responsive layout). */
export const CARD = { pad: 10, bar: 34, worldW: 3.0 };
const CARD_PX_W = PAGE.portrait.w + CARD.pad * 2;
export const CARD_PX_PER_UNIT = CARD_PX_W / CARD.worldW;
const DEG = Math.PI / 180;

const brief = copy.web.contractNew.milestones.list[0].crit;

/** The chapter whose copy column bounds the laptop's safe area (chapter 03). */
const COPY_ID = 'ch03-title';

/** Live laptop scale after the safe-area fit (the invite chip matches it so it lifts off at the field's size). */
export const laptopLive = { scale: 0 };

/** Brief state from scroll; React state changes only when it actually changes (per typed character at most). */
function useBriefState(): BriefState {
  const [state, setState] = useState(() => ch03BriefAt(scrollVh.get(), brief));
  useMotionValueEvent(scrollVh, 'change', (vh) => {
    const next = ch03BriefAt(vh, brief);
    if (next.added !== state.added || next.draft !== state.draft || next.panel !== state.panel || next.created !== state.created) setState(next);
  });
  return state;
}

function ScreenContent({ portrait, rootRef, tapRef }: { portrait: boolean; rootRef: React.RefObject<HTMLDivElement | null>; tapRef: React.RefObject<HTMLDivElement | null> }) {
  const state = useBriefState();
  const size = portrait ? PAGE.portrait : PAGE.desktop;
  return (
    <div ref={rootRef}>
      <WebContractNewScreen state={state} width={size.w} height={size.h}>
        {/* Tap mark (landing layer, not part of the board): TAPS in poses.ts. */}
        <div
          ref={tapRef}
          aria-hidden="true"
          data-tap-mark=""
          className="absolute top-0 left-0 rounded-full"
          style={{
            zIndex: 50,
            width: TAP_PX,
            height: TAP_PX,
            opacity: 0,
            background: 'rgb(123 47 190 / 0.22)',
            boxShadow: '0 0 0 2px rgb(123 47 190 / 0.55)',
          }}
        />
      </WebContractNewScreen>
    </div>
  );
}

/** Scroll (CSS px) that puts the `data-focus` element's centre at `at` of the screen height (clamped to the page). */
function scrollFor(p: PageScroll, root: HTMLElement, pageEl: HTMLElement, viewH: number) {
  if (!p) return 0;
  const el = root.querySelector<HTMLElement>(`[data-focus="${p.focus}"]`);
  if (!el) return 0;
  const { y } = offsetIn(el, root);
  const max = Math.max(0, pageEl.scrollHeight - viewH);
  return Math.min(max, Math.max(0, y + el.offsetHeight / 2 - p.at * viewH));
}

type Props = { reduced: boolean; portrait: boolean };

export function Laptop({ reduced, portrait }: Props) {
  const outer = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const lidPivot = useRef<THREE.Group>(null);
  const anchor = useRef<THREE.Group>(null);
  const rootEl = useRef<HTMLDivElement>(null);
  const tapEl = useRef<HTMLDivElement>(null);
  const fadeEls = useRef<(HTMLDivElement | null)[]>([]);
  const scrollY = useRef(0);
  const mats = useRef<THREE.Material[] | null>(null);
  const facing = useMemo(() => ({ q: new THREE.Quaternion(), n: new THREE.Vector3(), p: new THREE.Vector3() }), []);
  // Un-zoomed, un-panned reference camera: the safe-area fit is done for the resting frame; the T5 Zoom works on top.
  const fit = useMemo(() => ({ cam: new THREE.PerspectiveCamera(), v: new THREE.Vector3(), c: [0, 1, 2, 3].map(() => new THREE.Vector3()) }), []);

  const view = portrait ? PAGE.portrait : PAGE.desktop;
  const pxPerUnit = portrait ? CARD_PX_PER_UNIT : PX_PER_UNIT;

  useEffect(
    () =>
      registerFocusResolver((el, out) => {
        const root = rootEl.current?.firstElementChild as HTMLElement | null;
        if (!root || !anchor.current || !outer.current?.visible || !root.contains(el)) return false;
        screenPointToWorld(el, root, anchor.current, view, pxPerUnit, out, scrollY.current);
        return true;
      }),
    [view, pxPerUnit],
  );

  useFrame((state) => {
    if (!outer.current || !body.current) return;
    const vh = scrollVh.get();
    const pose = sampleLaptop(portrait ? laptopTracks.portrait : laptopTracks.desktop, vh, reduced);
    const vp = stageViewport(state);
    const opacity = pose.opacity;
    outer.current.visible = opacity > 0.001;
    for (const el of fadeEls.current) if (el) el.style.opacity = String(opacity);
    if (!outer.current.visible) return;

    const scale = portrait ? (pose.size * vp.width) / CARD.worldW : (pose.size * vp.width) / LAPTOP.base.w;
    outer.current.position.set((pose.position[0] * vp.width) / 2, (pose.position[1] * vp.height) / 2, pose.position[2]);
    outer.current.scale.setScalar(scale);
    body.current.rotation.set(pose.rotation[0] * DEG, pose.rotation[1] * DEG, pose.rotation[2] * DEG);
    if (lidPivot.current) lidPivot.current.rotation.x = (90 - pose.lid) * DEG;
    fitToSafeArea(state.camera as THREE.PerspectiveCamera, state.size);

    // The HTML screen is visible from behind too: hide it while it faces away (lid closing / closed).
    if (anchor.current && fadeEls.current[0]) {
      anchor.current.getWorldQuaternion(facing.q);
      facing.n.set(0, 0, 1).applyQuaternion(facing.q);
      anchor.current.getWorldPosition(facing.p);
      const visible = facing.n.dot(facing.p.subVectors(state.camera.position, facing.p)) > 0;
      fadeEls.current[0].style.visibility = visible ? 'visible' : 'hidden';
    }

    // Materials fade with the pose (the body slides in and out).
    if (!mats.current) {
      mats.current = [];
      body.current.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.Material | undefined;
        if (m) mats.current!.push(m);
      });
    }
    for (const m of mats.current) {
      const fading = opacity < 0.999;
      if (m.transparent !== fading) {
        m.transparent = fading;
        m.needsUpdate = true;
      }
      m.opacity = opacity;
    }

    // Page scroll inside the screen (pure function of scroll; layout-based so it follows the typed list).
    const root = rootEl.current?.firstElementChild as HTMLElement | null;
    const pageEl = root?.querySelector<HTMLElement>('[data-page]');
    if (root && pageEl) {
      const a = scrollFor(pose.pageFrom, root, pageEl, view.h);
      const b = scrollFor(pose.pageTo, root, pageEl, view.h);
      const y = a + (b - a) * pose.pageMix;
      if (Math.abs(y - scrollY.current) > 0.25 || pageEl.style.transform === '') {
        scrollY.current = y;
        pageEl.style.transform = `translateY(${-y.toFixed(1)}px)`;
      }
      if (tapEl.current) drawTap(tapEl.current, root, 'laptop', vh, reduced, scrollY.current);
    }
  });

  /**
   * Safe-area rule: shrink (never grow) and shift the laptop so its screen's projected box stays inside the safe
   * area, measured with an un-zoomed reference camera. Works for any window shape (16:10, 16:9, portrait).
   */
  function fitToSafeArea(camera: THREE.PerspectiveCamera, size: { width: number; height: number }) {
    if (!outer.current || !anchor.current) return;
    const cam = fit.cam;
    cam.fov = camera.fov;
    cam.aspect = camera.aspect;
    cam.near = camera.near;
    cam.far = camera.far;
    cam.zoom = 1;
    cam.position.set(0, 0, camera.position.z);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    const w = view.w / pxPerUnit / 2;
    const h = view.h / pxPerUnit / 2;
    const box = () => {
      outer.current!.updateMatrixWorld(true);
      let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
      [[-w, -h], [w, -h], [w, h], [-w, h]].forEach(([x, y], i) => {
        const p = fit.c[i].set(x, y, 0);
        anchor.current!.localToWorld(p);
        p.project(cam);
        const px = ((p.x + 1) / 2) * size.width;
        const py = ((1 - p.y) / 2) * size.height;
        l = Math.min(l, px); r = Math.max(r, px); t = Math.min(t, py); b = Math.max(b, py);
      });
      return { l, t, r, b };
    };
    const area = inset(safeArea(COPY_ID, portrait), 4);
    let bb = box();
    const k = Math.min(1, (area.r - area.l) / (bb.r - bb.l), (area.b - area.t) / (bb.b - bb.t));
    if (k < 1) {
      outer.current.scale.multiplyScalar(k);
      bb = box();
    }
    const dx = bb.l < area.l ? area.l - bb.l : bb.r > area.r ? area.r - bb.r : 0;
    const dy = bb.t < area.t ? area.t - bb.t : bb.b > area.b ? area.b - bb.b : 0;
    if (dx || dy) {
      // px → world at the screen's depth.
      anchor.current.getWorldPosition(fit.v);
      const dist = cam.position.z - fit.v.z;
      const worldPerPx = (2 * Math.tan((cam.fov * DEG) / 2) * dist) / size.height;
      outer.current.position.x += dx * worldPerPx;
      outer.current.position.y -= dy * worldPerPx;
    }
    laptopLive.scale = outer.current.scale.x;
  }

  const screenHtml = (
    <ScreenContent portrait={portrait} rootRef={rootEl} tapRef={tapEl} />
  );

  if (portrait) {
    // Cropped browser card (SPEC §8): a generic browser frame, no laptop body.
    const cardH = PAGE.portrait.h + CARD.bar + CARD.pad;
    return (
      <group ref={outer}>
        <group ref={body}>
          <group ref={anchor} position={[0, -((CARD.bar - CARD.pad) / 2) / CARD_PX_PER_UNIT, 0.002]} />
          <SceneHtml transform distanceFactor={400 / CARD_PX_PER_UNIT} position={[0, 0, 0]}>
            <div
              ref={(el) => {
                fadeEls.current[0] = el;
              }}
              style={{ opacity: 0, width: CARD_PX_W, height: cardH, borderRadius: 22, background: '#1A1A22', padding: `0 ${CARD.pad}px ${CARD.pad}px`, boxSizing: 'border-box' }}
            >
              <div aria-hidden="true" style={{ height: CARD.bar, display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 6 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 9, height: 9, borderRadius: 9999, background: '#3A3A46' }} />
                ))}
              </div>
              <div style={{ borderRadius: 12, overflow: 'hidden' }}>{screenHtml}</div>
            </div>
          </SceneHtml>
          {/* Owner tag in the card's top bar (right), so it never sits under the copy above the card. */}
          <SceneHtml transform distanceFactor={1} position={[CARD.worldW / 2 - 0.5, cardH / CARD_PX_PER_UNIT / 2 - CARD.bar / 2 / CARD_PX_PER_UNIT, 0.004]}>
            <div
              ref={(el) => {
                fadeEls.current[1] = el;
              }}
              style={{ opacity: 0 }}
            >
              <DeviceTag owner="client" device="computer" size="md" />
            </div>
          </SceneHtml>
        </group>
      </group>
    );
  }

  const { base, lid } = LAPTOP;
  const screenH = PAGE.desktop.h / PX_PER_UNIT;
  return (
    <group ref={outer}>
      <group ref={body}>
        {/* Base: keyboard deck with visible thickness; deck top at y = 0. */}
        <RoundedBox args={[base.w, base.t, base.d]} radius={0.04} smoothness={4} position={[0, -base.t / 2, 0]}>
          <meshStandardMaterial color="#1A1A22" metalness={0.7} roughness={0.35} />
        </RoundedBox>
        {/* Keyboard well and trackpad: plain recessed shapes, no keys or brand. */}
        <mesh position={[0, 0.002, -0.28]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[base.w * 0.86, base.d * 0.42]} />
          <meshStandardMaterial color="#111117" metalness={0.4} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.002, 0.62]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[base.w * 0.32, base.d * 0.26]} />
          <meshStandardMaterial color="#202029" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Hinge */}
        <mesh position={[0, 0.01, -base.d / 2 + 0.02]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, base.w * 0.8, 16]} />
          <meshStandardMaterial color="#2A2A34" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Lid on the hinge: rotation.x = 90° − lid angle (0° closed on the deck … 105° open). */}
        <group ref={lidPivot} position={[0, 0.02, -base.d / 2 + 0.02]}>
          <group position={[0, lid.h / 2, 0]}>
            <RoundedBox args={[lid.w, lid.h, lid.t]} radius={0.04} smoothness={4}>
              <meshStandardMaterial color="#1A1A22" metalness={0.7} roughness={0.35} />
            </RoundedBox>
            <mesh position={[0, 0, lid.t / 2 + 0.001]}>
              <planeGeometry args={[SCREEN_W + 0.04, screenH + 0.04]} />
              <meshBasicMaterial color="#05050A" />
            </mesh>
            <group ref={anchor} position={[0, 0, lid.t / 2 + 0.003]} />
            <SceneHtml transform distanceFactor={400 / PX_PER_UNIT} position={[0, 0, lid.t / 2 + 0.003]}>
              <div
                ref={(el) => {
                  fadeEls.current[0] = el;
                }}
                style={{ opacity: 0 }}
              >
                {screenHtml}
              </div>
            </SceneHtml>
          </group>
        </group>
        {/* Owner tag just below the front edge of the base, facing the camera (cancels the body's 10° tilt). */}
        <SceneHtml transform distanceFactor={1} position={[0, -base.t - 0.1, base.d / 2 + 0.05]} rotation={[-10 * DEG, 0, 0]}>
          <div
            ref={(el) => {
              fadeEls.current[1] = el;
            }}
            style={{ opacity: 0 }}
          >
            <DeviceTag owner="client" device="computer" size="lg" />
          </div>
        </SceneHtml>
      </group>
    </group>
  );
}
