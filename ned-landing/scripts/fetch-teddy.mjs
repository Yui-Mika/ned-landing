// Fetches Teddy's mood art from the product repo into public/assets/teddy/.
// Runs before dev and build (npm "predev" / "prebuild"); skips files that already exist.
// Source: Tdat10052499/Unihackfest-2026 · ned-wallet/assets/images/ (2D set, ~200 px).
// Replace with the layered 1024 px set once it exists.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MOODS = ['waving', 'thinking', 'surprised', 'sleepy', 'curious', 'happy', 'proud'];
const BASE =
  'https://raw.githubusercontent.com/Tdat10052499/Unihackfest-2026/main/ned-wallet/assets/images/';
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'teddy');

mkdirSync(out, { recursive: true });

let failed = 0;
for (const mood of MOODS) {
  const file = join(out, `${mood}.png`);
  if (existsSync(file)) continue;
  const url = `${BASE}${encodeURIComponent(`mascot teddy - ${mood}.png`)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    console.log(`teddy: ${mood}.png`);
  } catch (err) {
    failed++;
    console.warn(`teddy: could not fetch ${mood}.png (${err.message})`);
  }
}

if (failed) console.warn(`teddy: ${failed} image(s) missing; Teddy will not show those moods.`);
