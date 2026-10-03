import {
  CanvasTexture,
  CircleGeometry,
  LatheGeometry,
  MeshStandardMaterial,
  SRGBColorSpace,
  Vector2,
  type BufferGeometry,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Kit } from './kit';

// The coin from board "Coins": milled edge, raised rim, inner ring, embossed glyph, metal shine.
// Lies flat (faces ±y). Not the USDC logo: a plain $ and the word USDC.

export const COIN_R = 0.16;
export const COIN_H = 0.05;

export type CoinKind = 'usdc' | 'vnd';

const SPEC = {
  usdc: { face: ['#5EA2EF', '#2775CA', '#1A4F8F'], edge: 0x2775ca, glyph: '$', word: 'USDC' },
  vnd: { face: ['#4ADE80', '#16A34A', '#0F5C2C'], edge: 0x16a34a, glyph: '₫', word: 'VND' },
} as const;

function faceTexture(kind: CoinKind) {
  const s = SPEC[kind];
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(190, 160, 20, 256, 256, 280);
  grad.addColorStop(0, s.face[0]);
  grad.addColorStop(0.55, s.face[1]);
  grad.addColorStop(1, s.face[2]);
  g.fillStyle = grad;
  g.beginPath();
  g.arc(256, 256, 256, 0, Math.PI * 2);
  g.fill();
  // inner ring
  g.strokeStyle = 'rgba(255,255,255,0.6)';
  g.lineWidth = 10;
  g.beginPath();
  g.arc(256, 256, 206, 0, Math.PI * 2);
  g.stroke();
  // glyph
  g.fillStyle = '#FFFFFF';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${kind === 'usdc' ? 230 : 250}px "Space Grotesk", Arial, "DejaVu Sans", sans-serif`;
  g.fillText(s.glyph, 256, 250);
  g.font = '700 54px "Space Mono", "DejaVu Sans Mono", monospace';
  g.globalAlpha = 0.85;
  g.fillText(s.word, 256, 400);
  g.globalAlpha = 1;
  // specular sweep
  g.strokeStyle = 'rgba(255,255,255,0.4)';
  g.lineWidth = 16;
  g.lineCap = 'round';
  g.beginPath();
  g.arc(256, 256, 180, Math.PI * 1.08, Math.PI * 1.42);
  g.stroke();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Edge (lathe, milled) + top face + bottom face, as one geometry with three material groups. */
export function coinGeometry(kit: Kit, r = COIN_R, h = COIN_H): BufferGeometry {
  const prof = [
    new Vector2(r * 0.86, h / 2),
    new Vector2(r * 0.95, h / 2 + h * 0.18),
    new Vector2(r, h / 2),
    new Vector2(r, -h / 2),
    new Vector2(r * 0.95, -h / 2 - h * 0.18),
    new Vector2(r * 0.86, -h / 2),
  ];
  const segs = 144;
  const edge = new LatheGeometry(prof, segs);
  // Milled edge: alternate the radius of the two outer rows, segment by segment.
  const pos = edge.attributes.position;
  for (let i = 0; i <= segs; i++) {
    const k = i % 2 === 0 ? 1 : 0.986;
    for (const j of [2, 3]) {
      const idx = i * prof.length + j;
      pos.setX(idx, pos.getX(idx) * k);
      pos.setZ(idx, pos.getZ(idx) * k);
    }
  }
  edge.computeVertexNormals();
  const top = new CircleGeometry(r * 0.88, 64).rotateX(-Math.PI / 2).translate(0, h / 2 + 0.001, 0);
  const bottom = new CircleGeometry(r * 0.88, 64).rotateZ(Math.PI).rotateX(Math.PI / 2).translate(0, -h / 2 - 0.001, 0);
  const merged = mergeGeometries([edge, top, bottom], true);
  edge.dispose();
  top.dispose();
  bottom.dispose();
  return kit.geo(merged);
}

/** Materials for [edge, top, bottom]. A flip coin passes two kinds: top USDC, bottom ₫. */
export function coinMaterials(kit: Kit, top: CoinKind, bottom: CoinKind = top) {
  const edge = new MeshStandardMaterial({ color: SPEC[top].edge, metalness: 0.6, roughness: 0.3 });
  const a = new MeshStandardMaterial({ map: faceTexture(top), metalness: 0.35, roughness: 0.38 });
  const b = top === bottom ? a : new MeshStandardMaterial({ map: faceTexture(bottom), metalness: 0.35, roughness: 0.38 });
  kit.materials.push(edge, a);
  if (b !== a) kit.materials.push(b);
  return [edge, a, b];
}

export const COIN_EDGE = { usdc: SPEC.usdc.edge, vnd: SPEC.vnd.edge };
