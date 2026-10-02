import { ConeGeometry, Group, Mesh, type MeshBasicMaterial, type MeshStandardMaterial } from 'three';
import { easeBack, easeInOut, easeOut, seg } from '../../motion/timeline';
import { Bar, Kit, fadeMat } from '../kit';
import { FORK, GATE_X, LANE_Z, TRACK_END, v3 } from '../world';

const RING = 36;

class Gate {
  readonly group = new Group();
  readonly doorL = new Group();
  readonly doorR = new Group();
  readonly doorMat: MeshStandardMaterial;

  constructor(kit: Kit, frame: MeshStandardMaterial, z: number) {
    this.doorMat = kit.std(0x3d1270, { emissive: 0x7b2fbe, emissiveIntensity: 0.4, opacity: 0.85 });
    this.group.position.set(GATE_X, 0, z);
    // The gate spans the lane along z; doors hinge on the posts.
    this.group.add(kit.box(0.08, 1.1, 0.08, frame, 0, 0.55, -0.36));
    this.group.add(kit.box(0.08, 1.1, 0.08, frame, 0, 0.55, 0.36));
    this.group.add(kit.box(0.1, 0.08, 0.84, frame, 0, 1.12, 0));
    this.doorL.position.set(0, 0, -0.34);
    this.doorL.add(kit.box(0.04, 0.9, 0.34, this.doorMat, 0, 0.5, 0.17));
    this.doorR.position.set(0, 0, 0.34);
    this.doorR.add(kit.box(0.04, 0.9, 0.34, this.doorMat, 0, 0.5, -0.17));
    this.group.add(this.doorL, this.doorR);
  }

  /** open 0→1; dir +1 swings toward the freelancer, −1 toward the client. */
  set(open: number, dir: number) {
    const a = 1.4 * open * dir;
    this.doorL.rotation.y = a;
    this.doorR.rotation.y = -a;
  }
}

/** Chapter 04: two lanes, one gate per milestone, a timer on gate 2; the trunk on to the fork. */
export class Track {
  readonly group = new Group();
  private platformMat: MeshStandardMaterial;
  private laneMat: MeshBasicMaterial;
  private frameMat: MeshStandardMaterial;
  private gate1: Gate;
  private gate2: Gate;
  private ring: Mesh[] = [];
  private ringMat: MeshBasicMaterial;
  private ringDim: MeshBasicMaterial;
  private arrow: Mesh;
  private arrowMat: MeshBasicMaterial;
  private trunk: Bar;

  constructor(kit: Kit) {
    this.platformMat = kit.std(0x160530, { emissive: 0x270a4d, emissiveIntensity: 0.6, opacity: 0.9 });
    this.laneMat = kit.basic(0xb87aed, 1);
    this.frameMat = kit.std(0xd4b5f7, { emissive: 0x7b2fbe, emissiveIntensity: 0.5 });
    this.group.add(kit.box(TRACK_END * 2 + 0.8, 0.06, 2.6, this.platformMat, 0, -0.03, 0));
    for (const z of [LANE_Z, -LANE_Z]) this.group.add(kit.box(TRACK_END * 2 + 0.6, 0.012, 0.05, this.laneMat, 0, 0.01, z));
    this.gate1 = new Gate(kit, this.frameMat, LANE_Z);
    this.gate2 = new Gate(kit, this.frameMat, -LANE_Z);
    this.group.add(this.gate1.group, this.gate2.group);

    // Timer ring above gate 2 (04.14), facing the camera.
    this.ringMat = kit.basic(0xb87aed, 1);
    this.ringDim = kit.basic(0x353540, 1);
    const ringGroup = new Group();
    ringGroup.position.set(GATE_X, 1.65, -LANE_Z);
    for (let i = 0; i < RING; i++) {
      const a = (i / RING) * Math.PI * 2;
      const seg = kit.box(0.06, 0.03, 0.02, this.ringMat, Math.sin(a) * 0.26, Math.cos(a) * 0.26, 0);
      seg.rotation.z = -a;
      this.ring.push(seg);
      ringGroup.add(seg);
    }
    this.group.add(ringGroup);

    // Direction arrow on lane 2: points at the freelancer, flips toward the client at 900 (04.15).
    this.arrowMat = kit.basic(0xd4b5f7, 1);
    this.arrow = new Mesh(kit.geo(new ConeGeometry(0.1, 0.26, 12)), this.arrowMat);
    this.arrow.position.set(GATE_X + 0.55, 0.12, -LANE_Z);
    this.group.add(this.arrow);

    // The trunk from the freelancer's end on to the fork (04.22).
    this.trunk = new Bar(kit, v3(TRACK_END + 0.3, 0.01, LANE_Z), v3(FORK.x, 0.01, LANE_Z), 0.05, this.laneMat);
    this.group.add(this.trunk.mesh);
  }

  update(v: number) {
    const show = seg(v, [600, 640]) * (1 - seg(v, [1380, 1400]));
    this.group.visible = show > 0.01;
    if (!this.group.visible) return;
    fadeMat(this.platformMat, 0.9 * show);
    fadeMat(this.laneMat, show);

    // Gates rise (04.3), gate 2 twelve vh later.
    this.gate1.group.position.y = -1.3 * (1 - easeBack(seg(v, [660, 690])));
    this.gate2.group.position.y = -1.3 * (1 - easeBack(seg(v, [672, 702])));

    // Gate 1 opens on approval (04.10); green light.
    const open1 = easeOut(seg(v, [755, 785]));
    this.gate1.set(open1, 1);
    this.gate1.doorMat.emissive.setHex(open1 > 0.05 ? 0x16a34a : 0x7b2fbe);
    this.gate1.doorMat.emissiveIntensity = 0.4 + 0.6 * open1;

    // Gate 2: the timer runs down (04.14), then the gate turns back (04.15), amber, never red.
    const left = 1 - seg(v, [850, 900]);
    const lit = Math.round(left * RING);
    this.ring.forEach((m, i) => (m.material = i < lit ? this.ringMat : this.ringDim));
    this.ringMat.color.setHex(left < 0.2 ? 0xfbbf24 : 0xb87aed);
    const ringShow = seg(v, [845, 855]) * (1 - seg(v, [960, 975]));
    this.ring[0].parent!.visible = ringShow > 0.01;
    const back = easeOut(seg(v, [900, 915]));
    this.gate2.set(back, -1);
    this.gate2.doorMat.color.setHex(back > 0.05 ? 0x78350f : 0x3d1270);
    this.gate2.doorMat.emissive.setHex(back > 0.05 ? 0xf59e0b : 0x7b2fbe);
    this.gate2.doorMat.emissiveIntensity = 0.4 + 0.3 * back;
    this.arrow.rotation.z = -Math.PI / 2 + Math.PI * easeInOut(seg(v, [898, 906]));
    this.arrowMat.color.setHex(back > 0.5 ? 0xfbbf24 : 0xd4b5f7);

    this.trunk.draw(seg(v, [985, 1030]));
  }
}
