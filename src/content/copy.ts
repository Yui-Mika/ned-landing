/**
 * English copy. `vi.ts` will mirror these keys.
 * Copy rules (SPEC §7): never use the banned words; every VND figure carries "example, estimated".
 */
export const copy = {
  site: {
    title: "N.E.D — Locked before you start. Released when it's approved.",
    description:
      "Your client locks USDC for each milestone. When a milestone is approved, or its review time ends, it's released to you: to your wallet where that's allowed, or as VND to your bank account in Vietnam.",
    wordmark: 'N.E.D', // TODO(asset): real wordmark
    skipLink: 'Skip to content',
    canvasLabel: 'Illustration of the N.E.D app',
    footer: 'Built for Unihackfest 2026',
  },
  topBar: {
    demo: 'Try the demo',
    menuTitle: 'Products',
    testNetwork: 'Test network',
    comingSoon: 'Coming soon',
  },
  hero: {
    headline: "Locked before you start. Released when it's approved.",
    sub: "Your client locks USDC for each milestone. When a milestone is approved, or its review time ends, it's released to you: to your wallet where that's allowed, or as VND to your bank account in Vietnam.",
    chip: 'Demo on a test network',
    ctaDemo: 'Try the demo',
    ctaScroll: 'Scroll',
    scrollCue: 'SCROLL',
    dragHint: 'Drag me',
    tapHint: 'Tap to flip',
  },
  owners: {
    you: { phone: 'Your phone', computer: 'Your computer' },
    client: { phone: "Client's phone", computer: "Client's computer" },
    anyone: { phone: 'Anyone', computer: 'Anyone' },
  },
  screens: {
    testNetwork: 'Test network',
    youHome: {
      greeting: 'Home',
      label: 'Locked for you',
      amount: '≈ 13,010,000 VND',
      estimate: 'example, estimated',
      detail: '2 milestones · Landing page design',
      status: 'Held by the program, not by N.E.D',
    },
    clientHome: {
      greeting: 'Home',
      label: 'You locked',
      amount: '500.00 USDC',
      detail: '2 milestones',
      status: 'Released when approved, or after the review time',
    },
  },
  problem: {
    headline: 'Today, the work comes first. The money comes later.',
    // SPEC §6 row 01 gives only the headline and "both sides carry a risk". These two lines are a proposal:
    // TODO(copy): confirm with the owner. Clients are never the villain here.
    l1: 'Freelancers deliver the work, then wait for the money.',
    l2: 'Clients are asked to send money up front, before they see any work.',
  },
  /** Chapter 01 screens: a generic messaging app (not N.E.D), then the N.E.D splash. */
  chat: {
    you: {
      contact: 'Client',
      files: ['Wireframes_v2.fig', 'Visual_design.pdf'],
      sent: 'Files sent ✓',
      receipt: 'Delivered',
      daysLater: (n: number) => `${n} days later`,
    },
    client: {
      contact: 'Freelancer',
      clock: '9:41',
      incoming: 'Hi! I can start on Monday. Can you send part of it up front?',
      draft: "Send 500 USDC up front to someone I've never met?",
    },
    placeholder: 'Message',
    send: 'Send',
  },
  splash: {
    product: 'Milestone Lock',
  },
  later: {
    title: 'More chapters coming',
    body: 'Chapter 02 and the rest of the story are next.',
  },
} as const;
