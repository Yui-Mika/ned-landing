# N.E.D landing page

Scroll-told landing page for **N.E.D Milestone Lock** (UniHackfest 2026): *Locked before you start. Released when it's approved.*
One persistent 3D scene, ten chapters (00–09), scroll is the only control. Also used on the projector at the pitch (`?present=1`).

Stack: Vite · React 19 · TypeScript · Motion for React (`motion/react`) · three.js · Lenis · GitHub Pages.

> **Prototype v0.5 (3 Oct 2026) · concept "Airmail", motion map v4.1.** All ten chapters are in, 2,680 vh, 28 present stops.
> Teddy appears **in the hero only** (2D art until the team's model arrives). The story is told with window envelopes (the coin
> shows through), a glass rack as the contract, two mailboxes, two clocks (submission, review), dashed routes and the partner desk
> abroad. Chapter 06 shows a laptop (Workspace) and a phone, following the NED Wallet design system and the live demo path.

## Run

```bash
npm install
npm run dev        # http://localhost:5173/ned-landing/
npm run build      # dist/, deployed to Pages by .github/workflows/deploy.yml on push to main
```

URL flags: `?present=1` projector mode (PageDown / Space / → jump between 26 stops, larger type, no cursor-follow) ·
`?debug=1` shows the current story position in vh.

## How it is put together

The spec is the storyboard canvas: boards **AW-Story, AW-Objects, AW-Frames, AW-Sequences, AW-Copy** (concept Airmail v4.1)
for the story and objects, and the motion map v4.1 (**MotionMap, MM-System, MM-00 … MM-09**) for timing. Row ids such as `04.17`
appear in code comments. The Ribbon (RB-*) and F0–F9 boards are older.

| Layer | Where | Driven by |
|---|---|---|
| Story position | `src/motion/useScrollVh.ts` | Lenis → scrollY → `storyVh` (vh; phones scale by K = 0.75) |
| Ranges, stops | `src/motion/timeline.ts` | single source of truth, numbers from motion map v3.1 |
| Page layer | `src/chapters/*`, `src/components/Reveal.tsx` | `useTransform(storyVh, …)`: `Words`, `Fade`, `Chapter`, `Anchored` |
| 3D scene | `src/scene/Stage.ts` + `objects/*` | reads `storyVh.get()` every frame; every object is a function of vh |
| Camera | `src/scene/camera.ts` | segments + lens shift (scene sits right of the copy) |
| Airmail objects | `src/scene/airmail/parts.ts`, `tex.ts` | envelope (window, seal, postmark, RETURN stamp, TO lock), brief, mailbox, rack, clock, desk, wallet, card |
| Choreography | `src/scene/airmail/story.ts` | every object as a function of vh (motion map v4.1) |
| 06 devices | `src/components/Devices.tsx` | laptop (Workspace) + phone screens, light design system |
| Teddy (hero) | `src/components/TeddyHero.tsx`, `src/scene/teddy/*` | 2D art now; `GltfTeddy` takes over when a model URL is set |

Reduced motion: no scrubbing; the story snaps between key states (`REDUCED_STATES`) behind a 300 ms dip; envelopes and Teddy hold still.
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
"≈ … VND (example, estimated)" at 26,019.5 VND/USD (rate of 2 Oct 2026, as in the app), rounded to 10,000;
refresh before 8 Oct. App words are translated: payout partner → licensed partner, program vault → held by the program.
No partner names until confirmed. No "open source" claim until the repo has a LICENSE.

## Open items

- Teddy model (GLB, clips `idle` + `wave`) and a larger 2D Teddy PNG from the team.
- Licensed partner not confirmed: the partner stays an unnamed grey shape.
- Real Milestone Lock screenshots for chapter 06 (`SCREENS_ARE_PROPOSED` in `src/config.ts`).
- Exchange rate refresh before 8 Oct.
- Waitlist: no email collected until storage inside Vietnam is decided (`WAITLIST_ENDPOINT`).
