import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Vector3,
  type BufferGeometry,
  type ColorRepresentation,
  type Material,
} from 'three';
import { clamp, easeOut } from '../motion/timeline';

/** Tracks geometries and materials so the stage can dispose of everything at once. */
export class Kit {
  geometries: BufferGeometry[] = [];
  materials: Material[] = [];

  std(color: ColorRepresentation, opts: Partial<{ emissive: ColorRepresentation; emissiveIntensity: number; roughness: number; metalness: number; opacity: number }> = {}) {
    const m = new MeshStandardMaterial({
      color,
      emissive: opts.emissive ?? 0x000000,
      emissiveIntensity: opts.emissiveIntensity ?? 1,
      roughness: opts.roughness ?? 0.6,
      metalness: opts.metalness ?? 0,
      transparent: opts.opacity !== undefined,
      opacity: opts.opacity ?? 1,
    });
    this.materials.push(m);
    return m;
  }

  basic(color: ColorRepresentation, opacity = 1) {
    const m = new MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
    this.materials.push(m);
    return m;
  }

  geo<T extends BufferGeometry>(g: T) {
    this.geometries.push(g);
    return g;
  }

  box(w: number, h: number, d: number, m: Material, x = 0, y = 0, z = 0) {
    const mesh = new Mesh(this.geo(new BoxGeometry(w, h, d)), m);
    mesh.position.set(x, y, z);
    return mesh;
  }

  dispose() {
    this.geometries.forEach((g) => g.dispose());
    this.materials.forEach((m) => m.dispose());
  }
}

/** Set opacity on a material, switching transparency only when needed. */
export function fadeMat(m: Material, o: number) {
  m.opacity = o;
  const t = o < 0.999;
  if (m.transparent !== t) {
    m.transparent = t;
    m.needsUpdate = true;
  }
}

/**
 * A bar from A to B that can be "drawn" from A: draw(0) is nothing, draw(1) is the full bar.
 * Used for the Fund's lines of light and the fork's branches.
 */
export class Bar {
  readonly mesh: Mesh;
  private a: Vector3;
  private dir: Vector3;
  private len: number;

  constructor(kit: Kit, a: Vector3, b: Vector3, thickness: number, m: Material) {
    this.a = a.clone();
    this.dir = b.clone().sub(a);
    this.len = this.dir.length();
    this.dir.normalize();
    this.mesh = new Mesh(kit.geo(new BoxGeometry(1, 1, 1)), m);
    this.mesh.scale.set(thickness, thickness, this.len);
    this.mesh.lookAt(this.dir);
    this.draw(1);
  }

  draw(s: number) {
    const k = clamp(s);
    this.mesh.visible = k > 0.001;
    this.mesh.scale.z = Math.max(0.0001, this.len * k);
    this.mesh.position.copy(this.a).addScaledVector(this.dir, (this.len * k) / 2);
  }
}

/** 12 edges of a box, drawn one after another. */
export class EdgeFrame {
  readonly group = new Group();
  readonly bars: Bar[] = [];

  constructor(kit: Kit, w: number, h: number, d: number, thickness: number, m: Material) {
    const x = w / 2;
    const y = h / 2;
    const z = d / 2;
    const c = (sx: number, sy: number, sz: number) => new Vector3(sx * x, sy * y, sz * z);
    const edges: [Vector3, Vector3][] = [
      [c(-1, -1, 1), c(1, -1, 1)],
      [c(1, -1, 1), c(1, 1, 1)],
      [c(1, 1, 1), c(-1, 1, 1)],
      [c(-1, 1, 1), c(-1, -1, 1)],
      [c(-1, -1, -1), c(1, -1, -1)],
      [c(1, -1, -1), c(1, 1, -1)],
      [c(1, 1, -1), c(-1, 1, -1)],
      [c(-1, 1, -1), c(-1, -1, -1)],
      [c(-1, -1, 1), c(-1, -1, -1)],
      [c(1, -1, 1), c(1, -1, -1)],
      [c(1, 1, 1), c(1, 1, -1)],
      [c(-1, 1, 1), c(-1, 1, -1)],
    ];
    for (const [a, b] of edges) {
      const bar = new Bar(kit, a, b, thickness, m);
      this.bars.push(bar);
      this.group.add(bar.mesh);
    }
  }

  /** s 0→1 draws the edges in a stagger. */
  draw(s: number) {
    const n = this.bars.length;
    this.bars.forEach((bar, i) => {
      const start = (i / n) * 0.6;
      bar.draw(easeOut(clamp((s - start) / 0.4)));
    });
  }
}

/** Fires once when a value crosses `at` going forward; reports seconds since. Resets when going back. */
export class Trigger {
  private firedAt: number | null = null;
  constructor(private at: number) {}
  update(v: number, now: number) {
    if (v >= this.at && this.firedAt === null) this.firedAt = now;
    if (v < this.at - 2) this.firedAt = null;
    return this.firedAt === null ? -1 : now - this.firedAt;
  }
}
