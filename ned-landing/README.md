# N.E.D landing page

**N.E.D: shared money, held by rules, not by a middleman.**
A scroll-told landing page for N.E.D (NorthAxis E-Wallet Digital), a USDC wallet on Solana.
It is also projected during the UniHackfest 2026 final pitch (`?present=1`).

Live: https://yui-mika.github.io/ned-landing/ · App demo (test network): https://tdat10052499.github.io/Unihackfest-2026/
Product source of truth: [Tdat10052499/Unihackfest-2026](https://github.com/Tdat10052499/Unihackfest-2026), `docs/07-strategy-v3`.

## Status

| Chapter | Status |
| --- | --- |
| 00 Preloader · 01 Hero · 01→02 transition · 02 The problem | Prototype (2 Oct 2026) |
| 03 The idea · 04 Three ways · 08 Close | Reduced version, 5 Oct |
| 05 The app · 06 Trust · 07 What's real today · presentation pass | Final, 8 Oct |

## Run it

```bash
npm install
npm run dev        # http://localhost:5173/ned-landing/
npm run build      # static build in dist/
npm run typecheck
```

Pushing to `main` builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`).
One-time setup: repo **Settings → Pages → Source: GitHub Actions**.

## Where things live

| Folder | What |
| --- | --- |
| `src/content/` | All on-screen copy, one file per chapter. Reviewed by the Compliance Lead; edit here, not in components. |
| `src/config.ts` | `SEGMENT` (neutral / A / B), `WAITLIST_ENDPOINT` (off), links, coin counts. |
| `src/motion/timeline.ts` | Every scroll range in vh. The DOM and the 3D scene both read it. |
| `src/scene/` | The one persistent three.js scene: camera rig, Fund, coins, hand, figures. Lazy-loaded. |
| `src/chapters/` | DOM text for each chapter. |
| `src/components/` | Preloader, Teddy, mustache glyph, no-WebGL fallback. |
| `public/assets/` | Teddy art, fetched by `scripts/fetch-teddy.mjs` (not committed). |

## Rules this code follows

- Scroll is the only way the story moves; no clicks are needed.
- All text is real DOM text; Teddy is decorative (`aria-hidden`).
- `prefers-reduced-motion`: no camera travel, no orbit; chapters swap behind a short dip. Same content.
- No WebGL: a still picture of the Fund replaces the scene.
- Copy never uses: pay, payment, deposit, escrow, interest, yield, invest, earn, safe, risk-free, scam-free,
  guaranteed, credit score, rating, pool, vault.
- No email is collected until a storage endpoint inside Vietnam is approved (`WAITLIST_ENDPOINT`).

## URL flags

- `?present=1`: projector mode. Brighter ground, type ×1.2, less grain, PageDown / Space jump between stops,
  no cursor-follow or idle sleepy.
