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
import { WebSignInScreen } from '@/screens/web/WebSignInScreen';
import { WebRecordsScreen } from '@/screens/web/WebRecordsScreen';
import { ContractLockScreen } from '@/screens/phone/ContractLockScreen';
import { ContractLockedScreen } from '@/screens/phone/ContractLockedScreen';
import { HomeVNScreen } from '@/screens/phone/HomeScreen';
import { CH05, TAPS, cameraTrack, ch03BriefAt, ch05PanelAt, ch06ScanAt, ch06SubmitAt, laptopTracks, sampleLaptop, type BriefState, type LaptopScreen, type SubmitState, type Owner, type PageScroll } from './poses';
import { registerFocusResolver, screenPointToWorld, offsetIn, type Shift } from './focus';
import { stageZone } from './zone';
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
function drawScan(line: HTMLDivElement, root: HTMLElement, vh: number, scrollY: number, reduced: boolean, scrollX = 0) {
  const scan = reduced ? null : ch06ScanAt(vh);
  const row = scan ? root.querySelector<HTMLElement>(`[data-file-row="${scan.row}"]`) : null;
  if (!scan || !row) {
    if (line.style.opacity !== '0') line.style.opacity = '0';
    return;
  }
  const { x, y } = offsetIn(row, root);
  line.style.opacity = '1';
  line.style.width = `${row.offsetWidth}px`;
  line.style.transform = `translate(${(x - scrollX).toFixed(1)}px, ${(y + row.offsetHeight * scan.p - scrollY - 1).toFixed(1)}px)`;
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
  size,
  rootRef,
  tapRef,
  panelRef,
  scanRef,
}: {
  screen: LaptopScreen;
  size: { w: number; h: number };
  rootRef: React.RefObject<HTMLDivElement | null>;
  tapRef: React.RefObject<HTMLDivElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
  scanRef: React.RefObject<HTMLDivElement | null>;
}) {
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
      ) : screen === 'webWorkspaceVinh' ? (
        // Chapter 11: the wallet panel stays open on Home (no panelRef: chapter 05's scrubbed open motion does not apply).
        <WebWorkspaceScreen who="vinh" width={size.w} height={size.h} panel={<HomeVNScreen />}>
          {tap}
        </WebWorkspaceScreen>
      ) : screen === 'webRecords' ? (
        <WebRecordsScreen width={size.w} height={size.h}>
          {tap}
        </WebRecordsScreen>
      ) : screen === 'webSignIn' ? (
        <WebSignInScreen width={size.w} height={size.h}>
          {tap}
        </WebSignInScreen>
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
  // Portrait: the page and overlays (the signing wallet panel) pan both ways inside the browser card.
  const scrollX = useRef(0);
  const pans = useRef(new Map<Element, { x: number; y: number }>());
  // Portrait: the card's page height follows the stage zone (CSS px of the 480 px wide page).
  const [cardPageH, setCardPageH] = useState(0);
  const mats = useRef<THREE.Material[] | null>(null);
  const facing = useMemo(() => ({ q: new THREE.Quaternion(), n: new THREE.Vector3(), p: new THREE.Vector3() }), []);
  // Un-zoomed, un-panned reference camera: the safe-area fit is done for the resting frame; the T5 Zoom works on top.
  const fit = useMemo(() => ({ cam: new THREE.PerspectiveCamera(), v: new THREE.Vector3(), c: [0, 1, 2, 3].map(() => new THREE.Vector3()) }), []);

  const view = useMemo(
    () => (portrait ? { w: PAGE.portrait.w, h: cardPageH || portraitPage(screen).h } : PAGE.desktop),
    [portrait, cardPageH, screen],
  );
  const pxPerUnit = portrait ? CARD_PX_PER_UNIT : PX_PER_UNIT;
  /** Portrait: how far the container holding `el` (the page or an overlay) is panned. */
  const shift: Shift = (el) => {
    const root = rootEl.current?.firstElementChild;
    let c: Element | null = el;
    while (c && c.parentElement !== root) c = c.parentElement;
    return (c && pans.current.get(c)) || { x: 0, y: 0 };
  };

  useEffect(
    () =>
      registerFocusResolver((el, out) => {
        const root = rootEl.current?.firstElementChild as HTMLElement | null;
        if (!root || !anchor.current || !outer.current?.visible || !root.contains(el)) return false;
        screenPointToWorld(el, root, anchor.current, view, pxPerUnit, out, portrait ? shift : scrollY.current);
        return true;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view, pxPerUnit, portrait],
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

    if (portrait) {
      // Mobile layout pass: the browser card is the stage zone's width (viewport minus 24 px), centred, never
      // cropped; its page fills the zone's height (whole steps of 8 px), so tall panels fit where the zone allows.
      const z = stageZone(vh);
      const k = state.size.height / vp.height;
      const cardW = z.r - z.l;
      const pxPerCardPx = cardW / CARD_PX_W;
      const fits = Math.floor(((z.b - z.t) / pxPerCardPx - CARD.bar - CARD.pad) / 8) * 8;
      const pageH = Math.max(240, fits);
      if (pageH !== view.h) setCardPageH(pageH);
      const cx = (z.l + z.r) / 2;
      const cy = (z.t + z.b) / 2;
      outer.current.position.set((cx - state.size.width / 2) / k, -(cy - state.size.height / 2) / k, pose.position[2]);
      // Turning (T9 Owner turn), the near edge comes closer and projects wider: give it 8% of room.
      const turn = Math.abs(Math.sin(pose.rotation[1] * DEG));
      outer.current.scale.setScalar((cardW / (CARD.worldW * k)) * (1 - 0.08 * turn));
      laptopLive.scale = outer.current.scale.x;
      body.current.rotation.set(pose.rotation[0] * DEG, pose.rotation[1] * DEG, pose.rotation[2] * DEG);
    } else {
      const scale = (pose.size * vp.width) / LAPTOP.base.w;
      outer.current.position.set((pose.position[0] * vp.width) / 2, (pose.position[1] * vp.height) / 2, pose.position[2]);
      outer.current.scale.setScalar(scale);
      body.current.rotation.set(pose.rotation[0] * DEG, pose.rotation[1] * DEG, pose.rotation[2] * DEG);
      if (lidPivot.current) lidPivot.current.rotation.x = (90 - pose.lid) * DEG;
      fitToSafeArea(state.camera as THREE.PerspectiveCamera, state.size, `ch${chapterAt(vh).id}-title`);
    }

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
    if (root && pageEl && portrait) {
      panPortrait(root, pageEl, vh, pose.pageFrom, pose.pageTo, pose.pageMix);
      if (tapEl.current) drawTap(tapEl.current, root, 'laptop', vh, reduced, shift);
      if (scanEl.current) drawScan(scanEl.current, root, vh, scrollY.current, reduced, scrollX.current);
    } else if (root && pageEl) {
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
   * Portrait (mobile layout pass): zoom beats pan the content inside the card instead of moving the card. The page
   * pans to the pose's focus (centred), then toward the camera's zoom focus, the lock slider while it moves and a
   * tap target (TAPS; slider and tap eased in over 6 vh before and out over 6 vh after), whether the element sits in
   * the page or in an overlay (the signing wallet panel). Horizontally just enough to show it whole. Pure function
   * of scroll.
   */
  function panPortrait(root: HTMLElement, pageEl: HTMLElement, vh: number, from: PageScroll, to: PageScroll, mix: number) {
    const M = 12;
    const fitX = (left: number, w: number) => (w > view.w - 2 * M ? left + w / 2 - view.w / 2 : left < M ? left - M : left + w > view.w - M ? left + w - (view.w - M) : 0);
    const fitY = (top: number, h: number) => (h > view.h - 2 * M ? top + h / 2 - view.h / 2 : top < M ? top - M : top + h > view.h - M ? top + h - (view.h - M) : 0);
    const maxY = Math.max(0, pageEl.scrollHeight - view.h);
    // The pose's focus, centred vertically in the card (the desktop `at` fractions assume a taller screen).
    const base = (p: PageScroll) => {
      const el = p && root.querySelector<HTMLElement>(`[data-focus="${p.focus}"]`);
      if (!el) return { x: 0, y: 0 };
      const o = offsetIn(el, root);
      return { x: fitX(o.x, el.offsetWidth), y: Math.min(maxY, Math.max(0, o.y + el.offsetHeight / 2 - view.h / 2)) };
    };
    const a = base(from);
    const b = base(to);
    let x = a.x + (b.x - a.x) * mix;
    let y = a.y + (b.y - a.y) * mix;
    let overlay: Element | null = null;
    let ox = 0;
    let oy = 0;
    // Pull the content toward what the beat acts on, by weight w (0 … 1), in this order (later wins): the camera's
    // zoom focus (desktop zooms, portrait pans), the slider while its thumb moves, the tap target.
    // `centre`: the zoom focus is centred; sliders and taps move the content only as far as needed to show them.
    const pull = (el: HTMLElement | null, w: number, centre = false) => {
      if (!el || w <= 0 || !root.contains(el) || el === root) return;
      const o = offsetIn(el, root);
      const tx = fitX(o.x, el.offsetWidth);
      if (pageEl.contains(el)) {
        const want = centre ? o.y + el.offsetHeight / 2 - view.h / 2 : y + fitY(o.y - y, el.offsetHeight);
        const ty = Math.min(maxY, Math.max(0, want));
        x += (tx - x) * w;
        y += (ty - y) * w;
      } else {
        overlay = el;
        while (overlay && overlay.parentElement !== root) overlay = overlay.parentElement;
        ox = tx * w;
        oy = fitY(o.y, el.offsetHeight) * w;
      }
    };
    const byFocus = (f?: string) => (f ? root.querySelector<HTMLElement>(`[data-focus="${f}"]`) : null);
    for (let i = 0; i + 1 < cameraTrack.length; i++) {
      const ka = cameraTrack[i];
      const kb = cameraTrack[i + 1];
      if (vh < ka.vh || vh > kb.vh || (!ka.focus && !kb.focus)) continue;
      const f = (vh - ka.vh) / Math.max(1e-6, kb.vh - ka.vh);
      if (ka.focus && ka.focus === kb.focus) pull(byFocus(ka.focus), 1, true);
      else if (kb.focus) pull(byFocus(kb.focus), f, true);
      else pull(byFocus(ka.focus), 1 - f, true);
    }
    const ramp = (a: number, b: number) => Math.max(0, Math.min(1, (vh - (a - 8)) / 6, (b + 6 - vh) / 6));
    pull(byFocus('lock-slider'), ramp(CH05.slide[0], CH05.slide[1]));
    const tap = TAPS.find((t) => t.track === 'laptop' && vh > t.start - 8 && vh < t.end + 6);
    if (tap) pull(root.querySelector<HTMLElement>(`[data-tap-target="${tap.target}"]`), ramp(tap.start, tap.end));
    scrollX.current = x;
    scrollY.current = y;
    pageEl.style.transform = `translate(${(-x).toFixed(1)}px, ${(-y).toFixed(1)}px)`;
    pans.current.set(pageEl, { x, y });
    for (const c of Array.from(root.children)) {
      if (c === pageEl) continue;
      const on = c === overlay;
      if (!on && !pans.current.has(c)) continue;
      if (on) pans.current.set(c, { x: ox, y: oy });
      else pans.current.delete(c);
      (c as HTMLElement).style.transform = on ? `translate(${(-ox).toFixed(1)}px, ${(-oy).toFixed(1)}px)` : '';
    }
  }

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

  const screenHtml = <ScreenContent screen={screen} size={view} rootRef={rootEl} tapRef={tapEl} panelRef={panelEl} scanRef={scanEl} />;

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
              data-laptop-card=""
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
            data-device-tag="laptop"
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
