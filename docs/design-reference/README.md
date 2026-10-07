# N.E.D design reference (read-only source of truth for screens)

Exported from the "NED Wallet Design System" canvas (Modern Minimal v2.1). Only boards of the CURRENT Milestone Lock direction are included. Archived boards (Swap, xStocks, Simple Earn, T.E.D bot), Dispute/Split ("if shipped"), Send/Receive and the Jobs site are NOT included on purpose.

## How to read a `.dc.html` file
- It is one screen (390x844 phone, or 1440 wide web page). The markup between `<x-dc>` and `</x-dc>` has the exact inline styles: colours, sizes, radii, spacing, icons (inline SVG).
- `{{name}}` is a hole filled by `renderVals()` in the `<script type="text/x-dc">` block at the bottom. That script also holds the state variants (look at `data-props`: tweaks like who / state) and the sample strings for each state.
- `<dc-import name="Avatar" ...>` means the shared component in `shared/Avatar.dc.html`.
- `<sc-for>` / `<sc-if>` are loops and conditions.
- Tokens: `shared/Main.dc.html`. Motion: `shared/MotionSurfaces.dc.html`. Shared pills, sliders, rows: `shared/MilestoneComponents.dc.html`.

## Porting rules (do not redesign)
1. Port the board's markup and styles 1:1 into React in `src/screens/phone/` (and `src/screens/web/` later). Same colours, sizes, radii, spacing, icons, type scale. Do not invent any UI element, label, icon or layout.
2. Pick the state variant that matches the chapter (see map below). Resolve each `{{hole}}` from that state's strings in the board's script.
3. Where a board's sample amount differs from SPEC.md, keep the board's layout and use the SPEC number and wording (e.g. 13,010,000 VND with "example, estimated"; 500.00 USDC; milestone names from SPEC section 1).
4. Remove prototype-only controls that are not part of the product screen, such as the "DEMO · switch to @vinh's phone ->" line and tweak switches.
5. Phone screens render at 390x844. Inside the laptop the wallet panel is the same screen at 86%.
6. If a ported string contains a word from SPEC section 7, keep it (it is the product's own screen text) but LIST it in your report so the owner can decide. Known ones: "payout partner" (many screens), "paid out" (web/WebReview), "secured with MPC" (phone/OnbSetup).

## Chapter -> board map
| Ch | Phone boards | Web boards |
|---|---|---|
| 00 Hero | Your phone: phone/HomeVN. Flip (client): phone/ContractLocked | |
| 01 Problem | splash: phone/OnbSplash (the chat screens are generic, not from this canvas) | |
| 02 Sign in | phone/OnbWelcome, phone/OnbResidence, phone/OnbSetup, then phone/HomeVN | web/WebSignIn |
| 03 Brief | phone/ContractNew1Freelancer, ContractNew2Milestones, ContractNew3Review, ContractCreated | web/WebContractNew |
| 04 Accept | phone/ContractDetailVinhNew, ContractAccept, ContractDetailVinhAccepted | |
| 05 Lock | phone/ContractDetailMiaAccepted, ContractLock, ContractLocked, ContractLockedVN | web/WebWorkspace, web/WebWalletPanel |
| 06 Submit | phone/ContractDetailVinhLocked, MilestoneSubmit, MilestoneSubmitted | web/WebSubmit |
| 07 Release | phone/MilestoneReview, MilestoneReleased, MilestoneReleasedVN | web/WebReview |
| 08 Anyone acts | phone/ContractAnyoneAction, ContractAnyoneActionRefund, MilestoneReleasedB, MilestoneRefunded | |
| 09 Two ways | phone/HomeVN (VND), phone/HomeIntl (USDC), MilestoneReleasedVN | |
| 10 Records | phone/Records, RecordsIntl, ContractClose, ContractClosed | web/WebRecords |
| 11 One wallet | phone/HomeVN | web/WebWalletPanel, web/WebExtensionGallery |
| 12 What N.E.D does | phone/ContractLocked (program vault + Explorer link) | |
| 13 What's real | phone/Disclosures | |
| 14 Close | phone/HomeVN | web/WebSignIn |
