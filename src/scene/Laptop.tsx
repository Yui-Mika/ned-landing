'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useMotionValueEvent } from 'motion/react';
import * as THREE from 'three';
import { scrollVh } from '@/motion/scroll';
import { copy } from '@/content/copy';
import { DeviceTag } from '@/components/DeviceTag';
import { chapterAt } from '@/content/chapters';
import { WebContractNewScreen } from '@/screens/web/WebContractNewScreen';
import { WebWorkspaceScreen } from '@/screens/web/WebWorkspaceScreen';
import { WebSubmitScreen } from '@/screens/web/WebSubmitScreen';
import { ContractLockScreen } from '@/screens/phone/ContractLockScreen';
import { ContractLockedScreen } from '@/screens/phone/ContractLockedScreen';
import { ch03BriefAt, ch05PanelAt, ch06ScanAt, ch06SubmitAt, laptopTracks, sampleLaptop, type BriefState, type LaptopScreen, type SubmitState, type Owner, type PageScroll } from './poses';
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
/**
 * Portrait page size per screen. WebSubmit's sign panel is `position: fixed` on the board (top 76, ~670 px tall), so
 * it cannot scroll into view: that page is taller, and the safe-area fit shrinks the card to match.
 */
const PAGE_SUBMIT_PORTRAIT = { w: PAGE.portrait.w, h: 780 };
const portraitPage = (screen: LaptopScreen) => (screen === 'webSubmit' ? PAGE_SUBMIT_PORTRAIT : PAGE.portrait);
const SCREEN_W = 3.06;
export const PX_PER_UNIT = PAGE.desktop.w / SCREEN_W;
/** Portrait browser card: frame + bar around a 480 × 640 page (the board's own narrower responsive layout). */
export const CARD = { pad: 10, bar: 34, worldW: 3.0 };
const CARD_PX_W = PAGE.portrait.w + CARD.pad * 2;
export const CARD_PX_PER_UNIT = CARD_PX_W / CARD.worldW;
const DEG = Math.PI / 180;
/** The tag's place below the base's front edge, (0, −t − 0.1, d/2 + 0.05) on the body, tilted 10° like the body. */
const TAG_Y = (-LAPTOP.base.t - 0.1) * Math.cos(10 * DEG) - (LAPTOP.base.d / 2 + 0.05) * Math.sin(10 * DEG);
const TAG_Z = (-LAPTOP.base.t - 0.1) * Math.sin(10 * DEG) + (LAPTOP.base.d / 2 + 0.05) * Math.cos(10 * DEG);

const brief = copy.web.contractNew.milestones.list[0].crit;
const submitUrls = copy.web.submit.links.list.map((l) => l.url);

/**
 * Live laptop state after the safe-area fit: scale (the invite chip matches it so it lifts off at the field's size),
 * opacity, and the screen anchor (T4 Dock measures the wallet panel against it).
 */
export const laptopLive: { scale: number; opacity: number; anchor: THREE.Object3D | null } = { scale: 0, opacity: 0, anchor: null };

/** Brief state from scroll; React state changes only when it actually changes (per typed character at most). */
function useBriefState(): BriefState {
  const [state, setState] = useState(() => ch03BriefAt(scrollVh.get(), brief));
  useMotionValueEvent(scrollVh, 'change', (vh) => {
    const next = ch03BriefAt(vh, brief);
    if (next.added !== state.added || next.draft !== state.draft || next.panel !== state.panel || next.created !== state.created) setState(next);
  });
  return state;
}

/** Chapter 06 submit state from scroll; React state changes only when it actually changes (per typed character at most). */
function useSubmitState(): SubmitState {
  const [state, setState] = useState(() => ch06SubmitAt(scrollVh.get(), submitUrls));
  useMotionValueEvent(scrollVh, 'change', (vh) => {
    const n = ch06SubmitAt(vh, submitUrls);
    if (n.links !== state.links || n.draft !== state.draft || n.files !== state.files || n.scanned !== state.scanned || n.checks !== state.checks || n.panel !== state.panel || n.done !== state.done)
      setState(n);
  });
  return state;
}

function SubmitScreen({ size, children }: { size: { w: number; h: number }; children: React.ReactNode }) {
  const state = useSubmitState();
  return (
    <WebSubmitScreen state={state} width={size.w} height={size.h}>
      {children}
    </WebSubmitScreen>
  );
}

/**
 * Scan line (landing layer, not part of the board): a plain thin line that passes down a dropped file's row
 * (ch06ScanAt); the row's fingerprint shows once it has passed. Pure function of scroll. Reduced motion: no line
 * (it would slide); the fingerprints still appear.
 */
function drawScan(line: HTMLDivElement, root: HTMLElement, vh: number, scrollY: number, reduced: boolean) {
  const scan = reduced ? null : ch06ScanAt(vh);
  const row = scan ? root.querySelector<HTMLElement>(`[data-file-row="${scan.row}"]`) : null;
  if (!scan || !row) {
    if (line.style.opacity !== '0') line.style.opacity = '0';
    return;
  }
  const { x, y } = offsetIn(row, root);
  line.style.opacity = '1';
  line.style.width = `${row.offsetWidth}px`;
  line.style.transform = `translate(${x}px, ${(y + row.offsetHeight * scan.p - scrollY - 1).toFixed(1)}px)`;
}

/** Chapter 05 wallet panel screen from scroll; React state changes only when it opens, switches or closes. */
function usePanelScreen() {
  const [screen, setScreen] = useState(() => ch05PanelAt(scrollVh.get()).screen);
  useMotionValueEvent(scrollVh, 'change', (vh) => {
    const next = ch05PanelAt(vh).screen;
    if (next !== screen) setScreen(next);
  });
  return screen;
}

function BriefScreen({ size, children }: { size: { w: number; h: number }; children: React.ReactNode }) {
  const state = useBriefState();
  return (
    <WebContractNewScreen state={state} width={size.w} height={size.h}>
      {children}
    </WebContractNewScreen>
  );
}

function WorkspaceScreen({ size, panelRef, children }: { size: { w: number; h: number }; panelRef: React.RefObject<HTMLDivElement | null>; children: React.ReactNode }) {
  const panel = usePanelScreen();
  return (
    <WebWorkspaceScreen
      width={size.w}
      height={size.h}
      panelRef={panelRef}
      panel={panel === 'lock' ? <ContractLockScreen /> : panel === 'locked' ? <ContractLockedScreen /> : null}
    >
      {children}
    </WebWorkspaceScreen>
  );
}

function ScreenContent({
  screen,
  portrait,
  rootRef,
  tapRef,
  panelRef,
  scanRef,
}: {
  screen: LaptopScreen;
  portrait: boolean;
  rootRef: React.RefObject<HTMLDivElement | null>;
  tapRef: React.RefObject<HTMLDivElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
  scanRef: React.RefObject<HTMLDivElement | null>;
}) {
  const size = portrait ? portraitPage(screen) : PAGE.desktop;
  /* Tap mark (landing layer, not part of the board): TAPS in poses.ts. */
  const tap = (
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
  );
  return (
    <div ref={rootRef}>
      {screen === 'webWorkspace' ? (
        <WorkspaceScreen size={size} panelRef={panelRef}>
          {tap}
        </WorkspaceScreen>
      ) : screen === 'webSubmit' ? (
        <SubmitScreen size={size}>
          <div
            ref={scanRef}
            aria-hidden="true"
            data-scan-line=""
            className="absolute top-0 left-0"
            style={{ zIndex: 45, height: 2, opacity: 0, background: '#7B2FBE' }}
          />
          {tap}
        </SubmitScreen>
      ) : (
        <BriefScreen size={size}>{tap}</BriefScreen>
      )}
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
  const panelEl = useRef<HTMLDivElement>(null);
  const scanEl = useRef<HTMLDivElement>(null);
  // Screen and owner from the poses table (they switch while the laptop is hidden, or at T9 Owner turn).
  const [screen, setScreen] = useState<LaptopScreen>(() => sampleLaptop(laptopTracks.desktop, scrollVh.get()).screen);
  const [owner, setOwner] = useState<Owner>('client');
  const fadeEls = useRef<(HTMLDivElement | null)[]>([]);
  const scrollY = useRef(0);
  const mats = useRef<THREE.Material[] | null>(null);
  const facing = useMemo(() => ({ q: new THREE.Quaternion(), n: new THREE.Vector3(), p: new THREE.Vector3() }), []);
  // Un-zoomed, un-panned reference camera: the safe-area fit is done for the resting frame; the T5 Zoom works on top.
  const fit = useMemo(() => ({ cam: new THREE.PerspectiveCamera(), v: new THREE.Vector3(), c: [0, 1, 2, 3].map(() => new THREE.Vector3()) }), []);

  const view = portrait ? portraitPage(screen) : PAGE.desktop;
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
    if (pose.screen !== screen) setScreen(pose.screen);
    if (pose.owner !== owner) setOwner(pose.owner);
    laptopLive.opacity = opacity;
    laptopLive.anchor = anchor.current;
    if (panelEl.current) {
      // The board's panel open motion (`.ned-pop`: opacity, 6 px rise, scale .97 → 1 from the top-right), scrubbed.
      const { open } = ch05PanelAt(vh);
      panelEl.current.style.opacity = open.toFixed(3);
      panelEl.current.style.transformOrigin = 'top right';
      panelEl.current.style.transform = reduced ? '' : `translate3d(0, ${(-6 * (1 - open)).toFixed(2)}px, 0) scale(${(0.97 + 0.03 * open).toFixed(4)})`;
    }
    outer.current.visible = opacity > 0.001;
    for (const el of fadeEls.current) if (el) el.style.opacity = String(opacity);
    if (!outer.current.visible) return;

    const scale = portrait ? (pose.size * vp.width) / CARD.worldW : (pose.size * vp.width) / LAPTOP.base.w;
    outer.current.position.set((pose.position[0] * vp.width) / 2, (pose.position[1] * vp.height) / 2, pose.position[2]);
    outer.current.scale.setScalar(scale);
    body.current.rotation.set(pose.rotation[0] * DEG, pose.rotation[1] * DEG, pose.rotation[2] * DEG);
    if (lidPivot.current) lidPivot.current.rotation.x = (90 - pose.lid) * DEG;
    fitToSafeArea(state.camera as THREE.PerspectiveCamera, state.size, `ch${chapterAt(vh).id}-title`);

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
      if (scanEl.current) drawScan(scanEl.current, root, vh, scrollY.current, reduced);
    }
  });

  /**
   * Safe-area rule: shrink (never grow) and shift the laptop so its screen's projected box stays inside the safe
   * area, measured with an un-zoomed reference camera. Works for any window shape (16:10, 16:9, portrait).
   */
  function fitToSafeArea(camera: THREE.PerspectiveCamera, size: { width: number; height: number }, copyId: string) {
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
    const area = inset(safeArea(copyId, portrait), 4);
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

  const screenHtml = <ScreenContent screen={screen} portrait={portrait} rootRef={rootEl} tapRef={tapEl} panelRef={panelEl} scanRef={scanEl} />;

  if (portrait) {
    // Cropped browser card (SPEC §8): a generic browser frame, no laptop body.
    const cardH = view.h + CARD.bar + CARD.pad;
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
        </group>
        {/* Owner tag in the card's top bar (right), so it never sits under the copy above the card. Outside the turning
            body, so it stays readable during T9 Owner turn. */}
        <SceneHtml transform distanceFactor={1} position={[CARD.worldW / 2 - 0.5, cardH / CARD_PX_PER_UNIT / 2 - CARD.bar / 2 / CARD_PX_PER_UNIT, 0.004]}>
          <div
            ref={(el) => {
              fadeEls.current[1] = el;
            }}
            style={{ opacity: 0 }}
          >
            <DeviceTag owner={owner} device="computer" size="md" />
          </div>
        </SceneHtml>
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
      </group>
      {/* Owner tag just below the front edge of the base (at the body's 10° tilt), facing the camera. Outside the
          turning body, so it stays readable during T9 Owner turn. */}
      <SceneHtml transform distanceFactor={1} position={[0, TAG_Y, TAG_Z]}>
        <div
          ref={(el) => {
            fadeEls.current[1] = el;
          }}
          style={{ opacity: 0 }}
        >
          <DeviceTag owner={owner} device="computer" size="lg" />
        </div>
      </SceneHtml>
    </group>
  );
}
