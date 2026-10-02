// Site-wide switches. Copy lives in /src/content so it can be reviewed without touching code.

/** Problem chapter audience. Decided 2 Oct 2026: neutral copy that leans toward freelancers (B). */
export type Segment = 'neutral' | 'A' | 'B';
export const SEGMENT: Segment = 'neutral';

/** Waitlist storage must stay in Vietnam. Until an approved endpoint exists, no email is collected. */
export const WAITLIST_ENDPOINT: string | null = null;

export const DEMO_URL = 'https://tdat10052499.github.io/Unihackfest-2026/';
export const GITHUB_URL = 'https://github.com/Tdat10052499/Unihackfest-2026';

/** Coins in the 3D scene. Phones get fewer. */
export const COIN_COUNT = { desktop: 96, phone: 24 } as const;
