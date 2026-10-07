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
    /** web/WebWalletPanel · who mia · mode sign · action create. SPEC total (board sample: 20.00 USDC). */
    walletPanel: {
      dialog: 'Confirm: Create contract',
      handle: 'mia',
      request: { before: 'Request from ', app: 'N.E.D Workspace', after: ' · ned.app' },
      kicker: 'Confirm to sign',
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
      cancel: 'Cancel',
      confirm: 'Create',
      footer: 'Signed with the wallet linked to your Google account. N.E.D never holds your money.',
    },
  },
  /** The invite-link chip (T8): the same string as the link field it lifts off (web/WebContractNew, created). */
  inviteLink: 'ned.app/c/7XqP2mWc#k=Qm4tY8vR2LkN9sQe',
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
  later: {
    title: 'More chapters coming',
    body: 'Chapter 05 and the rest of the story are next.',
  },
} as const;
