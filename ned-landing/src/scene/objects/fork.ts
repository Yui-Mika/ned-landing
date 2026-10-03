import {
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Shape,
  Vector3,
  type Camera,
} from 'three';
import { bell, easeBack, easeIn, easeInOut, seg } from '../../motion/timeline';
import type { Kit } from '../kit';
import { COIN_EDGE, coinGeometry, coinMaterials } from '../coin';
import { PATH } from '../paths';
import { Dots, Ribbon } from '../ribbon';
import { BANK, PARTNER, WALLET } from '../world';

function roundedRect(w: number, h: number, r: number) {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function roundedHex(r: number, k = 0.24) {
  const pts: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 6 + (i * Math.PI) / 3;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  const s = new Shape();
  for (let i = 0; i < 6; i++) {
    const p0 = pts[(i + 5) % 6];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % 6];
    const a: [number, number] = [p1[0] + (p0[0] - p1[0]) * k, p1[1] + (p0[1] - p1[1]) * k];
    const b: [number, number] = [p1[0] + (p2[0] - p1[0]) * k, p1[1] + (p2[1] - p1[1]) * k];
    if (i === 0) s.moveTo(...a);
    else s.lineTo(...a);
    s.quadraticCurveTo(p1[0], p1[1], b[0], b[1]);
  }
  s.closePath();
  return s;
}

const soft = (depth: number, bevel: number) => ({ depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, curveSegments: 24 });

/**
 * Chapter 05 (board "Ribbon · 05–06 route"): the ribbon splits. Branch A ends at the wallet;
 * branch B passes a licensed partner abroad, the coin turns ₫ (05.14), then crosses the dotted border.
 */
export class Fork {
  readonly group = new Group();
  private branchA: Ribbon;
  private branchB1: Ribbon;
  private branchB2a: Ribbon;
  private branchB2b: Ribbon;
  private wallet = new Group();
  private partner: Mesh;
  private border: Dots;
  private bank = new Group();
  private bankMat: MeshPhysicalMaterial;
  private coin = new Group();
  private coinInner = new Group();
  private coinEdge: MeshStandardMaterial;
  private tmp = new Vector3();
  private dir = new Vector3();

  constructor(kit: Kit) {
    this.branchA = new Ribbon(kit, PATH.branchA, { color: [0xb87aed, 0xb87aed], radius: 0.028 });
    this.branchB1 = new Ribbon(kit, PATH.branchB1, { color: 0xb87aed, radius: 0.028 });
    this.branchB2a = new Ribbon(kit, PATH.branchB2a, { color: 0x5ea2ef, radius: 0.028 });
    this.branchB2b = new Ribbon(kit, PATH.branchB2b, { color: 0x4ade80, radius: 0.028 });
    this.group.add(this.branchA.group, this.branchB1.group, this.branchB2a.group, this.branchB2b.group);

    // Wallet: a rounded purple pocket with a clasp tab, standing.
    const purple = new MeshPhysicalMaterial({ color: 0x5a1d9e, roughness: 0.35, clearcoat: 0.7, emissive: 0x270a4d });
    const lilac = new MeshPhysicalMaterial({ color: 0x3d1270, roughness: 0.3, clearcoat: 0.8, emissive: 0x160530 });
    const dot = new MeshStandardMaterial({ color: 0xf0e4ff, emissive: 0xd4b5f7, emissiveIntensity: 0.6 });
    kit.materials.push(purple, lilac, dot);
    const pocket = new Mesh(kit.geo(new ExtrudeGeometry(roundedRect(0.9, 0.58, 0.16), soft(0.34, 0.05))), purple);
    pocket.position.set(0, 0.34, -0.17);
    const tab = new Mesh(kit.geo(new ExtrudeGeometry(roundedRect(0.34, 0.2, 0.1), soft(0.06, 0.02))), lilac);
    tab.position.set(0.24, 0.34, 0.2);
    const stud = new Mesh(kit.geo(new ExtrudeGeometry(roundedRect(0.06, 0.06, 0.03), soft(0.03, 0.01))), dot);
    stud.position.set(0.3, 0.34, 0.29);
    this.wallet.add(pocket, tab, stud);
    this.wallet.position.copy(WALLET);
    this.wallet.rotation.y = 0.35;
    this.group.add(this.wallet);

    // Licensed partner abroad: a rounded grey hexagon, never named until confirmed.
    const grey = new MeshPhysicalMaterial({ color: 0x55536a, roughness: 0.35, clearcoat: 0.7, emissive: 0x1a1824 });
    kit.materials.push(grey);
    this.partner = new Mesh(kit.geo(new ExtrudeGeometry(roundedHex(0.3), soft(0.2, 0.04))), grey);
    this.partner.rotation.x = -Math.PI / 2;
    this.partner.position.set(PARTNER.x, 0.02, PARTNER.z);
    this.group.add(this.partner);

    // The border: a dotted arc on the ground, never a wall (05.16 flash).
    this.border = new Dots(kit, PATH.border, 0.14, 0.022, 0xf0e4ff);
    this.group.add(this.border.mesh);

    // Bank card in Vietnam: rounded, green stripe, gold chip.
    this.bankMat = new MeshPhysicalMaterial({ color: 0x270a4d, roughness: 0.3, clearcoat: 0.9, emissive: 0x3d1270, emissiveIntensity: 0.4 });
    const stripe = new MeshStandardMaterial({ color: 0x4ade80, emissive: 0x16a34a, emissiveIntensity: 0.5 });
    const chip = new MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.7, roughness: 0.3 });
    kit.materials.push(this.bankMat, stripe, chip);
    const card = new Mesh(kit.geo(new ExtrudeGeometry(roundedRect(0.9, 0.56, 0.07), soft(0.02, 0.012))), this.bankMat);
    card.rotation.x = -Math.PI / 2;
    const band = new Mesh(kit.geo(new ExtrudeGeometry(roundedRect(0.9, 0.08, 0.01), soft(0.005, 0.003))), stripe);
    band.rotation.x = -Math.PI / 2;
    band.position.set(0, 0.04, -0.15);
    const gold = new Mesh(kit.geo(new ExtrudeGeometry(roundedRect(0.14, 0.1, 0.025), soft(0.006, 0.004))), chip);
    gold.rotation.x = -Math.PI / 2;
    gold.position.set(-0.24, 0.04, 0.07);
    this.bank.add(card, band, gold);
    this.bank.position.set(BANK.x, 0.06, BANK.z);
    this.group.add(this.bank);

    // The coin that becomes ₫: USDC on top, ₫ underneath; standing up, it faces the camera.
    const mats = coinMaterials(kit, 'usdc', 'vnd');
    this.coinEdge = mats[0] as MeshStandardMaterial;
    const coin = new Mesh(coinGeometry(kit, 0.22, 0.06), mats);
    coin.rotation.x = Math.PI / 2;
    this.coinInner.add(coin);
    this.coin.add(this.coinInner);
    this.group.add(this.coin);
  }

  update(v: number, camera: Camera, phoneAnchor: Vector3) {
    const on = seg(v, [1040, 1050]) * (1 - seg(v, [1395, 1400]));
    this.group.visible = on > 0.01 && v < 1400;
    if (!this.group.visible) return;

    this.branchA.draw(easeInOut(seg(v, [1050, 1080]))); // 05.2
    this.branchB1.draw(easeInOut(seg(v, [1050, 1080])));
    this.branchB2a.draw(easeInOut(seg(v, [1196, 1206])));
    this.branchB2b.draw(easeInOut(seg(v, [1204, 1222])));
    for (const r of [this.branchB1, this.branchB2a, this.branchB2b]) r.fade(on);
    // Once the ₫ coin sets off, branch A steps back so the Vietnam route leads (05.12).
    this.branchA.fade(on * (1 - 0.7 * seg(v, [1215, 1240])));

    const w = seg(v, [1055, 1080]);
    this.wallet.scale.setScalar(Math.max(0.001, w * (1 + 0.08 * bell(seg(v, [1138, 1148])))));
    this.partner.scale.setScalar(Math.max(0.001, easeBack(seg(v, [1195, 1210])))); // 05.11

    const b = seg(v, [1180, 1200]);
    this.border.set(b, b * (0.4 + 0.6 * bell(seg(v, [1276, 1292]))));

    // Bank card: appears, takes the ₫ (05.20), flies to the phone (05.21).
    const card = seg(v, [1300, 1330]);
    this.bank.visible = card > 0.01;
    this.bankMat.emissiveIntensity = 0.4 + 0.9 * bell(seg(v, [1355, 1370]));
    const fly = easeInOut(seg(v, [1360, 1400]));
    this.tmp.set(BANK.x, 0.06, BANK.z).lerp(phoneAnchor, fly);
    this.bank.position.copy(this.tmp);
    this.bank.rotation.x = fly * 1.2;
    this.bank.scale.setScalar(Math.max(0.001, card * (1 - 0.6 * fly)));

    // The ₫ coin, riding branch B (05.13), flipping at the partner (05.14), crossing the border (05.16).
    const p = this.tmp;
    let s = seg(v, [1205, 1220]);
    // The coin joins branch B past the fork, clear of the headline (05.13).
    if (v < 1225) PATH.branchB1.getPointAt(0.3, p);
    else if (v < 1250) PATH.branchB1.getPointAt(0.3 + 0.7 * easeInOut(seg(v, [1225, 1250])), p);
    else if (v < 1272) PATH.branchB2a.getPointAt(0.25 * easeInOut(seg(v, [1250, 1262])), p);
    else if (v < 1345) {
      const u = easeInOut(seg(v, [1272, 1295]));
      if (u < 0.35) PATH.branchB2a.getPointAt(0.25 + (u / 0.35) * 0.75, p);
      else PATH.branchB2b.getPointAt(((u - 0.35) / 0.65) * 0.45, p);
    } else {
      PATH.branchB2b.getPointAt(0.45, p);
      this.dir.set(BANK.x, 0.06, BANK.z);
      p.lerp(this.dir, easeIn(seg(v, [1345, 1365]))); // 05.20
      s = 1 - seg(v, [1360, 1366]);
    }
    p.y += 0.3;
    this.coin.position.copy(p);
    this.coin.scale.setScalar(Math.max(0.001, s));
    this.coin.visible = s > 0.01;
    this.coin.lookAt(camera.position);
    const flip = easeInOut(seg(v, [1250, 1262]));
    this.coinInner.rotation.y = Math.PI * flip;
    this.coinEdge.color.setHex(flip > 0.5 ? COIN_EDGE.vnd : COIN_EDGE.usdc);
  }
}
