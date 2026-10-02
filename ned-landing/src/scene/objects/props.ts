import { Group, Mesh, SphereGeometry, Vector3, type MeshBasicMaterial, type MeshStandardMaterial } from 'three';
import { easeInOut, easeOut, lerp, seg, window01 } from '../../motion/timeline';
import { Kit, fadeMat } from '../kit';
import { GATE_X, LANE_Z, SET_X } from '../world';

const DOTS = 18;

/** The work file (02.6, 04.7), the promise line (02.8) and the slot of light (02.16). */
export class Props {
  readonly group = new Group();
  private file = new Group();
  private fileMat: MeshStandardMaterial;
  private dots: Mesh[] = [];
  private dotMat: MeshBasicMaterial;
  private pulse: Mesh;
  private pulseMat: MeshBasicMaterial;
  private slot: Mesh;
  private slotMat: MeshBasicMaterial;
  private b = new Vector3();
  private c = new Vector3();

  constructor(kit: Kit) {
    this.fileMat = kit.std(0xf0e4ff, { emissive: 0x9b4fde, emissiveIntensity: 0.25, roughness: 0.5 });
    const fold = kit.std(0xb87aed, { emissive: 0x7b2fbe, emissiveIntensity: 0.4 });
    this.file.add(kit.box(0.34, 0.44, 0.05, this.fileMat));
    this.file.add(kit.box(0.24, 0.03, 0.06, fold, 0, 0.08, 0.005));
    this.file.add(kit.box(0.24, 0.03, 0.06, fold, 0, -0.02, 0.005));
    this.file.add(kit.box(0.16, 0.03, 0.06, fold, -0.04, -0.12, 0.005));
    this.group.add(this.file);

    this.dotMat = kit.basic(0xb87aed, 1);
    const dotGeo = kit.geo(new SphereGeometry(0.025, 8, 6));
    for (let i = 0; i < DOTS; i++) {
      const d = new Mesh(dotGeo, this.dotMat);
      this.dots.push(d);
      this.group.add(d);
    }
    this.pulseMat = kit.basic(0x2775ca, 1);
    this.pulse = new Mesh(kit.geo(new SphereGeometry(0.09, 16, 12)), this.pulseMat);
    this.group.add(this.pulse);

    this.slotMat = kit.basic(0xf0e4ff, 1);
    this.slot = kit.box(0.42, 1, 0.04, this.slotMat, 0, 1.1, 0);
    this.group.add(this.slot);
  }

  update(v: number, tcHand: Vector3, tfHand: Vector3) {
    // ---------- File ----------
    let fo = 0;
    const f = this.file.position;
    if (v >= 178 && v < 300) {
      fo = seg(v, [178, 184]) * (1 - 0.85 * seg(v, [258, 290])) * (1 - seg(v, [292, 300]));
      this.arc(tfHand, tcHand, 0.9, easeInOut(seg(v, [182, 212])), f);
    } else if (v >= 706 && v < 792) {
      fo = seg(v, [706, 712]) * (1 - seg(v, [780, 792]));
      this.b.set(GATE_X + 0.45, 0.95, LANE_Z);
      this.arc(tfHand, this.b, 0.8, easeInOut(seg(v, [712, 740])), f);
    }
    this.file.visible = fo > 0.01;
    this.file.rotation.y = v * 0.02;
    fadeMat(this.fileMat, fo);

    // ---------- Promise line: a pulse leaves the client and stops halfway ----------
    const lo = window01(v, [215, 222], [290, 300]);
    this.dots.forEach((d, i) => {
      d.visible = lo > 0.01;
      d.position.copy(tcHand).lerp(tfHand, (i + 1) / (DOTS + 1));
    });
    fadeMat(this.dotMat, lo * 0.7);
    const travel = 0.5 * easeOut(seg(v, [215, 250]));
    this.pulse.position.copy(tcHand).lerp(tfHand, travel);
    this.pulse.visible = lo > 0.01;
    fadeMat(this.pulseMat, lo * lerp(1, 0.35, seg(v, [250, 262])));

    // ---------- Slot of light between them (02.16) ----------
    const grow = easeOut(seg(v, [344, 366]));
    const so = v < 395 ? Math.min(1, grow * 1.2) * (1 - seg(v, [380, 395])) : 0;
    this.slot.visible = so > 0.01;
    this.slot.scale.y = Math.max(0.001, 2.2 * grow);
    fadeMat(this.slotMat, so);
  }

  private arc(a: Vector3, b: Vector3, h: number, t: number, out: Vector3) {
    this.c.copy(a).add(b).multiplyScalar(0.5);
    this.c.y += h;
    const u = 1 - t;
    out.set(
      u * u * a.x + 2 * u * t * this.c.x + t * t * b.x,
      u * u * a.y + 2 * u * t * this.c.y + t * t * b.y,
      u * u * a.z + 2 * u * t * this.c.z + t * t * b.z,
    );
  }
}

/** Chapters 07–08: the release record as a chain of blocks → two stacks → a timeline path. */
export class Plates {
  readonly group = new Group();
  private plates: Mesh[] = [];
  private doesMat: MeshStandardMaterial;
  private notMat: MeshStandardMaterial;
  private line: Mesh;
  private lineMat: MeshBasicMaterial;
  private p = new Vector3();
  private q = new Vector3();

  constructor(kit: Kit) {
    this.doesMat = kit.std(0x7b2fbe, { emissive: 0x5a1d9e, emissiveIntensity: 0.7, roughness: 0.35 });
    this.notMat = kit.std(0x1c1c24, { emissive: 0x270a4d, emissiveIntensity: 0.5, roughness: 0.6 });
    for (let k = 0; k < 9; k++) {
      const m = kit.box(1, 1, 1, k < 4 ? this.doesMat : this.notMat);
      this.plates.push(m);
      this.group.add(m);
    }
    this.lineMat = kit.basic(0xb87aed, 1);
    this.line = kit.box(9.2, 0.02, 0.05, this.lineMat, SET_X, 0.08, 0.42);
    this.group.add(this.line);
  }

  update(v: number) {
    const on = v >= 1830 && v < 2300;
    this.group.visible = on;
    if (!on) return;
    this.plates.forEach((m, k) => {
      const does = k < 4;
      const idx = does ? k : k - 4;
      // Chain (06.14).
      const chainIn = seg(v, [1835 + k * 3, 1845 + k * 3]);
      this.p.set(SET_X - 3.6 + k * 0.9, 1.0, 0);
      let sx = 0.4;
      let sy = 0.4;
      let sz = 0.4;
      // Fold into two stacks (07.2), then rise one plate per item (07.5, 07.7).
      const fold = easeInOut(seg(v, [1860, 1900]));
      this.q.set(does ? SET_X - 2.6 : SET_X + 2.6, 0.12, -1.2);
      this.p.lerp(this.q, fold);
      const rr = does ? [1905 + idx * 10, 1915 + idx * 10] : [1950 + idx * 10, 1960 + idx * 10];
      const rise = easeOut(seg(v, rr as [number, number]));
      this.p.y = lerp(this.p.y, 0.2 + idx * 0.4, rise);
      sx = lerp(sx, 1.3, rise);
      sy = lerp(sy, lerp(0.2, 0.3, rise), fold);
      sz = lerp(sz, 0.9, rise);
      // Flat into timeline tiles (07.10).
      const flat = easeInOut(seg(v, [2045 + k * 1.5, 2068 + k * 1.5]));
      this.q.set(SET_X - 4 + k * 1.0, 0.03, 0);
      this.p.lerp(this.q, flat);
      sx = lerp(sx, 0.9, flat);
      sy = lerp(sy, 0.05, flat);
      sz = lerp(sz, 0.6, flat);
      m.rotation.z = Math.PI * flat;
      m.position.copy(this.p);
      const s = chainIn * (1 - seg(v, [2280, 2300]));
      m.scale.set(Math.max(0.001, sx * s), Math.max(0.001, sy * s), Math.max(0.001, sz * s));
    });
    // Timeline line (08.2).
    const l = seg(v, [2080, 2110]);
    this.line.visible = l > 0.01;
    this.line.scale.x = Math.max(0.001, l);
    fadeMat(this.lineMat, 1 - seg(v, [2270, 2295]));
  }
}
