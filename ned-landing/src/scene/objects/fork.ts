import {
  CanvasTexture,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
  Vector3,
  type Camera,
  type MeshBasicMaterial,
} from 'three';
import { bell, easeBack, easeIn, easeInOut, seg } from '../../motion/timeline';
import { Bar, Kit, fadeMat } from '../kit';
import { BANK, BORDER_X, FORK, PARTNER, WALLET, v3 } from '../world';

function faceTexture(kind: 'usdc' | 'vnd') {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = kind === 'usdc' ? '#2775CA' : '#16A34A';
  g.beginPath();
  g.arc(128, 128, 128, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.7)';
  g.lineWidth = 10;
  g.beginPath();
  g.arc(128, 128, 96, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = '#FFFFFF';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = kind === 'usdc' ? 'bold 120px Arial, "DejaVu Sans", sans-serif' : 'bold 150px Arial, "DejaVu Sans", sans-serif';
  g.fillText(kind === 'usdc' ? '$' : '₫', 128, 136);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  // Cylinder caps map the picture sideways once the coin stands up; turn it upright.
  t.center.set(0.5, 0.5);
  t.rotation = Math.PI / 2;
  return t;
}

/**
 * Chapter 05: the fork. Branch A to the wallet (outside Vietnam), branch B through a licensed partner
 * abroad, where the coin becomes ₫ before it crosses the border (the key moment, 05.14), then a bank card.
 */
export class Fork {
  readonly group = new Group();
  private branchA: Bar;
  private branchB1: Bar;
  private branchB2: Bar;
  private wallet = new Group();
  private partner: Mesh;
  private border = new Group();
  private borderMat: MeshBasicMaterial;
  private bank = new Group();
  private bankMat: MeshStandardMaterial;
  private coin = new Group();
  private coinInner = new Group();
  private coinSide: MeshStandardMaterial;
  private branchMat: MeshBasicMaterial;
  private tmp = new Vector3();
  private tmp2 = new Vector3();
  private dir = new Vector3();

  constructor(kit: Kit) {
    this.branchMat = kit.basic(0xb87aed, 1);
    this.branchA = new Bar(kit, v3(FORK.x, 0.012, FORK.z), v3(WALLET.x, 0.012, WALLET.z), 0.05, this.branchMat);
    this.branchB1 = new Bar(kit, v3(FORK.x, 0.012, FORK.z), v3(PARTNER.x, 0.012, PARTNER.z), 0.05, this.branchMat);
    this.branchB2 = new Bar(kit, v3(PARTNER.x, 0.012, PARTNER.z), v3(BANK.x, 0.012, BANK.z), 0.05, this.branchMat);
    this.group.add(this.branchA.mesh, this.branchB1.mesh, this.branchB2.mesh);

    // Wallet: the N.E.D wallet, purple, with a lit screen.
    const purple = kit.std(0x5a1d9e, { emissive: 0x3d1270, emissiveIntensity: 0.6, roughness: 0.4 });
    const screen = kit.std(0x9b4fde, { emissive: 0xb87aed, emissiveIntensity: 0.8 });
    this.wallet.add(kit.box(0.9, 0.5, 0.6, purple, 0, 0.25, 0));
    this.wallet.add(kit.box(0.6, 0.02, 0.36, screen, 0, 0.51, 0));
    this.wallet.position.copy(WALLET);
    this.group.add(this.wallet);

    // Licensed partner abroad: a neutral hexagon. Never named until a partner is confirmed.
    const grey = kit.std(0x353540, { emissive: 0x1c1c24, emissiveIntensity: 0.6, roughness: 0.5 });
    this.partner = new Mesh(kit.geo(new CylinderGeometry(0.45, 0.45, 0.5, 6)), grey);
    this.partner.position.set(PARTNER.x, 0.25, PARTNER.z);
    this.group.add(this.partner);

    // The border: a thin wall of light across branch B.
    this.borderMat = kit.basic(0xd4b5f7, 0.18);
    this.border.add(kit.box(0.02, 0.9, 2.4, this.borderMat, 0, 0.45, 0));
    for (let i = 0; i < 6; i++) this.border.add(kit.box(0.05, 0.01, 0.22, this.borderMat, 0, 0.01, -1.05 + i * 0.42));
    this.border.position.set(BORDER_X, 0, 2.75);
    this.group.add(this.border);

    // Bank card in Vietnam.
    this.bankMat = kit.std(0x270a4d, { emissive: 0x5a1d9e, emissiveIntensity: 0.4, roughness: 0.4 });
    const stripe = kit.std(0x4ade80, { emissive: 0x16a34a, emissiveIntensity: 0.6 });
    const chip = kit.std(0xfbbf24, { metalness: 0.6, roughness: 0.3 });
    this.bank.add(kit.box(0.9, 0.035, 0.56, this.bankMat, 0, 0, 0));
    this.bank.add(kit.box(0.9, 0.04, 0.08, stripe, 0, 0.002, -0.16));
    this.bank.add(kit.box(0.14, 0.04, 0.1, chip, -0.24, 0.004, 0.06));
    this.bank.position.set(BANK.x, 0.08, BANK.z);
    this.group.add(this.bank);

    // The coin that becomes ₫. Faces: USDC in front, ₫ on the back; the flip shows the back.
    this.coinSide = kit.std(0x2775ca, { roughness: 0.35, metalness: 0.4 });
    const front = new MeshStandardMaterial({ map: faceTexture('usdc'), roughness: 0.4 });
    const back = new MeshStandardMaterial({ map: faceTexture('vnd'), roughness: 0.4 });
    kit.materials.push(front, back);
    const coinMesh = new Mesh(kit.geo(new CylinderGeometry(0.22, 0.22, 0.06, 40)), [this.coinSide, front, back]);
    coinMesh.rotation.x = Math.PI / 2; // cylinder top (USDC) now faces +z, bottom (₫) faces −z
    this.coinInner.add(coinMesh);
    this.coin.add(this.coinInner);
    this.group.add(this.coin);
  }

  /** Where the bank card should end up: in front of the camera, over the phone (05.21). */
  update(v: number, camera: Camera, phoneAnchor: Vector3) {
    const on = seg(v, [1040, 1050]) * (1 - seg(v, [1395, 1400]));
    this.group.visible = on > 0.01 && v < 1400;
    if (!this.group.visible) return;

    fadeMat(this.branchMat, on);
    this.branchA.draw(easeInOut(seg(v, [1050, 1080]))); // 05.2
    this.branchB1.draw(easeInOut(seg(v, [1050, 1080])));
    this.branchB2.draw(easeInOut(seg(v, [1195, 1215])));

    const w = seg(v, [1055, 1080]);
    this.wallet.scale.setScalar(Math.max(0.001, w * (1 + 0.08 * bell(seg(v, [1138, 1148])))));
    this.partner.scale.setScalar(Math.max(0.001, easeBack(seg(v, [1195, 1210])))); // 05.11

    // Border: visible with branch B, flashes as the ₫ coin crosses (05.16).
    const b = seg(v, [1180, 1200]);
    this.border.visible = b > 0.01;
    fadeMat(this.borderMat, b * (0.14 + 0.5 * bell(seg(v, [1276, 1292]))));

    // Bank card appears, receives the coin (05.20), then flies to the phone (05.21).
    const card = seg(v, [1300, 1330]);
    this.bank.visible = card > 0.01;
    this.bankMat.emissiveIntensity = 0.4 + 0.8 * bell(seg(v, [1355, 1370]));
    const fly = easeInOut(seg(v, [1360, 1400]));
    this.tmp.set(BANK.x, 0.08, BANK.z).lerp(phoneAnchor, fly);
    this.bank.position.copy(this.tmp);
    this.bank.rotation.x = fly * 1.2;
    this.bank.scale.setScalar(Math.max(0.001, card * (1 - 0.6 * fly)));

    // The ₫ coin.
    let p: Vector3 = this.tmp2;
    let s = 1;
    const start = v3(FORK.x + 0.12, 0.3, FORK.z);
    const atNode = v3(PARTNER.x + 0.5, 0.55, PARTNER.z + 0.08);
    const across = v3(BORDER_X + 0.8, 0.45, 2.75);
    const intoCard = v3(BANK.x, 0.2, BANK.z);
    if (v < 1225) p.copy(start);
    else if (v < 1262) p.copy(start).lerp(atNode, easeInOut(seg(v, [1225, 1250]))); // 05.13
    else if (v < 1345) p.copy(atNode).lerp(across, easeInOut(seg(v, [1272, 1295]))); // 05.16
    else {
      p = this.tmp2.copy(across).lerp(intoCard, easeIn(seg(v, [1345, 1365]))); // 05.20
      s = 1 - seg(v, [1360, 1366]);
    }
    this.coin.position.copy(p);
    this.coin.scale.setScalar(Math.max(0.001, s));
    this.coin.visible = s > 0.01;
    // Face the camera, then flip about the vertical axis: USDC → ₫ at 1250–1262 (KEY).
    this.dir.copy(camera.position);
    this.coin.lookAt(this.dir);
    const flip = easeInOut(seg(v, [1250, 1262]));
    this.coinInner.rotation.y = Math.PI * flip;
    this.coinSide.color.setHex(flip > 0.5 ? 0x16a34a : 0x2775ca);
  }
}
