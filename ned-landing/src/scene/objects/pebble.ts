import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Object3D,
  PlaneGeometry,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  TubeGeometry,
  Vector3,
  type Material,
} from 'three';
import { bell, clamp, easeInOut, easeOut, seg, type Range } from '../../motion/timeline';
import { FAST_SCROLL } from '../../motion/tokens';
import { curve } from '../ribbon';
import type { Kit } from '../kit';
import { ACTORS, PEBBLE_Y } from '../world';

// The two actors of chapters 01–04 and 09 (board "Ribbon · actors"): soft, faceless pebbles with one
// mark each. Moods never follow money: gestures are small and neutral.

export type Role = 'client' | 'freelancer';
export type Gesture = 'idle' | 'give' | 'catch' | 'reach' | 'think' | 'shake' | 'nod' | 'hop' | 'move' | 'curious';
export type GestureReq = { g: Gesture; time: number; scrub?: number };

const R = 0.55;
const SQUASH = { x: 1, y: 0.82, z: 0.9 };

function radial(stops: [number, string][]) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

/** A point on the pebble's surface in the direction of (x, y, z), lifted by `lift`. */
function onSurface(x: number, y: number, z: number, lift = 0.012) {
  const d = new Vector3(x / SQUASH.x, y / SQUASH.y, z / SQUASH.z).normalize();
  return new Vector3(d.x * R * SQUASH.x, d.y * R * SQUASH.y, d.z * R * SQUASH.z).multiplyScalar(1 + lift / R);
}

export class Pebble {
  readonly root = new Group();
  readonly label = new Object3D();
  readonly hold = new Object3D();
  private inner = new Group();
  private mats: Material[] = [];
  private bodyMat: MeshPhysicalMaterial;
  private halo: Sprite;
  private haloMat: SpriteMaterial;
  private shadowMat: MeshBasicMaterial;

  constructor(
    kit: Kit,
    readonly role: Role,
  ) {
    const base = role === 'client' ? 0x818cf8 : 0xb87aed;
    const geo = kit.geo(new SphereGeometry(R, 72, 54));
    // Gentle irregularity so it reads as a pebble, not a ball.
    const pos = geo.attributes.position;
    const v = new Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = 1 + 0.035 * Math.sin(v.x * 4.1 + 0.6) * Math.cos(v.z * 3.3) + 0.02 * Math.sin(v.y * 5.2 + v.x * 2.0);
      v.multiplyScalar(n);
      pos.setXYZ(i, v.x * SQUASH.x, v.y * SQUASH.y, v.z * SQUASH.z);
    }
    geo.computeVertexNormals();
    this.bodyMat = new MeshPhysicalMaterial({
      color: base,
      roughness: 0.32,
      clearcoat: 0.8,
      clearcoatRoughness: 0.18,
      sheen: 0.6,
      sheenColor: new Color(role === 'client' ? 0xc7d2fe : 0xf0e4ff),
      emissive: new Color(base).multiplyScalar(0.18),
    });
    this.mats.push(this.bodyMat);
    kit.materials.push(this.bodyMat);
    const body = new Mesh(geo, this.bodyMat);
    this.inner.add(body);

    // The mark: a meridian for the client abroad, a pen curl for the freelancer.
    const markMat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, toneMapped: false });
    this.mats.push(markMat);
    kit.materials.push(markMat);
    const tube = (pts: Vector3[], closed = false) => {
      const c = curve(pts.map((p) => [p.x, p.y, p.z] as [number, number, number]), closed);
      return new Mesh(kit.geo(new TubeGeometry(c, 96, 0.013, 6, closed)), markMat);
    };
    if (role === 'client') {
      const ell: Vector3[] = [];
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        ell.push(onSurface(Math.sin(a) * 0.12, Math.cos(a) * 0.2, 0.5));
      }
      this.inner.add(tube(ell, true));
      const eq: Vector3[] = [];
      for (let i = 0; i <= 12; i++) {
        const x = -0.2 + (i / 12) * 0.4;
        eq.push(onSurface(x, -0.01 + 0.04 * Math.cos((x / 0.2) * (Math.PI / 2)), 0.5));
      }
      this.inner.add(tube(eq));
    } else {
      const sp: Vector3[] = [];
      for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const a = Math.PI * 0.9 + t * Math.PI * 2.4;
        const r = 0.17 * (1 - t * 0.72);
        sp.push(onSurface(Math.cos(a) * r + 0.01, Math.sin(a) * r * 0.9, 0.5));
      }
      this.inner.add(tube(sp));
    }
    this.inner.position.y = PEBBLE_Y;
    this.root.add(this.inner);

    // Soft shadow and the active halo.
    this.shadowMat = new MeshBasicMaterial({ map: radial([[0, 'rgba(4,2,10,0.55)'], [1, 'rgba(4,2,10,0)']]), transparent: true, depthWrite: false });
    kit.materials.push(this.shadowMat);
    const shadow = new Mesh(kit.geo(new PlaneGeometry(1.5, 1.1)), this.shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.012;
    this.root.add(shadow);
    const col = new Color(base);
    this.haloMat = new SpriteMaterial({
      map: radial([[0, `rgba(${(col.r * 255) | 0},${(col.g * 255) | 0},${(col.b * 255) | 0},0.55)`], [1, 'rgba(0,0,0,0)']]),
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0,
    });
    kit.materials.push(this.haloMat);
    this.halo = new Sprite(this.haloMat);
    this.halo.scale.set(2.4, 2.0, 1);
    this.halo.position.y = PEBBLE_Y;
    this.root.add(this.halo);

    this.label.position.set(0, -0.04, 0.5);
    this.hold.position.set(0, 1.2, 0.15);
    this.root.add(this.label, this.hold);
  }

  /** Apply a gesture. `toward` = +1 if the other party is to the right. */
  pose(req: GestureReq, still: boolean, toward: number, lean: number) {
    const t = req.time;
    const s = req.scrub ?? 0;
    const amb = still ? 0 : 1;
    let sx = 1;
    let sy = 1 + Math.sin(t * 1.5) * 0.012 * amb;
    let rz = 0;
    let ry = 0;
    let lift = 0;
    let dx = 0;
    switch (req.g) {
      case 'give':
        rz = -0.16 * bell(s) * toward;
        sx = 1 + 0.06 * bell(s);
        dx = 0.06 * bell(s) * toward;
        break;
      case 'catch':
        sy = 1 - 0.12 * Math.max(0, 1 - t / 0.5) * amb;
        sx = 1 + 0.06 * Math.max(0, 1 - t / 0.5) * amb;
        break;
      case 'reach': {
        const k = t < 0.3 ? easeOut(t / 0.3) : Math.max(0, 1 - (t - 0.3) / 0.4);
        dx = 0.22 * k * toward;
        sx = 1 + 0.1 * k;
        rz = -0.08 * k * toward + (t > 0.3 ? Math.sin((t - 0.3) * 18) * 0.04 * Math.max(0, 1 - (t - 0.3) / 0.7) * amb : 0);
        break;
      }
      case 'think':
        rz = Math.sin(t * 1.2) * 0.06 * amb + 0.04;
        break;
      case 'shake':
        ry = Math.sin(t * 13) * 0.3 * Math.max(0, 1 - t / 1.3) * amb;
        break;
      case 'nod':
        sy = 1 - 0.08 * bell(clamp(t / 0.7));
        break;
      case 'hop':
        lift = 0.14 * bell(clamp(t / 0.6)) * (still ? 0 : 1);
        sy = 1 + 0.05 * bell(clamp(t / 0.6));
        break;
      case 'move':
        sx = 1 + 0.08 * bell(s);
        sy = 1 - 0.05 * bell(s);
        break;
      case 'curious':
        rz = -0.12 * toward;
        break;
    }
    this.inner.scale.set(sx, sy, 1);
    this.inner.rotation.set(0, ry, rz + lean);
    this.inner.position.set(dx, PEBBLE_Y + lift, 0);
  }

  set(opacity: number, halo: number) {
    this.root.visible = opacity > 0.01;
    for (const m of this.mats) {
      const t = opacity < 0.999;
      m.opacity = opacity;
      if (m.transparent !== t) {
        m.transparent = t;
        m.needsUpdate = true;
      }
    }
    this.shadowMat.opacity = opacity;
    this.haloMat.opacity = clamp(halo) * opacity;
  }
}

// ---------------------------------------------------------------- direction

type Beat = { r: Range; g: Gesture; mode: 'scrub' | 'once' | 'loop'; dur?: number };

const TF_BEATS: Beat[] = [
  { r: [178, 200], g: 'give', mode: 'scrub' }, // 02.5: sends the work
  { r: [395, 470], g: 'think', mode: 'loop' }, // 03.3
  { r: [580, 605], g: 'shake', mode: 'once', dur: 1.3 }, // 03.13
  { r: [605, 640], g: 'move', mode: 'scrub' },
  { r: [708, 728], g: 'give', mode: 'scrub' }, // 04.5: submits
  { r: [830, 900], g: 'nod', mode: 'once', dur: 0.7 }, // 04.12, no celebration
];
const TC_BEATS: Beat[] = [
  { r: [210, 258], g: 'catch', mode: 'once', dur: 0.5 }, // 02.7
  { r: [310, 336], g: 'give', mode: 'scrub' }, // 02.14: sends money up front
  { r: [478, 510], g: 'give', mode: 'scrub' }, // 03.7: locks
  { r: [575, 605], g: 'reach', mode: 'once', dur: 1.0 }, // 03.12
  { r: [605, 640], g: 'move', mode: 'scrub' },
  { r: [748, 800], g: 'hop', mode: 'once', dur: 0.6 }, // 04.9: approves
];

class Clock {
  private i = -2;
  private start = 0;
  resolve(beats: Beat[], v: number, now: number): GestureReq & { free: boolean } {
    const i = beats.findIndex((b) => v >= b.r[0] && v < b.r[1]);
    if (i !== this.i) {
      this.i = i;
      this.start = now;
    }
    if (i < 0) return { g: 'idle', time: now, free: true };
    const b = beats[i];
    if (b.mode === 'scrub') return { g: b.g, time: now, scrub: seg(v, b.r), free: false };
    const t = now - this.start;
    if (b.mode === 'loop' || t < (b.dur ?? 1)) return { g: b.g, time: b.mode === 'loop' ? now : t, free: false };
    return { g: 'idle', time: now, free: true };
  }
}

type Move = [Range, Vector3, Vector3];
const TF_MOVES: Move[] = [
  [[0, 0], ACTORS.tfMark, ACTORS.tfMark],
  [[605, 640], ACTORS.tfMark, ACTORS.tfTrack],
  [[2280, 2280], ACTORS.tfClose, ACTORS.tfClose],
];
const TC_MOVES: Move[] = [
  [[0, 0], ACTORS.tcMark, ACTORS.tcMark],
  [[605, 640], ACTORS.tcMark, ACTORS.tcTrack],
  [[2280, 2280], ACTORS.tcClose, ACTORS.tcClose],
];

function place(moves: Move[], v: number, out: Vector3) {
  out.copy(moves[0][1]);
  for (const [r, a, b] of moves) {
    if (v < r[0]) break;
    out.copy(a).lerp(b, easeInOut(seg(v, r)));
  }
}

export type Cue = { pos: Vector3; opacity: number; halo: number; req: GestureReq; free: boolean };

export class PebbleDirector {
  private tfClock = new Clock();
  private tcClock = new Clock();
  private hopUntil = -1;
  readonly tf: Cue = { pos: new Vector3(), opacity: 0, halo: 0, req: { g: 'idle', time: 0 }, free: true };
  readonly tc: Cue = { pos: new Vector3(), opacity: 0, halo: 0, req: { g: 'idle', time: 0 }, free: true };

  update(v: number, now: number, io: { velocity: number; ctaHover: boolean; present: boolean }) {
    // Both arrive as Teddy leaves the hero (01.14), fade out with the track (04.21), return in 09.
    const arrive = easeOut(seg(v, [50, 100]));
    const close = seg(v, [2290, 2320]);
    const away = 1 - seg(v, [1020, 1040]);

    const tf = this.tf;
    place(TF_MOVES, v, tf.pos);
    tf.opacity = v < 1040 ? arrive * away : v >= 2280 ? close : 0;
    if (v < 120) tf.pos.y = -0.5 * (1 - arrive);
    if (v >= 2280) tf.pos.y = -0.4 * (1 - easeOut(close));
    tf.halo = seg(v, [330, 342]) * (1 - seg(v, [360, 376])) + 0.6 * seg(v, [2325, 2345]);
    const r = this.tfClock.resolve(TF_BEATS, v, now);
    tf.req = r;
    tf.free = r.free;
    if (r.free && tf.opacity > 0.5) {
      if (!io.present && Math.abs(io.velocity) > FAST_SCROLL && now > this.hopUntil) this.hopUntil = now + 0.6;
      if (now < this.hopUntil) tf.req = { g: 'hop', time: 0.6 - (this.hopUntil - now) };
      else if (io.ctaHover) tf.req = { g: 'curious', time: now };
    }

    const tc = this.tc;
    place(TC_MOVES, v, tc.pos);
    if (v < 120) {
      tc.pos.x -= 0.8 * (1 - arrive);
      tc.pos.y = -0.5 * (1 - arrive);
    }
    const ghost = 1 - 0.82 * seg(v, [258, 290]) + 0.82 * seg(v, [300, 312]); // 02.10, 02.14
    tc.opacity = v < 380 ? arrive * ghost : v < 1040 ? away : v >= 2280 ? close : 0;
    if (v >= 2280) tc.pos.y = -0.4 * (1 - easeOut(close));
    tc.halo = seg(v, [478, 490]) * (1 - seg(v, [505, 520]));
    const rc = this.tcClock.resolve(TC_BEATS, v, now);
    tc.req = rc;
    tc.free = false;
  }
}
