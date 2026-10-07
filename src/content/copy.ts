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
  /**
   * Text INSIDE device screens: ported from docs/design-reference boards (board strings, SPEC numbers).
   * Board state used is noted per screen. Do not reword here; change the board first.
   */
  screens: {
    status: { clock: '9:41', devnet: 'Devnet · test money' },
    /** phone/HomeVN · view vn · stage locked · not empty · timeOfDay fixed to morning (board default "auto" reads the wall clock). */
    homeVN: {
      greeting: 'Good morning,',
      name: 'Vinh',
      handle: 'vinh',
      profileLabel: 'Your profile, Vinh',
      heroLabel: 'Locked for you',
      // SPEC §1 number, board split: whole + unit.
      heroWhole: '≈ 13,010,000',
      heroUnit: ' VND',
      // Board: "Estimate · $30.00 · 2 contracts · rate of 2 Oct". SPEC amount and "example, estimated" wording.
      heroSub: 'example, estimated · $500.00 · 2 contracts · rate of 2 Oct',
      flagTitle: 'Vietnamese đồng (VND)',
      flagLabel: 'Flag of Vietnam',
      quickActions: 'Quick actions',
      share: { label: 'Share @vinh', aria: 'Share @vinh: send your username to a client', sub: 'To a client' },
      records: { label: 'Records', aria: 'Records: what you received', sub: 'Your earnings' },
      statA: { label: 'Received this month', value: '≈ 0 VND' },
      statB: { label: 'Active contracts', value: '2' },
      needsTitle: 'Needs your action',
      needs: [
        // SPEC milestone 1 = 250 USDC ≈ 6,500,000 VND (board sample: ≈ 260,000).
        { title: 'Submit milestone 1 · due in 9 days', sub: 'Landing page design · ≈ 6,500,000 VND', icon: 'submit', tone: 'purple' },
        { title: 'Release now: Logo refresh', sub: 'Review time passed · you can release it yourself · ≈ 260,000 VND', icon: 'release', tone: 'success' },
      ],
      contractsTitle: 'Your contracts',
      seeAll: 'See all',
      rows: [
        // SPEC contract: 500 USDC (board sample: 20).
        { seed: 'mia', title: 'Landing page design', party: 'from @mia', deadline: 'Milestone 1 due 12 Oct', status: 'Locked · work in progress', tone: 'purple', total: '≈ 13,010,000 VND', totalSub: '$500.00 · estimate' },
        { seed: 'mia', title: 'Logo refresh', party: 'from @mia', deadline: 'Review time passed', status: 'Submitted · review time passed', tone: 'warning', total: '≈ 260,000 VND', totalSub: '$10.00 · estimate' },
      ],
      suggestedTitle: 'Suggested for you',
      suggested: {
        share: 'Share your @username with a client',
        devnet: 'What devnet and "simulated" mean',
        records: 'Keep a record of what you receive',
      },
      nav: { label: 'Main', home: 'Home', contracts: 'Contracts', records: 'Records', settings: 'Settings' },
    },
    /** phone/ContractLocked · side client. SPEC amount (board sample: 20.00 USDC). */
    contractLocked: {
      headline: '500.00 USDC locked',
      sub: 'Landing page design is locked in the program vault. @vinh can start work.',
      vaultTitle: 'Locked in program vault',
      vaultSub: 'Owned by the program, not by N.E.D · ',
      vaultAddress: '9vLt…Qm4x',
      explorer: 'Explorer',
      rulesLabel: 'Contract rules',
      rules: [
        'Released when the client approves, or automatically after the review time.',
        'Refunded to the client if a submission deadline is missed.',
        'Nobody, including N.E.D, can move it any other way.',
      ],
      primary: 'View contract',
      secondary: 'Back to Home',
    },
    /** phone/OnbSplash · variant mark. */
    onbSplash: {
      aria: 'N.E.D. Tap to continue',
      wordmark: 'N.E.D',
      tagline: 'Earnings locked by code',
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
  later: {
    title: 'More chapters coming',
    body: 'Chapter 02 and the rest of the story are next.',
  },
} as const;
