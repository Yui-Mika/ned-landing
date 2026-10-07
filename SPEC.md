# N.E.D Landing Page — Master Prompt

Dán toàn bộ nội dung bên dưới (từ "ROLE" đến hết) vào Claude Code / Cursor / bất kỳ AI coding agent nào.
Các thông tin chưa có đã được ghi "NONE YET, use placeholder" — AI sẽ dùng placeholder và đánh dấu `TODO(asset)`. Khi có thông tin thật, thay đúng chỗ đó (hoặc nhắn AI cập nhật).

---

## ROLE

You are a senior creative developer (Next.js, Three.js, Framer Motion). Build a scroll-driven, interactive 3D landing page that explains and advertises **N.E.D Milestone Lock** to three audiences: any visitor, freelancers, and clients (hiring partners). The page must feel like a premium product launch (reference: https://www.14islands.com/work/hatom — Next.js + Three.js + Framer Motion, smooth scroll, 3D objects), but with MORE interactivity: scroll-driven storytelling, a draggable 3D object, and 3D navigation.

Work in this order: (1) read this whole brief, (2) propose a short file/component plan, (3) build the page chapter by chapter, (4) run the acceptance checks at the end. Ask at most one question if something blocks you; otherwise use the defaults given here.

## 1. THE PRODUCT (source of truth — do not invent features)

**N.E.D Milestone Lock** is software that lets a freelancer and a client agree on work in milestones, with the money locked before work starts.

One-sentence version: *A client locks USDC (a US-dollar stablecoin) for each milestone in a smart contract on Solana before work starts. When a milestone is approved, or its review time ends, the contract releases it to the freelancer — to their own wallet where that is allowed, or as VND to a bank account in Vietnam through a licensed payout partner.*

Headline: **"Locked before you start. Released when it's approved."**
Pitch line: "Freelancers receive their earnings, locked by code."

How it works (the flow the page must teach):
1. **Client writes one brief** (milestones, deadlines, what counts as "Done when"). The brief's fingerprint (SHA-256) is saved on-chain so neither side can change it.
2. **Freelancer reads the brief, accepts, and chooses once where the money goes**: USDC to their N.E.D wallet (outside Vietnam) or VND to their bank (in Vietnam). Never types an address.
3. **Client locks the money** per milestone. Freelancer sees "Locked" before starting. Held by the program, not by N.E.D.
4. **Freelancer submits before the deadline.** Time + a fingerprint of the work are recorded. Files stay on their computer.
5. **Client approves → released.** Or the review time ends with no answer → released on its own (anyone can trigger it).
6. **Miss a submission deadline → that milestone's money returns to the client.**
7. Every step leaves a public record (Solana Explorer) and a Records page.

Two devices, one wallet: Workspace (computer) for writing the brief, submitting, reviewing; Mobile app (phone) for accepting, locking, seeing money arrive. Same Google sign-in, no seed phrase.

What N.E.D is NOT: it does not hold money, convert money, or charge a fee during the pilot. Nobody, including N.E.D, can move the money any other way.

Example numbers (always labelled "example, estimated"): milestone = 250 USDC; rate 26,019.5 VND/USD (2 Oct 2026) → ≈ 6,500,000 VND (rounded to nearest 10,000); two milestones = 500 USDC ≈ 13,010,000 VND.

### Honest status (must be visible on the page — chapter 13)
- NOW: demo on a **test network** (Solana devnet, test money). Program `ned_program` deployed on devnet.
- Payout partner and bank transfer are **simulated** in the demo. Partner not confirmed.
- NOT YET: no identity checks (KYC), no security audit, no way to settle disputes over quality (planned after launch), no lawyer review yet, USDC is issued by Circle which can freeze an address.
- NEXT: partner + legal → closed pilot (up to 1,000 USDC per contract) → later more.

## 2. AUDIENCE AND CALLS TO ACTION

| Audience | What they must understand in 10 seconds | What they do next |
|---|---|---|
| Any visitor | "Money for my work is locked before I start." | Scroll the story |
| Freelancer (esp. Vietnam) | "I see the money locked, and in Vietnam I only ever see VND." | Try the mobile app |
| Client / hiring partner | "I lock per milestone, I approve or it releases; I'm also protected (refund if no delivery)." | Open the Workspace and write a brief |

### Link table — render as 3 prominent product cards in the final chapter AND in a persistent top-right menu
| Product | Label | URL | Status |
|---|---|---|---|
| Workspace (computer) | Open the Workspace | https://unihackfest-2026.vercel.app | live (test network) |
| Mobile app | Try the app (test network) | https://tdat10052499.github.io/Unihackfest-2026/ | live (test network) |
| Communication Hub | Open the Communication Hub | NONE YET, use placeholder (empty URL → disabled "Coming soon" card) | coming soon |

Rules: put all URLs in ONE file `src/content/links.ts`. If a URL is empty, render the card disabled with a "Coming soon" chip and no `href` (not `#`). Links open in a new tab with `rel="noopener"`. Every link card shows the badge "Test network".

## 3. TECH STACK (match the reference, plus 3D tooling)
- Next.js (App Router) + TypeScript + Tailwind.
- **Lenis** for smooth scroll; ONE scroll progress value drives everything (page layer + 3D scene).
- **Framer Motion** (`useScroll`, `useTransform`, springs) for DOM animation.
- **three + @react-three/fiber + @react-three/drei** for the 3D scene (one persistent fixed `<Canvas>` behind the content; scenes are driven by scroll progress, not by separate canvases).
- Phone/laptop screens: real HTML placed on the 3D bodies with CSS3D / drei `<Html transform>` so text stays crisp. Do NOT render screens as blurry canvas textures.
- Deploy target: Vercel. No backend. No analytics that need a cookie banner.

## 4. DESIGN SYSTEM
- Mood: dark, premium, calm fintech; one purple accent family. Not neo-brutalist on the landing.
- Colors: bg `#06060E`, surface `#111116` / `#16161D`, text `#F4F4F6`, muted `#9CA3AF`, accent purple `#B87AED` / `#C084FC` / `#D4B5F7`, deep purple `#7B2FBE`, indigo `#818CF8` (client ring), amber `#FBBF24` (refund / warning), green for ₫ / VND moments, blue for $ / USDC moments.
- Fonts: **Space Grotesk** (headlines), **Inter** (body), **Space Mono** (numbers, fingerprints, tags). Always give fallback stacks.
- Device ownership convention (repeat everywhere): ring/tag **indigo = Client's phone/computer**, **purple = Your phone/computer**, **grey = Anyone**. Every device on screen carries a small tag naming its owner.
- Mascot: **Teddy** (a bear) appears ONLY in the hero, waving, head follows cursor. Teddy asset: NONE YET, use placeholder (a simple 2D bear shape; mark `TODO(asset)`). When a real 2D image/SVG or glb is provided, swap it in.
- Generic phone and laptop shapes (no real brand shapes). Phone has visible thickness (6 faces); laptop lid rotates on a hinge 0° → 105°.
- No stock photos. No emoji as icons. No Airmail/envelope metaphor (decided: dropped). Only two plain UI chips travel between devices: the **invite link** (chapter 03) and the **amount** (chapter 07).

## 5. INTERACTION SPEC (the part that must beat the reference)

### 5.1 Scroll-driven storytelling
- Total story length ≈ 3,300 vh on desktop (scale all ranges by 0.75 on phones). Every device pose, screen state, countdown and slider is a **pure function of scroll position** (never wall-clock time) so back-scroll, jump-to-chapter and reduced motion stay exact.
- Pinned (sticky) stage: the 3D scene stays fixed; the copy column (max 34% width on desktop) scrolls beside it.
- Rule per beat: one screen, one finger action (tap / type / slide), then the result. Beside it: one headline and at most two lines of copy.
- Slider interactions ("Slide to accept / lock / release"): the thumb position follows scroll progress through its range; the result screen appears 4 vh after 100%.
- Typing: characters appear with scroll (brief "Done when" list, links); the fingerprint string changes per keystroke then settles.
- Clocks and countdowns: digits are computed from scroll (vh), not time.

### 5.2 Interactive 3D object (hero + recurring)
- The hero object is the **3D phone** (three-quarter turn, ~78% viewport height, centre-right) showing the Home screen: "Locked for you ≈ 13,010,000 VND · example, estimated".
- The user can **drag to rotate** it (limited ±35° yaw, ±15° pitch, spring back to the story pose when released) and **click/tap it to flip** to the other party's phone (client ↔ you) with the owner tag changing. Hover: slight tilt toward the cursor and a soft glow in the owner colour.
- A "lock" glyph (padlock formed from the N.E.D mark) stamps onto the screen when money is locked.
- Hint text "Drag me" fades after first interaction.

### 5.3 Device transform vocabulary (use exactly these names in code)
- **T1 Glide** (40–60 vh): device moves along a curve, turns ≤ ±25° toward where it goes.
- **T2 Flip** (20–30 vh): phone rotates 180° around vertical axis; back shows owner tag; returns as the other person's phone. One phone model, two owners, never both at once.
- **T3 Split** (30–40 vh): one phone becomes two side by side, each tagged.
- **T4 Dock** (30–40 vh): phone flies into the laptop browser's top-right corner and shrinks to the wallet panel (86%); undock reverses it. Says: the wallet panel in the Workspace is the N.E.D app itself.
- **T5 Zoom** (40–70 vh): camera pushes 1.6× onto one detail (a list, two cards, a slider), then pulls out.
- **T6 Fan** (30–40 vh): one phone fans into three; folds back.
- **T7 Tilt** (20 vh): phone leans back 30° like lying on a desk (looking at a record).
- **T8 Lift-off** (20–40 vh): a UI element (invite link, fingerprint) leaves the screen as a flat chip.
- **T9 Owner turn** (30–40 vh): laptop turns 180° on its base; tag changes Client's computer → Your computer.
- Motion tokens: ease out `[0.22,1,0.36,1]`, inOut `[0.65,0,0.35,1]`; springs soft `{stiffness:140,damping:22}`, snap `{stiffness:420,damping:32}`; camera damping λ = 6.

### 5.4 3D navigation
- **Chapter orbit nav** (fixed, left or bottom): a small 3D ring/rail of 15 nodes (one per chapter) with the current chapter lit. Hover a node → label + a tiny preview pose of the device. Click → the **camera flies** (not a jump) to that chapter's pose while Lenis scrolls to its start (800–1200 ms, ease inOut).
- **Present mode** (key `P` or a button): jumps through 37 "present stops" with ←/→ and Space; auto-advance every ~4 s optional; hover effects disabled. Used for pitching in ~2.5 minutes.
- Persistent top bar: N.E.D wordmark · chapter name · "Try the demo ↗" (opens the product link menu: Workspace / Mobile / Communication Hub).
- Progress bar and a "SCROLL ↓" cue at the start only.

## 6. CHAPTERS (story script — follow this order)
Copy below is final unless marked. Keep headlines as written.

| # | vh | Chapter | Devices and beats | Headline / copy |
|---|---|---|---|---|
| 00 | 0–140 | Hero | Your phone centre-right, rises 40 px, turns −40° → −18°; Teddy waves at its left. T1 glide to left at the end. | H: **Locked before you start. Released when it's approved.** Sub: Your client locks USDC for each milestone. When a milestone is approved, or its review time ends, it's released to you: to your wallet where that's allowed, or as VND to your bank account in Vietnam. Chip: *Demo on a test network*. Buttons: Try the demo ↗ · Scroll |
| 01 | 140–360 | The problem | Your phone: "Files sent ✓", status-bar clock jumps 3 days → 14 → 30, no reply. T3 split: Client's phone with draft "Send 500 USDC up front to someone I've never met?" and a grey send button. Both dim, then N.E.D splash. | H: **Today, the work comes first. The money comes later.** Both sides carry a risk (never paint clients as villains). |
| 02 | 360–560 | Sign in, say where you live | Phone centred 82%. Tap "Continue with Google"; tap "I live in Vietnam"; sample amount flips 250.00 USDC → ≈ 6,500,000 VND. T2 flip to Client's phone, parks right. | H: **Sign in with Google. Say where you live.** L1: No seed phrase. Your wallet is set up when you sign in. L2: Live in Vietnam? The app shows only VND. You never hold crypto. Small: You can change it in Settings. |
| 03 | 560–860 | The brief | Laptop (Client's computer) slides in, lid opens; form: title "Landing page design", M1 "Wireframes and visual design" 250 USDC, M2 "Build and launch" 250 USDC; T5 zoom on "Done when" list typing 4 items; fingerprint changes per keystroke; Create → confirm in wallet panel; T8 invite-link chip lifts off; T6 fan of three phone screens ("Prefer the phone? Same three steps."). | H: **Your client writes one brief.** L1: Milestones, deadlines, and what counts as done for each one. L2: Its fingerprint is saved on the chain, so neither side can change it. Small: The brief travels encrypted inside the invite link. The link can't move money. |
| 04 | 860–1120 | Accept, and choose once | Link chip drops into Your phone (Vietnam). "Brief fingerprint matches ✓". Two cards: "VND to my bank in Vietnam (licensed partner · simulated)" selected; "USDC to my N.E.D wallet" greyed (outside Vietnam only). T5 zoom; "TO" label stamps; slide to accept follows scroll. | H: **You read the brief, then choose once where the money goes.** L1: You choose once, when you accept the contract. You never type an address. L2: In Vietnam: VND to your bank through a licensed partner. Chip: Partner in talks · simulated in the demo |
| 05 | 1120–1360 | Lock | Workspace overview "Needs your action · Lock in wallet". T4 dock: phone becomes the wallet panel. Panel: total 500.00 USDC · released when approved, or after the review time · refunded if a submission deadline is missed · Slide to lock. Lock glyph stamps. T4 undock → Your phone "Locked · ≈ 13,010,000 VND · held by the program, not by N.E.D". | H: **Your client locks it before you start.** L1: The whole amount, per milestone, held by the program. L2: Nobody, including N.E.D, can move the money any other way. Chip: You can see it's there |
| 06 | 1360–1620 | Work and submit | T9 laptop owner turn → Your computer. Submit M1: links (Figma · version 2214, GitHub · commit 3f9a1c2), two files dropped, scan line leaves short codes; "Done when" ✓ ×4; confirm in wallet panel; "Submitted · On time · recorded … · chain clock". Phone mirrors: "In review · released on its own on … if there's no answer". | H: **Submit before the deadline.** L1: The time and a fingerprint of your work are recorded. L2: Your files stay on your computer. Only their fingerprints are saved. |
| 07 | 1620–1900 | Review and release (KEY MOMENT) | Client's phone: "Released on its own in 2 d 14 h"; link check "Matches what was submitted ✓" (a changed link flashes "Doesn't match"); T5 zoom on "Slide to release"; "Released · 250.00 USDC to the licensed partner". T3 split: Your phone appears; the amount chip crosses the seam and turns **$ 250 USDC → ≈ 6,500,000 VND**. | H: **Your client checks the work, then releases it.** L1: Each link is checked against the fingerprint saved when you submitted. L2: Your client approves, and that part is released. Block: ≈ 6,500,000 VND · example, estimated · milestone 1, 250 USDC. Small: Bank transfer simulated in this demo. This is the visual climax: add particles/glow, hold ~60 vh. |
| 08 | 1900–2200 | If someone goes quiet | T6 fan: three phones. A Approved. B Review time ended → clock hits 0 → "Review time over · anyone can release" → slider moves by itself → released. C No submission → "Not submitted · deadline passed · anyone can refund" → "Refunded to the client". Chip: Disputes over quality: planned after launch. | L: No answer by the review deadline? It's released to you on its own. L: Miss a submission deadline, and that milestone's money goes back to the client. L: Deadlines run on their own: once one passes, anyone can trigger the next step. |
| 09 | 2200–2420 | Two ways to receive | T3 split: Your phone · Vietnam (green ₫ tint: "Received ≈ 6,500,000 VND", no USDC anywhere) vs Your phone · abroad (blue $ tint: "250.00 USDC in your N.E.D wallet"). | H: **Where you live decides how you receive it.** Small: Bank transfers need an identity check by the partner. |
| 10 | 2420–2620 | Records, then close | Laptop opens on Records; phone T7 tilt; rows stream from phone into laptop table (Date · Event · Contract · With · Amount · Chain); "Close contract → Contract closed". | H: **Every step leaves a record.** L1: Keep a record of what you received, for your own tax return, visa or loan application. L2: When every milestone is done, the contract can be closed. Small: Not tax advice. |
| 11 | 2620–2800 | One wallet, two screens | T4 dock again; panel and phone show the same Home; both open the same contract. | H: **Your phone and your computer, one wallet.** L1: The wallet panel in the Workspace is the N.E.D app itself. Same Google sign-in. L2: Open a contract on any device you sign in on. L3: You confirm every step that moves money. |
| 12 | 2800–2960 | What N.E.D does and doesn't do | Phone slowly turning; screen: public record "Holder: Milestone Lock program · not N.E.D", link "Open in Solana Explorer · devnet". Two lists (does / doesn't) + proof row. | H: **N.E.D is software. The money moves by the contract's rules.** Proof row: Sign in with Google. No seed phrase. · You confirm every step that moves money. · No N.E.D fee during the pilot. · Every lock and release is a public record. |
| 13 | 2960–3140 | What's real today | Disclosures screen scrolls with the page; each row lights as its "Not yet" line appears; timeline Now · Next · Then · Later (up to 1,000 USDC per contract). | H: **What works today, and what comes next.** Use the "Honest status" list from section 1 verbatim. |
| 14 | 3140–3300 | Close + product links | Phone and laptop at rest, facing camera. Phone: Home. Laptop: Workspace sign-in. Three link cards from the Link table. | H: **See a milestone released.** Client line: Hiring? Write a brief in the Workspace and lock a milestone. CTA 1: Try the app (test network). CTA 2: Open the Workspace. Card 3: Communication Hub (coming soon if URL empty). Footer. |

For chapters 02–13, build the screens as real React components (8 phone templates: onboarding, home, form, choice, detail+slider, result, list, thread; 4 laptop templates: sign-in, editor, overview+panel, table). Use the exact strings above. Screens should look like a real product UI (light app theme inside the dark site), and every screen shows a small "Test network" mark.

## 7. COPY RULES (non-negotiable — this product is legally sensitive)
- NEVER use these words anywhere on the page: **pay / payment** (for USDC), **escrow**, **deposit**, **invest**, **yield**, **interest**, **safe / secure-as-a-guarantee / "an toàn"**, **guaranteed**, **scam-free**, **tax-compliant**, **first** (as a claim), **free / zero fees**, **credit score**, **ký quỹ**, **thanh toán**.
- USE: lock, release, refund, receive (the money / earnings), transfer, record, contract, milestone, test network, simulated.
- Say "licensed partner" and "partner in talks · simulated in the demo". NEVER name Due or Nium as a live partner. NEVER say "our partner".
- Say "test network" instead of "devnet / test money" in headlines; "devnet" allowed in small technical labels.
- Fee line is exactly: "No N.E.D fee during the pilot." (not "free").
- Money amounts in VND are always shown with "example, estimated".
- Never claim: that money moves on mainnet today, that disputes exist today, that screens are final, that N.E.D converts or holds money, that the partner is live.
- Tone: plain, confident, short sentences, no hype words ("revolutionary", "game-changing", "seamless").
- Bilingual: ship English first. Prepare `src/content/vi.ts` with a Vietnamese translation of every string (same keys) and an EN/VI toggle in the top bar. In Vietnamese, avoid the banned Vietnamese words above; use "khóa" (lock), "giải ngân/chuyển cho bạn" → prefer "mở khóa chuyển cho bạn" or "chuyển đến bạn" for release, and "hoàn lại" for refund.

## 8. PERFORMANCE, ACCESSIBILITY, FALLBACKS
- Lighthouse: Performance ≥ 85 desktop, ≥ 70 mobile. First screen interactive in < 3 s on a mid phone: lazy-load 3D, show an SVG/CSS poster of the phone while loading, preloader "N.E.D" with progress.
- `prefers-reduced-motion`: no glide/flip/zoom; hard cuts between still states with 300 ms crossfades; every screen still shown; the ₫ moment survives as one composed still.
- Portrait/mobile (390 × 844): phone at 92% width rising from the bottom (top 60% visible); laptop becomes a cropped browser card; T4 dock becomes a crossfade; K = 0.75 on all vh ranges; drag-rotate stays, nav orbit becomes a bottom chapter dots bar.
- Any text that the copy refers to must render ≥ 11 px (desktop) / ≥ 12 px (portrait); otherwise make it a context beat or add a T5 zoom.
- Keyboard: all links/buttons focusable, visible focus ring; present-mode keys documented; skip link; alt text/ARIA for the 3D canvas ("Illustration of the N.E.D app").
- WebGL unsupported → graceful static layout with the same copy and screenshots.
- Pause ambient loops when the tab is hidden. Dispose geometries/textures on unmount.
- SEO/share: title "N.E.D — Locked before you start. Released when it's approved."; meta description from the hero sub; OG image 1200×630: NONE YET, use placeholder (generate a simple dark card with the N.E.D wordmark and the headline); favicon: NONE YET, use placeholder.

## 9. ASSETS I WILL PROVIDE (use placeholders until then, mark `TODO(asset)`)
- Logo / wordmark N.E.D: NONE YET, use placeholder (text wordmark "N.E.D" in Space Grotesk)
- Teddy: NONE YET, use placeholder
- Real screenshots of app screens: NONE YET, use placeholder (build the HTML screens from the strings above)
- OG image, favicon
- Link: Communication Hub: NONE YET, use placeholder (disabled "Coming soon" card, no href)
- Contact / team / hackathon credit line: NONE YET, use placeholder (default footer text: "Built for Unihackfest 2026")

## 10. DELIVERABLES
1. A running Next.js project (`pnpm dev`) with the file structure: `src/content/{links,copy,vi}.ts`, `src/motion/tokens.ts`, `src/scene/` (Stage, Phone, Laptop, poses table), `src/chapters/00…14`, `src/components/{OrbitNav,PresentMode,DeviceTag,Chip}`.
2. A **poses table** (`src/scene/poses.ts`): key = vh, value = {device, position, rotation, scale, screen, owner}; poses are interpolated, never hard-coded inside components.
3. A short README: how to change a link, a string, a pose; how to deploy on Vercel.

## 11. ACCEPTANCE TESTS (run before you say you're done)
1. Scroll top to bottom and back: nothing jumps; every device pose matches the poses table at the chapter start vh.
2. Drag and click the hero phone: it rotates within limits, springs back, flips owner on click.
3. Click each of the 15 orbit-nav nodes: camera flies to the chapter, copy and screen are correct.
4. Present mode: 37 stops, ←/→ works, hover effects off.
5. Links: Workspace and Mobile open the correct URLs in a new tab; Communication Hub card is disabled with "Coming soon" when its URL is empty.
6. Search the built page text for every banned word in section 7: zero hits.
7. Every VND figure carries "example, estimated"; every device screen shows "Test network".
8. 5-second test on chapters 04, 05, 07: a new viewer can answer (a) Where is the money right now? (b) Who can take it out, and when? (c) What if the client never answers? (d) What if no work is submitted?
9. Reduced-motion and portrait layouts render all content with no overlap.
10. Lighthouse numbers from section 8.

If a requirement here conflicts with performance on a phone, cut in this order and tell me: (1) travelling chips except the amount chip in 07, (2) the phone fan in 03, (3) the second dock in 11, (4) rows streaming in 10, (5) the split in 01. NEVER cut: 02, 03 brief, 04 accept, 05 lock, 06 submit, 07 release + VND, 08 B and C, 13 disclosures.
