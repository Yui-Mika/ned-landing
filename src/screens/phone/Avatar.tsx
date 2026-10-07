/**
 * Generated user avatar, ported from docs/design-reference/shared/Avatar.dc.html.
 * FNV-1a 32-bit hash + murmur3 finaliser → palette, pattern, rotation, accent. Same seed = same avatar.
 */
const P = [
  ['#F2EAFB', '#7B2FBE'], ['#E3EDFC', '#1D4ED8'], ['#E7F6EC', '#127A3A'], ['#FFF5E1', '#B45309'],
  ['#FDECEC', '#C2410C'], ['#E0F5F3', '#0F766E'], ['#EEEFFE', '#4F46E5'], ['#FCE7F3', '#BE185D'],
];

const circle = (cx: number, cy: number, r: number) =>
  'M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0a' + r + ' ' + r + ' 0 1 0 ' + -2 * r + ' 0Z';
const N = 'M0 0Z';

type Shape = { p1?: string; f1?: string; s1?: string; w1?: number; p2?: string; f2?: string; s2?: string; w2?: number; p3?: string; f3?: string; o3?: number };

function render(seedIn: string) {
  const seed = seedIn.trim().toLowerCase();
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0; h ^= h >>> 16; h = h >>> 0;
  const ci = h % 8, pi = (h >>> 3) % 6, rot = ((h >>> 6) % 4) * 90;
  let ai = (h >>> 8) % 7;
  if (ai >= ci) ai += 1;
  const bg = P[ci][0], fg = P[ci][1], ac = P[ai][1];
  const S: Shape[] = [
    // sun and moon
    { p1: circle(26, 15, 10), f1: fg, p2: circle(12, 29, 5.5), f2: ac, p3: circle(31, 31, 2.5), f3: '#FFFFFF', o3: 0.9 },
    // hill and sun
    { p1: 'M-2 42L-2 27Q20 11 42 27L42 42Z', f1: fg, p2: circle(28, 12, 5), f2: ac, p3: 'M-2 42L-2 34Q20 24 42 34L42 42Z', f3: '#FFFFFF', o3: 0.35 },
    // two quarters
    { p1: 'M0 0H22A22 22 0 0 1 0 22Z', f1: fg, p2: 'M40 40H18A22 22 0 0 1 40 18Z', f2: ac, p3: circle(20, 20, 3.5), f3: '#FFFFFF', o3: 0.95 },
    // ring and dot
    { p1: circle(20, 20, 12), f1: 'none', s1: fg, w1: 5, p2: circle(20, 20, 4.5), f2: ac, p3: circle(33, 8, 3), f3: fg, o3: 0.6 },
    // half and bead
    { p1: 'M0 22H40V40H0Z', f1: fg, p2: circle(20, 22, 8), f2: ac, p3: circle(20, 22, 3), f3: '#FFFFFF', o3: 0.9 },
    // blocks
    { p1: 'M9 9h11v11h-11z', f1: fg, p2: 'M20 20h11v11h-11z', f2: ac, p3: circle(25.5, 14.5, 4.5), f3: fg, o3: 0.45 },
  ];
  return { seed, bg, rot, s: S[pi] };
}

export function Avatar({ seed, size }: { seed: string; size: number }) {
  const { seed: s0, bg, rot, s } = render(seed);
  return (
    <div
      role="img"
      aria-label={'Avatar for @' + s0}
      style={{ width: size, height: size, borderRadius: 9999, overflow: 'hidden', flexShrink: 0, background: bg }}
    >
      <svg width="100%" height="100%" viewBox="0 0 40 40" aria-hidden="true" style={{ display: 'block' }}>
        <rect width="40" height="40" fill={bg} />
        <g transform={`rotate(${rot} 20 20)`}>
          <path d={s.p1 || N} fill={s.f1 || 'none'} stroke={s.s1 || 'none'} strokeWidth={s.w1 || 0} />
          <path d={s.p2 || N} fill={s.f2 || 'none'} stroke={s.s2 || 'none'} strokeWidth={s.w2 || 0} />
          <path d={s.p3 || N} fill={s.f3 || 'none'} fillOpacity={s.o3 ?? 1} />
        </g>
      </svg>
    </div>
  );
}
