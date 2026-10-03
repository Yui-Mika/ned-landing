import { Group, Vector3, type PerspectiveCamera, type Quaternion } from 'three';
import { bell, clamp, easeBack, easeIn, easeInOut, easeOut, seg, type Range } from '../../motion/timeline';
import type { Kit } from '../kit';
import { curve, Dots } from '../ribbon';
import { BANK, BORDER_X, BRIEF_IDEA, ENV_HERO, FORK, MB, MB_TOP, PARTNER, RACK_CLOSE, RACK_IDEA, RACK_TRACK, SET_X, WALLET } from '../world';
import { BankCard, Brief, Card, Clock, Desk, Envelope, Mailbox, Rack, Wallet, makePage, makePostmark, makeTag } from './parts';
import { hollowStampTex, postmarkTex, sheetStampTex } from './tex';

// The whole Airmail story (motion map v4.1). Every object's state is a pure function of the story
// position v, plus a few time-based touches (float, coin glint) that stop under reduced motion.

const V = (x: number, y: number, z: number) => new Vector3(x, y, z);
const win = (v: number, a: Range, b: Range) => seg(v, a) * (1 - seg(v, b));

/** Quadratic arc from a to b, lifted by h at the middle. */
function arc(a: Vector3, b: Vector3, h: number, t: number, out: Vector3) {
  const u = 1 - t;
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 + h;
  const mz = (a.z + b.z) / 2;
  return out.set(u * u * a.x + 2 * u * t * mx + t * t * b.x, u * u * a.y + 2 * u * t * my + t * t * b.y, u * u * a.z + 2 * u * t * mz + t * t * b.z);
}

const top = (p: Vector3, dx = 0, dz = 0.25) => V(p.x + dx, MB_TOP + 0.1, p.z + dz);

export class AirmailScene {
  readonly group = new Group();
  readonly mc: Mailbox;
  readonly my: Mailbox;
  readonly rack1: Rack;
  readonly rack3: Rack;
  private e0: Envelope;
  private m2: Envelope;
  private m3: Envelope;
  private eA: Envelope;
  private eV: Envelope;
  private eC: Envelope;
  private b0: Brief;
  private bc: Brief;
  private by: Brief;
  private bClose: Brief;
  private clocks: Clock[];
  private pages: Card[];
  private notSent: Card;
  private desk = new Group();
  private deskObj: Desk;
  private wallet: Wallet;
  private card: BankCard;
  private record: Card[] = [];
  private hollow: Card[] = [];
  private sheet: Card[] = [];
  private nowMark: Card;
  private routes: Record<string, Dots> = {};
  private curves: Record<string, ReturnType<typeof curve>> = {};
  private set05 = new Group();
  private t = V(0, 0, 0);
  private a = V(0, 0, 0);
  private b = V(0, 0, 0);
  readonly slotW = [V(0, 0, 0), V(0, 0, 0), V(0, 0, 0)];
  /** Phone-anchor handoff target for the bank card (05.25), set by the stage. */
  readonly phone = V(0, 0, 0);

  constructor(private kit: Kit) {
    this.mc = new Mailbox(kit, 'client');
    this.my = new Mailbox(kit, 'you');
    this.rack1 = new Rack(kit, 1);
    this.rack3 = new Rack(kit, 3);
    this.rack3.root.position.copy(RACK_TRACK);
    this.e0 = new Envelope(kit, 'usdc', '14:02', '3f9a…c21e');
    this.m2 = new Envelope(kit, 'usdc', '16:40', '7b20…e91a');
    this.m3 = new Envelope(kit, 'usdc', '—', '—');
    this.eA = new Envelope(kit, 'usdc', '14:02', '3f9a…c21e');
    this.eV = new Envelope(kit, 'vnd');
    this.eC = new Envelope(kit, 'usdc');
    this.b0 = new Brief(kit);
    this.bc = new Brief(kit);
    this.by = new Brief(kit);
    this.bClose = new Brief(kit);
    this.clocks = [new Clock(kit), new Clock(kit), new Clock(kit)];
    this.pages = [makePage(kit), makePage(kit), makePage(kit), makePage(kit)];
    this.notSent = makeTag(kit, 'NOT SENT', '#FBBF24');
    this.deskObj = new Desk(kit);
    this.desk.add(this.deskObj.root);
    this.desk.position.copy(PARTNER);
    this.desk.rotation.y = 0.1;
    this.wallet = new Wallet(kit);
    this.wallet.root.position.copy(WALLET);
    this.wallet.root.rotation.y = 0.35;
    this.card = new BankCard(kit);

    // Routes (dashed): 02 work and money, 04 track, 05 two ways and the border.
    const yR = 0.06;
    const C = this.curves;
    C.work02 = curve([[2.0, 1.25, 0.2], [1.0, 2.05, 0.35], [-1.0, 2.05, 0.35], [-2.0, 1.25, 0.2]]);
    C.money02 = curve([[-1.9, 1.2, 0.45], [-0.8, 0.75, 0.65], [0.8, 0.75, 0.65], [1.9, 1.2, 0.45]]);
    this.rack3.root.updateMatrixWorld(true);
    for (let i = 0; i < 3; i++) this.rack3.slotWorld(i, this.slotW[i]);
    const yt = top(MB.youTrack);
    const ct = top(MB.clientTrack);
    C.green1 = curve([[this.slotW[0].x, this.slotW[0].y + 0.2, this.slotW[0].z + 0.1], [1.4, 2.0, 0.2], [2.9, 1.95, 0.4], [yt.x - 0.1, yt.y, yt.z]]);
    C.green2 = curve([[this.slotW[1].x, this.slotW[1].y + 0.25, this.slotW[1].z + 0.1], [2.1, 1.8, 0.0], [3.2, 1.75, 0.3], [yt.x, yt.y - 0.05, yt.z]]);
    C.amber3 = curve([[this.slotW[2].x, this.slotW[2].y - 0.2, this.slotW[2].z + 0.2], [0.9, 0.45, 0.7], [-0.9, 0.55, 0.0], [ct.x, ct.y - 0.2, ct.z]]);
    C.workT = curve([[yt.x, yt.y - 0.1, yt.z], [2.6, 2.4, 0.3], [0.9, 2.4, 0.0], [this.slotW[0].x, this.slotW[0].y + 0.3, this.slotW[0].z]]);
    C.workT2 = curve([[yt.x, yt.y - 0.1, yt.z], [2.9, 2.3, 0.2], [1.7, 2.3, -0.1], [this.slotW[1].x, this.slotW[1].y + 0.3, this.slotW[1].z]]);
    C.routeA = curve([[FORK.x, yR, FORK.z], [9.0, yR, 0.6], [9.8, yR, -0.6], [10.6, yR, -2.1], [WALLET.x - 0.5, yR, WALLET.z + 0.1]]);
    C.routeB = curve([[FORK.x, yR, FORK.z], [9.0, yR, 0.8], [9.7, yR, 1.8], [PARTNER.x - 0.5, yR, PARTNER.z]]);
    C.routeV = curve([[PARTNER.x + 0.45, yR, PARTNER.z + 0.1], [11.4, yR, 2.55], [12.2, yR, 2.75], [BANK.x - 0.45, yR, BANK.z]]);
    C.border = curve([[BORDER_X + 0.05, 0.03, 1.2], [BORDER_X - 0.05, 0.03, 2.0], [BORDER_X - 0.09, 0.03, 2.8], [BORDER_X - 0.05, 0.03, 3.6], [BORDER_X + 0.05, 0.03, 4.4]]);
    const R = this.routes;
    R.work02 = new Dots(kit, C.work02, 0.11, 0.016, 0xf0e4ff);
    R.money02 = new Dots(kit, C.money02, 0.11, 0.016, 0xf0e4ff);
    R.workT = new Dots(kit, C.workT, 0.12, 0.016, 0xf0e4ff);
    R.workT2 = new Dots(kit, C.workT2, 0.12, 0.016, 0xf0e4ff);
    R.green1 = new Dots(kit, C.green1, 0.1, 0.018, 0x4ade80);
    R.green2 = new Dots(kit, C.green2, 0.1, 0.018, 0x4ade80);
    R.amber3 = new Dots(kit, C.amber3, 0.1, 0.018, 0xfbbf24);
    R.routeA = new Dots(kit, C.routeA, 0.13, 0.022, 0xd4b5f7);
    R.routeB = new Dots(kit, C.routeB, 0.13, 0.022, 0xd4b5f7);
    R.routeV = new Dots(kit, C.routeV, 0.13, 0.022, 0x4ade80);
    R.border = new Dots(kit, C.border, 0.14, 0.022, 0xf0e4ff);

    // 07: the public record (postmarks) and five blank stamps; 08: the stamp sheet.
    const labels = ['BRIEF', 'LOCK', 'SUBMIT', 'RELEASE', 'VND'];
    labels.forEach((l, k) => {
      const c = makePostmark(kit, l, `#${k + 1}`, '#D4B5F7', false);
      c.mesh.scale.set(1.0, 2.0, 1);
      this.record.push(c);
    });
    for (let k = 0; k < 5; k++) this.hollow.push(new Card(kit, hollowStampTex(), 0.3, 0.38));
    const st: [string, string, boolean][] = [['NOW', 'Demo', true], ['NEXT', 'Partner', false], ['THEN', 'Pilot', false], ['LATER', 'More', false]];
    st.forEach(([w, t, on]) => this.sheet.push(new Card(kit, sheetStampTex(w, t, on), 0.5, 0.63)));
    this.nowMark = new Card(kit, postmarkTex('OCT', '2026', '#3D1270', false), 0.56, 0.28);

    this.set05.add(this.desk, this.wallet.root, this.card.root, R.routeA.mesh, R.routeB.mesh, R.routeV.mesh, R.border.mesh);
    this.group.add(
      this.mc.root,
      this.my.root,
      this.rack1.root,
      this.rack3.root,
      ...[this.e0, this.m2, this.m3, this.eA, this.eV, this.eC, this.b0, this.bc, this.by, this.bClose].map((x) => x.root),
      ...this.clocks.map((c) => c.root),
      ...this.pages.map((p) => p.root),
      this.notSent.root,
      ...this.record.map((c) => c.root),
      ...this.hollow.map((c) => c.root),
      ...this.sheet.map((c) => c.root),
      this.nowMark.root,
      R.work02.mesh,
      R.money02.mesh,
      R.workT.mesh,
      R.workT2.mesh,
      R.green1.mesh,
      R.green2.mesh,
      R.amber3.mesh,
      this.set05,
    );
  }

  update(v: number, now: number, cam: PerspectiveCamera, entry: number, still: boolean) {
    const q = cam.quaternion;
    const time = still ? 0 : now;
    const float = (k: number) => (still ? 0 : Math.sin(now * 1.1 + k) * 0.02);
    this.mailboxes(v, cam);
    this.racks(v);
    this.envelopes(v, q, time, entry, float);
    this.briefs(v, q);
    this.clocksAndPages(v, q);
    this.routesUpdate(v);
    this.chapter05(v, q);
    this.facts(v, q);
  }

  // ---------------------------------------------------------------- mailboxes
  private mailboxes(v: number, cam: PerspectiveCamera) {
    const pc = this.mc.root.position;
    const py_ = this.my.root.position;
    const toTrack = easeInOut(seg(v, [655, 700]));
    if (v < 2400) {
      pc.copy(MB.clientMark).lerp(MB.clientTrack, toTrack);
      py_.copy(MB.youMark).lerp(MB.youTrack, toTrack);
    } else {
      pc.copy(MB.clientClose);
      py_.copy(MB.youClose);
    }
    const rise = v < 2400 ? -0.4 * (1 - easeOut(seg(v, [50, 100]))) : -0.4 * (1 - easeOut(seg(v, [2490, 2520])));
    pc.y += rise;
    py_.y += rise;
    const visBase = v < 2400 ? seg(v, [50, 100]) * (1 - seg(v, [1165, 1195])) : seg(v, [2490, 2520]);
    const ghost = 1 - 0.85 * seg(v, [258, 290]) + 0.85 * seg(v, [300, 312]);
    const yaw = (p: Vector3) => Math.atan2(cam.position.x - p.x, cam.position.z - p.z) * 0.5;
    const clientNod = 0.12 * bell(seg(v, [813, 823])) - 0.1 * bell(seg(v, [626, 640]));
    this.mc.set(visBase * ghost, v >= 2400 ? 0 : seg(v, [1095, 1102]), 0xfbbf24, clientNod, 0.05 * bell(seg(v, [210, 218])), yaw(pc));
    const youFlag = v >= 2400 ? 1 : seg(v, [870, 878]);
    this.my.set(visBase, youFlag, 0x4ade80, 0.12 * bell(seg(v, [530, 540])), 0.06 * bell(seg(v, [988, 996])), yaw(py_));
  }

  // ---------------------------------------------------------------- the contract
  private racks(v: number) {
    if (v < 2400) {
      this.rack1.root.position.copy(RACK_IDEA);
      // 02.15: an empty slot rises in the middle; 03.3: it builds again after the cut; 03.17: gives way to three slots.
      const o2 = win(v, [344, 352], [380, 381]);
      const o3 = win(v, [425, 430], [650, 690]);
      const draw = v < 381 ? seg(v, [344, 366]) : seg(v, [425, 465]);
      this.rack1.root.scale.y = v < 381 ? 0.2 + 0.8 * easeOut(seg(v, [344, 366])) : 1;
      this.rack1.set(Math.max(o2, o3), draw, seg(v, [628, 648]));
    } else {
      this.rack1.root.position.copy(RACK_CLOSE);
      this.rack1.root.scale.y = 1;
      this.rack1.set(seg(v, [2465, 2475]), seg(v, [2465, 2490]));
    }
    this.rack3.set(win(v, [650, 690], [1150, 1195]), seg(v, [650, 690]));
  }

  // ---------------------------------------------------------------- envelopes
  private envelopes(v: number, q: Quaternion, time: number, entry: number, float: (k: number) => number) {
    const t = this.t;
    const clientHold = top(MB.clientMark, 0.05);
    const youHold = top(MB.youMark, -0.05);
    const ideaHold = V(-1.3, 1.25, 0.6);
    this.rack1.root.updateMatrixWorld(true);
    const slot1 = this.rack1.slotWorld(0, V(0, 0, 0));
    const yt = top(MB.youTrack, -0.3, 0.3);
    const ct = top(MB.clientTrack, 0, 0.3);

    // e0: hero → client → (sent up front) → idea → slot M1 → released → fork → $ tray.
    let o = 1;
    let s = 1;
    let peel = 0;
    let noSeal = false;
    let post = 0;
    let addr = 0;
    let roll = 0;
    if (v < 56) {
      t.copy(ENV_HERO);
      t.y += float(0);
      o = entry;
      s = 2.0;
      roll = -0.05;
    } else if (v < 120) {
      const u = easeInOut(seg(v, [56, 110]));
      arc(ENV_HERO, clientHold, 0.8, u, t);
      s = 2.0 - 0.75 * u;
      roll = -0.05 + 0.15 * Math.sin(u * Math.PI);
      peel = seg(v, [100, 115]);
    } else if (v < 300) {
      t.copy(clientHold);
      t.y += float(1);
      s = 1.25;
      noSeal = true;
      o = 1 - seg(v, [262, 296]);
    } else if (v < 360) {
      noSeal = true;
      s = 1.25;
      o = seg(v, [300, 312]) * (1 - seg(v, [340, 356]));
      arc(clientHold, youHold, -0.35, easeInOut(seg(v, [312, 336])), t);
    } else if (v < 594) {
      o = seg(v, [535, 545]);
      s = 1.15;
      if (v < 568) {
        t.copy(ideaHold);
        t.y += float(2);
        noSeal = v < 566;
        peel = 1 - seg(v, [566, 572]);
      } else {
        peel = 1 - seg(v, [566, 572]);
        arc(ideaHold, slot1, 0.25, easeInOut(seg(v, [568, 594])), t);
        s = 1.15 - 0.15 * seg(v, [568, 594]);
      }
    } else if (v < 700) {
      t.copy(slot1).lerp(this.slotW[0], easeInOut(seg(v, [650, 700])));
    } else if (v < 838) {
      t.copy(this.slotW[0]);
      post = seg(v, [790, 798]);
      peel = seg(v, [820, 835]);
    } else if (v < 1155) {
      post = 1;
      peel = 1;
      const u = easeInOut(seg(v, [838, 870]));
      this.curves.green1.getPointAt(u, t);
      t.y += Math.sin(u * Math.PI) * 0.1 + (v > 870 ? float(3) : 0);
      s = 1 - 0.3 * u;
    } else if (v < 1425) {
      post = 1;
      peel = 1;
      const u = easeInOut(seg(v, [1155, 1200]));
      arc(yt, FORK, 0.6, u, t);
      s = 0.7 + 0.2 * u + 0.55 * win(v, [1236, 1250], [1280, 1300]);
      addr = seg(v, [1252, 1266]);
    } else {
      post = 1;
      peel = 1;
      addr = 1;
      const u = easeInOut(seg(v, [1425, 1450]));
      this.curves.routeB.getPointAt(u, this.a);
      this.b.set(PARTNER.x - 0.16, 0.42, PARTNER.z + 0.22);
      t.copy(this.a);
      t.y = FORK.y * (1 - u) + 0.6 * u;
      if (u >= 1) t.copy(this.b);
      else t.lerp(this.b, seg(u, [0.8, 1]));
      s = 0.9 - 0.55 * seg(v, [1440, 1452]);
      o = 1 - seg(v, [1590, 1630]);
    }
    if (v >= 381 && v < 535) o = 0;
    this.e0.root.position.copy(t);
    this.e0.set({ opacity: o, peel, noSeal, post, ret: 0, addr, roll, scale: s }, q, time);

    // M2 and M3 appear when the rack widens (03.17).
    {
      let o2 = win(v, [670, 700], [1160, 1190]);
      let p2 = 0;
      const pm2 = seg(v, [900, 908]);
      t.copy(this.slotW[1]);
      p2 = seg(v, [952, 962]);
      let s2 = 1;
      if (v >= 962) {
        const u = easeInOut(seg(v, [962, 990]));
        this.curves.green2.getPointAt(u, t);
        t.x += 0.12 * u;
        t.y += 0.08 * u + Math.sin(u * Math.PI) * 0.1;
        t.z -= 0.08 * u;
        s2 = 1 - 0.3 * u;
      }
      if (v < 650) o2 = 0;
      this.m2.root.position.copy(t);
      this.m2.set({ opacity: o2, peel: p2, post: pm2, ret: 0, addr: 0, scale: s2 }, q, time);
    }
    {
      const o3 = win(v, [680, 700], [1160, 1190]);
      t.copy(this.slotW[2]);
      let s3 = 1;
      if (v >= 1055) {
        const u = easeInOut(seg(v, [1055, 1095]));
        this.curves.amber3.getPointAt(u, t);
        t.y += Math.sin(u * Math.PI) * 0.12;
        s3 = 1 - 0.3 * u;
      }
      this.m3.root.position.copy(t);
      this.m3.set({ opacity: o3, peel: 0, post: 0, ret: seg(v, [1052, 1060]), addr: 0, scale: s3, roll: v >= 1055 ? -0.08 : 0 }, q, time);
    }

    // 05.9 route A (outside Vietnam): a ghost envelope opens into the wallet.
    {
      const u = easeInOut(seg(v, [1300, 1336]));
      this.curves.routeA.getPointAt(u, t);
      t.y = FORK.y * (1 - u) + 0.75 * u;
      const oA = 0.75 * win(v, [1290, 1300], [1332, 1342]);
      this.eA.root.position.copy(t);
      this.eA.set({ opacity: oA, peel: 1, post: 1, ret: 0, addr: 0, scale: 0.9 - 0.5 * seg(v, [1328, 1342]) }, q, time);
    }

    // 05.17 the ₫ envelope rises from the ₫ tray, crosses the border, opens onto the bank card.
    {
      const tray = V(PARTNER.x + 0.16, 0.42, PARTNER.z + 0.22);
      const before = V(BANK.x - 0.8, 1.2, BANK.z + 0.15);
      let sV = 0.9 * easeBack(seg(v, [1450, 1462]));
      if (v < 1472) {
        t.copy(tray);
        t.y += 0.5 * easeOut(seg(v, [1450, 1462]));
      } else {
        const u = easeInOut(seg(v, [1472, 1495]));
        this.curves.routeV.getPointAt(u, this.a);
        this.a.y = 0.92;
        t.copy(this.a);
        if (u >= 0.98) t.lerp(before, 1);
        sV = 0.9 - 0.6 * seg(v, [1545, 1565]);
      }
      const oV = win(v, [1450, 1455], [1555, 1566]);
      this.eV.root.position.copy(t);
      this.eV.set({ opacity: oV, peel: 1, noSeal: true, post: 0, ret: 0, addr: 0, scale: sV }, q, time);
    }

    // 09.4 a fresh envelope, sealed and slid into the rack.
    {
      const side = V(RACK_CLOSE.x - 0.9, RACK_CLOSE.y + 0.05, RACK_CLOSE.z + 0.45);
      t.copy(side).lerp(slot1, easeInOut(seg(v, [2506, 2518])));
      t.y += v < 2506 ? float(4) : 0;
      const oC = v >= 2400 ? seg(v, [2490, 2498]) : 0;
      this.eC.root.position.copy(t);
      this.eC.set({ opacity: oC, peel: 1 - seg(v, [2498, 2506]), post: 0, ret: 0, addr: 0, scale: 0.9 + 0.1 * seg(v, [2506, 2518]) }, q, time);
    }
    void ct;
  }

  // ---------------------------------------------------------------- briefs (03, 09)
  private briefs(v: number, q: Quaternion) {
    const t = this.t;
    this.b0.root.position.copy(BRIEF_IDEA);
    this.b0.set(win(v, [470, 478], [508, 512]), seg(v, [470, 500]), seg(v, [505, 512]), q, -0.04, 2.1);
    const copies: [Brief, Vector3, number][] = [
      [this.bc, top(MB.clientMark, -0.15, 0.1), -1],
      [this.by, top(MB.youMark, 0.15, 0.1), 1],
    ];
    for (const [b, dest, k] of copies) {
      const u = easeInOut(seg(v, [508, 530]));
      arc(BRIEF_IDEA, dest, 0.35, u, t);
      b.root.position.copy(t);
      b.set(win(v, [506, 510], [650, 668]), 1, 1, q, 0.06 * k, 2.1 - 1.15 * u);
    }
    this.bClose.root.position.set(RACK_CLOSE.x - 0.85, RACK_CLOSE.y + 0.55, RACK_CLOSE.z + 0.25);
    this.bClose.set(v >= 2400 ? seg(v, [2490, 2505]) : 0, 1, 1, q, -0.06, 0.75);
  }

  // ---------------------------------------------------------------- 04 clocks, pages, tags
  private clocksAndPages(v: number, q: Quaternion) {
    const vis = (v >= 720 && v < 1150 ? 1 : 0) * (1 - seg(v, [1140, 1150]));
    const appear = easeBack(seg(v, [720, 760]));
    const c = this.clocks;
    const place = (i: number) => c[i].root.position.copy(this.slotW[i]).add(V(0, 0.5, 0));
    for (let i = 0; i < 3; i++) place(i);
    // M1: submission clock until 790, then the review clock; gone after release.
    if (v < 795) c[0].set(vis, 1 - 0.45 * seg(v, [720, 790]), 'submit', q, appear);
    else c[0].set(vis * (1 - seg(v, [836, 846])), 0.55 + 0.45 * seg(v, [795, 810]) - 0.1 * seg(v, [810, 836]), 'review', q, 1);
    // M2: submission clock until 900; review clock runs out 905–950 with no answer.
    if (v < 900) c[1].set(vis, 1 - 0.55 * seg(v, [720, 900]), 'submit', q, appear);
    else c[1].set(vis * (1 - seg(v, [962, 972])), Math.min(1, 0.45 + seg(v, [900, 905]) * 0.55) * (1 - seg(v, [905, 950])), 'review', q, 1);
    // M3: the submission clock runs out at 1050.
    c[2].set(vis * (1 - seg(v, [1060, 1075])), 1 - seg(v, [720, 1050]), 'submit', q, appear);

    // Pages: the work. 02.5 two pages to the client; 04.5 / 04.14 to M1 and M2.
    const youTop = V(MB.youMark.x, 1.25, 0.2);
    const clientTop = V(MB.clientMark.x, 1.25, 0.2);
    const flights: [Range, Vector3, Vector3, number][] = [
      [[182, 208], youTop, clientTop, 0.9],
      [[188, 212], youTop, clientTop, 0.8],
      [[755, 775], top(MB.youTrack, 0, 0.2), this.slotW[0], 0.6],
      [[880, 895], top(MB.youTrack, 0, 0.2), this.slotW[1], 0.6],
    ];
    flights.forEach(([r, a, b, h], k) => {
      const u = easeInOut(seg(v, r));
      arc(a, b, h, u, this.t);
      this.pages[k].root.position.copy(this.t);
      this.pages[k].set(win(v, [r[0] - 2, r[0] + 2], [r[1] - 2, r[1] + 4]), q, -0.15 + 0.3 * u, 1.2);
    });

    // 02.7 NOT SENT over the client's envelope.
    this.notSent.root.position.copy(top(MB.clientMark, 0.05)).add(V(0, 0.42, 0));
    this.notSent.set(win(v, [215, 225], [255, 264]), q, 0, 1);
  }

  // ---------------------------------------------------------------- dashed routes
  private routesUpdate(v: number) {
    const R = this.routes;
    R.work02.set(seg(v, [182, 212]), 0.7 * (1 - seg(v, [255, 270])) + 0.25 * win(v, [300, 310], [340, 356]));
    R.money02.set(v < 300 ? 0.5 * seg(v, [215, 250]) : seg(v, [312, 336]), 0.8 * (v < 300 ? 1 - seg(v, [258, 290]) : win(v, [300, 306], [340, 356])));
    const track = 1 - seg(v, [1140, 1160]);
    R.workT.set(seg(v, [740, 770]), 0.55 * track * (v > 700 ? 1 : 0));
    R.workT2.set(seg(v, [740, 770]), 0.45 * track * (v > 700 ? 1 : 0));
    R.green1.set(seg(v, [740, 770]), (0.25 + 0.65 * seg(v, [835, 842])) * track * (v > 700 ? 1 : 0));
    R.green2.set(seg(v, [740, 770]), (0.25 + 0.65 * seg(v, [958, 964])) * track * (v > 700 ? 1 : 0));
    R.amber3.set(seg(v, [740, 770]), (0.2 + 0.7 * seg(v, [1052, 1058])) * track * (v > 700 ? 1 : 0));
  }

  // ---------------------------------------------------------------- 05 · two ways
  private chapter05(v: number, q: Quaternion) {
    const on = win(v, [1200, 1210], [1600, 1640]);
    this.set05.visible = on > 0.01;
    if (!this.set05.visible) return;
    const R = this.routes;
    const close = 1 - win(v, [1238, 1250], [1280, 1296]); // routes step back during the TO close-up
    R.routeA.set(seg(v, [1210, 1240]), on * close * (1 - 0.6 * seg(v, [1415, 1440])));
    R.routeB.set(seg(v, [1210, 1240]), on * close);
    R.routeV.set(seg(v, [1462, 1476]), on);
    R.border.set(seg(v, [1380, 1400]), on * (0.45 + 0.55 * bell(seg(v, [1476, 1492]))));
    this.wallet.root.scale.setScalar(Math.max(0.001, easeOut(seg(v, [1215, 1240])) * (1 + 0.08 * bell(seg(v, [1336, 1346])))));
    this.deskObj.root.scale.setScalar(Math.max(0.001, 0.8 * easeBack(seg(v, [1395, 1410]))));
    // Bank card: appears, takes the ₫ (05.24), flies to the phone (05.25).
    const show = seg(v, [1495, 1515]);
    this.card.root.visible = show > 0.01;
    this.card.mat.emissiveIntensity = 0.4 + 0.9 * bell(seg(v, [1555, 1570]));
    const fly = easeInOut(seg(v, [1560, 1600]));
    this.t.set(BANK.x - 0.5, 0.5, BANK.z).lerp(this.phone, fly);
    this.card.root.position.copy(this.t);
    this.card.root.quaternion.copy(q);
    this.card.root.scale.setScalar(Math.max(0.001, 0.7 * show * (1 - 0.6 * fly)));
  }

  // ---------------------------------------------------------------- 07 record, 08 stamp sheet
  private facts(v: number, q: Quaternion) {
    const recOut = 1 - seg(v, [2245, 2265]);
    this.record.forEach((c, k) => {
      const r: Range = [2035 + k * 9, 2043 + k * 9];
      const k1 = seg(v, r);
      c.root.position.set(SET_X - 4.1, 2.25 - k * 0.46, -0.6);
      c.set((v >= 2030 ? clamp(k1 * 1.6) : 0) * recOut, q, -0.06, 1.15 - 0.15 * easeOut(k1));
    });
    this.hollow.forEach((c, k) => {
      c.root.position.set(SET_X + 4.1, 2.25 - k * 0.46, -0.6);
      c.set(seg(v, [2150 + k * 10, 2158 + k * 10]) * recOut, q, 0.04, 0.85);
    });
    const sheetOn = win(v, [2280, 2310], [2440, 2460]);
    this.sheet.forEach((c, k) => {
      c.root.position.set(SET_X - 4.75, 0.02, -1.55 + k * 1.03);
      const lift = k === 0 ? easeIn(seg(v, [2428, 2460])) : 0;
      c.root.position.y += lift * 3;
      c.set(k === 0 ? seg(v, [2280, 2310]) * (1 - seg(v, [2445, 2460])) : sheetOn, q, 0, 1);
    });
    const nm = seg(v, [2332, 2340]);
    this.nowMark.root.position.set(SET_X - 4.6, 0.05, -1.35);
    this.nowMark.root.position.y += easeIn(seg(v, [2428, 2460])) * 3;
    this.nowMark.set(clamp(nm * 1.6) * (1 - seg(v, [2445, 2460])), q, -0.2, 1.18 - 0.18 * easeOut(nm));
  }

  /** Points the page layer pins labels to. */
  slotTop(i: number, out: Vector3) {
    return out.copy(this.slotW[i]).add(V(0, 0.36, 0));
  }
  slotBottom(i: number, out: Vector3) {
    return out.copy(this.slotW[i]).add(V(0, -0.46, 0));
  }
  get kitRef() {
    return this.kit;
  }
}
