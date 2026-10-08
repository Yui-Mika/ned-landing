# N.E.D demo video brief

Written 8 Oct 2026 from the latest `main` of both repos. Docs only: no code was changed, nothing was captured or built.

| Repo | Before | After |
| --- | --- | --- |
| `ned-landing` (this repo) | `44632c7` | `44632c7` (already up to date) |
| `Tdat10052499/Unihackfest-2026` (product, `D:\Code\Unihackfest-2026`) | `ffd804a` | `ea598bb` (fast-forward) |

**Rule used in this brief:** facts come from the product repo, wording comes from the landing copy. Where they disagree, section 2 lists the conflict and does not pick a side silently. Anything not checked is marked **[CONFIRM]**.

Source short names:
- **DL**: `Unihackfest-2026/docs/09-milestone-lock/README.md` (decision log)
- **PS**: `Unihackfest-2026/docs/09-milestone-lock/product-spec.md`
- **TH**: `Unihackfest-2026/docs/tong-hop-tien-do.md`
- **SPEC**: `ned-landing/SPEC.md`
- **COPY**: `ned-landing/src/content/copy.ts`
- **CH**: `ned-landing/src/content/chapters.ts`
- **LINKS**: `ned-landing/src/content/links.ts`

---

## 1. Facts

### 1.1 The product in one sentence
A foreign client locks USDC for each milestone in a Solana program before work starts. The program releases a milestone when the client accepts it, or when anyone presses Release now after the review deadline (unless the client requested changes in time). It goes to the destination the freelancer chose: their own wallet abroad, or a payout partner that would pay VND to a bank account in Vietnam. The partner is simulated in the demo. *(PS §1; DL "In one line")*

- Pitch line: *"Freelancers receive their earnings, locked by code."* *(PS §1; DL C11)*
- N.E.D holds no funds, converts nothing and charges no fee in v1. *(PS §2; DL D2)*
- Product name: the commit log shows `b9bc53a docs: name N.E.D · No Empty Deals (CL option A)` and, earlier, `552c9da … N.E.D, Network of Employment Deals`. Which expansion to use (if any) in the video: **[CONFIRM]**.

### 1.2 The flow *(PS §3)*
1. **Create (client).** Freelancer's @username, a title, 1 to 5 milestones (USDC amount, submission deadline and review deadline for each), and a brief with "Done when" points. The brief's SHA-256 goes on-chain (`brief_hash`). The brief itself travels encrypted (invite link `#k=`, plus per-device key wraps since D22).
2. **Accept and choose where earnings go (freelancer).** "USDC to my N.E.D wallet" (international) or "VND to my Vietnamese bank account through a payout partner" (Vietnam). The freelancer never types an address. The choice cannot change later. `accept` fails if the brief differs.
3. **Lock (client).** The full amount. The freelancer sees "Locked" before starting.
4. **Submit (freelancer)** before the deadline (chain time). The delivery is links, file fingerprints and a note. Only its SHA-256 goes on-chain. Since 7 Oct a first submission needs a preview link and a promised list of final files (TH rows R1, F1, F2; PS amendments in DL D27).
5. **Accept & release (client), or Release now.** If the client does nothing by the review deadline, anyone can press Release now, unless the client requested changes in time. **Nothing releases by itself** (DL D26).

Rules table *(PS §3)*:
- Missed submission deadline → anyone can refund that milestone to the client.
- Client requests changes (`dispute` plus a review note, before the review deadline) → Release now stops and the amount stays locked. It settles when the client accepts a revised version, the freelancer returns it (`concede`), or both agree a split. There is no neutral arbiter in v1. *(DL D11, D27)*. In the Workspace now; the phone app cannot respond yet (S-1) *(PS §3)*.

### 1.3 Example numbers
| Use | Numbers | Source |
| --- | --- | --- |
| Landing page (illustration) | 250 USDC per milestone ≈ 6,500,000 VND; 2 milestones = 500 USDC ≈ 13,010,000 VND; rate 26,019.5 VND/USD (2 Oct 2026); always "example, estimated" | SPEC §1, COPY `release.block` |
| Real demo | Contract A: 2 × 10 USDC = 20 USDC, Vinh sees "≈ 520,000 VND locked (estimate)". Contract B: 1 × 10 USDC | PS §4.1, §7 |
| Rate | `DEMO_USD_VND_RATE` = 26,019.5 (Wise mid-market, 2 Oct). PS says to update it on demo day, so on-screen VND in the recording may differ **[CONFIRM]** | PS §4.1 |
| Network fee | ~0.000005 SOL (devnet test SOL) | COPY (fees rows) |
| Cost note | A US$1,000 Vietnam payout costs about US$21.50 at Stripe's public prices; "not cheaper than Wise"; sell protection, never "cheapest" | DL "What the numbers say", C8 |

Arithmetic check: 250 × 26,019.5 = 6,504,875 → 6,500,000 (nearest 10,000). 500 × 26,019.5 = 13,009,750 → 13,010,000. 20 × 26,019.5 = 520,390 → 520,000.

### 1.4 Links *(LINKS; DL D21)*
| Card | Label | URL | Status |
| --- | --- | --- | --- |
| Mobile app | Try the app (test network) | https://tdat10052499.github.io/Unihackfest-2026/ | live |
| Workspace (computer) | Open the Workspace | https://unihackfest-2026.vercel.app | live |
| Community Hub | Open the Community Hub | *(empty: "Coming soon")* | coming soon |

The product repo says the job board is "N.E.D Jobs", built inside the Workspace under `/jobs/*` (DL D28), and production renders `https://unihackfest-2026.vercel.app/jobs/legal` (TH row P15). So the third card could point at `https://unihackfest-2026.vercel.app/jobs`. Name and URL: **[CONFIRM]** (see 2.i).

### 1.5 What is simulated *(PS §2, §4.1, §9)*
- The payout partner: a team-controlled devnet wallet on the program's allowlist (`FA2qzo…hbyp`, TH "Thông tin devnet"). Due and Nium are **candidates** only (DL D5, D9).
- The VND bank transfer: "Released to payout partner · VND transfer simulated in this demo". No fake "processing" or "received" steps.
- All money is devnet test money. Fees use devnet test SOL.

### 1.6 What is not built or not live
- No KYC, program not audited, no neutral arbiter, phone numbers not OTP-verified, the deploy wallet can still upgrade the program, Circle can freeze USDC addresses, not legal/tax/financial advice. *(PS §9)*
- No fee payer yet: before launch a relayer pays fees for Vietnam users. That needs a server and comes after the final. *(PS §4.3; DL D4, D8)*
- Payout partner not confirmed. The Due/Nium questions are still open (prices, matching by reference, startup eligibility). *(DL "Questions still open")*
- The phone app cannot respond to a change request yet (S-1). *(PS §3)*
- Open contract from `/new` (N1–N3) not built. *(DL D29 status)*
- D30 (roles, country, N.E.D Agreement): proposed, behind the flag `accountRoles` (off). Do not show it. *(DL D30; TH rows D30 R0–R2)*
- Shipped but **not on the landing page**: Funded Jobs (D25), lock at hire with program v1.4 live on devnet (D29), Records page (D24), request changes (D27). Leave these out of the video unless the owner asks **[CONFIRM]**.

---

## 2. Conflicts and risks (landing copy vs product docs)

| # | Landing says | Product docs say | Risk | Suggested video wording |
| --- | --- | --- | --- | --- |
| a | "released to you on its own" (COPY `quiet.l1`, `web.signIn.cards[2]`); "released automatically after the review time" (COPY `contractLocked.rules`, `contractLock.rules`, `cn3.next`); "Auto-release in …" (COPY `milestoneSubmitted.sub`, `milestoneReview.cdBefore`, `contractDetailLogo`); SPEC row 08 "slider moves by itself" | D1: anyone can release after the review deadline, **unless the client disputed in time**. D11/D27: a client who requests changes stops Release now. D26: "auto-release" removed because nothing releases by itself. PS §6 lists "auto-release" under Never | High. A false claim on screen, and the phone screens captured from chapters 06, 07 and 08 show "Auto-release" | Say "After the review deadline, anyone can press Release now, unless the client requested changes in time." Avoid capturing frames where "Auto-release" or "on its own" can be read, or blur them **[CONFIRM]** |
| b | "Live in Vietnam? The app shows only VND. You never hold crypto." (COPY `signIn.l2`) | D8: in the demo every user pays fees with devnet test SOL; "no crypto at any step" must hold **at launch**. PS §6: say "the Vietnam user never receives, holds or sends USDC", never "never touches crypto" | High | On screen: "In Vietnam, you see only VND." VO: "never receives, holds or sends USDC". Add the PS §4.3 disclosure in Video B |
| c | 250 / 500 USDC, ≈ 6,500,000 / 13,010,000 VND (SPEC §1, COPY throughout) | Real demo: 2 × 10 USDC, ≈ 520,000 VND; contract B 1 × 10 USDC (PS §7; DL R11). The landing's contract B "Logo refresh" also uses 250 USDC | Medium. Viewers see two sets of numbers | Landing shots keep "example, estimated". In the product recording, add a caption "Real demo: test network, 10 USDC milestones". Never put the 6,500,000 figure over the real recording |
| d | No "cheapest" or "cheaper" anywhere in COPY or SPEC (checked by search) | DL: the Vietnam path is **not** cheaper than Wise; never "cheapest" | Low (OK today) | Never say cheap/cheaper/cheapest (rẻ/rẻ hơn/rẻ nhất) in VO |
| e | Invite link `ned.app/c/7XqP2mWc#k=…` and wallet header "Request from N.E.D Workspace · ned.app" (COPY `web.contractNew.created.link`, `inviteLink`, `walletPanel.sign.request`) | The Workspace origin is `https://unihackfest-2026.vercel.app` (DL D21; TH "Thông tin devnet"); commit `W2 … mobile invite links point at the Workspace origin`; route `app/c/[fund]` (PS §5). No `ned.app` domain is named in the product docs | Medium. Viewers may try `ned.app` | Do not show the link text large in the video, or ask the landing owner to change the board string. Real link format **[CONFIRM]** |
| f | "Disputes over quality: planned after launch" (COPY `quiet.chip`); "no way to settle disputes over quality (planned after launch)" (COPY `real.notYet`); "@mia may dispute" (COPY `web.submit.aside.notAll`); SPEC §12.5 "disputes are NOT available" | D27: "Accept or request changes" is shipped in the Workspace (`FEATURES.dispute = true`); D11: no neutral arbiter in v1 | Medium. Landing understates a shipped feature and contradicts itself ("may dispute") | Video: "No neutral arbiter yet." Do not say "disputes are not available". Do not show the chip |
| g | "licensed partner", "licensed payout partner" (SPEC §7 says to use it; COPY `accept.l2`, `contractAccept.vnd.body`, `disclosures.partner`) | PS §6: Never "our partner", "licensed partner", "licensed Vietnamese crypto partner". Use "candidate payout partners (Due, Nium), simulated in the demo" | High | Say "payout partner (simulated in the demo)". Do not say "licensed". Per the brief rules, do not name Due or Nium at all |
| h | "Nobody, including N.E.D, can move the money any other way." (COPY `lock.l2`, contract rules; SPEC §1) | PS §6: never "nobody can move the funds" (the deploy wallet still holds the upgrade authority); use "no instruction lets N.E.D move locked funds". D30 F11 made the same change in the product | High | "No instruction lets N.E.D move the locked money." |
| i | Third card "Community Hub", coming soon, no URL (LINKS; SPEC §13) | "N.E.D Jobs" is a site inside the Workspace at `/jobs` (DL D28), live on production (TH P15) | Low | Name and URL for the end card **[CONFIRM]** |
| j | Disclosures screen: 10 rows, "Version 1.0.0" (COPY `disclosures`) | Product Disclosures now has 15 lines after the 7 Oct wording pass (TH row "Rà soát ngôn từ") | Low | Do not present the landing Disclosures screen as the product's |
| k | Partner chip "Partner in talks" (COPY `accept.chip`) | D5: questions sent 2 Oct. DL lists the replies as an open question | Low | Allowed by SPEC §7. Keep "simulated in the demo" next to it |

---

## 3. Chapter status

From CH (built chapters run without gaps; 10–12 are not built) and `git log --oneline -40`.

| # | Chapter | Built? | Commit(s) | Headline (COPY) |
| --- | --- | --- | --- | --- |
| 00 | Hero | yes | `4557ff3`, `e0ed9d4`, `f6a06b5`, `106fcbf` | Locked before you start. Released when it's approved. |
| 01 | The problem | yes | `ade981f` | Today, the work comes first. The money comes later. |
| 02 | Sign in, say where you live | yes (in CH; no commit is named "chapter 02"; likely `ef57f45` onboarding screens **[CONFIRM]**) | `ef57f45`, `f3261bf` | Sign in with Google. Say where you live. |
| 03 | The brief | yes | `6d6848d` | Your client writes one brief. |
| 04 | Accept, and choose once | yes | `0c9f0d2` | You read the brief, then choose once where the money goes. |
| 05 | Lock | yes | `f4a1041`, `91a066d` | Your client locks it before you start. |
| 06 | Work and submit | yes | `0ad5260`, `91a066d` | Submit before the deadline. |
| 07 | Review and release | yes | `c519a52` | Your client checks the work, then releases it. |
| 08 | If someone goes quiet | yes | `f654b73`, `728c437` (dispute UI removed) | *(no headline; first line)* No answer by the review deadline? It's released to you on its own. ⚠ see 2.a |
| 09 | Two ways to receive | yes | `44632c7` | Where you live decides how you receive it. |
| 10 | Records, then close | **no** | — | *(SPEC only)* Every step leaves a record. |
| 11 | One wallet, two screens | **no** | — | *(SPEC only)* Your phone and your computer, one wallet. |
| 12 | What N.E.D does and doesn't do | **no** | — | *(SPEC only)* N.E.D is software. The money moves by the contract's rules. |
| 13 | What's real today | yes | `6d82ed5` | What works today, and what comes next. |
| 14 | Close + product links | yes | `e028bc9` | See a milestone released. |

---

## 4. Reference style (style only)

From your description. Do not copy the reference's visuals, layout or branding.
- 48-second promo, 1920 × 1080, 30 fps.
- Large kinetic text, 3 to 6 words per beat.
- Transitions: dark to light purple glow. Use the landing's own band palette `#D4B5F7 → #B87AED → #7B2FBE → #2A0B4D → #06060E` (SPEC §16.2).
- Product UI shown in angled perspective (our phone/laptop renders already do this).
- A cursor clicking a button: use our slide controls ("Slide to lock", "Slide to release") and "Release now".
- A scan line passing over a document: chapter 06 already has one (files dropped, "scan line leaves short codes", SPEC row 06).
- End card with logo and URL.
- Glow and gradients only on the landing layer, never inside app screens (SPEC §12.3).

---

## 5. Video A: 60-second teaser (target 60 s; allowed 55–65 s)

On-screen text is at most 7 words. Where a page headline is longer it is trimmed, and the cut is noted. Vietnamese VO lines are my drafts, not taken from `vi.ts` (not read). Check them against section 8 **[CONFIRM]**.

| Time | Shot | On-screen text | Visual (capture + motion) | Sound / VO (VI) |
| --- | --- | --- | --- | --- |
| 0–6 | Hook | "The work comes first. The money later." (trimmed from ch01) | Ch01: your phone "Files sent ✓", status-bar clock jumps 3 → 14 → 30 days. Fast push-in, text slams word by word | Low pulse. VO: "Bạn giao việc trước. Tiền đến sau." |
| 6–11 | Logo + headline | "Locked before you start." → "Released when it's approved." | Purple glow sweep (dark → light), then ch00 hero phone enters after the sweep (SPEC §16). Logo **[CONFIRM]** (section 7) | Swell. VO: "N.E.D. Khóa trước khi bạn bắt đầu." |
| 11–16 | Step 1 · Brief | "Your client writes one brief." | Ch03 laptop: "Done when" list typing, fingerprint changing per keystroke. Angled perspective, slow dolly | VO: "Khách hàng viết một bản mô tả. Dấu vân tay của nó được lưu trên chuỗi." |
| 16–21 | Step 2 · Accept | "Read the brief. Choose once." (trimmed from ch04) | Ch04 phone: "VND to my Vietnamese bank account" card selected, "SIMULATED" chip visible, slide to accept. Do not let "licensed" read large (2.g) | VO: "Bạn đọc, chấp nhận, và chọn một lần nơi nhận tiền." |
| 21–26 | Step 3 · Lock | "Your client locks it before you start." | Ch05 dock: cursor drags "Slide to lock", lock glyph stamps, phone "Locked · ≈ 13,010,000 VND" with "example, estimated" visible | Click + thud. VO: "Khách khóa toàn bộ số tiền trước khi bạn bắt đầu." |
| 26–31 | Step 4 · Submit | "Submit before the deadline." | Ch06 laptop: two files dropped, **scan line** passes and leaves short codes, "Submitted · On time" | Scan sweep sound. VO: "Nộp trước hạn. Thời gian và dấu vân tay được ghi lại." |
| 31–36 | Step 5 · Release (climax) | "≈ 6,500,000 VND" + small "example, estimated" | Ch07: cursor on "Slide to release", amount chip crosses the seam, $ 250 USDC → ≈ 6,500,000 VND; glow bloom on the landing layer only. Small line "Bank transfer simulated in this demo." Avoid the "Auto-release in" countdown frame (2.a) | Hit + shimmer. VO: "Khách duyệt, phần đó được chuyển đến bạn. Ví dụ, ước tính." |
| 36–44 | If someone goes quiet | "Deadlines run on their own." (trimmed from ch08 line 3) then small "Unless the client requests changes in time." | Ch08 fan of three phones: Approved / "Review time over · anyone can release" / "Refunded to the client". Hide the "Disputes over quality" chip (2.f). Phone B's slider "moves by itself" in the page; recut so a cursor presses it **[CONFIRM]** whether that is possible from the page | VO: "Hết hạn duyệt mà không ai trả lời? Ai cũng có thể bấm Release now, trừ khi khách đã yêu cầu sửa đúng hạn. Trễ hạn nộp? Tiền được hoàn lại cho khách." |
| 44–50 | Honest status | "What works today, and what comes next." | Ch13 Disclosures rows lighting. Chip "Demo on a test network". Fade only, no blur or slide on disclosure text (SPEC §14.4) | VO: "Bản demo chạy trên mạng thử nghiệm. Đối tác chi trả là mô phỏng." |
| 50–60 | End card | "See a milestone released." | Logo + three cards: Try the app (test network) · Open the Workspace · third card **[CONFIRM]**. URLs from section 1.4. Badge "Test network" on each | Resolve chord. VO: "Mở Workspace hoặc thử ứng dụng trên mạng thử nghiệm." |

Running time: 60 s.

---

## 6. Video B: 2 min 30 s, narrated (150 s)

Landing chapters frame the story; 70 s (52–122 s) is a screen recording of the real product on devnet.

| Time | Shot | On-screen text | Visual | VO (VI) |
| --- | --- | --- | --- | --- |
| 0–8 | Hook | "The work comes first. The money later." | Ch01 your phone, then T3 split with the client's phone draft "Send 500 USDC up front to someone I've never met?" (both sides carry a risk; the client is not the villain) | "Freelancer giao việc rồi chờ tiền. Khách hàng thì ngại chuyển trước cho người chưa từng gặp." |
| 8–14 | Logo + headline | "Locked before you start." | Ch00 hero, purple sweep, phone enters | "N.E.D: tiền được khóa trước khi bạn bắt đầu, và chuyển đến bạn khi được duyệt." |
| 14–22 | Sign in | "Sign in with Google." | Ch02: "Continue with Google", "I live in Vietnam", 250.00 USDC flips to ≈ 6,500,000 VND (example, estimated) | "Đăng nhập bằng Google, không cần cụm từ khôi phục. Sống ở Việt Nam? Bạn chỉ thấy VND, và không bao giờ nhận, giữ hay gửi USDC." (2.b) |
| 22–28 | Brief | "Your client writes one brief." | Ch03 laptop | "Khách viết một bản mô tả: các mốc, hạn chót, và thế nào là xong." |
| 28–34 | Accept | "Read the brief. Choose once." | Ch04 phone | "Bạn chọn một lần nơi nhận tiền. Không bao giờ phải gõ địa chỉ ví." |
| 34–40 | Lock | "Your client locks it before you start." | Ch05 dock | "Toàn bộ số tiền được khóa trong chương trình. Không lệnh nào cho phép N.E.D di chuyển số tiền đã khóa." (2.h) |
| 40–46 | Submit | "Submit before the deadline." | Ch06 scan line | "Tệp ở lại trên máy bạn. Chỉ dấu vân tay được lưu." |
| 46–52 | Release | "≈ 6,500,000 VND" + "example, estimated" | Ch07 climax | "Khách duyệt, mốc đó được chuyển đến bạn. Chuyển khoản ngân hàng là mô phỏng." |
| 52–122 | **Real product recording** (70 s, see 6.1) | Corner caption: "Real demo · test network · 10 USDC milestones" | Contract A create → accept VND → lock → submit → accept & release; contract B Release now; explorer | Narrate each step in plain words. No VND figure other than what the app shows |
| 122–130 | If someone goes quiet | "Deadlines run on their own." + "Unless the client requests changes in time." | Ch08 fan (chip hidden) | "Hết hạn duyệt? Ai cũng có thể bấm Release now, trừ khi khách đã yêu cầu sửa đúng hạn. Chưa có trọng tài trung lập." |
| 130–140 | Honest status | "What works today, and what comes next." | Ch13 | "Đây là bản demo trên mạng thử nghiệm: chưa KYC, chưa kiểm toán, đối tác chi trả là mô phỏng. Phí mạng dùng SOL thử nghiệm; trước khi ra mắt, người dùng Việt Nam sẽ không giữ tiền mã hóa nào." (PS §4.3 disclosure) |
| 140–150 | End card | "See a milestone released." | Logo, three links | "Mở Workspace, viết bản mô tả và khóa một mốc." |

### 6.1 Real product recording (60–90 s; planned 70 s)

From PS §7 (original plan) and TH "Checklist ngày demo". PS §7 says the **stage** version is now `final-pitch.md` §2–3 (Person A / Person B, Workspace for both roles, accept and lock in the wallet panel). I did not read that file, so the exact click path is **[CONFIRM]**.

**Accounts**
- **Mia (client, intl):** a second Google account with a `@mia…` profile and region `intl`. Note her wallet address. *(TH checklist)*
- **Vinh (freelancer, Vietnam view):** a Google account with a profile, region `vn`. *(TH checklist)*
- The embedded logins cannot be scripted. Every signing step is done by hand in the app. *(PS §7)*

**Funds (devnet)**
- Mia needs **30 USDC**: 10 for contract B, 20 for contract A. Circle faucet (https://faucet.circle.com → USDC → Solana Devnet) gives 20 USDC per address every 2 hours, so claim twice at least 2 hours apart the day before, or recycle. *(PS §7; TH)*
- Both wallets need ≥ 0.05 devnet SOL from https://faucet.solana.com (GitHub login). Vinh needs SOL to sign `accept` and `submit`. *(TH)*

**Review time on devnet**
- Minimum work window: 60 s on devnet (24 h at launch [Assumption]). *(PS §3)*
- Contract B: prepare it **in the app** about 15 minutes before recording. 1 milestone × 10 USDC, submission deadline = create time + 5 minutes, review deadline 60 s after that. Vinh accepts, Mia locks, Vinh submits. When the review deadline has passed, anyone presses Release now. *(PS §7)*
- A first submission needs a preview link (Google Drive, Figma, YouTube, Loom or an image link) and a promised list of final files, unless a fixed-version link is given. Have a Drive link and two small files ready. *(TH rows R1, F1, F2)*

**Shot list (70 s)**
| t (within the recording) | Step | Who | What must be visible |
| --- | --- | --- | --- |
| 0–12 | Create contract A "Landing page design", 2 × 10 USDC, brief with "Done when" | Mia, Workspace | Brief fingerprint; "No money moves at this step" |
| 12–22 | Accept, choose "VND to my bank account" | Vinh | "SIMULATED" next to the payout partner |
| 22–32 | Lock 20 USDC | Mia, wallet panel | Vinh's screen: "≈ 520,000 VND locked (estimate)" or whatever the app shows on the day **[CONFIRM]** |
| 32–44 | Submit milestone 1 (preview link + final files list) | Vinh | "On time", chain clock |
| 44–54 | Accept & release milestone 1 | Mia | "Released to payout partner · VND transfer simulated in this demo" |
| 54–64 | Open contract B by deep link, press Release now | anyone | Review time over, Release now |
| 64–70 | Solana Explorer (devnet) | — | Vault owned by the program, not by N.E.D |

**After each take: the recycle script** (run in `ned-wallet/`; partner keypair by default at `~/.config/solana/ned-demo-partner.json`, outside the repo; fees paid by `~/.config/solana/id.json`) *(PS §7; TH)*:
```bash
npm run recycle:demo-usdc -- --to <Mia wallet> --dry-run
```
```bash
npm run recycle:demo-usdc -- --to <Mia wallet>
```
Then check that Mia has ≥ 30 USDC again.

---

## 7. Asset list

**To capture from the landing page** (chapters as built, section 3): 00 hero with sweep · 01 chat phones · 02 sign-in · 03 brief laptop + typing "Done when" · 04 accept · 05 dock + lock stamp · 06 submit + scan line · 07 release chip morph · 08 fan · 13 Disclosures · 14 cards. Chapters 10–12 are not built and cannot be captured.

**To capture from the product:** the section 6.1 recording, desktop Workspace (Mia) and phone or wallet panel (Vinh); Explorer page of the vault.

**Teddy images** (this repo, `public/`):
- `public/teddy/`: curious, happy, proud, sleepy, surprised, thinking, waving (`.png`)
- `public/design-assets/`: teddy-confused, teddy-curious, teddy-happy, teddy-thinking, teddy-waving (with hash suffixes)
- Rules: inside screens Teddy always sits on a lilac tile `#EDE3FB`; free-floating only next to the hero phone (SPEC §12.4).

**Logo**
- Landing: no wordmark asset yet (COPY `site.wordmark: 'N.E.D', // TODO(asset)`).
- Product repo: the pull added `assets/images/ned-logo.png` and `assets/images/ned-logo-banner.png` (seen in the pull diff; not opened). Whether they are the approved logo: **[CONFIRM]**.

**Fonts** (SPEC §12.2): Space Grotesk 700 (amounts, titles), Inter 400/600 (body, rows), Space Mono 400 (addresses, fingerprints). Landing-layer display font for kinetic text: in SPEC §4, which I did not read for this brief **[CONFIRM]**.

**Colour tokens**
- Landing background `#06060E`; band `#D4B5F7`, `#B87AED`, `#7B2FBE`, `#2A0B4D` (SPEC §16.2).
- App screens (SPEC §12.1): background `#F4F4F6`, surface `#FFFFFF`, ink `#111116`, primary `#7B2FBE`, primary tint `#F2EAFB`, Teddy tile `#EDE3FB`, success `#E7F6EC` / `#127A3A`, warning `#FFF5E1` / `#8A5300`.

**End card text**
- Headline: "See a milestone released."
- Line: "Hiring? Write a brief in the Workspace and lock a milestone."
- Links: Try the app (test network) · https://tdat10052499.github.io/Unihackfest-2026/ — Open the Workspace · https://unihackfest-2026.vercel.app — third card **[CONFIRM]**
- Chip: "Demo on a test network". Footer: "Built for Unihackfest 2026" (COPY `site.footer`).

---

## 8. Script rules

### 8.1 Banned words (SPEC §7, plus PS §6) with Vietnamese equivalents to avoid
| Never (EN) | Never (VI) |
| --- | --- |
| pay / payment (for USDC) | thanh toán, trả tiền |
| escrow | ký quỹ, tài khoản ký quỹ |
| deposit | đặt cọc, tiền cọc, nạp tiền (as a product claim) |
| invest | đầu tư |
| yield | lợi suất, lợi nhuận |
| interest | lãi, lãi suất |
| safe / secure as a guarantee | an toàn, bảo mật tuyệt đối |
| guaranteed | đảm bảo, bảo đảm, cam kết chắc chắn |
| scam-free | không lừa đảo, chống lừa đảo |
| tax-compliant | đúng luật thuế, tuân thủ thuế |
| first (as a claim) | đầu tiên, duy nhất |
| free / zero fees | miễn phí, 0 phí, không mất phí |
| credit score | điểm tín dụng |
| auto-release (PS §6, D26) | tự động giải ngân, tự động chuyển |
| "licensed partner", "our partner" (PS §6) | "đối tác được cấp phép", "đối tác của chúng tôi" |
| "nobody can move the funds" (PS §6) | "không ai có thể di chuyển tiền" |
| "never touches crypto" (PS §6) | "không bao giờ chạm vào tiền mã hóa" |

Use: lock (khóa), release (mở khóa chuyển cho bạn / chuyển đến bạn), refund (hoàn lại), receive earnings (nhận tiền công), record (bản ghi), contract (hợp đồng), milestone (mốc), test network (mạng thử nghiệm), simulated (mô phỏng). The SPEC prefers "chuyển đến bạn" over "giải ngân".

Note: SPEC §7 says to use "licensed partner"; PS §6 says never. This brief follows the product (2.g) **[CONFIRM]**.

### 8.2 Honesty lines (must appear)
- "Demo on a test network" (chip on the hook or the end card, and on every link card).
- "simulated" next to every payout partner or bank transfer mention.
- "example, estimated" next to every VND figure on the landing shots.
- Fee line exactly: "No N.E.D fee during the pilot." Never "free".
- Video B: the fee disclosure from PS §4.3, in substance: "Demo on devnet: network fees use test SOL. Before launch, Vietnam users will hold no crypto, not even for fees."

### 8.3 Release wording
- Wherever release after the review deadline is mentioned, add "unless the client disputes (requests changes) in time". The product UI calls it "Request changes" (D27).
- The product docs ban the word "auto-release" (D26). So the script never says "auto-release" or "on its own". It says "anyone can press Release now after the review deadline, unless the client requested changes in time".

### 8.4 Never
- "cheapest", "cheaper" (rẻ nhất, rẻ hơn). The product is not cheaper than Wise (DL).
- Due or Nium named as live partners. Safest: do not name them in the video at all.
- Mainnet, live money, a live partner, or that N.E.D holds or converts money.
- Showing D30 screens, Swap, xStocks, Earn, or the old wallet Home (SPEC §12.5; DL D30).

---

## 9. Open items

1. **[CONFIRM]** Which wording wins where the landing and the product disagree: 2.a (auto-release), 2.b (never hold crypto), 2.g (licensed partner), 2.h (nobody can move). This brief follows the product docs. Will the landing copy be changed before capture? If not, frames with the old strings must be avoided or blurred.
2. **[CONFIRM]** The real invite-link host and path (2.e). Change the `ned.app` board string, or keep it off screen?
3. **[CONFIRM]** Third end-card link: "Community Hub" (coming soon) or "N.E.D Jobs" at `https://unihackfest-2026.vercel.app/jobs` (2.i).
4. **[CONFIRM]** Logo: are `assets/images/ned-logo.png` / `ned-logo-banner.png` in the product repo the approved logo for the end card? Does the landing get a wordmark?
5. **[CONFIRM]** Product name line: "N.E.D · No Empty Deals" vs "Network of Employment Deals" vs just "N.E.D".
6. **[CONFIRM]** The recording follows `final-pitch.md` §2–3 (not read here) or PS §7. Which roles run in the Workspace and which in the wallet panel?
7. **[CONFIRM]** `DEMO_USD_VND_RATE` on recording day, and the VND figure the app will show for 20 USDC.
8. **[CONFIRM]** Chapter 08 phone B: can a cursor press the slider (D26), or does the page only show it moving by itself? If only by itself, cut away before it moves.
9. **[CONFIRM]** Whether chapter 02 is complete (no commit is named "chapter 02").
10. **[CONFIRM]** The landing-layer display font for kinetic text (SPEC §4 not read).
11. **[CONFIRM]** Vietnamese VO lines: draft translations, not from `vi.ts`. They need a native review against section 8.1.
12. **[CONFIRM]** Mia's 30 USDC and both wallets' SOL are in place before recording (TH checklist; current balances not checked).
13. **[CONFIRM]** Should Funded Jobs / lock at hire (D25, D29), shipped but not on the landing page, appear in Video B?
14. **[CONFIRM]** Music and VO talent, licence of any track.
