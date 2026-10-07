# N.E.D landing page

**Locked before you start. Released when it's approved.**
Scroll-told 3D landing page for N.E.D Milestone Lock. Brief: [SPEC.md](SPEC.md).

Next.js (App Router) · TypeScript · Tailwind v4 · Lenis · Motion (Framer Motion) · three + @react-three/fiber + drei.

## Status

| Chapter | Status |
| --- | --- |
| Skeleton (smooth scroll, fixed 3D stage, top bar, links) | Built |
| 00 Hero (draggable 3D phone, Teddy, T1 glide) | Built |
| 01–14, orbit nav, present mode, EN/VI | Not yet |

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck
```

## Where things live

| Path | What |
| --- | --- |
| `src/content/links.ts` | **Every product URL.** Empty `url` → disabled "Coming soon" card, no href. |
| `src/content/copy.ts` | All on-screen English strings (`vi.ts` will mirror the keys). |
| `src/content/chapters.ts` | Chapter names and vh ranges (SPEC §6). |
| `src/scene/poses.ts` | **Poses table**: key = vh → device position / rotation / size / screen / owner. |
| `src/scene/Stage.tsx` | The one fixed `<Canvas>` behind the page; camera rig. |
| `src/scene/Phone.tsx` | Generic phone body + real HTML screen (drei `<Html transform>`). |
| `src/scene/usePhoneInteraction.ts` | Drag (±35° / ±15°, spring back), click to flip owner, hover tilt. |
| `src/screens/phone/` | Phone screen templates (light app theme). |
| `src/motion/scroll.ts` | The single scroll value `scrollVh` (story vh; K = 0.75 on phones). |
| `src/motion/tokens.ts` | `EASE` / `EASE_OUT`, springs, camera λ, and all text-animation timings (`text.reveal`, `text.scrub`). |
| `src/motion/reveal.ts` | Chapter 00 load reveal: gate (fonts + first frame, ≤ 1.2 s), phase store, `useLoadReveal`. |
| `src/motion/intro.ts` | Hero intro store `introPhase` (pending → sweeping → done). Phone, poster, Teddy, hint and tag wait for `done`. |
| `src/components/hero/RefractionBand.tsx` | Fluted-glass light band (SPEC §16, DOM version). Timings, widths, colours, contrast cap: `band` / `intro` in tokens.ts. |
| `src/components/text/` | `SplitText`, `RevealBlock`, `ChapterCopy` (SPEC §14). Copy windows `copyIn` / `copyOut` live in `chapters.ts`. |
| `ned-landing/` | Old Vite prototype (earlier story). Reference only; not part of the build. |

## How to change…

- **A link**: edit `src/content/links.ts`. Nothing else holds a URL.
- **A string**: edit `src/content/copy.ts`. Keep SPEC §7 copy rules (banned words, "example, estimated" next to every VND figure).
- **A pose**: edit the keyframes in `src/scene/poses.ts`. `position` x/y are fractions of the half viewport, `rotation` is degrees, `size` is a fraction of viewport height (width on portrait). Poses are interpolated by scroll; never hard-code them in components.

## Dev-only test hooks (not in production builds)

- `?__reduced` — JS sees `prefers-reduced-motion: reduce` (the preview browser can't emulate it).
- `window.__nedIntro()` — intro state. `window.__nedBand.pin(vw)` / `.get()` / `.speed(n)` — pin or speed up the band.
- Contrast (test 22) is measured with text hidden and the band pinned at 5–50 vw; `band.copyCap` = 0.25 passes
  (worst: muted sub-paragraph 4.68:1). Re-measure if you change the band colours, cap or copy colours.

## Deploy (Vercel)

Import the repo in Vercel; framework preset **Next.js**, root directory `/`, build `npm run build`. No env vars, no backend.
