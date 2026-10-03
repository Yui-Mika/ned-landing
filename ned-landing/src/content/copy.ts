// All on-screen copy, storyboard v3 (Milestone Lock). English only.
// Banned words (strategy-v3 §11.3 + landing rules): pay, paid, payment, payout, deposit, escrow, interest,
// yield, invest, earn, safe, risk-free, scam-free, guaranteed, credit score, rating, pool, vault.
// VND figures are always "≈ … VND (example, estimated)". Rate used: 26,019.5 VND per USD (rate of 2 Oct 2026,
// the same as the app), rounded to the nearest 10,000 — refresh before 8 Oct, in both.
// App words translated for the landing page: payout partner → licensed partner; program vault → held by the program.
// No partner names until a partner is confirmed. No "open source": there is no LICENSE yet.

export const site = {
  wordmark: 'N.E.D',
  demoLink: 'Try the demo',
  skipLink: 'Skip to the demo link',
  title: "N.E.D · Locked before you start. Released when it's approved.",
} as const;

export const hero = {
  headline: "Locked before you start. Released when it's approved.",
  sub: "Your client locks US dollar stablecoins (USDC) for each milestone. When a milestone is approved, or its review time ends, it's released to you: to your wallet where that's allowed, or as VND to your bank account in Vietnam.",
  chip: 'Demo on a test network',
  cue: 'Scroll',
  bubble: "Hi, I'm Teddy.",
} as const;

export const problem = {
  headline: 'Today, the work comes first. The money comes later.',
  lines: [
    'You deliver the files. Then you wait for the client to send the money.',
    'If the client disappears or changes their mind, the money never arrives.',
    'Clients take a risk too when they send everything up front.',
  ],
  labels: { client: 'Client', you: 'You' },
} as const;

export const idea = {
  headline: 'What if the money waited in the middle?',
  body: 'Before the work starts, the client locks it in a smart contract.',
  brief: 'First you agree on one brief: what counts as done for each milestone. Its fingerprint is saved, so neither side can change it.',
  chip: "You can see it's there",
  rule: "Once locked, the money moves only by the contract's rules.",
} as const;

export const milestones = {
  badge: 'Building · up to 5 milestones per contract',
  headline: 'One gate for each milestone.',
  steps: ['You submit before the deadline.', 'The time and a fingerprint of your work are recorded.', 'Your client approves, and that part is released.'],
  silence: "No answer by the review deadline? It's released to you on its own.",
  deadline: "Miss a submission deadline, and that milestone's money goes back to the client.",
  deadline2: 'Deadlines run on their own: once one passes, anyone can trigger the next step.',
  disputes: 'Disputes over quality: planned after launch',
  stamp: 'Time recorded',
  outcomes: { approved: 'Approved', silent: 'Review time ended', none: 'No submission' },
} as const;

export const twoWays = {
  headline: 'Where you live decides how you receive it.',
  badge: 'Building',
  abroad: 'Outside Vietnam, USDC goes straight to your N.E.D wallet, where stablecoins are allowed.',
  vietnam: 'In Vietnam, you never hold crypto. A licensed partner converts the money abroad and sends VND to your bank account.',
  once: 'You choose once, when you accept the contract. You never type an address.',
  partnerChip: 'Partner in talks · simulated in the demo',
  vnd: '≈ 6,500,000 VND',
  vndNote: 'example, estimated · milestone 1, 250 USDC',
  identity: 'Bank transfers need an identity check by the partner.',
  wallet: { name: 'N.E.D wallet', amount: '250.00 USDC' },
  partnerLabel: 'Licensed partner · abroad',
  sides: { abroad: 'Abroad', vietnam: 'Vietnam' },
} as const;

export const app = {
  headline: 'Your phone and your computer, one wallet.',
  note: 'Same Google sign-in. Test network; bank transfer simulated.',
  client: 'Hiring? Write the brief in the Workspace and lock from your N.E.D wallet.',
  proposed: 'Screens from the demo app design · test network',
  steps: [
    { title: 'Write the brief', who: 'Client', where: 'computer', sub: 'Milestones, deadlines, what counts as done.' },
    { title: 'Accept and choose where it goes', who: null, where: 'phone', sub: 'VND to your bank, or USDC where allowed.' },
    { title: 'Your client locks it', who: 'Client', where: 'phone', sub: 'The money waits in the contract.' },
    { title: 'Submit your work', who: null, where: 'computer', sub: 'Links and files. The time is recorded.' },
    { title: 'Review', who: 'Client', where: 'computer', sub: "Approve, or it's released when the review time ends." },
    { title: 'Money on its way', who: null, where: 'phone', sub: 'VND arrives in your bank account.' },
  ],
} as const;

export const role = {
  headline: "N.E.D is software. The money moves by the contract's rules.",
  nobody: 'Nobody, including N.E.D, can move the money any other way.',
  doesTitle: 'N.E.D does',
  doesntTitle: "N.E.D doesn't",
  does: [
    { text: 'Provides the app, the Workspace and the Milestone Lock contract', tag: null },
    { text: 'Keeps your contract history and a record of what you received', tag: null },
    { text: 'Connects you to a licensed partner', tag: 'In talks' },
    { text: "Shows facts about who you're dealing with", tag: 'Planned' },
  ],
  doesnt: [
    "Hold anyone's money",
    'Convert USDC into VND',
    'Send money to Vietnam itself',
    'Let users in Vietnam hold or trade crypto',
    'Tell you who to trust. You see facts, not opinions.',
  ],
  proof: ['Sign in with Google. No seed phrase.', 'You confirm every step that moves money.', 'No N.E.D fee during the pilot.', 'Every lock and release is a public record.'],
  code: 'Solana program · devnet ·',
  codeLink: 'code on GitHub',
} as const;

export const real = {
  headline: 'What works today, and what comes next.',
  note: 'Plan as of Oct 2026. The order can change.',
  nodes: [
    { when: 'Oct 2026 · Now', title: 'Demo', text: 'Two milestones on a test network; bank transfer simulated' },
    { when: 'Next', title: 'Partner and legal', text: 'Confirm a licensed partner; get a legal review' },
    { when: 'Then', title: 'Closed pilot', text: 'With freelancers and their clients; up to 1,000 USDC per contract' },
    { when: 'Later', title: 'More', text: 'Disputes, Rotating Fund, Group Goal' },
  ],
  notYetTitle: 'Not yet',
  notYet: [
    'Test network only. No real money moves.',
    'Partner not confirmed; bank transfers are simulated.',
    'No identity checks (KYC) yet.',
    'No security audit of the contract yet.',
    'No way to settle disputes over quality yet.',
    'No lawyer has reviewed this yet.',
    'USDC is issued by Circle, which can freeze an address.',
  ],
} as const;

export const close = {
  headline: 'See a milestone released.',
  sub: 'Try the demo on a test network. The waitlist opens soon.',
  cta: 'Try the demo',
  client: 'Hiring? Write a brief in the Workspace and lock a milestone.',
  waitlist: 'The waitlist opens soon.',
  bubble: 'See you soon.',
  footer: { github: 'GitHub', demo: 'Demo on a test network' },
} as const;
