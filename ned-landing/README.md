# N.E.D landing page

Scroll-told landing page for **N.E.D Milestone Lock** (UniHackfest 2026): *Locked before you start. Released when it's approved.*
One persistent 3D scene, ten chapters (00–09), scroll is the only control. Also used on the projector at the pitch (`?present=1`).

Stack: Vite · React 19 · TypeScript · Motion for React (`motion/react`) · three.js · Lenis · GitHub Pages.

> **Prototype v0.3 (3 Oct 2026).** All ten chapters are in. Teddy is a **block placeholder** until the team's model arrives;
> the app screens in chapter 06 are **proposed designs** until real screenshots exist.

## Run

```bash
npm install
npm run dev        # http://localhost:5173/ned-landing/
npm run build      # dist/, deployed to Pages by .github/workflows/deploy.yml on push to main
```

URL flags: `?present=1` projector mode (PageDown / Space / → jump between 26 stops, larger type, no cursor-follow) ·
`?debug=1` shows the current story position in vh.

## How it is put together

The motion map on the storyboard canvas (boards **MM-00 … MM-09**, "Motion system", "Teddy 3D") is the spec.
Row ids such as `02.6` appear in code comments.

| Layer | Where | Driven by |
|---|---|---|
| Story position | `src/motion/useScrollVh.ts` | Lenis → scrollY → `storyVh` (vh; phones scale by K = 0.75) |
| Ranges, stops | `src/motion/timeline.ts` | single source of truth, numbers from motion map v3.1 |
| Page layer | `src/chapters/*`, `src/components/Reveal.tsx` | `useTransform(storyVh, …)`: `Words`, `Fade`, `Chapter`, `Anchored` |
| 3D scene | `src/scene/Stage.ts` + `objects/*` | reads `storyVh.get()` every frame; every object is a function of vh |
| Camera | `src/scene/camera.ts` | segments + lens shift (scene sits right of the copy) |
| Teddys | `src/scene/teddy/*` | `Director` (story beats) → `TeddyRig` (placeholder or model) |

Reduced motion: no scrubbing; the story snaps between key states (`REDUCED_STATES`) behind a 300 ms dip; Teddy holds still poses.
No WebGL: a still 2D frame (`StaticScene`, Teddy art fetched by `scripts/fetch-teddy.mjs`), copy reads in full.

### Why three.js directly, not React Three Fiber

The scene is written against three.js directly (one `Stage` class) instead of R3F/drei. Decided 3 Oct 2026: the build machine
could not install R3F, and a scene that is a pure function of one scroll value needs little of R3F's declarative layer.
Swapping to R3F later is mechanical: each object's `update(v)` becomes a `useFrame`.

## Plugging in the Teddy model

1. Put the file at `public/models/teddy.glb`.
2. Set `TEDDY_MODEL_URL = 'models/teddy.glb'` in `src/config.ts`.

The model needs (board "Teddy 3D · what the model needs"): one rig for both roles; accessory nodes `acc_client` and
`acc_freelancer`; bones `head`, `hand_L`, `hand_R`; optional morph target `blink`; clips named exactly
`idle walk wave give catch hold lock reach think headShake approve nod proud bye happy curious surprised sleepy`.
Missing clips fall back to `idle`. The model is scaled to the scene's Teddy height. Until it loads, the block placeholders stay.

## Copy rules

All copy is in `src/content/copy.ts`, English only. Banned words: pay, paid, payment, payout, deposit, escrow, interest, yield,
invest, earn, safe, risk-free, scam-free, guaranteed, credit score, rating, pool, vault. VND is always
"≈ … VND (example, estimated)" at 25,810 VND/USD (Vietcombank, 2 Oct 2026); refresh before 8 Oct.
No partner names until confirmed. No "open source" claim until the repo has a LICENSE.

## Open items

- Teddy model (GLB with clips) from the team.
- Real Milestone Lock screenshots for chapter 06 (`SCREENS_ARE_PROPOSED` in `src/config.ts`).
- Exchange rate refresh before 8 Oct.
- Waitlist: no email collected until storage inside Vietnam is decided (`WAITLIST_ENDPOINT`).
