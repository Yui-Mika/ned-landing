import {
  ACESFilmicToneMapping,
  Clock,
  DirectionalLight,
  HemisphereLight,
  MathUtils,
  PerspectiveCamera,
  SRGBColorSpace,
  Scene,
  Vector3,
  WebGLRenderer,
  type Object3D,
} from 'three';
import type { MotionValue } from 'motion/react';
import { anchor, signals, type AnchorName } from '../motion/anchors';
import { PRESENT } from '../motion/flags';
import { clamp, easeOut } from '../motion/timeline';
import { DAMP } from '../motion/tokens';
import { TEDDY_MODEL_URL } from '../config';
import { cameraAt, shiftAt } from './camera';
import { Kit } from './kit';
import { Coins } from './objects/coins';
import { Fork } from './objects/fork';
import { Fund } from './objects/fund';
import { Plates, Props } from './objects/props';
import { Track } from './objects/track';
import { BlockTeddy } from './teddy/BlockTeddy';
import { Director, type Direction } from './teddy/director';
import type { TeddyRig } from './teddy/types';
import { BORDER_X, GATE_X, LANE_Z, PARTNER, WALLET } from './world';

export type StageOptions = {
  canvas: HTMLCanvasElement;
  vh: MotionValue<number>;
  velocity: MotionValue<number>;
  reduced: boolean;
  phone: boolean;
  /** Cursor-follow and camera parallax (desktop, not present mode). */
  parallax: boolean;
  coinCount: number;
  onReady: () => void;
};

/** Horizontal field of view the layout was designed for (32° vertical at 16:9). */
const DESIGN_TAN = Math.tan(MathUtils.degToRad(16)) * (16 / 9);

/**
 * The one persistent 3D scene. Everything in it is a function of the story position (vh), plus a few
 * time-based touches (Teddy clips, blink, orbit) that switch off under reduced motion.
 */
export class Stage {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(32, 1, 0.1, 200);
  private kit = new Kit();
  private clock = new Clock();
  private fund: Fund;
  private coins: Coins;
  private track: Track;
  private fork: Fork;
  private props: Props;
  private plates: Plates;
  private director = new Director();
  private tc: TeddyRig;
  private tf: TeddyRig;
  private raf = 0;
  private running = false;
  private readyAt: number | null = null;
  private firstFrame = true;
  private pointer = { x: 0, y: 0 };
  private lastInput = performance.now() / 1000;
  private look = { tf: { y: 0, x: 0 }, tc: { y: 0, x: 0 } };
  private parallax = { x: 0, y: 0 };
  private camPos = new Vector3();
  private camTgt = new Vector3();
  private tcHand = new Vector3();
  private tfHand = new Vector3();
  private phoneAnchor = new Vector3();
  private tmp = new Vector3();
  private anchors: [AnchorName, () => Vector3, () => boolean][] = [];

  constructor(private o: StageOptions) {
    this.renderer = new WebGLRenderer({ canvas: o.canvas, antialias: !o.phone, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, o.phone ? 1.5 : 2));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    // Light: soft key from the front-left, purple rims from behind (#B87AED).
    this.scene.add(new HemisphereLight(0xf0e4ff, 0x160530, 0.9));
    const key = new DirectionalLight(0xffffff, 1.6);
    key.position.set(-3, 5, 6);
    const rim = new DirectionalLight(0xb87aed, 2.2);
    rim.position.set(4, 3, -5);
    const rim2 = new DirectionalLight(0x9b4fde, 1.0);
    rim2.position.set(-5, 2, -3);
    this.scene.add(key, rim, rim2);

    this.fund = new Fund(this.kit);
    this.coins = new Coins(this.kit, o.coinCount);
    this.track = new Track(this.kit);
    this.fork = new Fork(this.kit);
    this.props = new Props(this.kit);
    this.plates = new Plates(this.kit);
    this.tc = new BlockTeddy('client');
    this.tf = new BlockTeddy('freelancer');
    this.scene.add(
      this.fund.group,
      this.fund.ghosts,
      this.coins.mesh,
      this.track.group,
      this.fork.group,
      this.props.group,
      this.plates.group,
      this.tc.root,
      this.tf.root,
    );

    const at = (x: number, y: number, z: number) => {
      const p = new Vector3(x, y, z);
      return () => p;
    };
    const world = (obj: () => Object3D) => () => obj().getWorldPosition(this.tmp);
    this.anchors = [
      ['tc-head', world(() => this.tc.headAnchor), () => this.director.tc.opacity > 0.5],
      ['tf-head', world(() => this.tf.headAnchor), () => this.director.tf.opacity > 0.5],
      ['gate1', at(GATE_X, 1.5, LANE_Z), () => true],
      ['wallet', at(WALLET.x, 0.95, WALLET.z), () => true],
      ['partner', at(PARTNER.x, 0.95, PARTNER.z), () => true],
      ['abroad', at(BORDER_X - 0.9, 1.5, 4.4), () => true],
      ['vietnam', at(BORDER_X + 0.9, 1.5, 4.4), () => true],
    ];

    window.addEventListener('pointermove', this.onPointer, { passive: true });
    window.addEventListener('scroll', this.onInput, { passive: true });
    window.addEventListener('keydown', this.onInput);
    window.addEventListener('resize', this.resize);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.resize();
    if (TEDDY_MODEL_URL) void this.loadModel(TEDDY_MODEL_URL);
  }

  /** Swap the block placeholders for the team's model once it loads. */
  private async loadModel(url: string) {
    try {
      const [{ GLTFLoader }, { GltfTeddy }] = await Promise.all([
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('./teddy/GltfTeddy'),
      ]);
      const gltf = await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}${url}`);
      const swap = (old: TeddyRig, next: TeddyRig) => {
        this.scene.remove(old.root);
        old.dispose();
        this.scene.add(next.root);
        return next;
      };
      this.tc = swap(this.tc, new GltfTeddy('client', gltf.scene, gltf.animations));
      this.tf = swap(this.tf, new GltfTeddy('freelancer', gltf.scene, gltf.animations));
    } catch (err) {
      console.warn('Teddy model could not load; keeping the placeholders.', err);
    }
  }

  private onPointer = (e: PointerEvent) => {
    this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    this.lastInput = performance.now() / 1000;
  };

  private onInput = () => {
    this.lastInput = performance.now() / 1000;
  };

  private onVisibility = () => {
    if (document.hidden) this.stop();
    else this.start();
  };

  private resize = () => {
    const w = this.o.canvas.clientWidth || window.innerWidth;
    const h = this.o.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    const aspect = w / h;
    this.camera.aspect = aspect;
    // Keep the designed horizontal framing on narrower screens.
    const fov = aspect < 16 / 9 ? 2 * Math.atan(DESIGN_TAN / aspect) : MathUtils.degToRad(32);
    this.camera.fov = Math.min(78, MathUtils.radToDeg(fov));
    this.size = { w, h, portrait: aspect < 0.85 };
    this.applyShift(this.o.vh.get());
  };

  private size = { w: 1, h: 1, portrait: false };
  private shift = -1;

  /** Lens shift: scene to the right of the copy on desktop; pushed down under the copy in portrait. */
  private applyShift(v: number) {
    // Portrait: hero and close are composed for wide screens; pull them left so Teddy stays in frame.
    const s = this.size.portrait ? (v < 120 || v > 2260 ? -0.2 : 0) : shiftAt(v);
    if (Math.abs(s - this.shift) < 0.0005) return;
    this.shift = s;
    const { w, h, portrait } = this.size;
    this.camera.setViewOffset(w, h, -s * w, portrait ? -h * 0.14 : 0, w, h);
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

  private applyTeddy(rig: TeddyRig, d: Direction, dt: number, still: boolean) {
    rig.root.position.copy(d.pos);
    rig.root.rotation.y = d.rotY;
    rig.setOpacity(d.opacity);
    if (d.opacity > 0.01) rig.play(d.req, dt, still);
  }

  private frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const now = performance.now() / 1000;
    const v = this.o.vh.get();
    const still = this.o.reduced;
    if (this.readyAt === null && signals.ready.get() > 0) this.readyAt = now;
    const entry = this.readyAt === null ? 0 : still ? 1 : easeOut(Math.min(1, (now - this.readyAt) / 0.9));
    const interactive = this.o.parallax && !still;

    // ---------- Teddys ----------
    const hour = new Date().getHours();
    this.director.update(v, now, this.readyAt === null ? null : still ? this.readyAt - 10 : this.readyAt, {
      velocity: this.o.velocity.get(),
      ctaHover: signals.ctaHover.get() > 0,
      idleFor: now - this.lastInput,
      lateNight: hour >= 22 || hour < 5,
      present: PRESENT || still,
    });
    const { tc, tf } = this.director;
    this.applyTeddy(this.tc, tc, dt, still);
    this.applyTeddy(this.tf, tf, dt, still);

    // Freelancer looks at the cursor when free; the client looks at the freelancer.
    const k = 1 - Math.exp(-DAMP * dt);
    const followCursor = interactive && tf.free;
    const ty = followCursor ? clamp(this.pointer.x * 0.5 - tf.rotY * 0.4, -0.5, 0.5) : 0;
    const tx = followCursor ? clamp(-this.pointer.y * 0.18, -0.18, 0.18) : 0;
    this.look.tf.y += (ty - this.look.tf.y) * k;
    this.look.tf.x += (tx - this.look.tf.x) * k;
    this.tf.look(this.look.tf.y, this.look.tf.x);
    const toTf = Math.atan2(tf.pos.x - tc.pos.x, tf.pos.z - tc.pos.z) - tc.rotY;
    const cy = tf.opacity > 0.5 ? clamp(toTf, -0.5, 0.5) : 0;
    this.look.tc.y += (cy - this.look.tc.y) * k;
    this.tc.look(this.look.tc.y, 0);

    this.tc.root.updateMatrixWorld();
    this.tf.root.updateMatrixWorld();
    this.tc.handSocket.getWorldPosition(this.tcHand);
    this.tf.handSocket.getWorldPosition(this.tfHand);

    // ---------- Camera ----------
    this.applyShift(v);
    cameraAt(v, this.camPos, this.camTgt);
    if (v >= 1400 && v < 1860 && !still) {
      this.camPos.x += Math.sin(now * 0.15) * 0.25; // slow drift behind the phone (06.1)
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

    // Where the phone sits on screen (06), for the bank card hand-off.
    this.phoneAnchor.set(0.42, -0.05, 0.5).unproject(this.camera).sub(this.camera.position).normalize();
    this.phoneAnchor.multiplyScalar(3).add(this.camera.position);

    // ---------- Objects ----------
    this.fund.update(v, now, entry);
    this.coins.update(v, { now, tcHand: this.tcHand, tfHand: this.tfHand, still });
    this.track.update(v);
    this.fork.update(v, this.camera, this.phoneAnchor);
    this.props.update(v, this.tcHand, this.tfHand);
    this.plates.update(v);
    this.coins.mesh.visible = !(v >= 1400 && v < 2215);

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
    window.removeEventListener('scroll', this.onInput);
    window.removeEventListener('keydown', this.onInput);
    window.removeEventListener('resize', this.resize);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.tc.dispose();
    this.tf.dispose();
    this.kit.dispose();
    this.renderer.dispose();
  }
}
