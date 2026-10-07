# CLAUDE.md

N.E.D landing page: scroll-told 3D landing for N.E.D Milestone Lock (Next.js App Router, TypeScript, Tailwind, Lenis, Motion, R3F).

## Source of truth
- `SPEC.md` sections 1–16 are the source of truth. Addenda (12–16) win over 1–11 where they conflict. Do not invent features.
- `README.md` says where things live (links, copy, chapters, poses, motion tokens).

## Working rules
- Use npm (not pnpm): `npm run dev`, `npm run build`, `npm run typecheck`.
- Build one chapter at a time, then stop and report. Do not start the next chapter unasked.
- Never commit or push unless asked.
- Banned words are listed in SPEC section 7. Check every string you add (EN and VI) against it.
- Screens drawn inside the phone/laptop follow SPEC section 12 (light tokens, radius 20/28, 52 px pill buttons, no outlines/gradients/glows/shadows inside screens).
- Poses come from `src/scene/poses.ts`; URLs only from `src/content/links.ts`; strings only from `src/content/copy.ts`.

## Dev-only test hooks
- `?__reduced`, `window.__nedIntro`, `window.__nedBand` must never ship to production.
  Keep them behind `process.env.NODE_ENV !== 'production'` (see `src/app/layout.tsx`, `src/motion/intro.ts`, `src/components/hero/RefractionBand.tsx`).

## Reporting
- Always end with what you could not verify (and why).
