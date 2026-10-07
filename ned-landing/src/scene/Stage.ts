import {
  ACESFilmicToneMapping,
  Clock,
  DirectionalLight,
  HemisphereLight,
  MathUtils,
  PMREMGenerator,
  PerspectiveCamera,
  SRGBColorSpace,
  Scene,
  Vector3,
  WebGLRenderer,
  type Object3D,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { MotionValue } from 'motion/react';
import { anchor, signals, type AnchorName } from '../motion/anchors';
import { PRESENT } from '../motion/flags';
import { easeOut, seg } from '../motion/timeline';
import { DAMP } from '../motion/tokens';
import { TEDDY_MODEL_URL } from '../config';
import { cameraAt, shiftAt } from './camera';
import { Kit } from './kit';
import { AirmailScene } from './airmail/story';
import { disposeTextures } from './airmail/tex';
import type { TeddyRig } from './teddy/types';
import { BORDER_X, PARTNER, TEDDY_HERO, WALLET } from './world';

export type StageOptions = {
  canvas: HTMLCanvasElement;
  vh: MotionValue<number>;
  velocity: MotionValue<number>;
  reduced: boolean;
  phone: boolean;
  /** Cursor tilt and camera parallax (desktop, not present mode). */
  parallax: boolean;
  onReady: () => void;
};

/** Horizontal field of view the layout was designed for (32° vertical at 16:9). */
const DESIGN_TAN = Math.tan(MathUtils.degToRad(16)) * (16 / 9);

/**
 * The one persistent 3D scene, in the Airmail direction (motion map v4.1): window envelopes with the coin
 * visible, a glass rack as the contract, two mailboxes, two clocks, dashed routes, the partner desk abroad.
 * Everything is a function of the story position (vh), plus a few time-based touches (float, glint) that
 * switch off under reduced motion.
 */
export class Stage {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(32, 1, 0.1, 200);
  private kit = new Kit();
  private clock = new Clock();
  private air: AirmailScene;
  private teddy: TeddyRig | null = null;
  private raf = 0;
  private running = false;
  private readyAt: number | null = null;
  private firstFrame = true;
  private pointer = { x: 0, y: 0 };
  private parallax = { x: 0, y: 0 };
  private camPos = new Vector3();
  private camTgt = new Vector3();
  private phoneAnchor = new Vector3();
  private tmp = new Vector3();
  private anchors: [AnchorName, () => Vector3, () => boolean][] = [];

  constructor(private o: StageOptions) {
    this.renderer = new WebGLRenderer({ canvas: o.canvas, antialias: !o.phone, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, o.phone ? 1.5 : 2));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Soft studio reflections for the coins and pebbles, plus a key and purple rims (#B87AED).
    const pmrem = new PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environmentIntensity = 0.55;
    this.scene.add(new HemisphereLight(0xf0e4ff, 0x160530, 0.5));
    const key = new DirectionalLight(0xffffff, 1.3);
    key.position.set(-3, 5, 6);
    const rim = new DirectionalLight(0xb87aed, 2.0);
    rim.position.set(4, 3, -5);
    const rim2 = new DirectionalLight(0x9b4fde, 0.9);
    rim2.position.set(-5, 2, -3);
    this.scene.add(key, rim, rim2);

    this.air = new AirmailScene(this.kit);
    this.scene.add(this.air.group);

    const at = (x: number, y: number, z: number) => {
      const p = new Vector3(x, y, z);
      return () => p;
    };
    const world = (obj: () => Object3D) => () => obj().getWorldPosition(this.tmp);
    const slotTop = (i: number) => () => this.air.slotTop(i, this.tmp);
    const slotBottom = (i: number) => () => this.air.slotBottom(i, this.tmp);
    this.anchors = [
      ['tc', world(() => this.air.mc.label), () => this.air.mc.root.visible],
      ['tf', world(() => this.air.my.label), () => this.air.my.root.visible],
      ['teddy', at(TEDDY_HERO.x, TEDDY_HERO.y + 0.85, TEDDY_HERO.z), () => true],
      ['teddy-top', at(TEDDY_HERO.x - 0.1, TEDDY_HERO.y + 1.75, TEDDY_HERO.z), () => true],
      ['gate1', slotTop(0), () => true],
      ['slot1', slotBottom(0), () => true],
      ['slot2', slotBottom(1), () => true],
      ['slot3', slotBottom(2), () => true],
      ['wallet', at(WALLET.x, 1.0, WALLET.z), () => true],
      ['partner', at(PARTNER.x, 0.0, PARTNER.z + 0.45), () => true],
      ['abroad', at(BORDER_X - 0.6, 0.12, 4.0), () => true],
      ['vietnam', at(BORDER_X + 0.6, 0.12, 4.0), () => true],
    ];

    window.addEventListener('pointermove', this.onPointer, { passive: true });
    window.addEventListener('resize', this.resize);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.resize();
    if (TEDDY_MODEL_URL) void this.loadModel(TEDDY_MODEL_URL);
  }

  /** The team's Teddy model, for the hero only. Until it loads, the page layer shows the 2D art. */
  private async loadModel(url: string) {
    try {
      const [{ GLTFLoader }, { GltfTeddy }] = await Promise.all([
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('./teddy/GltfTeddy'),
      ]);
      const gltf = await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}${url}`);
      this.teddy = new GltfTeddy('freelancer', gltf.scene, gltf.animations);
      this.teddy.root.position.copy(TEDDY_HERO);
      this.teddy.root.rotation.y = -0.35;
      this.scene.add(this.teddy.root);
      signals.teddyModel.set(1);
    } catch (err) {
      console.warn('Teddy model could not load; keeping the 2D art.', err);
    }
  }

  private onPointer = (e: PointerEvent) => {
    this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  };

  private onVisibility = () => {
    if (document.hidden) this.stop();
    else this.start();
  };

  private size = { w: 1, h: 1, portrait: false };
  private shift = -1;

  private resize = () => {
    const w = this.o.canvas.clientWidth || window.innerWidth;
    const h = this.o.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    const aspect = w / h;
    this.camera.aspect = aspect;
    const fov = aspect < 16 / 9 ? 2 * Math.atan(DESIGN_TAN / aspect) : MathUtils.degToRad(32);
    this.camera.fov = Math.min(78, MathUtils.radToDeg(fov));
    this.size = { w, h, portrait: aspect < 0.85 };
    this.shift = -1;
    this.applyShift(this.o.vh.get());
  };

  /** Lens shift: scene to the right of the copy on desktop; pushed down under the copy in portrait. */
  private applyShift(v: number) {
    const { w, h, portrait } = this.size;
    const sx = portrait ? (v < 120 || v > 2460 ? -0.2 : 0) : shiftAt(v);
    // Portrait: chapters 04–05 have the longest copy, so their scene sits lower.
    const sy = portrait ? 0.14 + 0.09 * Math.max(bell01(v, 700, 740, 1150, 1200), bell01(v, 1240, 1280, 1560, 1600) * 1.45) : 0;
    const key = sx + sy * 10;
    if (Math.abs(key - this.shift) < 0.0005) return;
    this.shift = key;
    this.camera.setViewOffset(w, h, -sx * w, -sy * h, w, h);
    this.camera.updateProjectionMatrix();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.getDelta();
    const loop = () => {
      if (!this.running) return;
      this.frame();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const now = performance.now() / 1000;
    const v = this.o.vh.get();
    const still = this.o.reduced;
    if (this.readyAt === null && signals.ready.get() > 0) this.readyAt = now;
    const entry = this.readyAt === null ? 0 : still ? 1 : easeOut(Math.min(1, (now - this.readyAt) / 0.9));
    const interactive = this.o.parallax && !still;
    void PRESENT;
    const k = 1 - Math.exp(-DAMP * dt);

    // ---------- Teddy model (hero only, when provided) ----------
    if (this.teddy) {
      const o = entry * (1 - seg(v, [30, 60]));
      this.teddy.setOpacity(o);
      const since = this.readyAt === null ? 0 : now - this.readyAt;
      if (o > 0.01) this.teddy.play({ clip: since < 2.4 ? 'wave' : 'idle', time: since }, dt, still);
    }

    // ---------- Camera ----------
    this.applyShift(v);
    cameraAt(v, this.camPos, this.camTgt);
    if (v >= 1600 && v < 2060 && !still) {
      this.camPos.x += Math.sin(now * 0.15) * 0.25; // slow drift behind the devices (06.1)
      this.camPos.y += Math.sin(now * 0.11) * 0.08;
    }
    const px = interactive ? this.pointer.x * 0.18 : 0;
    const py = interactive ? this.pointer.y * 0.1 : 0;
    this.parallax.x += (px - this.parallax.x) * k * 0.5;
    this.parallax.y += (py - this.parallax.y) * k * 0.5;
    this.camera.position.copy(this.camPos);
    this.camera.position.x += this.parallax.x;
    this.camera.position.y += this.parallax.y;
    this.camera.lookAt(this.camTgt);
    this.camera.updateMatrixWorld();

    this.phoneAnchor.set(0.72, -0.3, 0.5).unproject(this.camera).sub(this.camera.position).normalize();
    this.phoneAnchor.multiplyScalar(3).add(this.camera.position);

    // ---------- Objects ----------
    this.air.phone.copy(this.phoneAnchor);
    this.air.update(v, now, this.camera, entry, still);

    // ---------- Anchors for the page layer ----------
    const w = this.o.canvas.clientWidth || window.innerWidth;
    const h = this.o.canvas.clientHeight || window.innerHeight;
    for (const [name, get, ok] of this.anchors) {
      const p = this.tmp.copy(get()).project(this.camera);
      const a = anchor(name);
      const inView = p.z < 1 && Math.abs(p.x) < 1.15 && Math.abs(p.y) < 1.15 && ok();
      a.x.set(((p.x + 1) / 2) * w);
      a.y.set(((1 - p.y) / 2) * h);
      a.visible.set(inView ? 1 : 0);
    }

    this.renderer.render(this.scene, this.camera);
    if (this.firstFrame) {
      this.firstFrame = false;
      this.o.onReady();
    }
  }

  dispose() {
    this.stop();
    window.removeEventListener('pointermove', this.onPointer);
    window.removeEventListener('resize', this.resize);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.teddy?.dispose();
    this.kit.dispose();
    disposeTextures();
    this.renderer.dispose();
  }
}

/** 0 → 1 over [a, b], 1 until c, → 0 over [c, d]. */
function bell01(v: number, a: number, b: number, c: number, d: number) {
  const up = Math.min(1, Math.max(0, (v - a) / (b - a)));
  const down = Math.min(1, Math.max(0, (d - v) / (d - c)));
  return Math.min(up, down);
}
