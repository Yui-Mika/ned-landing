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
  later: {
    title: 'More chapters coming',
    body: 'Chapter 01 and the rest of the story are next.',
  },
} as const;
