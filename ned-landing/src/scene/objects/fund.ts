import { Group, Mesh, TorusGeometry } from 'three';
import { bell, easeInOut, lerp, seg, within } from '../../motion/timeline';
import { EdgeFrame, Kit, Trigger, fadeMat } from '../kit';
import { FUND_HERO, FUND_IDEA, FUND_SIZE } from '../world';

/**
 * The Fund: a box of light where the money waits. Hero (01), built and locked (03), stretched into the
 * track (03.15), rebuilt at the close (09).
 */
export class Fund {
  readonly group = new Group();
  private faces: Mesh;
  private frame: EdgeFrame;
  private lidPivot = new Group();
  private lid: Mesh;
  private lock = new Group();
  private ghostGates = new Group();
  private faceMat;
  private edgeMat;
  private lidMat;
  private lockMat;
  private ghostMat;
  private ripple = new Trigger(575);

  constructor(kit: Kit) {
    const { w, h, d } = FUND_SIZE;
    this.faceMat = kit.std(0x7b2fbe, { emissive: 0x3d1270, emissiveIntensity: 0.6, opacity: 0.32, roughness: 0.3 });
    this.faceMat.depthWrite = false;
    this.edgeMat = kit.basic(0xd4b5f7, 1);
    this.lidMat = kit.std(0x9b4fde, { emissive: 0x5a1d9e, emissiveIntensity: 0.5, opacity: 0.5, roughness: 0.3 });
    this.lidMat.depthWrite = false;
    this.lockMat = kit.basic(0xf0e4ff, 1);
    this.ghostMat = kit.basic(0xb87aed, 0.25);

    this.faces = kit.box(w, h, d, this.faceMat);
    this.frame = new EdgeFrame(kit, w, h, d, 0.035, this.edgeMat);
    this.lidPivot.position.set(0, h / 2, -d / 2);
    this.lid = kit.box(w, 0.05, d, this.lidMat, 0, 0.03, d / 2);
    this.lidPivot.add(this.lid);

    // Lock on the front face: body + shackle.
    this.lock.position.set(0, 0.05, d / 2 + 0.03);
    this.lock.add(kit.box(0.34, 0.26, 0.05, this.lockMat, 0, -0.06, 0));
    const shackle = new Mesh(kit.geo(new TorusGeometry(0.11, 0.025, 8, 20, Math.PI)), this.lockMat);
    shackle.position.set(0, 0.07, 0);
    this.lock.add(shackle);

    this.group.add(this.faces, this.frame.group, this.lidPivot, this.lock);

    // Two faint gates behind the hero Fund (01.5): a hint of chapter 04.
    for (const x of [-0.7, 0.7]) {
      const g = new Group();
      g.add(kit.box(0.05, 1.1, 0.05, this.ghostMat, -0.3, 0.55, 0));
      g.add(kit.box(0.05, 1.1, 0.05, this.ghostMat, 0.3, 0.55, 0));
      g.add(kit.box(0.65, 0.05, 0.05, this.ghostMat, 0, 1.1, 0));
      g.position.set(FUND_HERO.x + x, 0, -1.7);
      this.ghostGates.add(g);
    }
  }

  get ghosts() {
    return this.ghostGates;
  }

  /** `entry` is 0→1 over the hero's time-based entrance after the preloader. */
  update(v: number, now: number, entry: number) {
    let visible = true;
    let face = 0.32;
    let edge = 1;
    let draw = 1;
    let lidOpen = 0;
    let lockS = 1;
    let sx = 1;
    let sy = 1;
    let scale = 1;
    let lockVis = 1;
    const pos = this.group.position;

    if (v < 120) {
      // 01: hero Fund, dissolving 50–92 (01.13).
      pos.copy(FUND_HERO);
      const dis = seg(v, [50, 92]);
      face = 0.32 * entry * (1 - dis);
      edge = entry * (1 - dis);
      scale = lerp(0.92, 1, entry) * (1 + 0.15 * dis);
      visible = dis < 1;
    } else if (v >= 420 && v < 640) {
      // 03: lines of light (03.4), faces (03.6), lid closes (03.9), glass (03.10), stretch (03.15).
      pos.copy(FUND_IDEA);
      draw = seg(v, [425, 465]);
      face = 0.55 * seg(v, [460, 480]);
      lidOpen = v < 520 ? 1 : 1 - easeInOut(seg(v, [520, 534]));
      lockVis = seg(v, [528, 534]);
      lockS = 1 + 0.12 * bell(seg(v, [530, 537]));
      face = lerp(face, 0.22, seg(v, [540, 556]));
      const rip = this.ripple.update(v, now);
      if (rip >= 0 && rip < 0.6) scale = 1 + 0.04 * Math.sin((rip / 0.6) * Math.PI);
      const st = easeInOut(seg(v, [600, 640]));
      sx = lerp(1, 3.2, st);
      sy = lerp(1, 0.35, st);
      pos.y = lerp(FUND_IDEA.y, 0.3, st);
      edge = 1 - seg(v, [615, 640]);
      face *= 1 - st;
      visible = v < 640;
    } else if (v >= 2260) {
      // 09: rebuilt at the hero spot (09.2), lid closes and the lock clicks (09.5).
      pos.copy(FUND_HERO);
      draw = seg(v, [2265, 2290]);
      face = 0.32 * seg(v, [2280, 2295]);
      lidOpen = v < 2305 ? 1 : 1 - easeInOut(seg(v, [2305, 2318]));
      lockVis = seg(v, [2312, 2318]);
      lockS = 1 + 0.12 * bell(seg(v, [2316, 2322]));
    } else {
      visible = false;
    }

    this.group.visible = visible;
    this.group.scale.set(sx * scale, sy * scale, scale);
    fadeMat(this.faceMat, face);
    fadeMat(this.edgeMat, edge);
    fadeMat(this.lidMat, 0.5 * edge * (draw > 0.9 ? 1 : 0));
    this.frame.draw(draw);
    this.lidPivot.rotation.x = -1.1 * lidOpen;
    this.lock.scale.setScalar(lockS * Math.max(0.001, lockVis));
    this.lock.visible = lockVis > 0.01 && edge > 0.05;

    // Ghost gates: with the hero Fund only.
    this.ghostGates.visible = v < 92;
    fadeMat(this.ghostMat, 0.25 * entry * (1 - seg(v, [50, 92])) * within(v, [-10, 120], 1));
  }
}
