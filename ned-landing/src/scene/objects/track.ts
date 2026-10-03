import { Group } from 'three';
import { easeBack, easeOut, seg, within } from '../../motion/timeline';
import type { Kit } from '../kit';
import { PATH } from '../paths';
import { Beads, Ribbon, archCurve, circleCurve } from '../ribbon';
import { GATE_X, LANE_Z } from '../world';

const LILAC = 0xd4b5f7;
const GREEN = 0x4ade80;
const AMBER = 0xfbbf24;

class Gate {
  readonly group = new Group();
  readonly arch: Ribbon;
  readonly lit: Ribbon;
  constructor(kit: Kit, color: number, z: number) {
    // The gate spans the lane: an arch standing across it, all one tube.
    this.arch = new Ribbon(kit, archCurve(0.62, 0.55), { color: LILAC, radius: 0.028, taper: 0 });
    this.lit = new Ribbon(kit, archCurve(0.62, 0.55), { color, radius: 0.032, taper: 0 });
    this.group.add(this.arch.group, this.lit.group);
    this.group.position.set(GATE_X, 0.04, z);
    // Across the lane, turned toward the camera so the arch reads as an arch.
    this.group.rotation.y = 0.95;
  }
}

/** Chapter 04 (board "Ribbon · 04 gates"): two lanes from the opened loop, one arched gate each. */
export class Track {
  readonly group = new Group();
  private lane1: Ribbon;
  private lane1b: Ribbon;
  private lane2: Ribbon;
  private curl: Ribbon;
  private trunk: Ribbon;
  private beads1: Beads;
  private gate1: Gate;
  private gate2: Gate;
  private timer: Ribbon;
  private timerBack: Ribbon;

  constructor(kit: Kit) {
    this.lane1 = new Ribbon(kit, PATH.lane1, { color: [0xb87aed, 0xb87aed], radius: 0.028 });
    this.lane2 = new Ribbon(kit, PATH.lane2, { color: [0xb87aed, 0xb87aed], radius: 0.028 });
    this.lane1b = new Ribbon(kit, PATH.lane1b, { color: GREEN, radius: 0.028 });
    this.curl = new Ribbon(kit, PATH.curl2, { color: AMBER, radius: 0.024 });
    this.trunk = new Ribbon(kit, PATH.trunk, { color: [GREEN, 0xb87aed], radius: 0.028 });
    this.beads1 = new Beads(kit, PATH.lane1b, 6);
    this.gate1 = new Gate(kit, GREEN, LANE_Z);
    this.gate2 = new Gate(kit, AMBER, -LANE_Z);
    // Deadline timer: a ring above gate 2, drawn by the time left (04.14).
    this.timerBack = new Ribbon(kit, circleCurve(0.2), { color: 0x353540, radius: 0.012, closed: true, halo: false });
    this.timer = new Ribbon(kit, circleCurve(0.2), { color: 0xffffff, radius: 0.016, closed: true });
    for (const r of [this.timerBack, this.timer]) r.group.position.set(GATE_X, 1.25, -LANE_Z);
    this.group.add(
      this.lane1.group,
      this.lane2.group,
      this.lane1b.group,
      this.curl.group,
      this.trunk.group,
      this.beads1.mesh,
      this.gate1.group,
      this.gate2.group,
      this.timerBack.group,
      this.timer.group,
    );
  }

  update(v: number, now: number, still: boolean, camYaw: number) {
    const on = v >= 596 && v < 1400;
    this.group.visible = on;
    if (!on) return;
    const out = 1 - seg(v, [1380, 1400]);

    // Lanes open out of the loop (03.15).
    this.lane1.draw(seg(v, [600, 650]));
    this.lane2.draw(seg(v, [604, 654]));
    this.lane1.fade(out);
    this.lane2.fade(out * (1 - 0.6 * seg(v, [905, 930])));

    // Gates rise (04.3), gate 2 twelve vh later.
    const r1 = easeBack(seg(v, [660, 690]));
    const r2 = easeBack(seg(v, [672, 702]));
    this.gate1.group.scale.set(1, Math.max(0.001, r1), 1);
    this.gate2.group.scale.set(1, Math.max(0.001, r2), 1);
    this.gate1.group.visible = r1 > 0.01;
    this.gate2.group.visible = r2 > 0.01;
    for (const g of [this.gate1, this.gate2]) {
      g.arch.draw(1);
      g.arch.fade(out);
    }

    // Gate 1 opens green on approval (04.10); the lane after it lights and the money flows (04.11).
    const open1 = easeOut(seg(v, [755, 785]));
    this.gate1.lit.draw(1);
    this.gate1.lit.fade(open1 * out);
    this.lane1b.draw(seg(v, [770, 800]));
    this.lane1b.fade(out);
    this.beads1.update(now, seg(v, [780, 800]), !still && within(v, [790, 990], 8) > 0.5);

    // Gate 2: the timer runs down (04.14), the gate turns amber (04.15), the money curls back (04.16).
    const left = 1 - seg(v, [850, 900]);
    const ringOn = seg(v, [845, 855]) * (1 - seg(v, [960, 975])) * out;
    this.timer.draw(left);
    this.timer.fade(ringOn);
    this.timer.tint(left < 0.25 ? AMBER : 0xb87aed, 1);
    this.timerBack.draw(1);
    this.timerBack.fade(ringOn * 0.8);
    for (const r of [this.timer, this.timerBack]) r.group.rotation.y = camYaw;
    const back = easeOut(seg(v, [900, 915]));
    this.gate2.lit.draw(1);
    this.gate2.lit.fade(back * out);
    this.curl.draw(seg(v, [902, 948]));
    this.curl.fade(out);

    // The released money rolls on to the fork (04.22).
    this.trunk.draw(seg(v, [985, 1030]));
    this.trunk.fade(out * (1 - 0.65 * seg(v, [1110, 1150]))); // steps back behind the 05 copy
  }
}
