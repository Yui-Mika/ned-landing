import {
  AdditiveBlending,
  CanvasTexture,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  SRGBColorSpace,
  ShapeGeometry,
  Shape,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  Vector3,
} from 'three';
import { easeInOut, easeOut, seg, window01 } from '../../motion/timeline';
import type { Kit } from '../kit';
import { coinGeometry, coinMaterials } from '../coin';
import { PATH, PLAN_T, RECORD_T } from '../paths';
import { Dots, Ribbon } from '../ribbon';
import { GATE_X, LANE_Z } from '../world';

const CLIENT = 0x818cf8;
const LINE = 0xf0e4ff;

function pageTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 320;
  const g = c.getContext('2d')!;
  g.fillStyle = '#F0E4FF';
  g.fillRect(0, 0, 256, 320);
  g.fillStyle = 'rgba(184,122,237,0.75)';
  g.beginPath();
  g.moveTo(176, 0);
  g.lineTo(256, 80);
  g.lineTo(196, 80);
  g.quadraticCurveTo(176, 80, 176, 60);
  g.closePath();
  g.fill();
  g.strokeStyle = '#7B2FBE';
  g.lineCap = 'round';
  g.lineWidth = 18;
  for (const [y, w] of [[150, 150], [196, 120], [242, 90]] as const) {
    g.beginPath();
    g.moveTo(48, y);
    g.lineTo(48 + w, y);
    g.stroke();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** The work: a page with a folded corner, rounded silhouette. */
function pageShape(w: number, h: number) {
  const r = 0.05;
  const f = 0.11;
  const s = new Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - f);
  s.lineTo(w / 2 - f, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}

/** Chapters 02–03 props (board "Ribbon · 02–03"): the work, the promise, the seam of light. */
export class Props {
  readonly group = new Group();
  private page = new Group();
  private pageMat: MeshBasicMaterial;
  private promise: Ribbon;
  private promiseRest: Dots;
  private pulse: Mesh;
  private pulseRing: Mesh;
  private ringMat: MeshBasicMaterial;
  private seamL: Ribbon;
  private seamR: Ribbon;
  private seamGlow: Sprite;
  private seamMat: SpriteMaterial;
  private b = new Vector3();
  /** Where the delivered page rests: beside the client's coins, not on them. */
  private restOffset = new Vector3(0.48, -0.22, 0.2);

  constructor(kit: Kit) {
    const W = 0.36;
    const H = 0.46;
    const geo = kit.geo(new ShapeGeometry(pageShape(W, H), 12));
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + W / 2) / W, (uv.getY(i) + H / 2) / H);
    this.pageMat = new MeshBasicMaterial({ map: pageTexture(), side: DoubleSide, transparent: true, toneMapped: false });
    kit.materials.push(this.pageMat);
    this.page.add(new Mesh(geo, this.pageMat));
    this.group.add(this.page);

    this.promise = new Ribbon(kit, PATH.promise, { color: CLIENT, radius: 0.026 });
    this.promiseRest = new Dots(kit, PATH.promiseRest, 0.11, 0.012, LINE);
    this.pulse = new Mesh(coinGeometry(kit, 0.12, 0.035), coinMaterials(kit, 'usdc'));
    this.pulse.rotation.x = 1.2;
    this.ringMat = new MeshBasicMaterial({ color: CLIENT, transparent: true, toneMapped: false });
    kit.materials.push(this.ringMat);
    this.pulseRing = new Mesh(kit.geo(new TorusGeometry(0.2, 0.008, 6, 48)), this.ringMat);
    this.group.add(this.promise.group, this.promiseRest.mesh, this.pulse, this.pulseRing);

    this.seamL = new Ribbon(kit, PATH.seamL, { color: LINE, radius: 0.022 });
    this.seamR = new Ribbon(kit, PATH.seamR, { color: 0xb87aed, radius: 0.018 });
    this.seamMat = new SpriteMaterial({
      map: new CanvasTexture(
        (() => {
          const c = document.createElement('canvas');
          c.width = 64;
          c.height = 256;
          const g = c.getContext('2d')!;
          const gr = g.createRadialGradient(32, 128, 0, 32, 128, 128);
          gr.addColorStop(0, 'rgba(240,228,255,0.9)');
          gr.addColorStop(1, 'rgba(240,228,255,0)');
          g.fillStyle = gr;
          g.fillRect(0, 0, 64, 256);
          return c;
        })(),
      ),
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    kit.materials.push(this.seamMat);
    this.seamGlow = new Sprite(this.seamMat);
    this.seamGlow.scale.set(0.7, 2.4, 1);
    this.seamGlow.position.set(0, 1.1, 0.2);
    this.group.add(this.seamL.group, this.seamR.group, this.seamGlow);
  }

  update(v: number, tcHold: Vector3, tfHold: Vector3) {
    // ---------- The work ----------
    let po = 0;
    const f = this.page.position;
    if (v >= 178 && v < 300) {
      po = seg(v, [178, 184]) * (1 - 0.85 * seg(v, [258, 290])) * (1 - seg(v, [292, 300]));
      const u = easeInOut(seg(v, [182, 212])); // 02.6
      if (u <= 0) f.copy(tfHold);
      else if (u >= 1) f.copy(tcHold).add(this.restOffset);
      else PATH.workFlight.getPointAt(u, f).addScaledVector(this.restOffset, u);
      this.page.rotation.set(0, 0, -0.25 * Math.sin(u * Math.PI));
    } else if (v >= 706 && v < 792) {
      po = seg(v, [706, 712]) * (1 - seg(v, [780, 792]));
      this.b.set(GATE_X + 0.35, 0.95, LANE_Z + 0.1);
      const u = easeInOut(seg(v, [712, 740])); // 04.7
      f.copy(tfHold).lerp(this.b, u);
      f.y += Math.sin(u * Math.PI) * 0.7;
      this.page.rotation.set(0, 0, 0.2 * Math.sin(u * Math.PI));
    }
    this.page.visible = po > 0.01;
    this.pageMat.opacity = po;

    // ---------- The promise: a coin leaves the client and stops halfway (02.8) ----------
    const lo = window01(v, [215, 222], [290, 300]);
    const d = easeOut(seg(v, [215, 250]));
    this.promise.draw(d);
    this.promise.fade(lo);
    this.promiseRest.set(seg(v, [236, 252]), 0.3 * lo);
    PATH.promise.getPointAt(d, this.b);
    this.pulse.position.copy(this.b);
    this.pulse.position.y += 0.06;
    this.pulse.visible = lo > 0.01 && d > 0.02;
    this.pulseRing.position.copy(this.b);
    this.pulseRing.position.y += 0.06;
    const ping = (v - 250) / 40;
    this.pulseRing.visible = lo > 0.01 && ping > 0 && ping < 1;
    this.pulseRing.scale.setScalar(1 + 1.2 * Math.max(0, ping));
    this.ringMat.opacity = Math.max(0, 1 - ping) * 0.6 * lo;

    // ---------- The seam of light (02.16) ----------
    const grow = easeOut(seg(v, [344, 366]));
    const so = v < 395 ? Math.min(1, grow * 1.3) * (1 - seg(v, [380, 395])) : 0;
    this.seamL.draw(grow);
    this.seamR.draw(grow);
    this.seamL.fade(so);
    this.seamR.fade(so);
    this.seamMat.opacity = so * 0.8;
    this.seamGlow.visible = so > 0.01;
  }
}

/** Chapters 06–08 (board "Ribbon · 06–09"): the record as beads, does / doesn't, the plan. */
export class Facts {
  readonly group = new Group();
  private record: Ribbon;
  private recordBeads: Mesh[] = [];
  private does: Ribbon;
  private doesBeads: Mesh[] = [];
  private doesnt: Dots;
  private rings: Mesh[] = [];
  private plan: Ribbon;
  private nodes: Mesh[] = [];
  private nowRing: Mesh;
  private nowMat: MeshBasicMaterial;

  constructor(kit: Kit) {
    const bead = new MeshPhysicalMaterial({ color: 0x7b2fbe, roughness: 0.25, clearcoat: 1, emissive: 0x5a1d9e, emissiveIntensity: 0.8 });
    const core = new MeshBasicMaterial({ color: LINE, toneMapped: false });
    const hollow = new MeshBasicMaterial({ color: 0x9ca3af, transparent: true, opacity: 0.85 });
    const dark = new MeshPhysicalMaterial({ color: 0x270a4d, roughness: 0.3, clearcoat: 1, emissive: 0x160530 });
    kit.materials.push(bead, core, hollow, dark);
    const sphere = kit.geo(new SphereGeometry(0.11, 32, 24));
    const dotGeo = kit.geo(new SphereGeometry(0.04, 16, 12));
    const ring = kit.geo(new TorusGeometry(0.1, 0.014, 8, 40));

    this.record = new Ribbon(kit, PATH.record, { color: [0x818cf8, 0xb87aed], radius: 0.026 });
    this.group.add(this.record.group);
    for (const t of RECORD_T) {
      const g = new Mesh(sphere, dark);
      g.add(new Mesh(dotGeo, core));
      PATH.record.getPointAt(t, g.position);
      this.recordBeads.push(g);
      this.group.add(g);
    }

    this.does = new Ribbon(kit, PATH.does, { color: 0xb87aed, radius: 0.026 });
    this.group.add(this.does.group);
    for (let k = 0; k < 4; k++) {
      const g = new Mesh(sphere, bead);
      PATH.does.getPointAt(0.2 + k * 0.22, g.position);
      this.doesBeads.push(g);
      this.group.add(g);
    }
    this.doesnt = new Dots(kit, PATH.doesnt, 0.12, 0.012, LINE);
    this.group.add(this.doesnt.mesh);
    for (let k = 0; k < 5; k++) {
      const r = new Mesh(ring, hollow);
      PATH.doesnt.getPointAt(0.12 + k * 0.19, r.position);
      this.rings.push(r);
      this.group.add(r);
    }

    this.plan = new Ribbon(kit, PATH.plan, { color: [0xb87aed, 0x818cf8], radius: 0.03 });
    this.group.add(this.plan.group);
    PLAN_T.forEach((t, k) => {
      const n = new Mesh(sphere, k === 0 ? bead : dark);
      PATH.plan.getPointAt(t, n.position);
      n.position.y += 0.05;
      this.nodes.push(n);
      this.group.add(n);
    });
    this.nowMat = new MeshBasicMaterial({ color: 0xb87aed, transparent: true, toneMapped: false });
    kit.materials.push(this.nowMat);
    this.nowRing = new Mesh(kit.geo(new TorusGeometry(0.18, 0.012, 8, 48)), this.nowMat);
    this.nowRing.rotation.x = -Math.PI / 2;
    this.nowRing.position.copy(this.nodes[0].position);
    this.group.add(this.nowRing);
  }

  update(v: number, now: number, still: boolean, camQuat: { x: number; y: number; z: number; w: number }, portrait = false) {
    const on = v >= 1830 && v < 2300;
    this.group.visible = on;
    if (!on) return;
    // 06.14: the release record unrolls as a ribbon of beads; fades as the facts arrive.
    const rec = seg(v, [1835, 1875]);
    const recOut = 1 - seg(v, [1862, 1890]);
    this.record.draw(rec);
    this.record.fade(recOut);
    this.recordBeads.forEach((b, k) => b.scale.setScalar(Math.max(0.001, easeOut(seg(v, [1840 + k * 6, 1850 + k * 6])) * recOut)));

    // 07: does = lit ribbon, one bead per item (07.5); doesn't = dotted line, hollow rings (07.7).
    const factsOut = 1 - seg(v, [2040, 2062]);
    this.does.draw(seg(v, [1872, 1902]));
    this.does.fade(factsOut);
    this.doesBeads.forEach((b, k) => b.scale.setScalar(Math.max(0.001, easeOut(seg(v, [1905 + k * 10, 1913 + k * 10])) * factsOut)));
    this.doesnt.set(seg(v, [1876, 1906]), 0.4 * factsOut);
    this.rings.forEach((r, k) => {
      r.scale.setScalar(Math.max(0.001, easeOut(seg(v, [1950 + k * 10, 1958 + k * 10])) * factsOut));
      r.quaternion.set(camQuat.x, camQuat.y, camQuat.z, camQuat.w);
    });

    // 08: the plan on one ribbon; NOW pulses (08.6).
    // In portrait the timeline is a vertical list, so the flat plan ribbon stays hidden.
    const planOut = portrait ? 0 : 1 - seg(v, [2272, 2295]);
    this.plan.draw(seg(v, [2050, 2110]));
    this.plan.fade(planOut);
    this.nodes.forEach((n, k) => n.scale.setScalar(Math.max(0.001, easeOut(seg(v, [2120 + k * 12, 2130 + k * 12])) * planOut)));
    const pulse = still ? 0.4 : (now * 0.5) % 1;
    this.nowRing.visible = seg(v, [2120, 2130]) > 0 && planOut > 0.01;
    this.nowRing.scale.setScalar(1 + pulse * 1.4);
    this.nowMat.opacity = (1 - pulse) * 0.7 * planOut;
  }
}
