import { CylinderGeometry, Euler, InstancedMesh, Matrix4, Quaternion, Vector3, DynamicDrawUsage } from 'three';
import { clamp, easeIn, easeInOut, easeOut, lerp, seg, type Range } from '../../motion/timeline';
import type { Kit } from '../kit';
import { FORK, FUND_HERO, FUND_IDEA, FUND_SIZE, LANE_Z, SET_X, TRACK_END, WALLET } from '../world';

type Ctx = { now: number; tcHand: Vector3; tfHand: Vector3; still: boolean };

const GOLDEN = 2.399963;

/**
 * Every USDC coin in the story, as one InstancedMesh (one draw call). Each coin's place is a pure
 * function of the story position, so scrolling back plays everything in reverse.
 * Coin 1 hands over to the dedicated ₫ coin in chapter 05.
 */
export class Coins {
  readonly mesh: InstancedMesh;
  private m = new Matrix4();
  private q = new Quaternion();
  private e = new Euler();
  private p = new Vector3();
  private s = new Vector3();
  private a = new Vector3();
  private b = new Vector3();
  private c = new Vector3();

  constructor(
    kit: Kit,
    readonly count: number,
  ) {
    const geo = kit.geo(new CylinderGeometry(0.16, 0.16, 0.05, 28));
    const mat = kit.std(0x2775ca, { emissive: 0x0b3a75, emissiveIntensity: 0.5, roughness: 0.35, metalness: 0.4 });
    this.mesh = new InstancedMesh(geo, mat, count);
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.mesh.frustumCulled = false;
  }

  private half() {
    return Math.ceil(this.count / 2);
  }

  /** A small stack in the hands. */
  private handPile(i: number, centre: Vector3, out: Vector3) {
    const k = i % 18;
    return out.set(centre.x + ((k % 3) - 1) * 0.09, centre.y + Math.floor(k / 3) * 0.035, centre.z + (((i * 7) % 3) - 1) * 0.05);
  }

  /** Neat layers inside a Fund-sized box. */
  private fundSlot(i: number, centre: Vector3, out: Vector3) {
    const x = ((i % 4) - 1.5) * 0.28;
    const z = ((Math.floor(i / 4) % 3) - 1) * 0.26;
    const y = -FUND_SIZE.h / 2 + 0.12 + Math.floor(i / 12) * 0.06;
    return out.set(centre.x + x, centre.y + y, centre.z + z);
  }

  /** A pile on a lane of the track. */
  private lanePile(j: number, x: number, z: number, out: Vector3) {
    return out.set(x + ((j % 4) - 1.5) * 0.12, 0.06 + Math.floor(j / 4) * 0.05, z + (((j * 5) % 3) - 1) * 0.08);
  }

  private orbit(i: number, t: number, out: Vector3) {
    const th = t * 0.15 + i * GOLDEN;
    const r = 0.25 + (i % 3) * 0.13;
    const y = -0.5 + (((i * 7) % 10) / 10) * 1.0;
    return out.set(FUND_HERO.x + Math.cos(th) * r, FUND_HERO.y + y, FUND_HERO.z + Math.sin(th) * r * 0.8);
  }

  /** Quadratic arc from a to b, peaking `h` above the midpoint. */
  private arc(a: Vector3, b: Vector3, h: number, t: number, out: Vector3) {
    this.c.copy(a).add(b).multiplyScalar(0.5);
    this.c.y += h;
    const u = 1 - t;
    return out.set(
      u * u * a.x + 2 * u * t * this.c.x + t * t * b.x,
      u * u * a.y + 2 * u * t * this.c.y + t * t * b.y,
      u * u * a.z + 2 * u * t * this.c.z + t * t * b.z,
    );
  }

  update(v: number, ctx: Ctx) {
    const t = ctx.still ? 0 : ctx.now;
    const half = this.half();
    for (let i = 0; i < this.count; i++) {
      const g1 = i < half;
      const j = g1 ? i : i - half;
      const k12 = i % 12;
      let sc = 1;
      let spin = 0;
      let flat = 1; // 1 = lying flat, 0 = standing on edge
      const p = this.p;

      if (v < 56) {
        this.orbit(i, t, p); // 01.4
        spin = t * 0.6 + i;
        flat = 0.3;
      } else if (v < 120) {
        const r: Range = [56 + k12 * 3, 56 + k12 * 3 + 28]; // 01.15
        this.orbit(i, t, this.a);
        this.handPile(i, ctx.tcHand, this.b);
        this.arc(this.a, this.b, 1.0, easeIn(seg(v, r)), p);
        spin = (1 - seg(v, r)) * 4;
      } else if (v < 300) {
        this.handPile(i, ctx.tcHand, p);
        sc = 1 - seg(v, [262 + (i % 8) * 2, 262 + (i % 8) * 2 + 18]); // 02.11
      } else if (v < 380) {
        sc = seg(v, [300, 312]) * (1 - seg(v, [356, 380]));
        const r: Range = [310 + (i % 8) * 1.5, 310 + (i % 8) * 1.5 + 14]; // 02.14
        this.handPile(i, ctx.tcHand, this.a);
        this.handPile(i, ctx.tfHand, this.b);
        this.arc(this.a, this.b, 1.2, easeInOut(seg(v, r)), p);
      } else if (v < 470) {
        sc = 0;
        p.set(0, -10, 0);
      } else if (v < 528) {
        sc = seg(v, [470, 480]);
        const r: Range = [485 + k12 * 2, 485 + k12 * 2 + 19]; // 03.8
        this.handPile(i, ctx.tcHand, this.a);
        this.fundSlot(i, FUND_IDEA, this.b);
        this.arc(this.a, this.b, 1.1, easeInOut(seg(v, r)), p);
      } else if (v < 620) {
        this.fundSlot(i, FUND_IDEA, p);
      } else if (v < 1100 || (!g1 && v < 2220)) {
        // Into two piles, one per milestone (04.4).
        this.fundSlot(i, FUND_IDEA, this.a);
        const lane = g1 ? LANE_Z : -LANE_Z;
        this.lanePile(j, 0, lane, this.b);
        p.copy(this.a).lerp(this.b, easeInOut(seg(v, [620 + (i % 6) * 3, 700 + (i % 6) * 2])));
        if (g1) {
          // Pile 1: through gate 1 to the freelancer's end (04.11), then on to the fork (04.22).
          const go = easeInOut(seg(v, [782 + (j % 6) * 2, 818 + (j % 6) * 2]));
          const on = easeInOut(seg(v, [995 + (j % 6) * 2, 1032 + (j % 6) * 1.3]));
          p.x += go * TRACK_END + on * (FORK.x - TRACK_END);
          p.y += Math.abs(Math.sin(go * Math.PI * 3)) * 0.08 * (go < 1 ? 1 : 0);
          spin = (go + on) * 10;
          if (j === 1 && v >= 1040) sc = 0; // the ₫ coin takes over
        } else {
          // Pile 2: deadline missed, rolls back to the client (04.16).
          const back = easeInOut(seg(v, [905 + (j % 6) * 2, 942 + (j % 6) * 1.3]));
          p.x -= back * TRACK_END;
          spin = -back * 10;
          sc = 1 - seg(v, [1000, 1040]);
        }
      } else if (v < 2220) {
        // Chapter 05: coin 0 runs branch A into the wallet (05.7); the rest leave quietly.
        if (j === 0) {
          this.lanePile(j, FORK.x, LANE_Z, this.a);
          this.b.set(WALLET.x, 0.5, WALLET.z);
          this.arc(this.a, this.b, 0.6, easeInOut(seg(v, [1100, 1140])), p);
          sc = 1 - seg(v, [1135, 1141]);
        } else {
          this.lanePile(j, FORK.x, LANE_Z, p);
          sc = j === 1 ? 0 : 1 - seg(v, [1150 + (j % 5) * 4, 1170 + (j % 5) * 4]);
        }
      } else if (v < 2260) {
        // 08.9: lift off the timeline.
        const x = SET_X - 4 + (i % 9) * 0.95;
        sc = seg(v, [2220, 2230]);
        p.set(x, lerp(0.1, 2, easeOut(seg(v, [2225 + (i % 9) * 2, 2245 + (i % 9) * 2]))), ((i * 3) % 5) * 0.15 - 0.3);
        spin = t + i;
      } else {
        // 09.3: settle into the rebuilt Fund.
        const x = SET_X - 4 + (i % 9) * 0.95;
        this.a.set(x, 2, ((i * 3) % 5) * 0.15 - 0.3);
        this.fundSlot(i, FUND_HERO, this.b);
        const r: Range = [2275 + k12 * 1.5, 2275 + k12 * 1.5 + 18];
        this.arc(this.a, this.b, 2.5, easeInOut(seg(v, r)), p);
        spin = (1 - seg(v, r)) * 6;
      }

      this.e.set((1 - flat) * (Math.PI / 2), spin, 0);
      this.q.setFromEuler(this.e);
      const s = clamp(sc) * 1;
      this.s.set(s, s, s);
      this.m.compose(p, this.q, this.s);
      this.mesh.setMatrixAt(i, this.m);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
