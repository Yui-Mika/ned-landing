import {
  BufferAttribute,
  CanvasTexture,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  Path,
  PlaneGeometry,
  Quaternion,
  SRGBColorSpace,
  Shape,
  Vector3,
  type ColorRepresentation,
  type Material,
  type Texture,
} from 'three';
import { clamp, easeBack, easeOut } from '../../motion/timeline';
import type { Kit } from '../kit';
import { coinGeometry, coinMaterials } from '../coin';
import { curve, Ribbon, circleCurve } from '../ribbon';
import {
  ENV,
  addressTex,
  briefTex,
  envelopeFront,
  envelopeInside,
  fingerprintTex,
  markTex,
  pageTex,
  plateTex,
  postmarkTex,
  returnTex,
  sealTex,
  tagTex,
  trayTex,
  windowGlass,
  type EnvKind,
} from './tex';

// Airmail objects (board "Airmail · objects"). Paper things face the camera (billboards) so their
// text always reads; solid things (mailboxes, rack, desk, wallet, card) are real 3D.

const tmpQ = new Quaternion();

function flatMat(kit: Kit, map: Texture, opts: { transparent?: boolean; side?: boolean } = {}) {
  const m = new MeshBasicMaterial({ map, transparent: true, toneMapped: false, depthWrite: !opts.transparent, side: opts.side ? DoubleSide : undefined });
  kit.materials.push(m);
  return m;
}

function plane(kit: Kit, w: number, h: number, m: Material, x = 0, y = 0, z = 0) {
  const mesh = new Mesh(kit.geo(new PlaneGeometry(w, h)), m);
  mesh.position.set(x, y, z);
  return mesh;
}

function setOpacity(mats: Material[], o: number, base: number[] = []) {
  mats.forEach((m, i) => {
    m.opacity = clamp(o) * (base[i] ?? 1);
    m.visible = m.opacity > 0.005;
  });
}

let shadowTex: CanvasTexture | null = null;
function softShadow() {
  if (shadowTex) return shadowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  shadowTex = new CanvasTexture(c);
  shadowTex.colorSpace = SRGBColorSpace;
  return shadowTex;
}

/** A billboard base: root sits in the world; face turns to the camera. */
class Billboard {
  readonly root = new Group();
  readonly face = new Group();
  constructor() {
    this.root.add(this.face);
  }
  /** Face the camera, with an optional roll (radians) and a small yaw for depth. */
  turn(camQuat: Quaternion, roll = 0, yaw = 0) {
    this.face.quaternion.copy(camQuat);
    if (yaw) this.face.quaternion.multiply(tmpQ.setFromAxisAngle(new Vector3(0, 1, 0), yaw));
    if (roll) this.face.quaternion.multiply(tmpQ.setFromAxisAngle(new Vector3(0, 0, 1), roll));
  }
}

// ---------------------------------------------------------------- envelope

const EW = 0.62;
const EH = 0.4;
const px = (x: number) => (x / ENV.w - 0.5) * EW;
const py = (y: number) => (0.5 - y / ENV.h) * EH;

export type EnvelopeState = {
  opacity: number;
  /** 0 sealed … 1 peeled off. */
  peel: number;
  /** -1 no seal at all (today, nothing locked). */
  noSeal?: boolean;
  post: number;
  ret: number;
  addr: number;
  roll?: number;
  scale?: number;
};

/** A window envelope: the coin shows through; seal, postmark, RETURN stamp and TO lock are layers. */
export class Envelope extends Billboard {
  kind: EnvKind = 'usdc';
  private frontMat: MeshBasicMaterial;
  private insideMat: MeshBasicMaterial;
  private glassMat: MeshBasicMaterial;
  private sealL: Mesh;
  private sealR: Mesh;
  private sealMat: MeshBasicMaterial;
  private post: Mesh;
  private postMat: MeshBasicMaterial;
  private ret: Mesh;
  private retMat: MeshBasicMaterial;
  private addr: Mesh;
  private addrMat: MeshBasicMaterial;
  private shadowMat: MeshBasicMaterial;
  private coin: Mesh;
  private coinMats: Material[];
  private coinMatsV: Material[];
  private mats: Material[];
  private base: number[];

  constructor(kit: Kit, kind: EnvKind = 'usdc', postTop = 'SUBMIT', postBottom = '14:02') {
    super();
    this.frontMat = flatMat(kit, envelopeFront(kind));
    this.frontMat.alphaTest = 0.5;
    this.frontMat.transparent = true;
    this.insideMat = flatMat(kit, envelopeInside(kind));
    this.glassMat = flatMat(kit, windowGlass(), { transparent: true });
    this.sealMat = flatMat(kit, sealTex(), { transparent: true });
    this.postMat = flatMat(kit, postmarkTex(postTop, postBottom, '#3D1270'), { transparent: true });
    this.retMat = flatMat(kit, returnTex(), { transparent: true });
    this.addrMat = flatMat(kit, addressTex(), { transparent: true });
    this.shadowMat = flatMat(kit, softShadow(), { transparent: true });

    const [wx, wy, ww, wh] = ENV.win;
    const wcx = px(wx + ww / 2);
    const wcy = py(wy + wh / 2);
    const wW = (ww / ENV.w) * EW;
    const wH = (wh / ENV.h) * EH;

    const shadow = plane(kit, EW * 1.3, EH * 1.1, this.shadowMat, 0.02, -0.04, -0.05);
    const inside = plane(kit, wW, wH, this.insideMat, wcx, wcy, -0.012);
    this.coinMats = coinMaterials(kit, 'usdc');
    this.coinMatsV = coinMaterials(kit, 'vnd');
    this.coin = new Mesh(coinGeometry(kit, (ENV.coin[2] / ENV.w) * EW, 0.018), kind === 'usdc' ? this.coinMats : this.coinMatsV);
    this.coin.rotation.x = Math.PI / 2;
    this.coin.position.set(wcx, wcy + 0.004, -0.006);
    const front = plane(kit, EW, EH, this.frontMat, 0, 0, 0);
    const glass = plane(kit, wW, wH, this.glassMat, wcx, wcy, 0.002);

    // The seal sticker straddles the top edge: two halves that part when it peels.
    const s = 0.1;
    const half = (left: boolean) => {
      const g = kit.geo(new PlaneGeometry(s / 2, s));
      const uv = g.attributes.uv as BufferAttribute;
      for (let i = 0; i < uv.count; i++) uv.setX(i, left ? uv.getX(i) * 0.5 : 0.5 + uv.getX(i) * 0.5);
      const m = new Mesh(g, this.sealMat);
      m.position.set(left ? -s / 4 : s / 4, EH / 2 - 0.004, 0.006);
      return m;
    };
    this.sealL = half(true);
    this.sealR = half(false);

    this.post = plane(kit, 0.34, 0.17, this.postMat, 0.118, 0.07, 0.008);
    this.ret = plane(kit, 0.44, 0.115, this.retMat, 0.03, -0.02, 0.01);
    this.ret.rotation.z = 0.12;
    this.addr = plane(kit, 0.31, 0.086, this.addrMat, px(720) - 0.004, py(470) + 0.004, 0.009);

    this.face.add(shadow, inside, this.coin, front, glass, this.sealL, this.sealR, this.post, this.ret, this.addr);
    this.mats = [this.frontMat, this.insideMat, this.glassMat, this.shadowMat];
    this.base = [1, 1, 1, 0.8];
    this.kind = kind;
  }

  /** Swap between the USDC and the ₫ envelope (05.17). */
  setKind(kit: Kit, kind: EnvKind) {
    if (kind === this.kind) return;
    this.kind = kind;
    this.frontMat.map = envelopeFront(kind);
    this.insideMat.map = envelopeInside(kind);
    this.frontMat.needsUpdate = this.insideMat.needsUpdate = true;
    this.coin.material = kind === 'usdc' ? this.coinMats : this.coinMatsV;
    void kit;
  }

  set(st: EnvelopeState, camQuat: Quaternion, time = 0) {
    const o = clamp(st.opacity);
    this.root.visible = o > 0.01;
    if (!this.root.visible) return;
    this.turn(camQuat, st.roll ?? 0);
    this.face.scale.setScalar(st.scale ?? 1);
    setOpacity(this.mats, o, this.base);
    for (const m of this.coin.material as Material[]) {
      m.transparent = o < 0.999;
      m.opacity = o;
    }
    this.coin.rotation.y = Math.sin(time * 0.8) * 0.12;
    // seal
    const p = clamp(st.peel);
    const sealO = st.noSeal ? 0 : o * (1 - clamp((p - 0.4) / 0.6));
    this.sealMat.opacity = sealO;
    this.sealL.visible = this.sealR.visible = sealO > 0.01;
    this.sealL.position.x = -0.025 - p * 0.05;
    this.sealR.position.x = 0.025 + p * 0.05;
    this.sealL.rotation.z = p * 0.7;
    this.sealR.rotation.z = -p * 0.7;
    this.sealL.position.y = this.sealR.position.y = EH / 2 - 0.004 + p * 0.05;
    // stamps land: scale 1.15 → 1 while the ink comes in
    const stampIn = (mesh: Mesh, mat: MeshBasicMaterial, t: number) => {
      const k = clamp(t);
      mat.opacity = o * clamp(k * 1.6);
      mesh.visible = mat.opacity > 0.01;
      mesh.scale.setScalar(1.18 - 0.18 * easeOut(k));
    };
    stampIn(this.post, this.postMat, st.post);
    stampIn(this.ret, this.retMat, st.ret);
    stampIn(this.addr, this.addrMat, st.addr);
  }
}

// ---------------------------------------------------------------- brief

/** The brief: one letter, DONE WHEN checklist, its fingerprint stamp. */
export class Brief extends Billboard {
  private mat: MeshBasicMaterial;
  private fpMat: MeshBasicMaterial;
  private fp: Mesh;
  private shadowMat: MeshBasicMaterial;
  private paper: Mesh;

  constructor(kit: Kit) {
    super();
    this.mat = flatMat(kit, briefTex(3), { transparent: true });
    this.fpMat = flatMat(kit, fingerprintTex(), { transparent: true });
    this.shadowMat = flatMat(kit, softShadow(), { transparent: true });
    const w = 0.34;
    const h = w * (760 / 600);
    this.paper = plane(kit, w, h, this.mat);
    this.fp = plane(kit, 0.12, 0.12, this.fpMat, 0.095, -0.15, 0.004);
    this.face.add(plane(kit, w * 1.3, h * 1.1, this.shadowMat, 0.02, -0.04, -0.04), this.paper, this.fp);
  }

  /** draw: checklist reveal 0..1 (vertical wipe), fp: fingerprint stamp 0..1. */
  set(o: number, draw: number, fp: number, camQuat: Quaternion, roll = 0, scale = 1) {
    this.root.visible = o > 0.01;
    if (!this.root.visible) return;
    this.turn(camQuat, roll);
    this.face.scale.setScalar(scale);
    this.mat.opacity = o;
    this.shadowMat.opacity = o * 0.7;
    this.paper.scale.y = 0.15 + 0.85 * easeOut(clamp(draw));
    this.paper.position.y = ((1 - this.paper.scale.y) * 0.43) / 2;
    const k = clamp(fp);
    this.fpMat.opacity = o * clamp(k * 1.6);
    this.fp.visible = this.fpMat.opacity > 0.01;
    this.fp.scale.setScalar(1.25 - 0.25 * easeOut(k));
  }
}

// ---------------------------------------------------------------- flat cards (page, tag, postmark …)

export class Card extends Billboard {
  readonly mat: MeshBasicMaterial;
  readonly mesh: Mesh;
  constructor(kit: Kit, map: Texture, w: number, h: number) {
    super();
    this.mat = flatMat(kit, map, { transparent: true });
    this.mesh = plane(kit, w, h, this.mat);
    this.face.add(this.mesh);
  }
  set(o: number, camQuat: Quaternion | null, roll = 0, scale = 1) {
    this.mat.opacity = clamp(o);
    this.root.visible = this.mat.opacity > 0.01;
    if (!this.root.visible) return;
    if (camQuat) this.turn(camQuat, roll);
    else this.face.rotation.z = roll;
    this.face.scale.setScalar(scale);
  }
}

export const makePage = (kit: Kit) => new Card(kit, pageTex(), 0.17, 0.215);
export const makeTag = (kit: Kit, text: string, color: string) => new Card(kit, tagTex(text, color), 0.78, 0.17);
export const makePostmark = (kit: Kit, top: string, bottom: string, color = '#D4B5F7', waves = true) => new Card(kit, postmarkTex(top, bottom, color, waves), 0.5, 0.25);

// ---------------------------------------------------------------- mailbox

export type Role = 'client' | 'you';

/** A rounded mailbox on a post. The flag is the only gesture: up when money arrives. */
export class Mailbox {
  readonly root = new Group();
  readonly body = new Group();
  readonly label = new Object3D();
  private flagPivot = new Group();
  private flagMat: MeshStandardMaterial;
  private mats: Material[] = [];
  private shadowMat: MeshBasicMaterial;

  constructor(kit: Kit, role: Role) {
    const w = 0.46;
    const h0 = 0.26;
    const s = new Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(w / 2, h0);
    s.absarc(0, h0, w / 2, 0, Math.PI, false);
    s.lineTo(-w / 2, 0);
    const geo = kit.geo(new ExtrudeGeometry(s, { depth: 0.56, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 6, curveSegments: 32 }));
    geo.translate(0, 0, -0.28);
    const bodyMat = new MeshPhysicalMaterial({
      color: role === 'client' ? 0x818cf8 : 0xb87aed,
      roughness: 0.32,
      clearcoat: 0.7,
      clearcoatRoughness: 0.25,
      sheen: 0.4,
      sheenColor: role === 'client' ? 0xc7d2fe : 0xf0e4ff,
      emissive: role === 'client' ? 0x3730a3 : 0x5a1d9e,
      emissiveIntensity: 0.45,
      transparent: true,
    });
    const postMat = new MeshStandardMaterial({ color: 0x2a2438, roughness: 0.6, transparent: true });
    this.flagMat = new MeshStandardMaterial({ color: 0x6b7280, roughness: 0.5, transparent: true });
    const markMat = flatMat(kit, markTex(role), { transparent: true });
    this.shadowMat = flatMat(kit, softShadow(), { transparent: true });
    kit.materials.push(bodyMat, postMat, this.flagMat);
    this.mats = [bodyMat, postMat, this.flagMat, markMat];

    const bodyMesh = new Mesh(geo, bodyMat);
    bodyMesh.position.y = 0.56;
    const mark = plane(kit, 0.22, 0.22, markMat, 0, 0.56 + 0.2, 0.32);
    const post = new Mesh(kit.geo(new CylinderGeometry(0.04, 0.05, 0.58, 20)), postMat);
    post.position.y = 0.29;
    const pole = new Mesh(kit.geo(new CylinderGeometry(0.014, 0.014, 0.34, 10)), this.flagMat);
    pole.position.y = 0.17;
    const fshape = new Shape();
    fshape.moveTo(0, 0);
    fshape.lineTo(0.13, 0);
    fshape.quadraticCurveTo(0.16, 0, 0.16, 0.03);
    fshape.lineTo(0.16, 0.07);
    fshape.quadraticCurveTo(0.16, 0.1, 0.13, 0.1);
    fshape.lineTo(0, 0.1);
    const flag = new Mesh(kit.geo(new ExtrudeGeometry(fshape, { depth: 0.015, bevelEnabled: false, curveSegments: 8 })), this.flagMat);
    flag.position.set(0, 0.24, -0.008);
    this.flagPivot.add(pole, flag);
    this.flagPivot.position.set(w / 2 + 0.05, 0.62, -0.08);
    this.body.add(bodyMesh, mark, this.flagPivot);
    const shadow = plane(kit, 0.9, 0.6, this.shadowMat, 0, 0.005, 0);
    shadow.rotation.x = -Math.PI / 2;
    this.root.add(shadow, post, this.body);
    this.label.position.set(0, 0, 0.3);
    this.root.add(this.label);
  }

  /** flag 0 down … 1 up; color for up. nod in radians; bump scale. */
  set(o: number, flag: number, flagColor: ColorRepresentation, nod = 0, bump = 0, yaw = 0) {
    const op = clamp(o);
    this.root.visible = op > 0.01;
    if (!this.root.visible) return;
    setOpacity(this.mats, op);
    this.shadowMat.opacity = op * 0.8;
    const f = easeBack(clamp(flag));
    this.flagPivot.rotation.z = -Math.PI / 2 + f * (Math.PI / 2);
    this.flagMat.color.set(flag > 0.02 ? flagColor : 0x6b7280);
    this.body.rotation.x = nod;
    this.body.scale.setScalar(1 + bump);
    this.root.rotation.y = yaw;
  }
}

// ---------------------------------------------------------------- rack (the contract)

function roundedRectPath(p: Shape | Path, x: number, y: number, w: number, h: number, r: number) {
  p.moveTo(x + r, y);
  p.lineTo(x + w - r, y);
  p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r);
  p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h);
  p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r);
  p.quadraticCurveTo(x, y, x + r, y);
  return p;
}

/** The contract: a glass rack with one slot per milestone, plate "Smart contract". Nobody behind it. */
export class Rack {
  readonly root = new Group();
  readonly slots: Vector3[] = [];
  private glass: MeshPhysicalMaterial;
  private outline: Ribbon;
  private plateMat: MeshBasicMaterial;
  readonly w: number;
  readonly h: number;

  constructor(kit: Kit, n: number) {
    const sw = 0.72;
    const sh = 0.52;
    const gap = 0.12;
    this.w = n * sw + (n + 1) * gap;
    this.h = sh + 0.32;
    const x0 = -this.w / 2;
    const y0 = -this.h / 2;
    const shape = roundedRectPath(new Shape(), x0, y0, this.w, this.h, 0.1) as Shape;
    for (let i = 0; i < n; i++) {
      const sx = x0 + gap + i * (sw + gap);
      const sy = y0 + 0.2;
      shape.holes.push(roundedRectPath(new Path(), sx, sy, sw, sh, 0.06) as Path);
      this.slots.push(new Vector3(sx + sw / 2, sy + sh / 2, 0.02));
    }
    const geo = kit.geo(new ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 4, curveSegments: 16 }));
    geo.translate(0, 0, -0.04);
    this.glass = new MeshPhysicalMaterial({ color: 0xf0e4ff, roughness: 0.12, metalness: 0, transparent: true, opacity: 0.16, depthWrite: false, clearcoat: 1 });
    kit.materials.push(this.glass);
    const pts: [number, number, number][] = [];
    const r = 0.1;
    const corners = [
      [x0 + this.w - r, y0 + r, -Math.PI / 2],
      [x0 + this.w - r, y0 + this.h - r, 0],
      [x0 + r, y0 + this.h - r, Math.PI / 2],
      [x0 + r, y0 + r, Math.PI],
    ];
    for (const [cx, cy, a0] of corners) for (let k = 0; k <= 4; k++) pts.push([cx + Math.cos(a0 + (k / 4) * (Math.PI / 2)) * r, cy + Math.sin(a0 + (k / 4) * (Math.PI / 2)) * r, 0.065]);
    this.outline = new Ribbon(kit, curve(pts, true), { color: 0xd4b5f7, radius: 0.007, closed: true, segments: 200 });
    this.plateMat = flatMat(kit, plateTex('SMART CONTRACT'), { transparent: true });
    const plate = plane(kit, 0.6, 0.11, this.plateMat, 0, y0 + 0.1, 0.07);
    this.root.add(new Mesh(geo, this.glass), this.outline.group, plate);
  }

  set(o: number, draw: number, ripple = 0) {
    const op = clamp(o);
    this.root.visible = op > 0.01;
    if (!this.root.visible) return;
    this.outline.draw(draw);
    this.outline.fade(op);
    this.glass.opacity = 0.16 * op * clamp(draw * 1.5);
    this.plateMat.opacity = op * clamp((draw - 0.6) / 0.4);
    this.root.scale.setScalar(1 + 0.03 * Math.sin(clamp(ripple) * Math.PI * 3) * (1 - clamp(ripple)));
  }

  slotWorld(i: number, out: Vector3) {
    return this.root.localToWorld(out.copy(this.slots[i]));
  }
}

// ---------------------------------------------------------------- clocks

/** A countdown ring: submission (lilac → amber) or review (purple). Faces the camera. */
export class Clock extends Billboard {
  private bg: Ribbon;
  private fg: Ribbon;
  constructor(kit: Kit, r = 0.12) {
    super();
    this.bg = new Ribbon(kit, circleCurve(r, 40), { color: 0x353540, radius: 0.012, halo: false, closed: true, segments: 120 });
    this.fg = new Ribbon(kit, circleCurve(r, 40), { color: 0xffffff, radius: 0.016, closed: true, segments: 120 });
    this.face.add(this.bg.group, this.fg.group);
  }
  set(o: number, left: number, kind: 'submit' | 'review', camQuat: Quaternion, scale = 1) {
    this.root.visible = o > 0.01;
    if (!this.root.visible) return;
    this.turn(camQuat);
    this.face.scale.setScalar(scale);
    this.bg.draw(1);
    this.bg.fade(o * 0.9);
    this.fg.draw(clamp(left));
    this.fg.fade(o);
    this.fg.tint(kind === 'review' ? 0xb87aed : left < 0.25 ? 0xfbbf24 : 0xd4b5f7, 1);
  }
}

// ---------------------------------------------------------------- 05 · desk, wallet, bank card

function rounded(w: number, h: number, r: number) {
  return roundedRectPath(new Shape(), -w / 2, -h / 2, w, h, r) as Shape;
}
const soft = (depth: number, bevel: number) => ({ depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, curveSegments: 20 });

/** The licensed partner abroad: an unnamed grey desk, trays $ in and ₫ out. */
export class Desk {
  readonly root = new Group();
  constructor(kit: Kit) {
    const grey = new MeshPhysicalMaterial({ color: 0x55536a, roughness: 0.35, clearcoat: 0.6, emissive: 0x1a1824 });
    kit.materials.push(grey);
    const body = new Mesh(kit.geo(new ExtrudeGeometry(rounded(0.9, 0.34, 0.1), soft(0.42, 0.04))), grey);
    body.position.set(0, 0.2, -0.21);
    const trayIn = plane(kit, 0.3, 0.19, flatMat(kit, trayTex('$'), { transparent: true }), -0.2, 0.22, 0.26);
    const trayOut = plane(kit, 0.3, 0.19, flatMat(kit, trayTex('₫'), { transparent: true }), 0.2, 0.22, 0.26);
    this.root.add(body, trayIn, trayOut);
  }
}

export class Wallet {
  readonly root = new Group();
  constructor(kit: Kit) {
    const purple = new MeshPhysicalMaterial({ color: 0x5a1d9e, roughness: 0.35, clearcoat: 0.7, emissive: 0x270a4d });
    const lilac = new MeshPhysicalMaterial({ color: 0x3d1270, roughness: 0.3, clearcoat: 0.8, emissive: 0x160530 });
    const dot = new MeshStandardMaterial({ color: 0xf0e4ff, emissive: 0xd4b5f7, emissiveIntensity: 0.6 });
    kit.materials.push(purple, lilac, dot);
    const pocket = new Mesh(kit.geo(new ExtrudeGeometry(rounded(0.9, 0.58, 0.16), soft(0.34, 0.05))), purple);
    pocket.position.set(0, 0.34, -0.17);
    const tab = new Mesh(kit.geo(new ExtrudeGeometry(rounded(0.34, 0.2, 0.1), soft(0.06, 0.02))), lilac);
    tab.position.set(0.24, 0.34, 0.2);
    const stud = new Mesh(kit.geo(new ExtrudeGeometry(rounded(0.06, 0.06, 0.03), soft(0.03, 0.01))), dot);
    stud.position.set(0.3, 0.34, 0.29);
    this.root.add(pocket, tab, stud);
  }
}

export class BankCard {
  readonly root = new Group();
  readonly mat: MeshPhysicalMaterial;
  constructor(kit: Kit) {
    this.mat = new MeshPhysicalMaterial({ color: 0x270a4d, roughness: 0.3, clearcoat: 0.9, emissive: 0x4ade80, emissiveIntensity: 0.4 });
    const stripe = new MeshStandardMaterial({ color: 0x4ade80, emissive: 0x16a34a, emissiveIntensity: 0.5 });
    const chip = new MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.6, roughness: 0.3 });
    kit.materials.push(this.mat, stripe, chip);
    const body = new Mesh(kit.geo(new ExtrudeGeometry(rounded(0.86, 0.54, 0.07), soft(0.025, 0.012))), this.mat);
    const st = new Mesh(kit.geo(new PlaneGeometry(0.86, 0.08)), stripe);
    st.position.set(0, 0.12, 0.04);
    const ch = new Mesh(kit.geo(new ExtrudeGeometry(rounded(0.13, 0.1, 0.025), soft(0.01, 0.004))), chip);
    ch.position.set(-0.26, -0.06, 0.03);
    this.root.add(body, st, ch);
  }
}
