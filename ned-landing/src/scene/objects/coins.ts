import { DynamicDrawUsage, Euler, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';
import { clamp, easeIn, easeInOut, easeOut, seg, type Range } from '../../motion/timeline';
import type { Kit } from '../kit';
import { COIN_H, coinGeometry, coinMaterials } from '../coin';
import { PATH, PLAN_T } from '../paths';
import { FORK, FUND_HERO, FUND_IDEA, LOOP_R } from '../world';

type Ctx = { now: number; tcHold: Vector3; tfHold: Vector3; still: boolean };

/**
 * Every USDC coin in the story, as one InstancedMesh (milled-edge coin, board "Coins").
 * Each coin's place is a pure function of the story position, so scrolling back plays it in reverse.
 * Coins ride the same centre lines as the ribbons (paths.ts). Coin 1 of pile 1 hands over to the ₫ coin.
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
    this.mesh = new InstancedMesh(coinGeometry(kit), coinMaterials(kit, 'usdc'), count);
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.mesh.frustumCulled = false;
  }

  /** Neat stacks around a centre: `stacks` columns side by side. */
  private stack(i: number, centre: Vector3, stacks: number, gap: number, out: Vector3) {
    const col = i % stacks;
    const level = Math.floor(i / stacks);
    const x = (col - (stacks - 1) / 2) * gap + ((i * 37) % 7) * 0.004;
    const z = ((i * 13) % 3) * 0.012;
    return out.set(centre.x + x, centre.y + level * (COIN_H + 0.004), centre.z + z);
  }

  /** Inside the loop, resting on its lower curve. */
  private inLoop(i: number, centre: Vector3, out: Vector3) {
    this.c.set(centre.x, centre.y - LOOP_R * 0.66, centre.z + 0.06);
    return this.stack(i, this.c, 4, 0.22, out);
  }

  private onPath(path: keyof typeof PATH, t: number, out: Vector3) {
    return PATH[path].getPointAt(clamp(t), out);
  }

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
    const half = Math.ceil(this.count / 2);
    for (let i = 0; i < this.count; i++) {
      const g1 = i < half;
      const j = g1 ? i : i - half;
      const k = i % 12;
      let sc = 1;
      let spin = i * 0.7;
      // At rest the coins lean toward the camera so their faces read, not just their edges.
      let tilt = 0.42;
      const p = this.p;

      if (v < 56) {
        this.inLoop(i, FUND_HERO, p); // 01.4: the money waits in the hero loop
        p.y += Math.sin(t * 1.1 + (i % 3)) * 0.008;
      } else if (v < 120) {
        const r: Range = [56 + k * 3, 56 + k * 3 + 26]; // 01.15
        this.inLoop(i, FUND_HERO, this.a);
        this.stack(i, ctx.tcHold, 3, 0.2, this.b);
        const u = easeIn(seg(v, r));
        this.arc(this.a, this.b, 0.9, u, p);
        tilt = 0.42 + Math.sin(u * Math.PI) * 0.5;
      } else if (v < 300) {
        this.stack(i, ctx.tcHold, 3, 0.2, p);
        sc = 1 - seg(v, [262 + (i % 8) * 2, 262 + (i % 8) * 2 + 16]); // 02.11
      } else if (v < 380) {
        sc = seg(v, [300, 312]) * (1 - seg(v, [356, 380]));
        const r: Range = [310 + (i % 8) * 1.5, 310 + (i % 8) * 1.5 + 14]; // 02.14
        this.stack(i, ctx.tcHold, 3, 0.2, this.a);
        this.stack(i, ctx.tfHold, 3, 0.2, this.b);
        const u = easeInOut(seg(v, r));
        this.arc(this.a, this.b, 1.0, u, p);
        tilt = 0.42 + Math.sin(u * Math.PI) * 0.5;
      } else if (v < 470) {
        sc = 0;
        p.set(0, -10, 0);
      } else if (v < 528) {
        sc = seg(v, [470, 480]);
        const r: Range = [485 + k * 2, 485 + k * 2 + 18]; // 03.8
        this.stack(i, ctx.tcHold, 3, 0.2, this.a);
        this.inLoop(i, FUND_IDEA, this.b);
        const u = easeInOut(seg(v, r));
        this.arc(this.a, this.b, 0.7, u, p);
        tilt = 0.42 + Math.sin(u * Math.PI) * 0.4;
      } else if (v < 620) {
        this.inLoop(i, FUND_IDEA, p);
      } else if (v < 1100 || (!g1 && v < 2220)) {
        // Into two piles, one per lane (03.15 / 04.4).
        this.inLoop(i, FUND_IDEA, this.a);
        this.onPath(g1 ? 'release' : 'giveBack', 0, this.c);
        this.stack(j, this.c, 2, 0.24, this.b);
        p.copy(this.a).lerp(this.b, easeInOut(seg(v, [620 + (i % 6) * 3, 700 + (i % 6) * 2])));
        if (g1) {
          // Pile 1 rides lane 1 through the green gate (04.11), then the trunk to the fork (04.22).
          const go = seg(v, [782 + (j % 6) * 2.5, 820 + (j % 6) * 2]);
          const on = seg(v, [995 + (j % 6) * 2, 1030 + (j % 6) * 1.5]);
          if (go > 0) {
            this.onPath('release', easeInOut(go), this.a);
            this.onPath('release', 1, this.c);
            this.stack(j, this.c, 2, 0.24, this.b);
            const settle = seg(go, [0.85, 1]);
            p.copy(this.a).lerp(this.b, settle);
            p.y += Math.sin(go * Math.PI) * 0.12 + (1 - settle) * (j % 6) * 0.004;
            tilt = 0.42 + Math.sin(go * Math.PI) * 0.4;
          }
          if (on > 0) {
            this.onPath('trunk', easeInOut(on), this.a);
            this.c.set(FORK.x, 0.06, FORK.z);
            this.stack(j, this.c, 2, 0.24, this.b);
            p.copy(this.a).lerp(this.b, seg(on, [0.85, 1]));
            p.y += Math.sin(on * Math.PI) * 0.1;
            tilt = 0.42 + Math.sin(on * Math.PI) * 0.4;
          }
        } else {
          // Pile 2: deadline missed, back along the amber curl to the client (04.16).
          const back = seg(v, [905 + (j % 6) * 2.5, 942 + (j % 6) * 1.5]);
          if (back > 0) {
            this.onPath('giveBack', easeInOut(back), this.a);
            this.onPath('giveBack', 1, this.c);
            this.stack(j, this.c, 2, 0.24, this.b);
            p.copy(this.a).lerp(this.b, seg(back, [0.85, 1]));
            p.y += Math.sin(back * Math.PI) * 0.1;
            tilt = 0.42 + Math.sin(back * Math.PI) * 0.4;
          }
          sc = 1 - seg(v, [1000, 1040]);
        }
      } else if (v < 2220) {
        // 05: coin 0 rides branch A into the wallet (05.7); the rest leave quietly.
        this.c.set(FORK.x, 0.06, FORK.z);
        if (j === 0) {
          const u = easeInOut(seg(v, [1100, 1140]));
          this.onPath('branchA', u, p);
          p.y += 0.12 + Math.sin(u * Math.PI) * 0.15;
          sc = 1 - seg(v, [1136, 1142]);
          tilt = 0.4;
        } else {
          this.stack(j, this.c, 2, 0.24, p);
          // the rest of the pile leaves as the camera turns to branch A; a fresh coin starts branch B (05.13)
          sc = 1 - seg(v, [1104 + (j % 5) * 4, 1122 + (j % 5) * 4]);
        }
      } else if (v < 2260) {
        // 08.9: lift off the plan ribbon.
        this.onPath('plan', PLAN_T[i % 4] + ((i >> 2) % 3) * 0.04 - 0.04, this.a);
        sc = seg(v, [2220, 2230]);
        p.copy(this.a);
        p.y += 1.9 * easeOut(seg(v, [2225 + (i % 9) * 2, 2245 + (i % 9) * 2]));
        spin = t + i;
      } else {
        // 09.3: settle into the rebuilt loop.
        this.onPath('plan', PLAN_T[i % 4] + ((i >> 2) % 3) * 0.04 - 0.04, this.a);
        this.a.y += 1.9;
        this.inLoop(i, FUND_HERO, this.b);
        const r: Range = [2275 + k * 1.5, 2275 + k * 1.5 + 18];
        const u = easeInOut(seg(v, r));
        this.arc(this.a, this.b, 2.2, u, p);
        tilt = 0.42 + Math.sin(u * Math.PI) * 0.5;
      }

      this.e.set(tilt, spin * 0.15, 0);
      this.q.setFromEuler(this.e);
      const s = clamp(sc);
      this.s.set(s, s, s);
      this.m.compose(p, this.q, this.s);
      this.mesh.setMatrixAt(i, this.m);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
