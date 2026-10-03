import { CanvasTexture, SRGBColorSpace } from 'three';

// Canvas textures for the Airmail objects (board "Airmail · objects"). Drawn once, cached by key.
// Text is Space Mono / Space Grotesk when the web fonts are loaded, with system fallbacks.

export const PAPER = '#F4EEE3';
export const PAPER_HI = '#FBF7F0';
export const PAPER_G = '#E4F3E8';
export const STRIPE_A = '#9B4FDE';
export const STRIPE_B = '#6366F1';
export const INK = '#3D1270';
export const SEAL = '#7B2FBE';
export const GREEN = '#4ADE80';
export const AMBER = '#FBBF24';

const MONO = '"Space Mono", "DejaVu Sans Mono", monospace';
const DISPLAY = '"Space Grotesk", Arial, "DejaVu Sans", sans-serif';

const cache = new Map<string, CanvasTexture>();

function make(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  draw(g);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(key, t);
  return t;
}

/** Forget cached textures (on stage dispose). */
export function disposeTextures() {
  cache.forEach((t) => t.dispose());
  cache.clear();
}

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function stripes(g: CanvasRenderingContext2D, w: number, h: number, band: number, r: number) {
  g.save();
  rr(g, 0, 0, w, h, r);
  g.clip();
  g.fillStyle = PAPER;
  g.fillRect(0, 0, w, h);
  const step = band * 1.7;
  g.lineWidth = step / 4;
  for (let i = -h; i < w + h; i += step) {
    g.strokeStyle = Math.round(i / step) % 2 === 0 ? STRIPE_A : STRIPE_B;
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + h, h);
    g.stroke();
  }
  g.restore();
}

export function mustachePath(g: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  g.beginPath();
  const p = (x: number, y: number) => [cx + x * s, cy + y * s] as const;
  g.moveTo(...p(0, -1));
  g.bezierCurveTo(...p(-4, -6), ...p(-10, -7), ...p(-15, -4));
  g.bezierCurveTo(...p(-19, -2), ...p(-22, -3), ...p(-24, -6));
  g.bezierCurveTo(...p(-24, 0), ...p(-19, 5), ...p(-12, 4));
  g.bezierCurveTo(...p(-7, 3), ...p(-3, 1), ...p(0, -1));
  g.bezierCurveTo(...p(3, 1), ...p(7, 3), ...p(12, 4));
  g.bezierCurveTo(...p(19, 5), ...p(24, 0), ...p(24, -6));
  g.bezierCurveTo(...p(22, -3), ...p(19, -2), ...p(15, -4));
  g.bezierCurveTo(...p(10, -7), ...p(4, -6), ...p(0, -1));
  g.closePath();
}

function stamp(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string) {
  g.fillStyle = '#FFFFFF';
  g.fillRect(x, y, w, h);
  // perforations
  g.fillStyle = PAPER;
  const r = w * 0.045;
  for (let i = 0; i <= 9; i++) {
    g.beginPath();
    g.arc(x + (i / 9) * w, y, r, 0, Math.PI * 2);
    g.arc(x + (i / 9) * w, y + h, r, 0, Math.PI * 2);
    g.fill();
  }
  for (let i = 0; i <= 11; i++) {
    g.beginPath();
    g.arc(x, y + (i / 11) * h, r, 0, Math.PI * 2);
    g.arc(x + w, y + (i / 11) * h, r, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = fill;
  g.fillRect(x + w * 0.12, y + h * 0.1, w * 0.76, h * 0.8);
  g.fillStyle = '#FFFFFF';
  mustachePath(g, x + w / 2, y + h * 0.42, w * 0.024);
  g.fill();
  g.font = `700 ${w * 0.16}px ${MONO}`;
  g.textAlign = 'center';
  g.fillText('N.E.D', x + w / 2, y + h * 0.72);
}

export type EnvKind = 'usdc' | 'vnd';

/** Envelope front, 1024×660. The window (80..450 × 150..470) is transparent so the coin shows through. */
export const ENV = { w: 1024, h: 660, win: [80, 150, 370, 320] as const, coin: [265, 300, 118] as const };

export function envelopeFront(kind: EnvKind) {
  return make(`env-${kind}`, ENV.w, ENV.h, (g) => {
    const { w, h } = ENV;
    stripes(g, w, h, 34, 34);
    const grad = g.createLinearGradient(0, 0, w * 0.3, h);
    grad.addColorStop(0, kind === 'usdc' ? PAPER_HI : '#F3FBF5');
    grad.addColorStop(1, kind === 'usdc' ? PAPER : PAPER_G);
    g.fillStyle = grad;
    rr(g, 34, 34, w - 68, h - 68, 18);
    g.fill();
    // window
    const [wx, wy, ww, wh] = ENV.win;
    g.save();
    g.globalCompositeOperation = 'destination-out';
    rr(g, wx, wy, ww, wh, 26);
    g.fill();
    g.restore();
    g.strokeStyle = 'rgba(61,18,112,0.28)';
    g.lineWidth = 4;
    rr(g, wx, wy, ww, wh, 26);
    g.stroke();
    // amount under the window
    g.fillStyle = INK;
    g.textAlign = 'center';
    g.font = `700 ${kind === 'usdc' ? 44 : 36}px ${MONO}`;
    g.fillText(kind === 'usdc' ? '250 USDC' : '≈ 6,500,000 VND', wx + ww / 2, wy + wh + 62);
    // address
    g.textAlign = 'left';
    g.fillStyle = 'rgba(61,18,112,0.7)';
    g.font = `400 27px ${MONO}`;
    g.fillText(kind === 'usdc' ? 'FROM  CLIENT · ABROAD' : 'FROM  PARTNER · ABROAD', 500, 400);
    g.fillStyle = 'rgba(61,18,112,0.18)';
    g.fillRect(500, 416, 440, 3);
    g.fillStyle = INK;
    g.font = `700 32px ${MONO}`;
    g.fillText(kind === 'usdc' ? 'TO  YOU · VIETNAM' : 'TO  YOUR BANK · VN', 500, 486);
    g.fillStyle = 'rgba(61,18,112,0.18)';
    g.fillRect(500, 502, 440, 3);
    stamp(g, 820, 74, 132, 160, kind === 'usdc' ? SEAL : '#15803D');
  });
}

/** Window glass: a faint white sheen with one highlight stroke, 370×320. */
export function windowGlass() {
  return make('glass', 370, 320, (g) => {
    g.fillStyle = 'rgba(255,255,255,0.22)';
    rr(g, 0, 0, 370, 320, 26);
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.75)';
    g.lineWidth = 9;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(34, 110);
    g.lineTo(130, 34);
    g.stroke();
  });
}

/** Envelope interior seen through the window. */
export function envelopeInside(kind: EnvKind) {
  return make(`inside-${kind}`, 64, 64, (g) => {
    g.fillStyle = kind === 'usdc' ? '#E2D7C5' : '#D3E9DA';
    g.fillRect(0, 0, 64, 64);
  });
}

/** The seal sticker: a purple disc with a lock, 256×256. */
export function sealTex() {
  return make('seal', 256, 256, (g) => {
    const grad = g.createRadialGradient(90, 80, 10, 128, 128, 128);
    grad.addColorStop(0, '#C79BF2');
    grad.addColorStop(0.55, SEAL);
    grad.addColorStop(1, '#3D1270');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(128, 128, 124, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.45)';
    g.lineWidth = 5;
    g.beginPath();
    g.arc(128, 128, 92, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = '#FFFFFF';
    g.lineWidth = 12;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(98, 124);
    g.lineTo(98, 104);
    g.arc(128, 104, 30, Math.PI, 0);
    g.lineTo(158, 124);
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.25)';
    rr(g, 86, 120, 84, 64, 16);
    g.fill();
    g.strokeStyle = '#FFFFFF';
    g.lineWidth = 10;
    rr(g, 86, 120, 84, 64, 16);
    g.stroke();
  });
}

/** Round postmark with cancellation waves on the left, 1024×512. */
export function postmarkTex(top: string, bottom: string, color = '#D4B5F7', waves = true) {
  return make(`pm-${top}-${bottom}-${color}-${waves}`, 1024, 512, (g) => {
    const cx = 700;
    const cy = 256;
    g.strokeStyle = color;
    g.fillStyle = color;
    g.lineCap = 'round';
    if (waves) {
      g.lineWidth = 14;
      for (let k = -1; k <= 1; k++) {
        g.beginPath();
        const y = cy + k * 70;
        g.moveTo(40, y);
        for (let i = 0; i < 4; i++) g.quadraticCurveTo(40 + i * 120 + 60, y + (i % 2 ? 26 : -26), 40 + (i + 1) * 120, y);
        g.stroke();
      }
    }
    g.lineWidth = 16;
    g.beginPath();
    g.arc(cx, cy, 220, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 7;
    g.beginPath();
    g.arc(cx, cy, 178, 0, Math.PI * 2);
    g.stroke();
    g.textAlign = 'center';
    g.font = `700 ${top.length > 6 ? 62 : 80}px ${MONO}`;
    g.fillText(top, cx, cy - 6);
    g.font = `400 ${bottom.length > 7 ? 48 : 64}px ${MONO}`;
    g.fillText(bottom, cx, cy + 82);
  });
}

/** RETURN TO SENDER, amber, 768×200. */
export function returnTex() {
  return make('return', 768, 200, (g) => {
    g.fillStyle = 'rgba(251,191,36,0.16)';
    rr(g, 8, 8, 752, 184, 26);
    g.fill();
    g.strokeStyle = AMBER;
    g.lineWidth = 12;
    rr(g, 8, 8, 752, 184, 26);
    g.stroke();
    g.lineWidth = 4;
    rr(g, 30, 30, 708, 140, 16);
    g.stroke();
    g.fillStyle = '#F59E0B';
    g.textAlign = 'center';
    g.font = `700 70px ${MONO}`;
    g.fillText('RETURN TO SENDER', 384, 124);
  });
}

/** The TO field written once, with a lock tab, 720×200. */
export function addressTex() {
  return make('address', 720, 200, (g) => {
    g.fillStyle = PAPER_HI;
    rr(g, 0, 30, 640, 160, 16);
    g.fill();
    g.fillStyle = 'rgba(61,18,112,0.7)';
    g.font = `400 28px ${MONO}`;
    g.fillText('TO', 32, 84);
    g.fillStyle = INK;
    g.font = `700 36px ${MONO}`;
    g.fillText('YOU · VND · YOUR BANK', 32, 140);
    g.fillStyle = 'rgba(61,18,112,0.2)';
    g.fillRect(32, 156, 560, 3);
    g.save();
    g.translate(600, 44);
    g.rotate(0.14);
    g.fillStyle = SEAL;
    rr(g, -86, -32, 172, 64, 14);
    g.fill();
    g.fillStyle = '#FFFFFF';
    g.font = `700 30px ${MONO}`;
    g.textAlign = 'center';
    g.fillText('ONCE', 0, 11);
    g.restore();
  });
}

/** The brief: a letter with DONE WHEN and its fingerprint, 600×760. */
export function briefTex(ticks = 3) {
  return make(`brief-${ticks}`, 600, 760, (g) => {
    g.fillStyle = PAPER_HI;
    g.beginPath();
    g.moveTo(24, 0);
    g.lineTo(500, 0);
    g.lineTo(600, 100);
    g.lineTo(600, 736);
    g.arcTo(600, 760, 576, 760, 24);
    g.lineTo(24, 760);
    g.arcTo(0, 760, 0, 736, 24);
    g.lineTo(0, 24);
    g.arcTo(0, 0, 24, 0, 24);
    g.fill();
    g.fillStyle = '#DCD2C2';
    g.beginPath();
    g.moveTo(500, 0);
    g.lineTo(500, 80);
    g.arcTo(500, 100, 520, 100, 20);
    g.lineTo(600, 100);
    g.fill();
    g.fillStyle = INK;
    g.font = `700 52px ${MONO}`;
    g.fillText('BRIEF', 56, 112);
    g.fillStyle = 'rgba(61,18,112,0.7)';
    g.font = `400 30px ${MONO}`;
    g.fillText('DONE WHEN', 56, 192);
    for (let i = 0; i < 4; i++) {
      const y = 240 + i * 78;
      g.strokeStyle = 'rgba(61,18,112,0.6)';
      g.lineWidth = 5;
      rr(g, 56, y, 38, 38, 8);
      g.stroke();
      if (i < ticks) {
        g.strokeStyle = '#127A3A';
        g.lineWidth = 7;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(64, y + 20);
        g.lineTo(73, y + 30);
        g.lineTo(88, y + 9);
        g.stroke();
      }
      g.fillStyle = 'rgba(61,18,112,0.32)';
      rr(g, 120, y + 12, i % 2 ? 260 : 340, 14, 7);
      g.fill();
    }
    g.fillStyle = 'rgba(61,18,112,0.75)';
    g.font = `400 26px ${MONO}`;
    g.fillText('9f3a…c21e', 56, 712);
  });
}

/** Fingerprint stamp (overlay on the brief), 256×256. */
export function fingerprintTex(color = SEAL) {
  return make(`fp-${color}`, 256, 256, (g) => {
    g.fillStyle = 'rgba(123,47,190,0.12)';
    g.beginPath();
    g.arc(128, 128, 120, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = color;
    g.lineCap = 'round';
    g.lineWidth = 6;
    g.beginPath();
    g.arc(128, 128, 116, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 9;
    for (const k of [0.25, 0.5, 0.75, 1]) {
      g.beginPath();
      g.ellipse(128, 150, 70 * k, 80 * k, 0, Math.PI * 1.05, Math.PI * 1.95);
      g.stroke();
    }
    g.beginPath();
    g.moveTo(128, 150);
    g.lineTo(128, 200);
    g.stroke();
  });
}

/** Mailbox role marks (white): meridian = abroad, pen curl = maker. 256×256. */
export function markTex(kind: 'client' | 'you') {
  return make(`mark-${kind}`, 256, 256, (g) => {
    g.strokeStyle = 'rgba(255,255,255,0.92)';
    g.lineWidth = 14;
    g.lineCap = 'round';
    if (kind === 'client') {
      g.beginPath();
      g.ellipse(128, 128, 52, 90, 0, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      g.moveTo(40, 128);
      g.bezierCurveTo(80, 150, 176, 150, 216, 128);
      g.stroke();
    } else {
      g.beginPath();
      g.moveTo(66, 196);
      g.bezierCurveTo(56, 90, 160, 50, 190, 112);
      g.bezierCurveTo(214, 166, 130, 196, 110, 150);
      g.bezierCurveTo(96, 120, 126, 100, 146, 116);
      g.stroke();
    }
  });
}

/** The work: a page with a folded corner, 300×380. */
export function pageTex() {
  return make('page', 300, 380, (g) => {
    g.fillStyle = '#F0E4FF';
    g.beginPath();
    g.moveTo(20, 0);
    g.lineTo(220, 0);
    g.lineTo(300, 80);
    g.lineTo(300, 360);
    g.arcTo(300, 380, 280, 380, 20);
    g.lineTo(20, 380);
    g.arcTo(0, 380, 0, 360, 20);
    g.lineTo(0, 20);
    g.arcTo(0, 0, 20, 0, 20);
    g.fill();
    g.fillStyle = 'rgba(184,122,237,0.75)';
    g.beginPath();
    g.moveTo(220, 0);
    g.lineTo(220, 60);
    g.arcTo(220, 80, 240, 80, 20);
    g.lineTo(300, 80);
    g.fill();
    g.fillStyle = '#7B2FBE';
    for (let i = 0; i < 4; i++) {
      rr(g, 46, 160 + i * 50, i % 2 ? 150 : 200, 18, 9);
      g.fill();
    }
  });
}

/** A label plate, e.g. SMART CONTRACT. */
export function plateTex(text: string) {
  return make(`plate-${text}`, 640, 120, (g) => {
    g.fillStyle = '#160530';
    rr(g, 4, 4, 632, 112, 56);
    g.fill();
    g.strokeStyle = 'rgba(184,122,237,0.7)';
    g.lineWidth = 5;
    rr(g, 4, 4, 632, 112, 56);
    g.stroke();
    g.fillStyle = '#D4B5F7';
    g.font = `700 46px ${MONO}`;
    g.textAlign = 'center';
    g.fillText(text, 320, 76);
  });
}

/** A short floating tag (NOT SENT …). */
export function tagTex(text: string, color: string) {
  return make(`tag-${text}-${color}`, 512, 110, (g) => {
    g.fillStyle = 'rgba(20,20,24,0.88)';
    rr(g, 4, 4, 504, 102, 51);
    g.fill();
    g.strokeStyle = color;
    g.lineWidth = 4;
    rr(g, 4, 4, 504, 102, 51);
    g.stroke();
    g.fillStyle = color;
    g.font = `700 44px ${MONO}`;
    g.textAlign = 'center';
    g.fillText(text, 256, 70);
  });
}

/** Partner desk tray faces: $ in, ₫ out. */
export function trayTex(glyph: '$' | '₫') {
  return make(`tray-${glyph}`, 256, 160, (g) => {
    g.fillStyle = '#1C1C24';
    rr(g, 6, 6, 244, 148, 28);
    g.fill();
    g.strokeStyle = glyph === '$' ? '#5EA2EF' : GREEN;
    g.lineWidth = 7;
    rr(g, 6, 6, 244, 148, 28);
    g.stroke();
    g.fillStyle = glyph === '$' ? '#5EA2EF' : GREEN;
    g.font = `700 100px ${DISPLAY}`;
    g.textAlign = 'center';
    g.fillText(glyph, 128, 116);
  });
}

/** Stamp-sheet stamps (08) and hollow stamp outlines (07), 300×380. */
export function sheetStampTex(when: string, title: string, on: boolean) {
  return make(`ss-${when}-${title}-${on}`, 300, 380, (g) => {
    g.fillStyle = on ? PAPER : '#2A2438';
    g.fillRect(14, 14, 272, 352);
    g.fillStyle = '#000000';
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i <= 8; i++) {
      for (const y of [14, 366]) {
        g.beginPath();
        g.arc(14 + (i / 8) * 272, y, 11, 0, Math.PI * 2);
        g.fill();
      }
    }
    for (let i = 0; i <= 10; i++) {
      for (const x of [14, 286]) {
        g.beginPath();
        g.arc(x, 14 + (i / 10) * 352, 11, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.globalCompositeOperation = 'source-over';
    g.textAlign = 'center';
    g.fillStyle = on ? INK : '#9CA3AF';
    g.font = `700 34px ${MONO}`;
    g.fillText(when, 150, 120);
    g.fillStyle = on ? INK : '#D1D5DB';
    g.font = `700 48px ${DISPLAY}`;
    g.fillText(title, 150, 210);
  });
}

export function hollowStampTex() {
  return make('hollow', 300, 380, (g) => {
    g.strokeStyle = 'rgba(240,228,255,0.55)';
    g.lineWidth = 6;
    g.setLineDash([4, 16]);
    g.lineCap = 'round';
    rr(g, 16, 16, 268, 348, 8);
    g.stroke();
  });
}

/** One printed rule line on N.E.D's label (07). */
export function ruleLineTex() {
  return make('rule', 512, 64, (g) => {
    g.fillStyle = PAPER_HI;
    rr(g, 0, 0, 512, 64, 14);
    g.fill();
    g.fillStyle = 'rgba(61,18,112,0.55)';
    rr(g, 22, 24, 360, 16, 8);
    g.fill();
    g.fillStyle = '#127A3A';
    g.beginPath();
    g.arc(470, 32, 14, 0, Math.PI * 2);
    g.fill();
  });
}
