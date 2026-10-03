import { CircleGeometry, Group, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, SphereGeometry, TorusGeometry, TubeGeometry, Color } from 'three';
import { bell, easeInOut, lerp, seg } from '../../motion/timeline';
import { Kit, Trigger } from '../kit';
import { PATH } from '../paths';
import { Dots, Ribbon, archCurve, circleCurve, curve } from '../ribbon';
import { FUND_HERO, FUND_IDEA, LOOP_R } from '../world';

const CLIENT = 0x818cf8;
const FREE = 0xb87aed;
const LINE = 0xf0e4ff;

/**
 * The Fund as a loop of ribbon that closes with a clasp (board "Ribbon · 02–03"): the hero (01),
 * built and locked between the two pebbles (03), opened into lanes (03.15), rebuilt at the close (09).
 */
export class FundLoop {
  readonly group = new Group();
  readonly extras = new Group();
  private ring: Ribbon;
  private clasp = new Group();
  private claspMat: MeshPhysicalMaterial;
  private disc: Mesh;
  private discMat: MeshBasicMaterial;
  private ripples: Mesh[] = [];
  private rippleMat: MeshBasicMaterial;
  private ghosts: Ribbon[] = [];
  private clientIn: Ribbon;
  private freeOn: Dots;
  private closeIn: Ribbon;
  private closeOn: Dots;
  private nextGate: Ribbon;
  private ripple = new Trigger(575);

  constructor(kit: Kit) {
    this.ring = new Ribbon(kit, circleCurve(LOOP_R), { color: [CLIENT, FREE], radius: 0.03, segments: 200, closed: true });
    this.group.add(this.ring.group);

    // Clasp: a dark bead in a lit ring with a small shackle (03.9).
    this.claspMat = new MeshPhysicalMaterial({ color: 0x160530, roughness: 0.25, clearcoat: 1, emissive: new Color(0x3d1270), transparent: true });
    kit.materials.push(this.claspMat);
    const lit = new MeshBasicMaterial({ color: 0xd4b5f7, transparent: true, toneMapped: false });
    kit.materials.push(lit);
    this.clasp.add(new Mesh(kit.geo(new SphereGeometry(0.11, 32, 24)), this.claspMat));
    const ring = new Mesh(kit.geo(new TorusGeometry(0.11, 0.012, 8, 40)), lit);
    ring.position.z = 0.01;
    this.clasp.add(ring);
    const shackle = new Mesh(kit.geo(new TorusGeometry(0.055, 0.013, 8, 24, Math.PI)), lit);
    shackle.position.set(0, 0.05, 0.08);
    this.clasp.add(shackle);
    const body = new Mesh(kit.geo(new SphereGeometry(0.045, 16, 12)), lit);
    body.scale.set(1.2, 0.9, 0.4);
    body.position.set(0, -0.01, 0.1);
    this.clasp.add(body);
    this.clasp.position.set(0, LOOP_R, 0.02);
    this.group.add(this.clasp);

    // "You can see it's there": a faint glass disc inside the loop (03.10).
    this.discMat = new MeshBasicMaterial({ color: 0xf0e4ff, transparent: true, opacity: 0, depthWrite: false });
    kit.materials.push(this.discMat);
    this.disc = new Mesh(kit.geo(new CircleGeometry(LOOP_R * 0.95, 64)), this.discMat);
    this.disc.position.z = -0.02;
    this.group.add(this.disc);

    // Ripples where the client's reach meets the loop (03.12).
    this.rippleMat = new MeshBasicMaterial({ color: CLIENT, transparent: true, opacity: 0, toneMapped: false });
    kit.materials.push(this.rippleMat);
    for (let i = 0; i < 3; i++) {
      const arc: [number, number, number][] = [];
      for (let k = 0; k <= 10; k++) {
        const a = Math.PI * 0.72 + (k / 10) * Math.PI * 0.56;
        arc.push([Math.cos(a), Math.sin(a), 0]);
      }
      const m = new Mesh(kit.geo(new TubeGeometry(curve(arc), 40, 0.012, 6, false)), this.rippleMat);
      this.ripples.push(m);
      this.group.add(m);
    }

    // Hero: two faint gates waiting behind the loop (01.5).
    for (const dx of [-0.75, 0.75]) {
      const g = new Ribbon(kit, archCurve(0.5, 0.75), { color: 0xb87aed, radius: 0.016, halo: false });
      g.group.position.set(FUND_HERO.x + dx, 0, -1.6);
      this.ghosts.push(g);
      this.extras.add(g.group);
    }

    // Connections to the pebbles.
    this.clientIn = new Ribbon(kit, PATH.clientToLoop, { color: CLIENT, radius: 0.026 });
    this.freeOn = new Dots(kit, PATH.loopToFree, 0.11, 0.012, LINE);
    this.closeIn = new Ribbon(kit, PATH.closeIn, { color: CLIENT, radius: 0.026 });
    this.closeOn = new Dots(kit, PATH.closeOn, 0.1, 0.012, LINE);
    this.nextGate = new Ribbon(kit, archCurve(0.32, 0.36), { color: 0xd4b5f7, radius: 0.014, halo: false });
    this.nextGate.group.position.set(2.62, 0.02, 0.6);
    this.extras.add(this.clientIn.group, this.freeOn.mesh, this.closeIn.group, this.closeOn.mesh, this.nextGate.group);
  }

  /** `entry` is 0→1 over the hero's time-based entrance. Returns where the loop is, for the coins. */
  update(v: number, now: number, entry: number) {
    let show = true;
    let draw = 1;
    let fade = 1;
    let clasp = 1;
    let click = 0;
    let glass = 0;
    let rip = -1;
    if (v < 120) {
      this.group.position.copy(FUND_HERO);
      const open = seg(v, [50, 92]); // 01.13: the loop opens, the coins fall to the client
      draw = entry * (1 - open);
      clasp = entry * (1 - seg(v, [44, 56]));
      show = draw > 0.001;
    } else if (v >= 420 && v < 645) {
      this.group.position.copy(FUND_IDEA);
      draw = easeInOut(seg(v, [425, 528])); // 03.4 + 03.8: the loop closes as the coins arrive
      clasp = seg(v, [526, 534]);
      click = bell(seg(v, [530, 538]));
      glass = seg(v, [540, 556]);
      rip = this.ripple.update(v, now);
      const open = easeInOut(seg(v, [600, 632])); // 03.15: opens into the two lanes
      draw *= 1 - open;
      fade = 1 - seg(v, [625, 640]);
      clasp *= 1 - seg(v, [598, 606]);
      glass *= 1 - open;
    } else if (v >= 2260) {
      this.group.position.copy(FUND_HERO);
      draw = easeInOut(seg(v, [2265, 2310])); // 09.2
      clasp = seg(v, [2310, 2316]);
      click = bell(seg(v, [2316, 2324])); // 09.5
    } else {
      show = false;
    }
    this.group.visible = show;
    this.ring.draw(draw);
    this.ring.fade(fade);
    this.clasp.visible = clasp > 0.01;
    this.clasp.scale.setScalar(Math.max(0.001, clasp * (1 + 0.25 * click)));
    this.claspMat.emissiveIntensity = 1 + 2 * click;
    this.discMat.opacity = 0.07 * glass;
    const ripT = rip >= 0 && rip < 0.9 ? rip / 0.9 : -1;
    this.ripples.forEach((m, i) => {
      const k = ripT < 0 ? 0 : Math.max(0, Math.min(1, ripT * 1.6 - i * 0.25));
      m.visible = k > 0 && k < 1;
      m.scale.setScalar(LOOP_R * (1.1 + 0.35 * k + i * 0.12));
    });
    this.rippleMat.opacity = ripT < 0 ? 0 : 0.8 * (1 - ripT);

    // Ghost gates with the hero loop only.
    this.ghosts.forEach((g) => {
      g.draw(1);
      g.fade(0.28 * entry * (1 - seg(v, [50, 92])));
    });

    // 03: the client's ribbon into the loop; the dotted way on to the freelancer.
    this.clientIn.draw(seg(v, [470, 500]));
    this.clientIn.fade((1 - seg(v, [598, 612])) * (v >= 420 && v < 640 ? 1 : 0));
    this.freeOn.set(seg(v, [540, 560]), 0.35 * (1 - seg(v, [598, 612])) * (v >= 420 && v < 640 ? 1 : 0));
    // 09: the same, around the rebuilt loop, and the next gate closing behind.
    const c = v >= 2260 ? 1 : 0;
    this.closeIn.draw(seg(v, [2296, 2316]));
    this.closeIn.fade(c);
    this.closeOn.set(seg(v, [2316, 2330]), 0.35 * c);
    this.nextGate.draw(seg(v, [2318, 2334]));
    this.nextGate.fade(c * lerp(0.9, 0.45, seg(v, [2334, 2350])));
    return this.group.position;
  }
}
