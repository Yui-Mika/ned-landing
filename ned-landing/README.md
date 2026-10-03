# N.E.D landing page

Scroll-told landing page for **N.E.D Milestone Lock** (UniHackfest 2026): *Locked before you start. Released when it's approved.*
One persistent 3D scene, ten chapters (00–09), scroll is the only control. Also used on the projector at the pitch (`?present=1`).

Stack: Vite · React 19 · TypeScript · Motion for React (`motion/react`) · three.js · Lenis · GitHub Pages.

> **Prototype v0.4 (3 Oct 2026) · asset set "A · Ribbon".** All ten chapters are in. Teddy appears **in the hero only**
> (2D art until the team's model arrives); every other chapter is told with abstract objects: ribbons, pebbles, a loop, gates,
> coins. The app screens in chapter 06 are **proposed designs** until real screenshots exist.

## Run

```bash
npm install
npm run dev        # http://localhost:5173/ned-landing/
npm run build      # dist/, deployed to Pages by .github/workflows/deploy.yml on push to main
```

URL flags: `?present=1` projector mode (PageDown / Space / → jump between 26 stops, larger type, no cursor-follow) ·
`?debug=1` shows the current story position in vh.

## How it is put together

The spec is the storyboard canvas: boards **RB-Frames … RB-Facts** ("Asset set · Direction A · Ribbon") for the objects,
**AD-Coins** for the coin, and the motion map (**MM-00 … MM-09**) for timing. Row ids such as `02.6` appear in code comments.
Where the MM boards still mention two Teddys or the box Fund, the Ribbon boards win.

| Layer | Where | Driven by |
|---|---|---|
| Story position | `src/motion/useScrollVh.ts` | Lenis → scrollY → `storyVh` (vh; phones scale by K = 0.75) |
| Ranges, stops | `src/motion/timeline.ts` | single source of truth, numbers from motion map v3.1 |
| Page layer | `src/chapters/*`, `src/components/Reveal.tsx` | `useTransform(storyVh, …)`: `Words`, `Fade`, `Chapter`, `Anchored` |
| 3D scene | `src/scene/Stage.ts` + `objects/*` | reads `storyVh.get()` every frame; every object is a function of vh |
| Camera | `src/scene/camera.ts` | segments + lens shift (scene sits right of the copy) |
| Ribbons, coins | `src/scene/ribbon.ts`, `coin.ts`, `paths.ts` | tube ribbons with draw-on and taper; milled-edge coin; shared centre lines |
| Actors | `src/scene/objects/pebble.ts` | two pebbles (client abroad, freelancer in Vietnam); `PebbleDirector` gives the story beats |
| Teddy (hero) | `src/components/TeddyHero.tsx`, `src/scene/teddy/*` | 2D art now; `GltfTeddy` takes over when a model URL is set |

Reduced motion: no scrubbing; the story snaps between key states (`REDUCED_STATES`) behind a 300 ms dip; pebbles and Teddy hold still.
No WebGL: a still 2D frame (`StaticScene`; Teddy art fetched by `scripts/fetch-teddy.mjs`, hero only), copy reads in full.

### Why three.js directly, not React Three Fiber

The scene is written against three.js directly (one `Stage` class) instead of R3F/drei. Decided 3 Oct 2026: the build machine
could not install R3F, and a scene that is a pure function of one scroll value needs little of R3F's declarative layer.
Swapping to R3F later is mechanical: each object's `update(v)` becomes a `useFrame`.

## Plugging in the Teddy model

1. Put the file at `public/models/teddy.glb`.
2. Set `TEDDY_MODEL_URL = 'models/teddy.glb'` in `src/config.ts`.

Teddy appears in the hero only, so the model needs just two clips, named exactly `idle` and `wave` (wave plays once, then
idle loops). It is scaled to the scene's Teddy height and stands right of the hero loop. Until it loads, the 2D art stays.
Please send the 2D art at 1024 px or more as well: the current PNG is about 200 px.

## Copy rules

All copy is in `src/content/copy.ts`, English only. Banned words: pay, paid, payment, payout, deposit, escrow, interest, yield,
invest, earn, safe, risk-free, scam-free, guaranteed, credit score, rating, pool, vault. VND is always
"≈ … VND (example, estimated)" at 25,810 VND/USD (Vietcombank, 2 Oct 2026); refresh before 8 Oct.
No partner names until confirmed. No "open source" claim until the repo has a LICENSE.

## Open items

- Teddy model (GLB, clips `idle` + `wave`) and a larger 2D Teddy PNG from the team.
- Licensed partner not confirmed: the partner stays an unnamed grey shape.
- Real Milestone Lock screenshots for chapter 06 (`SCREENS_ARE_PROPOSED` in `src/config.ts`).
- Exchange rate refresh before 8 Oct.
- Waitlist: no email collected until storage inside Vietnam is decided (`WAITLIST_ENDPOINT`).
