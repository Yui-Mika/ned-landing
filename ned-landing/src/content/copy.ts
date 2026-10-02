// All on-screen copy, storyboard v3 (Milestone Lock). English only.
// Banned words (strategy-v3 §11.3 + landing rules): pay, paid, payment, payout, deposit, escrow, interest,
// yield, invest, earn, safe, risk-free, scam-free, guaranteed, credit score, rating, pool, vault.
// VND figures are always "≈ … VND (example, estimated)". Rate used: 25,810 VND per USD
// (Vietcombank transfer buying rate, 2 Oct 2026, 15:10) — refresh before 8 Oct.
// No partner names until a partner is confirmed. No "open source": there is no LICENSE yet.

export const site = {
  wordmark: 'N.E.D',
  demoLink: 'Try the demo',
  skipLink: 'Skip to the demo link',
  title: "N.E.D · Locked before you start. Released when it's approved.",
} as const;

export const hero = {
  headline: "Locked before you start. Released when it's approved.",
  sub: "Your client locks US dollar stablecoins (USDC) for each milestone. When a milestone is approved, it's released to you: to your wallet where that's allowed, or as VND to your bank account in Vietnam.",
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
  chip: "You can see it's there",
  rule: "Once locked, the money moves only by the contract's rules.",
} as const;

export const milestones = {
  badge: 'Building · demo with 2 milestones',
  headline: 'One gate for each milestone.',
  steps: ['You submit.', 'The time is recorded.', 'Your client approves, and that part is released.'],
  deadline: "Miss a submission deadline, and that milestone's money goes back to the client.",
  deadline2: 'Deadlines run on their own.',
  disputes: 'Disputes over quality: planned after launch',
  stamp: 'Time recorded',
} as const;

export const twoWays = {
  headline: 'Where you live decides how you receive it.',
  badge: 'Building',
  abroad: 'Outside Vietnam, USDC goes straight to your N.E.D wallet, where stablecoins are allowed.',
  vietnam: 'In Vietnam, you never hold crypto. A licensed partner converts the money abroad and sends VND to your bank account.',
  partnerChip: 'Partner in talks · simulated in the demo',
  vnd: '≈ 6,450,000 VND',
  vndNote: 'example, estimated · milestone 1, 250 USDC',
  identity: 'Bank transfers need an identity check by the partner.',
  wallet: { name: 'N.E.D wallet', amount: '250.00 USDC' },
  partnerLabel: 'Licensed partner · abroad',
  sides: { abroad: 'Abroad', vietnam: 'Vietnam' },
} as const;

export const app = {
  headline: 'Follow every milestone in the app.',
  note: 'Shown on a test network. Bank transfer simulated.',
  client: 'Hiring? Lock USDC from your N.E.D wallet or any Solana wallet.',
  proposed: 'Proposed screens · replaced by real screenshots before launch',
  steps: [
    { title: 'Create the contract', who: null, sub: 'Milestones, deadlines, amounts.' },
    { title: 'Your client locks it', who: 'Client', sub: 'The money waits in the contract.' },
    { title: 'Submit a milestone', who: null, sub: 'Send your work. The time is recorded.' },
    { title: 'Approve', who: 'Client', sub: 'That milestone is released.' },
    { title: 'Money on its way', who: null, sub: 'VND arrives in your bank account.' },
  ],
} as const;

export const role = {
  headline: "N.E.D is software. The money moves by the contract's rules.",
  doesTitle: 'N.E.D does',
  doesntTitle: "N.E.D doesn't",
  does: [
    { text: 'Provides the app and the Milestone Lock contract', tag: null },
    { text: 'Keeps your contract history', tag: null },
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
  proof: ['Sign in with Google. No seed phrase.', 'In Vietnam, no crypto wallet needed.', 'Every lock and release is a public record.'],
  code: 'Solana program · devnet ·',
  codeLink: 'code on GitHub',
} as const;

export const real = {
  headline: 'What works today, and what comes next.',
  note: 'Plan as of Oct 2026. The order can change.',
  nodes: [
    { when: 'Oct 2026 · Now', title: 'Demo', text: 'Two milestones on a test network; bank transfer simulated' },
    { when: 'Next', title: 'Partner and legal', text: 'Confirm a licensed partner; get a legal review' },
    { when: 'Then', title: 'Closed pilot', text: 'With freelancers and their clients' },
    { when: 'Later', title: 'More', text: 'Disputes, Rotating Fund, Group Goal' },
  ],
  notYetTitle: 'Not yet',
  notYet: [
    'Test network only. No real money moves.',
    'Partner not confirmed; bank transfers are simulated.',
    'No lawyer has reviewed this yet.',
    'No security audit yet.',
    'No way to settle disputes over quality yet.',
    'Fees are not final.',
  ],
} as const;

export const close = {
  headline: 'See a milestone released.',
  sub: 'Try the demo on a test network. The waitlist opens soon.',
  cta: 'Try the demo',
  client: 'Hiring? Try the client side of the demo: lock a milestone, then approve it.',
  waitlist: 'The waitlist opens soon.',
  bubble: 'See you soon.',
  footer: { github: 'GitHub', demo: 'Demo on a test network' },
} as const;
