// Chapter 01 · Hero. All on-screen copy is reviewed by the Compliance Lead before going live.
// Banned words (strategy-v3 §11.3): pay, payment, deposit, escrow, interest, yield, invest, earn,
// safe, risk-free, scam-free, guaranteed, credit score, rating, pool, vault.

export const hero = {
  headline: 'Shared money, held by rules, not by a middleman.',
  sub: 'N.E.D is a wallet for USDC, a stablecoin that tracks the US dollar. When a group puts money together, a fund holds it under the rules the group agreed on.',
  chip: 'Demo on a test network',
  cue: 'Scroll to see how',
} as const;

export const site = {
  wordmark: 'N.E.D',
  demoLink: 'Try the demo',
  skipLink: 'Skip to the demo link',
  prototypeEnd: {
    title: 'The rest of the story is being built.',
    body: 'Next: the fund that its own creator cannot open, and three ways to share money.',
  },
} as const;
