import {
  AdditiveBlending,
  BufferAttribute,
  CatmullRomCurve3,
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
  type ColorRepresentation,
  type Curve,
} from 'three';
import { clamp } from '../motion/timeline';
import type { Kit } from './kit';

// The Ribbon direction's line language (board "Ribbon · system"): one continuous tube of light with a
// soft halo, round tapered ends, drawn on along its length; dotted paths for "not taken"; beads for flow.

export const curve = (pts: [number, number, number][], closed = false) =>
  new CatmullRomCurve3(
    pts.map((p) => new Vector3(...p)),
    closed,
    'catmullrom',
    0.5,
  );

type RibbonOpts = {
  radius?: number;
  /** One colour, or [start, end] for a gradient along the length. */
  color: ColorRepresentation | [ColorRepresentation, ColorRepresentation];
  halo?: boolean;
  segments?: number;
  /** Share of the length at each end that tapers to a point (0 = none). */
  taper?: number;
  closed?: boolean;
};

export class Ribbon {
  readonly group = new Group();
  readonly curve: Curve<Vector3>;
  private core: Mesh;
  private halo: Mesh | null = null;
  private coreMat: MeshBasicMaterial;
  private haloMat: MeshBasicMaterial | null = null;
  private indexCount: number;
  private ringIndices: number;
  private opacity = 1;
  private drawn = 1;

  constructor(kit: Kit, c: Curve<Vector3>, o: RibbonOpts) {
    this.curve = c;
    const seg = o.segments ?? 160;
    const radial = 10;
    const r = o.radius ?? 0.028;
    const geo = kit.geo(new TubeGeometry(c, seg, r, radial, o.closed ?? false));
    this.taperAndColor(geo, c, seg, radial, o.taper ?? (o.closed ? 0 : 0.06), o.color);
    this.coreMat = new MeshBasicMaterial({ vertexColors: true, transparent: true, toneMapped: false });
    kit.materials.push(this.coreMat);
    this.core = new Mesh(geo, this.coreMat);
    this.group.add(this.core);
    if (o.halo ?? true) {
      const hgeo = kit.geo(new TubeGeometry(c, seg, r * 3.4, radial, o.closed ?? false));
      this.taperAndColor(hgeo, c, seg, radial, o.taper ?? (o.closed ? 0 : 0.06), o.color);
      this.haloMat = new MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.2,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      });
      kit.materials.push(this.haloMat);
      this.halo = new Mesh(hgeo, this.haloMat);
      this.group.add(this.halo);
    }
    this.indexCount = geo.index!.count;
    this.ringIndices = radial * 6;
  }

  /** Taper the ends toward the centre line and colour vertices along the length. */
  private taperAndColor(geo: TubeGeometry, c: Curve<Vector3>, seg: number, radial: number, taper: number, color: RibbonOpts['color']) {
    const pos = geo.attributes.position as BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const [c0, c1] = Array.isArray(color) ? [new Color(color[0]), new Color(color[1])] : [new Color(color), new Color(color)];
    const centre = new Vector3();
    const v = new Vector3();
    const col = new Color();
    for (let i = 0; i <= seg; i++) {
      const u = i / seg;
      c.getPointAt(u, centre);
      const end = Math.min(u, 1 - u);
      const k = taper > 0 ? clamp(end / taper) : 1;
      const f = 0.25 + 0.75 * (k * k * (3 - 2 * k));
      col.copy(c0).lerp(c1, u);
      for (let j = 0; j <= radial; j++) {
        const idx = i * (radial + 1) + j;
        v.fromBufferAttribute(pos, idx).sub(centre).multiplyScalar(f).add(centre);
        pos.setXYZ(idx, v.x, v.y, v.z);
        colors[idx * 3] = col.r;
        colors[idx * 3 + 1] = col.g;
        colors[idx * 3 + 2] = col.b;
      }
    }
    geo.setAttribute('color', new BufferAttribute(colors, 3));
    pos.needsUpdate = true;
  }

  /** Draw on from the start: 0 = nothing, 1 = the whole ribbon. */
  draw(s: number) {
    this.drawn = clamp(s);
    const n = Math.round((this.indexCount / this.ringIndices) * this.drawn) * this.ringIndices;
    this.core.geometry.setDrawRange(0, n);
    this.halo?.geometry.setDrawRange(0, n);
    this.group.visible = n > 0 && this.opacity > 0.01;
  }

  fade(o: number) {
    this.opacity = clamp(o);
    this.coreMat.opacity = this.opacity;
    if (this.haloMat) this.haloMat.opacity = 0.2 * this.opacity;
    this.group.visible = this.drawn > 0.001 && this.opacity > 0.01;
  }

  /** Recolour the whole ribbon (e.g. a gate turning green). */
  tint(color: ColorRepresentation, amount: number) {
    this.coreMat.color.set(0xffffff).lerp(new Color(color).multiplyScalar(1.2), amount);
    this.haloMat?.color.set(0xffffff).lerp(new Color(color).multiplyScalar(1.2), amount);
  }

  pointAt(t: number, out: Vector3) {
    return this.curve.getPointAt(clamp(t), out);
  }
}

/** A dotted path: round dots along a curve. For paths not taken and the border. */
export class Dots {
  readonly mesh: InstancedMesh;
  private mat: MeshBasicMaterial;
  private n: number;

  constructor(kit: Kit, c: Curve<Vector3>, spacing: number, radius: number, color: ColorRepresentation) {
    this.n = Math.max(2, Math.round(c.getLength() / spacing));
    this.mat = new MeshBasicMaterial({ color, transparent: true, toneMapped: false });
    kit.materials.push(this.mat);
    this.mesh = new InstancedMesh(kit.geo(new SphereGeometry(radius, 10, 8)), this.mat, this.n);
    const m = new Matrix4();
    const p = new Vector3();
    for (let i = 0; i < this.n; i++) {
      c.getPointAt(i / (this.n - 1), p);
      m.makeTranslation(p.x, p.y, p.z);
      this.mesh.setMatrixAt(i, m);
    }
    this.mesh.frustumCulled = false;
  }

  set(draw: number, opacity: number) {
    this.mesh.count = Math.round(this.n * clamp(draw));
    this.mat.opacity = clamp(opacity);
    this.mesh.visible = this.mesh.count > 0 && opacity > 0.01;
  }
}

/** Beads that flow along a ribbon: the money moving. Off under reduced motion. */
export class Beads {
  readonly mesh: InstancedMesh;
  private m = new Matrix4();
  private p = new Vector3();

  constructor(
    kit: Kit,
    private c: Curve<Vector3>,
    private n: number,
    radius = 0.022,
    color: ColorRepresentation = 0xffffff,
  ) {
    const mat = new MeshBasicMaterial({ color, transparent: true, opacity: 0.85, toneMapped: false });
    kit.materials.push(mat);
    this.mesh = new InstancedMesh(kit.geo(new SphereGeometry(radius, 10, 8)), mat, n);
    this.mesh.frustumCulled = false;
  }

  /** time-driven flow, limited to the drawn share of the ribbon. */
  update(time: number, drawn: number, visible: boolean, speed = 0.12) {
    this.mesh.visible = visible && drawn > 0.02;
    if (!this.mesh.visible) return;
    for (let i = 0; i < this.n; i++) {
      const t = ((i / this.n + time * speed) % 1) * drawn;
      this.c.getPointAt(t, this.p);
      this.m.makeTranslation(this.p.x, this.p.y, this.p.z);
      this.mesh.setMatrixAt(i, this.m);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

/** Centre line of an arched gate: up a post, over a half circle, down the other post (one smooth tube). */
export function archCurve(w: number, h: number) {
  const pts: [number, number, number][] = [
    [-w / 2, 0, 0],
    [-w / 2, h * 0.5, 0],
  ];
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI - (i / 12) * Math.PI;
    pts.push([(Math.cos(a) * w) / 2, h + (Math.sin(a) * w) / 2, 0]);
  }
  pts.push([w / 2, h * 0.5, 0], [w / 2, 0, 0]);
  return curve(pts);
}

/** A circle in the XY plane, starting at the top and running counter-clockwise. */
export function circleCurve(r: number, n = 32) {
  const pts: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = Math.PI / 2 + (i / n) * Math.PI * 2;
    pts.push([Math.cos(a) * r, Math.sin(a) * r, 0]);
  }
  return curve(pts, true);
}
