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
    /** Where your phone is (chapter 09 T3 split): "Your phone · Vietnam" / "Your phone · abroad" (SPEC row 09). */
    place: { vn: 'Vietnam', abroad: 'abroad' },
  },
  /**
   * Text INSIDE device screens: ported from docs/design-reference boards (board strings, SPEC numbers).
   * Board state used is noted per screen. Do not reword here; change the board first.
   */
  screens: {
    status: { clock: '9:41', devnet: 'Devnet · test money' },
    /** phone/HomeVN · view vn · stage locked · not empty · one contract only (board's "Logo refresh" sample removed) · timeOfDay fixed to morning (board default "auto" reads the wall clock). */
    homeVN: {
      greeting: 'Good morning,',
      name: 'Vinh',
      handle: 'vinh',
      profileLabel: 'Your profile, Vinh',
      heroLabel: 'Locked for you',
      // SPEC §1 number, board split: whole + unit.
      heroWhole: '≈ 13,010,000',
      heroUnit: ' VND',
      // Board: "Estimate · $30.00 · 2 contracts · rate of 2 Oct". SPEC: one contract of 500.00 USDC, "example, estimated"
      // (SPEC text, so it is kept ≥ 11 px on screen; the rest of the line is board text at the board size).
      heroSubEstimate: 'example, estimated',
      heroSubRest: ' · $500.00 · 1 contract · rate of 2 Oct',
      flagTitle: 'Vietnamese đồng (VND)',
      flagLabel: 'Flag of Vietnam',
      quickActions: 'Quick actions',
      share: { label: 'Share @vinh', aria: 'Share @vinh: send your username to a client', sub: 'To a client' },
      records: { label: 'Records', aria: 'Records: what you received', sub: 'Your earnings' },
      statA: { label: 'Received this month', value: '≈ 0 VND' },
      statB: { label: 'Active contracts', value: '1' },
      needsTitle: 'Needs your action',
      needs: [
        // SPEC milestone 1 = 250 USDC ≈ 6,500,000 VND (board sample: ≈ 260,000).
        { title: 'Submit milestone 1 · due in 9 days', sub: 'Landing page design · ≈ 6,500,000 VND', icon: 'submit', tone: 'purple' },
      ],
      contractsTitle: 'Your contracts',
      seeAll: 'See all',
      rows: [
        // SPEC contract: 500 USDC (board sample: 20).
        { seed: 'mia', title: 'Landing page design', party: 'from @mia', deadline: 'Milestone 1 due 12 Oct', status: 'Locked · work in progress', tone: 'purple', total: '≈ 13,010,000 VND', totalSub: '$500.00 · estimate' },
      ],
      suggestedTitle: 'Suggested for you',
      suggested: {
        share: 'Share your @username with a client',
        devnet: 'What devnet and "simulated" mean',
        records: 'Keep a record of what you receive',
      },
      nav: { label: 'Main', home: 'Home', contracts: 'Contracts', records: 'Records', settings: 'Settings' },
    },
    /**
     * phone/HomeIntl (same markup as HomeVN) · view intl · clientStage locked · not empty · one contract only
     * (board's "Logo refresh" sample removed, as on HomeVN). SPEC numbers: 500.00 USDC (board sample: 20.00).
     */
    homeIntl: {
      greeting: 'Good morning,',
      name: 'Mia',
      handle: 'mia',
      profileLabel: 'Your profile, Mia',
      heroLabel: 'USDC balance',
      heroWhole: '0.00',
      heroUnit: ' USDC',
      heroSub: 'Devnet test money',
      flagTitle: 'US dollar · USDC is a dollar stablecoin',
      flagLabel: 'Flag of the United States',
      quickActions: 'Quick actions',
      actions: {
        newContract: { label: 'New contract', aria: 'New contract: lock USDC per milestone for a freelancer' },
        receive: { label: 'Receive', aria: 'Receive USDC' },
        send: { label: 'Send', aria: 'Send USDC' },
      },
      statA: { label: 'Locked in your contracts', value: '500.00 USDC' },
      statB: { label: 'Locked for you', value: '0.00 USDC' },
      needsTitle: 'Needs your action',
      // Board: only "Release now: Logo refresh" in this state; with Logo refresh removed the list is empty and the
      // board shows its no-needs box (its text is empty for the intl view).
      noNeedsText: '',
      contractsTitle: 'Your contracts',
      seeAll: 'See all',
      rows: [
        { seed: 'vinh', title: 'Landing page design', party: 'to @vinh', deadline: 'Milestone 1 due 12 Oct', status: 'Locked · work in progress', tone: 'purple', total: '500.00 USDC', totalSub: 'total' },
      ],
      suggestedTitle: 'Suggested for you',
      suggested: {
        lock: 'Lock a milestone for a freelancer',
        devnet: 'What devnet and "simulated" mean',
        records: 'Keep a record of what you receive',
      },
      nav: { label: 'Main', home: 'Home', contracts: 'Contracts', records: 'Records', settings: 'Settings' },
    },
    /**
     * phone/HomeVN · stage released (chapter 09): only the fields that differ from homeVN. Board: milestone 1 released
     * → "Received this month" = milestone 1, milestone 2 still locked. SPEC numbers (board samples 10 / 20 USDC);
     * Logo refresh removed as in homeVN.
     */
    homeVNReleased: {
      heroWhole: '≈ 6,500,000',
      heroSubRest: ' · $250.00 · 1 contract · rate of 2 Oct',
      statA: { label: 'Received this month', value: '≈ 6,500,000 VND' },
      needs: [{ title: 'Submit milestone 2 · due in 16 days', sub: 'Landing page design · ≈ 6,500,000 VND', icon: 'submit', tone: 'purple' }],
      rows: [
        { seed: 'mia', title: 'Landing page design', party: 'from @mia', deadline: 'Milestone 2 due 19 Oct', status: 'Locked · work in progress', tone: 'purple', total: '≈ 13,010,000 VND', totalSub: '$500.00 · estimate' },
      ],
    },
    /**
     * phone/HomeIntl · clientStage released (chapter 09): only the fields that differ from homeIntl. The board has no
     * freelancer-abroad Home; nearest: this board with its "USDC balance" set to the SPEC 250.00 USDC (board: 0.00 in
     * this stage). Milestone 2 still locked: 250.00 USDC. Logo refresh removed as in homeIntl.
     */
    homeIntlReleased: {
      heroWhole: '250.00',
      statA: { label: 'Locked in your contracts', value: '250.00 USDC' },
      rows: [
        { seed: 'vinh', title: 'Landing page design', party: 'to @vinh', deadline: 'Milestone 2 due 19 Oct', status: 'Locked · work in progress', tone: 'purple', total: '500.00 USDC', totalSub: 'total' },
      ],
    },
    /** phone/OnbWelcome (no states). */
    onbWelcome: {
      teddyAlt: 'Teddy, the N.E.D bear, waving hello',
      headline: 'Get your earnings locked before you start.',
      sub: 'Milestone contracts for freelancers and their clients abroad.',
      points: [
        'Clients lock the money for each milestone',
        'Receive VND in Vietnam, or USDC abroad',
        'Refund or release by deadline, written in code',
      ],
      google: 'Continue with Google',
      googleMark: 'G',
      legal: { before: 'By continuing you agree to our ', terms: 'Terms', and: ' and ', privacy: 'Privacy Policy', after: '.' },
    },
    /** phone/OnbSetup · returning false · step driven by scroll (board: a 1.1 s timer). */
    onbSetup: {
      steps: ['Signed in with Google', 'Securing your wallet', 'Checking for a N.E.D profile'],
      working: { heading: 'Setting up your wallet…', sub: 'This takes a few seconds.' },
      finished: { heading: 'Your account is ready', sub: 'Two quick steps: your consent, then your profile.' },
      continue: 'Continue',
      secured: 'Secured with MPC. No recovery phrase to write down.',
    },
    /** phone/OnbResidence · selected vn. */
    onbResidence: {
      back: 'Back',
      progress: 'Step 3 of 3',
      headline: 'Where do you live?',
      sub: 'This decides how amounts are shown and where your earnings can go.',
      groupLabel: 'Where you live',
      vn: {
        badge: 'VN',
        title: 'I live in Vietnam',
        body: "You'll see amounts in VND and receive earnings in your bank account through a payout partner. No crypto balance is shown.",
      },
      intl: { title: 'I live outside Vietnam', body: "You'll see USDC and receive earnings in your N.E.D wallet." },
      note: 'You can change this in Settings.',
      continue: 'Continue',
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
    /** phone/ContractNew1Freelancer · search found (@vinh). */
    cn1: {
      back: 'Back to Home',
      title: 'New contract',
      progress: 'Step 1 of 3',
      heading: 'Who is the freelancer?',
      searchLabel: 'N.E.D username',
      query: '@vinh',
      placeholder: '@username',
      result: 'Result',
      handle: '@vinh',
      badge: 'N.E.D',
      who: 'Freelancer · Vinh',
      facts: [
        { k: 'On N.E.D since', v: '24 Sep 2026 · 9 days' },
        { k: 'Phone', v: 'Not verified', warn: true },
        { k: 'Wallet', v: '4FqT…9LwE', mono: true },
        { k: 'Contracts on N.E.D', v: '0 completed' },
      ],
      factsNote: 'On-chain facts only. Check who you work with yourself.',
      continue: 'Continue with @vinh',
    },
    /** phone/ContractNew2Milestones · 2 milestones, no error. SPEC amounts: 250 USDC each (board sample: 10). */
    cn2: {
      back: 'Back',
      title: 'New contract',
      progress: 'Step 2 of 3',
      heading: 'Job and milestones',
      forWho: 'For @vinh',
      titleLabel: 'Title',
      titleValue: 'Landing page design',
      titleHint: "Public on-chain. Don't include personal info.",
      milestones: [
        { n: 1, amt: '250', date: '12 Oct 2026, 18:00' },
        { n: 2, amt: '250', date: '19 Oct 2026, 18:00' },
      ],
      milestone: 'Milestone',
      amount: 'Amount',
      unit: 'USDC',
      submitBy: 'Submit by (deadline for this milestone)',
      reviewTime: 'Review time',
      reviews: ['1 min (demo)', '3 days', '7 days'],
      reviewOn: 1,
      add: 'Add milestone',
      totalLabel: 'Total to lock · 2 milestones',
      total: '500.00 USDC',
      next: 'Review contract',
    },
    /** phone/ContractNew3Review (no states). SPEC amounts: 250 / 500 USDC (board sample: 10 / 20). */
    cn3: {
      back: 'Back',
      title: 'Review contract',
      progress: 'Step 3 of 3',
      handle: '@vinh',
      who: 'Freelancer · on N.E.D 9 days · phone not verified',
      titleLabel: 'Title (public on-chain)',
      titleValue: 'Landing page design',
      milestonesLabel: 'Milestones',
      milestones: [
        { n: 1, name: 'Milestone 1', amt: '250.00 USDC', sub: 'Submit by 12 Oct 2026, 18:00 · review 3 days' },
        { n: 2, name: 'Milestone 2', amt: '250.00 USDC', sub: 'Submit by 19 Oct 2026, 18:00 · review 3 days' },
      ],
      totalLabel: 'Total to lock',
      total: '500.00 USDC',
      feesLabel: 'Fees',
      fees: { ned: 'N.E.D fee', nedV: 'None during the pilot', network: 'Network fee', networkV: '~0.000005 SOL', networkSub: 'devnet test SOL', partner: 'Payout partner fee', partnerV: 'Set by the partner', simulated: 'SIMULATED' },
      nextLabel: 'What happens next',
      next: [
        '@vinh accepts and chooses where earnings go.',
        'You lock 500.00 USDC in the program vault.',
        '@vinh submits each milestone.',
        'You approve, or it is released automatically after the review time.',
        'If a submission deadline is missed, that milestone can be refunded to you.',
      ],
      slide: 'Slide to create',
      slideNote: 'Nothing is locked yet. You lock after @vinh accepts.',
    },
    /**
     * phone/ContractDetail as used by ContractDetailVinhNew (role freelancer · view vn · state created) and
     * ContractDetailVinhAccepted (state accepted; its prototype-only "DEMO · switch to @mia's phone" line removed).
     * SPEC numbers: 500 USDC ≈ 13,010,000 VND, milestones 250 USDC ≈ 6,500,000 VND (board sample: 20 / 10).
     */
    contractDetail: {
      back: 'Back',
      title: 'Landing page design',
      devnet: { label: 'DEVNET', aria: 'Devnet, test money', title: 'Devnet · test money' },
      status: {
        created: 'New contract · review and accept',
        accepted: 'Accepted · waiting for @mia to lock',
      },
      next: 'Next · ',
      wait: { accepted: "Waiting for @mia to lock. Don't start work until this says Locked." },
      other: '@mia',
      otherRole: 'CLIENT',
      otherFacts: 'Mia · on N.E.D since 20 Sep 2026',
      heroLabel: 'Contract total',
      heroAmt: '≈ 13,010,000 VND',
      // Board: "(estimate) · $20.00 · rate of 2 Oct 2026". SPEC wording (≥ 11 px) and SPEC amount.
      heroSubEstimate: 'example, estimated',
      heroSubRest: ' · $500.00 · rate of 2 Oct 2026',
      destLabel: 'Earnings go to:',
      dest: { created: 'chosen by @vinh when accepting', accepted: 'VND via payout partner' },
      simulated: 'SIMULATED',
      notFunded: { created: 'Not locked yet · the freelancer has to accept', accepted: 'Not locked yet · the client locks next' },
      milestonesTitle: 'Milestones',
      milestone: 'Milestone',
      milestones: [
        { n: 1, amt: '≈ 6,500,000 VND', amtSub: '$250.00 · estimate', submitBy: '12 Oct, 18:00', reviewBy: '15 Oct, 18:00' },
        { n: 2, amt: '≈ 6,500,000 VND', amtSub: '$250.00 · estimate', submitBy: '19 Oct, 18:00', reviewBy: '22 Oct, 18:00' },
      ],
      notLocked: 'Not locked yet',
      submitBy: 'Submit by',
      reviewBy: 'Review by',
      rules: 'How this contract works',
      disclosures: 'Disclosures',
      contractId: 'Contract ID',
      cid: 'A7x9Lp…Qm7e',
      copy: 'Copy',
      action: 'Accept and choose where earnings go',
    },
    /**
     * phone/ContractDetailMiaAccepted = phone/ContractDetail · role client · view intl · state accepted (shared labels
     * from contractDetail). SPEC numbers: 500.00 USDC, milestones 250.00 USDC (board sample: 20.00 / 10.00).
     */
    contractDetailMia: {
      status: 'Ready to lock',
      other: '@vinh',
      otherRole: 'FREELANCER',
      otherFacts: 'Vinh · on N.E.D 9 days · phone not verified',
      heroLabel: 'Contract total',
      heroAmt: '500.00 USDC',
      heroSub: '2 milestones · devnet test money',
      dest: 'VND via payout partner',
      notFunded: 'Not locked yet · the client locks next',
      milestones: [
        { n: 1, amt: '250.00 USDC', amtSub: '', submitBy: '12 Oct, 18:00', reviewBy: '15 Oct, 18:00' },
        { n: 2, amt: '250.00 USDC', amtSub: '', submitBy: '19 Oct, 18:00', reviewBy: '22 Oct, 18:00' },
      ],
      actions: { lock: 'Lock 500.00 USDC', close: 'Close contract' },
    },
    /** phone/ContractLock · balance enough. SPEC numbers: 500.00 USDC total, 250.00 per milestone (board sample: 20.00 / 10.00). */
    contractLock: {
      back: 'Back',
      title: 'Lock for @vinh',
      totalLabel: 'Total to lock',
      total: '500.00 USDC',
      totalSub: 'Landing page design · 2 milestones',
      destLabel: 'Earnings go to',
      dest: 'VND via payout partner',
      simulated: 'SIMULATED',
      milestones: [
        { k: 'Milestone 1 · 250.00 USDC', v: 'by 12 Oct, 18:00' },
        { k: 'Milestone 2 · 250.00 USDC', v: 'by 19 Oct, 18:00' },
      ],
      reviewLabel: 'Review time',
      review: '3 days each',
      rulesLabel: 'Contract rules',
      rules: [
        'Released when the client approves, or automatically after the review time.',
        'Refunded to the client if a submission deadline is missed.',
        'Nobody, including N.E.D, can move it any other way.',
      ],
      balanceLabel: 'Your balance',
      balance: '500.00 USDC',
      afterLabel: 'After locking',
      after: '0.00 USDC',
      fees: { label: 'Fees', ned: 'N.E.D fee', nedV: 'None during the pilot', network: 'Network fee', networkV: '~0.000005 SOL', networkSub: 'devnet test SOL', partner: 'Payout partner fee', partnerV: 'Set by the partner' },
      slide: 'Slide to lock',
    },
    /**
     * phone/ContractLockedVN = phone/ContractLocked · side freelancer · view vn (other strings as contractLocked).
     * Board: "Locked ≈ 520,000 VND" and "(estimate) · $20.00. "; SPEC amount and wording ("example, estimated", ≥ 11 px).
     */
    contractLockedVN: {
      headline: 'Locked ≈ 13,010,000 VND · you can start',
      subEstimate: 'example, estimated',
      subRest: ' · $500.00. @mia locked the full contract in the program vault. Submit milestone 1 by 12 Oct, 18:00.',
      primary: 'Submit milestone 1',
      secondary: 'Back to Home',
    },
    /**
     * phone/ContractDetailVinhLocked = phone/ContractDetail · role freelancer · view vn · state locked (shared labels from
     * contractDetail). SPEC numbers and wording (board sample: ≈ 520,000 VND, "(estimate) · $20.00").
     */
    contractDetailVinhLocked: {
      status: 'Locked · work in progress',
      heroLabel: 'Locked for you',
      heroAmt: '≈ 13,010,000 VND',
      heroSubEstimate: 'example, estimated',
      heroSubRest: ' · $500.00 · rate of 2 Oct 2026',
      dest: 'VND via payout partner',
      vault: 'Held by the program, not by N.E.D · ',
      vaultAddress: '9vLt…Qm4x',
      explorer: 'Explorer',
      milestoneStatus: 'Locked · work in progress',
      countdown: 'Submit by deadline',
      // Board countdowns are seconds from a 1 s timer (840000 s, 1444800 s); here fixed, as the board shows them at t = 0.
      milestones: [
        { n: 1, amt: '≈ 6,500,000 VND', amtSub: '$250.00 · estimate', submitBy: '12 Oct, 18:00', reviewBy: '15 Oct, 18:00', cd: 'in 9 days' },
        { n: 2, amt: '≈ 6,500,000 VND', amtSub: '$250.00 · estimate', submitBy: '19 Oct, 18:00', reviewBy: '22 Oct, 18:00', cd: 'in 16 days' },
      ],
      action: 'Submit milestone 1',
    },
    /** phone/MilestoneSubmitted = phone/MilestoneSubmit · view vn · done (prototype-only "DEMO · switch to @mia's phone" removed). */
    milestoneSubmitted: {
      back: 'Back',
      title: 'Submit milestone 1',
      headline: 'Submitted · in review',
      sub: 'Auto-release in 3 days. Remember to send @mia the delivery link.',
      fingerprint: 'Fingerprint',
      reviewBy: 'Review by',
      reviewByV: '15 Oct, 18:00',
      explorer: 'View on Explorer',
      home: 'Back to Home',
    },
    /**
     * phone/MilestoneReview (review 3 days). The countdown is the board's at t = 0 (its 1 s timer is left out; SPEC §5.1).
     * Link: the board's "matches" sample, and its "differs" sample for the one flash. SPEC amount (board sample: 10.00 USDC).
     */
    milestoneReview: {
      back: 'Back',
      title: 'Review milestone 1',
      job: 'Landing page design · Milestone 1',
      by: 'by @vinh · submitted 3 Oct, 00:31',
      amt: '250.00 USDC',
      amtSub: 'to VND via payout partner',
      cdBefore: 'Auto-release in ',
      cd: '2 days 17 h',
      checkLabel: 'Check a link',
      checkHelp: 'Paste the link @vinh sent you. We compare its fingerprint with the one saved on-chain.',
      link: 'https://example.com/vinh/landing-v1',
      linkChanged: 'https://example.com/vinh/landing-v2',
      placeholder: 'https://',
      match: 'Matches what was submitted ✓',
      noMatch: "Doesn't match what was submitted",
      onchain: 'On-chain fingerprint ',
      fees: { label: 'Fees', ned: 'N.E.D fee', nedV: 'None during the pilot', network: 'Network fee', networkV: '~0.000005 SOL', networkSub: 'devnet test SOL', partner: 'Payout partner fee', partnerV: 'Set by the partner' },
      simulated: 'SIMULATED',
      slide: 'Slide to release',
    },
    /**
     * phone/MilestoneReleased (contract A): `client` (who client · view intl; its prototype-only "DEMO · switch to
     * @vinh's phone" removed) and `freelancerVN` (= phone/MilestoneReleasedVN: who freelancer · view vn).
     * SPEC amounts and wording (board sample: 10.00 USDC, ≈ 260,000 VND "(estimate)").
     */
    milestoneReleased: {
      devnet: 'Devnet · test money',
      teddyAlt: '',
      chip: 'Released',
      explorer: 'View on Explorer',
      fees: 'N.E.D fee: none during the pilot · Network fee ~0.000005 SOL (devnet test SOL)',
      done: 'Done',
      receiptLabel: 'Receipt',
      simLine: 'VND payout simulated in this demo ',
      simulated: 'SIMULATED',
      client: {
        headline: 'Released to Vinh',
        sub: 'Landing page design · Milestone 1 · 250.00 USDC',
        receipt: [
          { k: 'Contract', v: 'Landing page design · Milestone 1' },
          { k: 'Amount', v: '250.00 USDC', focus: 'rel-amount-client' },
          { k: 'To', v: 'VND via payout partner (simulated)' },
          { k: 'Released by', v: 'You (@mia)' },
        ],
      },
      /** who anyone · contract B (= phone/MilestoneReleasedB). SPEC amount (board sample: 10.00 USDC). */
      anyone: {
        headline: '250.00 USDC released to @vinh',
        sub: 'Logo refresh · to VND via payout partner (simulated)',
        receipt: [
          { k: 'Contract', v: 'Logo refresh' },
          { k: 'Amount', v: '250.00 USDC' },
          { k: 'To', v: 'VND via payout partner (simulated)' },
          { k: 'Released by', v: 'You (anyone can, after the review time)' },
        ],
      },
      /** who refund · contract A (= phone/MilestoneRefunded). SPEC amount (board sample: 10.00 USDC). */
      refund: {
        chip: 'Refunded to client',
        headline: '250.00 USDC refunded to @mia',
        sub: 'Landing page design · Milestone 1 · the submission deadline passed.',
        receipt: [
          { k: 'Contract', v: 'Landing page design · Milestone 1' },
          { k: 'Amount', v: '250.00 USDC' },
          { k: 'To', v: '@mia (client)' },
          { k: 'Reason', v: 'Deadline passed' },
        ],
      },
      freelancerVN: {
        headline: 'Released to payout partner',
        subAmount: '≈ 6,500,000 VND (',
        subEstimate: 'example, estimated',
        subRest: ') · $250.00 · rate of 2 Oct 2026. The partner sends VND to your bank; this demo stops here.',
        receipt: [
          { k: 'Contract', v: 'Landing page design · Milestone 1' },
          { k: 'Amount', v: '≈ 6,500,000 VND (example, estimated)', focus: 'rel-amount-you' },
          { k: 'To', v: 'Payout partner (simulated)' },
          { k: 'From', v: '@mia' },
        ],
      },
    },
    /**
     * phone/Disclosures. Board strings 1:1, except the row "Disputes have no neutral arbiter" (it says a client can
     * dispute; disputes are not available, SPEC §7 and §12.5). `id` names the rows chapter 13 lights.
     */
    disclosures: {
      back: 'Back',
      title: 'Disclosures',
      intro: 'Please read these before you lock or receive anything. Version 1.0.0 · pilot on Solana devnet.',
      rows: [
        { id: 'devnet', title: 'Devnet only', text: 'This demo runs on Solana devnet with test money. Nothing here has real value.' },
        { id: 'kyc', title: 'No KYC yet', text: 'N.E.D does not check anyone’s identity in this version.' },
        { id: 'phone', title: 'Phone numbers are not verified', text: 'We don’t send a code. A number on a profile may not belong to that person.' },
        { id: 'audit', title: 'The program is not audited', text: 'The Solana program that locks and releases USDC has not had a security audit.' },
        { id: 'partner', title: 'The payout partner is simulated', text: 'No licensed partner is connected in this demo. No VND is sent to any bank.' },
        { id: 'fees', title: 'Network fees use test SOL', text: 'Each action costs about 0.000005 test SOL on devnet. N.E.D charges no fee during the pilot.' },
        { id: 'vn', title: 'After release in the Vietnam path', text: 'Once a milestone is released to the payout partner, you rely on that partner to send you the VND.' },
        { id: 'circle', title: 'Circle can freeze USDC addresses', text: 'USDC is issued by Circle, which can freeze an address. N.E.D cannot undo that.' },
        { id: 'public', title: 'Public on-chain', text: 'Contract titles and delivery-link fingerprints are public. N.E.D never stores your delivery link or bank details.' },
        { id: 'advice', title: 'Not advice', text: 'This is not legal, tax or financial advice.' },
      ],
    },
    /**
     * phone/ContractAnyoneAction: `release` (kind release, contract B "Logo refresh") and `refund`
     * (= phone/ContractAnyoneActionRefund, contract A). SPEC amount (board sample: 10.00 USDC).
     */
    anyoneAction: {
      back: 'Back',
      devnet: 'Devnet · test money',
      parties: 'client @mia · freelancer @vinh',
      bgAmt: '250.00 USDC',
      sheetLabel: 'Anyone action',
      fees: { label: 'Fees', ned: 'N.E.D fee', nedV: 'None during the pilot', network: 'Network fee', networkV: '~0.000005 SOL', networkSub: 'devnet test SOL', partner: 'Payout partner fee', partnerV: 'Set by the partner' },
      simulated: 'SIMULATED',
      cancel: 'Cancel',
      release: {
        bgHead: 'Logo refresh',
        bgTitle: 'Logo refresh',
        bgStatus: 'Submitted · review time passed',
        title: 'Release now',
        text: "The review time has passed. Anyone can release this milestone to the freelancer's destination.",
        rows: [
          { k: 'Milestone', v: 'Logo refresh · 250.00 USDC' },
          { k: 'Review time ended', v: '3 Oct, 00:41' },
          { k: 'Goes to', v: 'VND via payout partner for @vinh (simulated)' },
        ],
        slide: 'Slide to release',
      },
      refund: {
        bgHead: 'Landing page design',
        bgTitle: 'Landing page design · Milestone 1',
        bgStatus: 'Not submitted · deadline passed',
        title: 'Refund now',
        text: 'The submission deadline passed. Anyone can refund this milestone to the client.',
        rows: [
          { k: 'Milestone', v: 'Landing page design · Milestone 1' },
          { k: 'Submission deadline', v: '12 Oct, 18:00 (passed)' },
          { k: 'Goes to', v: '@mia (client)' },
        ],
        slide: 'Slide to refund',
      },
    },
    /**
     * phone/ContractDetail · role client · view intl · contract B ("Logo refresh") · state submitted: the board's clock
     * (review time 60 s, 42 s left at t = 0) counts down with scroll in chapter 08. SPEC amount (board sample: 10.00 USDC).
     */
    contractDetailLogo: {
      title: 'Logo refresh',
      statusBefore: 'Submitted · review by 3 Oct, 00:41 · auto-release ',
      other: '@vinh',
      otherRole: 'FREELANCER',
      otherFacts: 'Vinh · on N.E.D 9 days · phone not verified',
      heroLabel: 'Locked for @vinh',
      heroAmt: '250.00 USDC',
      heroSub: '1 milestone · devnet test money',
      dest: 'VND via payout partner',
      msStatus: 'Submitted · review by 3 Oct, 00:41',
      milestones: [{ n: 1, amt: '250.00 USDC', amtSub: '', submitBy: '3 Oct, 00:40', reviewBy: '3 Oct, 00:41' }],
      countdown: 'Auto-release',
      now: 'now',
      cid: 'B3k8Qz…r2Fw',
      actions: { review: 'Review milestone 1' },
    },
    /** phone/ContractAccept · view vn (VND only; the board hides the USDC option in this view). SPEC amounts. */
    contractAccept: {
      back: 'Back',
      title: 'Accept contract',
      job: 'Landing page design',
      from: 'from @mia',
      total: '≈ 13,010,000 VND',
      // Board: "$20.00 · estimate · rate of 2 Oct 2026". SPEC wording (≥ 11 px) and SPEC amount.
      totalSubEstimate: 'example, estimated',
      totalSubRest: ' · $500.00 · rate of 2 Oct 2026',
      milestones: ['Milestone 1 · submit by 12 Oct, 18:00 · review 3 days', 'Milestone 2 · submit by 19 Oct, 18:00 · review 3 days'],
      question: 'Where should your earnings go?',
      groupLabel: 'Where earnings go',
      vnd: {
        title: 'VND to my Vietnamese bank account',
        body: 'A licensed payout partner converts outside Vietnam and sends VND to your bank. Bank details are collected by the partner, not by N.E.D. Simulated in this demo.',
      },
      simulated: 'SIMULATED',
      vnOnly: 'You live in Vietnam, so earnings arrive in VND only. Receiving USDC in a wallet is for people who live outside Vietnam (change this in Settings).',
      warn: { strong: "This can't be changed later.", rest: ' You never type an address: earnings go only to the destination you pick here.' },
      fees: { label: 'Fees', ned: 'N.E.D fee', nedV: 'None during the pilot', network: 'Network fee', networkV: '~0.000005 SOL', networkSub: 'devnet test SOL', partner: 'Payout partner fee', partnerV: 'Set by the partner' },
      slide: 'Slide to accept',
    },
    /** phone/OnbSplash · variant mascot (the board's Teddy variant; the mark variant has no mark asset yet). */
    onbSplash: {
      aria: 'N.E.D. Tap to continue',
      wordmark: 'N.E.D',
    },
  },
  problem: {
    headline: 'Today, the work comes first. The money comes later.',
    // SPEC §6 row 01 gives only the headline and "both sides carry a risk". These two lines are a proposal:
    // TODO(copy): confirm with the owner. Clients are never the villain here.
    l1: 'Freelancers deliver the work, then wait for the money.',
    l2: 'Clients are asked to send money up front, before they see any work.',
  },
  /** Text inside the laptop screen: web boards (board strings, SPEC numbers). */
  web: {
    /** web/WebSignIn · panelOpen false (the signed-out wallet panel is a separate board). Board strings 1:1. */
    signIn: {
      brand: { mark: 'N.E.D', name: 'Workspace' },
      devnet: 'Devnet · test money',
      signInButton: 'Sign in with N.E.D Wallet',
      chip: 'For freelancers and the clients who hire them',
      headline: 'Write the brief. Deliver the work. Get it released.',
      lead: 'The Workspace is the computer side of your N.E.D Wallet. Clients write the brief and lock money per milestone. Freelancers submit their work before the deadline. Money moves only from a wallet, when its owner confirms.',
      cta: 'Sign in with N.E.D Wallet',
      ctaNote: 'Use the same Google account as on your phone.',
      cards: [
        { role: 'Client', title: 'Write the brief', text: 'Scope, milestones and what counts as done. Its fingerprint is saved on-chain, so neither side can change it later.' },
        { role: 'Freelancer', title: 'Submit your work', text: 'Links and files from your computer, before the deadline. The chain clock records when you submitted.' },
        { role: 'Client', title: 'Review and release', text: 'Check the delivery against the brief, then release. If you do nothing by the review deadline, it releases on its own.' },
      ],
      phone: {
        title: 'Your phone stays the wallet',
        text: 'Same Google sign-in, same wallet, same contracts. Do the long work here; check status and confirm on your phone when you are away from your desk.',
      },
      footnote:
        'Devnet pilot · test money only. N.E.D holds no funds and charges no fee during the pilot. In the Vietnam view, earnings arrive in VND through a payout partner (simulated in the demo).',
    },
    /** web/WebContractNew · who mia. Form → wallet panel (sign) → created. SPEC: 250 + 250 USDC (board sample: 10 + 10). */
    contractNew: {
      brand: { mark: 'N.E.D', name: 'Workspace' },
      devnet: 'Devnet · test money',
      wallet: { handle: 'mia', label: 'Your wallet, @mia', sub: 'USDC wallet' },
      breadcrumb: { root: 'Workspace', sep: '/', here: 'New contract' },
      heading: 'New contract',
      steps: ['1 · Brief', '2 · @vinh accepts', '3 · You lock', '4 · Work starts'],
      freelancer: { heading: 'Freelancer', name: 'Vinh Nguyen', handle: '@vinh', sub: 'Chooses where earnings go when accepting', change: 'Change' },
      job: {
        heading: 'The job',
        titleLabel: 'Title',
        title: 'Landing page design',
        scopeLabel: 'What you need',
        scope:
          'A one-page landing site for our new budgeting app, desktop and mobile. Use the copy and the brand guide linked below. Milestone 1 is design only; milestone 2 is the build.',
        scopePlaceholder: 'Describe the work, who it is for and anything the freelancer must use.',
        refsLabel: 'References',
        refs: ['https://drive.example.com/brand-guide-v3.pdf', 'https://docs.example.com/landing-copy-v2'],
        refAddLabel: 'Add a reference link',
        refPlaceholder: 'Paste a link to a brand guide, copy or example',
        add: 'Add',
      },
      milestones: {
        heading: 'Milestones',
        note: 'Up to 5 · each one is locked, submitted and released on its own',
        amountLabel: 'Amount (USDC)',
        dateLabel: 'Submit by',
        reviewLabel: 'Review time after submit',
        reviews: [
          { v: '1m', label: '1 min (devnet demo)' },
          { v: '3d', label: '3 days' },
          { v: '7d', label: '7 days' },
        ],
        doneWhen: 'Done when…',
        doneWhenNote: 'The freelancer checks these before submitting; you check them before releasing.',
        critPlaceholder: 'Add something you can check, e.g. “Works on mobile”',
        add: 'Add',
        errNoCrit: 'Add at least one “done when” item.',
        addMilestone: '+ Add milestone',
        list: [
          {
            name: 'Wireframes and visual design',
            amt: '250',
            date: '2026-10-12T18:00',
            dateShort: '12 Oct',
            review: '3d',
            crit: ['Desktop and mobile layouts', 'Colours and fonts from the brand guide', 'Figma file with named components', 'Copy from the brief, no placeholder text'],
          },
          {
            name: 'Build and launch',
            amt: '250',
            date: '2026-10-19T18:00',
            dateShort: '19 Oct',
            review: '3d',
            crit: ['Page live on a test link', 'Matches the approved design', 'Source code in a Git repository'],
          },
        ],
      },
      summary: {
        total: 'Total to lock',
        unit: ' USDC',
        after: ' · locked after @vinh accepts',
        fingerprint: 'Brief fingerprint',
        fingerprintNote:
          'Changes as you type. When you create, it is saved on-chain and cannot change. @vinh confirms the same fingerprint when accepting, so you both agree on one brief.',
        checkedTitle: 'Checked before you sign',
        checked:
          'At least 24 h to work before the first deadline (60 s on devnet) · review time of at least 60 s · up to 5 milestones · title up to 32 characters · at least one “done when” item per milestone.',
        create: 'Create contract',
        createNote: 'Opens your wallet to confirm. No money moves at this step.',
      },
      created: {
        heading: 'Contract created',
        body: 'Send this invite link to @vinh. The brief travels inside it, encrypted: the part after # is the key, and browsers never send that part to a server.',
        link: 'ned.app/c/7XqP2mWc#k=Qm4tY8vR2LkN9sQe',
        copy: 'Copy link',
        fingerprint: 'Brief fingerprint · on-chain',
        next: 'Next',
        nextText: '@vinh accepts, then you lock ',
        view: 'View contract',
        back: 'Back to Workspace',
      },
    },
    /**
     * web/WebWalletPanel · who mia. Header (signed in) shared by both modes; `sign` = mode sign (chapter 03: action
     * create); `app` = mode app, the phone app itself at 86% (chapter 05: ContractLock, then ContractLocked).
     * SPEC total (board sample: 20.00 USDC).
     */
    walletPanel: {
      who: { mia: { handle: 'mia', shortAddr: '9PZw…rhkW' }, vinh: { handle: 'vinh', shortAddr: '4Fq8…Lw2c' } },
      devnet: 'Devnet · ',
      fullView: 'Open in full view',
      close: 'Close wallet',
      app: { dialog: 'Your N.E.D Wallet', label: 'N.E.D Wallet' },
      sign: {
        request: { before: 'Request from ', app: 'N.E.D Workspace', after: ' · ned.app' },
        kicker: 'Confirm to sign',
        cancel: 'Cancel',
        footer: 'Signed with the wallet linked to your Google account. N.E.D never holds your money.',
        create: {
          dialog: 'Confirm: Create contract',
          title: 'Create contract',
          rows: [
            { k: 'Contract', v: 'Landing page design' },
            { k: 'Freelancer', v: '@vinh' },
            { k: 'Milestones', v: '2 · 500.00 USDC total', sub: 'Locked later, after @vinh accepts' },
            { k: 'Brief fingerprint', v: '{fp}', sub: 'Saved on-chain, cannot change', mono: true },
            { k: 'Network fee', v: '~0.000005 SOL', sub: 'devnet test SOL' },
            { k: 'N.E.D fee', v: 'None during the pilot' },
          ],
          note: 'No money moves yet. @vinh reads the brief from your invite link and confirms the same fingerprint when accepting.',
          confirm: 'Create',
        },
        /** who vinh · action submit. SPEC amount and wording (board sample: ≈ 260,000 VND, "$10.00 · estimate"). */
        submit: {
          dialog: 'Confirm: Submit milestone 1',
          title: 'Submit milestone 1',
          rows: [
            { k: 'Contract', v: 'Landing page design' },
            { k: 'For', v: '@mia' },
            { k: 'Amount', v: '≈ 6,500,000 VND', sub: '$250.00 · example, estimated · rate of 2 Oct' },
            { k: 'Delivery fingerprint', v: '{fp}', sub: 'Saved on-chain with the chain clock', mono: true },
            { k: 'Deadline', v: '12 Oct 2026, 18:00', sub: 'On time · 9 days left' },
            { k: 'Network fee', v: '~0.000005 SOL', sub: 'devnet test SOL' },
          ],
          note: 'After you submit, @mia has until 15 Oct, 18:00 to review. If she does nothing by then, it is released to your bank in VND.',
          confirm: 'Submit',
        },
      },
    },
    /**
     * web/WebSubmit (who vinh). Board samples kept (they match SPEC: Figma · version 2214, GitHub · commit 3f9a1c2).
     * SPEC amount and wording for VND (board sample: ≈ 260,000 VND, "$10.00 · estimate"). The prototype-only
     * "DEMO · switch to @mia's computer" link is removed.
     */
    submit: {
      brand: { mark: 'N.E.D', name: 'Workspace' },
      devnet: 'Devnet · test money',
      wallet: { handle: 'vinh', label: 'Your wallet, @vinh', sub: 'Vietnam view · VND' },
      breadcrumb: { root: 'Workspace', sep: '/', contract: 'Landing page design', here: 'Milestone 1' },
      heading: 'Submit milestone 1',
      sub: 'Landing page design · Wireframes and visual design · for @mia',
      timer: 'Submit by 12 Oct, 18:00 · 9 days left',
      links: {
        heading: 'Links to your work',
        body: 'Use links that point at one fixed version (a Figma version, a Git commit, a shared file), so what @mia opens is what you delivered.',
        list: [
          { label: 'Figma · version 2214', url: 'https://www.figma.com/design/Lp7Qx/landing?version-id=2214' },
          { label: 'GitHub · commit 3f9a1c2', url: 'https://github.com/vinh-ng/landing/tree/3f9a1c2' },
        ],
        pinned: 'Fixed version',
        remove: 'Remove ',
        addLabel: 'Add a link',
        placeholder: 'https://',
        add: 'Add',
      },
      files: {
        heading: 'Files',
        body: 'Files stay on your computer. We read each one here and keep only its fingerprint, so @mia can check the file you share with her is the same one.',
        drop: 'Drop files here or choose files',
        list: [
          { name: 'landing-v1.fig', size: '4.2 MB', sha: '3f9a…c21e' },
          { name: 'export-desktop.png', size: '1.1 MB', sha: 'b81d…07f4' },
        ],
        fingerprint: ' · fingerprint ',
        remove: 'Remove ',
      },
      note: {
        label: 'Note to @mia',
        value: 'Both layouts are on the page “Final” in Figma. Components are named as in the brand guide.',
        placeholder: 'What is in this delivery and where to look first.',
      },
      check: {
        heading: 'Check against the brief',
        count: (n: number, of: number) => `${n} of ${of} ticked`,
        body: 'What @mia wrote under “Done when”. Only for you: ticks are not saved on-chain.',
        items: ['Desktop and mobile layouts', 'Colours and fonts from the brand guide', 'Figma file with named components', 'Copy from the brief, no placeholder text'],
      },
      aside: {
        label: 'Before you submit',
        comesLabel: 'Comes to you after release',
        comesWhole: '≈ 6,500,000',
        comesUnit: ' VND',
        comesSubEstimate: 'example, estimated',
        comesSubRest: ' · $250.00 · rate of 2 Oct · to your bank via the payout partner',
        askedTitle: 'What @mia asked for',
        asked: 'A one-page landing site for our new budgeting app, desktop and mobile. Use the copy and the brand guide linked below. Milestone 1 is design only…',
        briefFp: 'Brief fingerprint',
        briefFpV: '0x2831…3b17',
        accepted: 'You accepted',
        readBrief: 'Read the full brief',
        deliveryFp: 'Delivery fingerprint',
        deliveryNote: 'Made from your links, file fingerprints and note. Only this goes on-chain; the delivery itself is encrypted with the contract key, so only you and @mia can read it.',
        onTimeTitle: 'How on-time is decided',
        onTime: 'The program accepts a submit only up to 12 Oct, 18:00 and records the time from the chain clock, not from your computer. After that, the milestone can be refunded to @mia.',
        notAll: 'Some “Done when” items are not ticked. You can still submit; @mia may dispute.',
        submit: 'Submit milestone 1',
        submitNote: 'Opens your wallet to confirm. You cannot edit a delivery after submitting.',
      },
      done: {
        heading: 'Submitted · in review',
        body: '@mia sees your delivery in her Workspace and on her phone. If she does nothing by 15 Oct, 18:00, it is released to your bank in VND.',
        recorded: 'Recorded at',
        recordedV: '3 Oct 2026, 00:31 · chain clock',
        deadline: 'Deadline',
        deadlineV: '12 Oct 2026, 18:00',
        onTime: 'On time',
        fingerprint: 'Delivery fingerprint',
        comes: 'Comes to you',
        comesV: '≈ 6,500,000 VND',
        comesSubEstimate: 'example, estimated',
        comesSubRest: ' · $250.00 · rate of 2 Oct',
        explorer: 'View on Explorer',
        back: 'Back to Workspace',
      },
    },
    /**
     * web/WebWorkspace · who mia · panel open from "Lock in wallet". The board's mia samples are a later state (review,
     * Logo refresh); chapter 05 is before the lock, so the samples follow the story: one contract (Logo refresh removed,
     * as on HomeIntl), nothing locked yet, one need "Lock in wallet" (SPEC row 05) in the board's need card. Strings
     * reused from boards: "Lock 500.00 USDC" and "Ready to lock" (phone/ContractDetail · client · accepted).
     */
    workspace: {
      brand: { mark: 'N.E.D', name: 'Workspace' },
      devnet: 'Devnet · test money',
      wallet: { handle: 'mia', label: 'Your wallet, @mia', sub: 'USDC wallet' },
      nav: {
        label: 'Workspace',
        overview: 'Overview',
        contracts: 'Contracts',
        newContract: 'New contract',
        jobs: 'Jobs',
        records: 'Records',
        settings: 'Settings',
        settingsSub: 'in wallet',
      },
      phoneCard: { title: 'On your phone too', body: 'Same Google sign-in, same wallet. Confirm steps from your phone when you are away.' },
      greeting: 'Good afternoon,',
      name: 'Mia',
      cta: 'New contract',
      stats: [
        { label: 'Locked in your contracts', value: '0.00 USDC', sub: 'Held by the program, not by N.E.D' },
        { label: 'Waiting for your review', value: '0', sub: '' },
        { label: 'Active contracts', value: '1', sub: 'With @vinh' },
      ],
      needsTitle: 'Needs your action',
      needs: [{ title: 'Lock 500.00 USDC', sub: 'Landing page design · @vinh accepted', when: 'Ready to lock', cta: 'Lock in wallet' }],
      contractsTitle: 'Your contracts',
      history: 'History',
      table: { label: 'Your contracts', cols: ['Contract', 'Freelancer', 'Milestones', 'Next step', 'Amount', 'Status'] },
      rows: [
        {
          seed: 'vinh',
          title: 'Landing page design',
          party: '@vinh',
          ms: '0 of 2 done',
          next: 'Lock 500.00 USDC',
          amt: '500.00 USDC',
          amtSub: 'to VND via payout partner',
          status: 'Ready to lock',
        },
      ],
    },
  },
  /** The invite-link chip (T8): the same string as the link field it lifts off (web/WebContractNew, created). */
  inviteLink: 'ned.app/c/7XqP2mWc#k=Qm4tY8vR2LkN9sQe',
  /** Chapter 09 copy column: SPEC §6 row 09, exact wording. */
  receive: {
    headline: 'Where you live decides how you receive it.',
    small: 'Bank transfers need an identity check by the partner.',
  },
  /**
   * Chapter 13 copy column: SPEC §6 row 13 headline + the "Honest status" list of SPEC §1, verbatim. NOT YET is split
   * at its commas (one item per line, so each lights its Disclosures row); NEXT is the timeline Now · Next · Then · Later.
   * `row` = the Disclosures row an item lights (null: the board has no such row).
   */
  real: {
    headline: 'What works today, and what comes next.',
    now: {
      label: 'NOW:',
      before: 'demo on a ',
      strong: 'test network',
      after: ' (Solana devnet, test money). Program ',
      program: 'ned_program',
      end: ' deployed on devnet.',
    },
    simulated: { before: 'Payout partner and bank transfer are ', strong: 'simulated', after: ' in the demo. Partner not confirmed.' },
    notYet: {
      label: 'NOT YET:',
      items: [
        { text: 'no identity checks (KYC),', row: 'kyc' },
        { text: 'no security audit,', row: 'audit' },
        { text: 'no way to settle disputes over quality (planned after launch),', row: null },
        { text: 'no lawyer review yet,', row: null },
        { text: 'USDC is issued by Circle which can freeze an address.', row: 'circle' },
      ],
    },
    next: {
      label: 'NEXT:',
      steps: [
        { k: 'Now', v: 'demo on a test network' },
        { k: 'Next', v: 'partner + legal' },
        { k: 'Then', v: 'closed pilot (up to 1,000 USDC per contract)' },
        { k: 'Later', v: 'more' },
      ],
    },
  },
  /** Chapter 14 copy column: SPEC §6 row 14, exact wording. The CTAs are the product cards (labels in links.ts). */
  close: {
    headline: 'See a milestone released.',
    client: 'Hiring? Write a brief in the Workspace and lock a milestone.',
  },
  /** Chapter 08 copy column: SPEC §6 row 08, exact wording (three lines, no headline in the SPEC; the first leads). */
  quiet: {
    l1: "No answer by the review deadline? It's released to you on its own.",
    l2: "Miss a submission deadline, and that milestone's money goes back to the client.",
    l3: 'Deadlines run on their own: once one passes, anyone can trigger the next step.',
    chip: 'Disputes over quality: planned after launch',
  },
  /** Chapter 07 copy column and landing-layer block: SPEC §6 row 07, exact wording. */
  release: {
    headline: 'Your client checks the work, then releases it.',
    l1: 'Each link is checked against the fingerprint saved when you submitted.',
    l2: 'Your client approves, and that part is released.',
    block: { amount: '≈ 6,500,000 VND', meta: 'example, estimated · milestone 1, 250 USDC' },
    small: 'Bank transfer simulated in this demo.',
    /** The amount chip (SPEC §4: the only other chip that travels): "$ 250 USDC" morphs to "≈ 6,500,000 VND" by scroll. */
    chip: { usdc: '$ 250 USDC', vndPrefix: '≈ ', vndUnit: ' VND', vnd: 6500000 },
  },
  /** Chapter 06 copy column: SPEC §6 row 06, exact wording. */
  submit: {
    headline: 'Submit before the deadline.',
    l1: 'The time and a fingerprint of your work are recorded.',
    l2: 'Your files stay on your computer. Only their fingerprints are saved.',
  },
  /** Chapter 05 copy column: SPEC §6 row 05, exact wording. */
  lock: {
    headline: 'Your client locks it before you start.',
    l1: 'The whole amount, per milestone, held by the program.',
    l2: 'Nobody, including N.E.D, can move the money any other way.',
    chip: "You can see it's there",
  },
  /** Chapter 04 copy column: SPEC §6 row 04, exact wording. */
  accept: {
    headline: 'You read the brief, then choose once where the money goes.',
    l1: 'You choose once, when you accept the contract. You never type an address.',
    l2: 'In Vietnam: VND to your bank through a licensed partner.',
    chip: 'Partner in talks · simulated in the demo',
  },
  /** Chapter 03 copy column: SPEC §6 row 03, exact wording. */
  brief: {
    headline: 'Your client writes one brief.',
    l1: 'Milestones, deadlines, and what counts as done for each one.',
    l2: 'Its fingerprint is saved on the chain, so neither side can change it.',
    small: "The brief travels encrypted inside the invite link. The link can't move money.",
    fanCaption: 'Prefer the phone? Same three steps.',
  },
  /** Chapter 02 copy column: SPEC §6 row 02, exact wording. */
  signIn: {
    headline: 'Sign in with Google. Say where you live.',
    l1: 'No seed phrase. Your wallet is set up when you sign in.',
    l2: 'Live in Vietnam? The app shows only VND. You never hold crypto.',
    small: 'You can change it in Settings.',
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
} as const;
