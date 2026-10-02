// Site-wide switches. Copy lives in src/content so it can be reviewed without touching code.

export const DEMO_URL = 'https://tdat10052499.github.io/Unihackfest-2026/';
export const GITHUB_URL = 'https://github.com/Tdat10052499/Unihackfest-2026';

/** Waitlist storage must stay in Vietnam. Until an approved endpoint exists, no email is collected. */
export const WAITLIST_ENDPOINT: string | null = null;

/**
 * The team's Teddy model (.glb), relative to the site root, e.g. 'models/teddy.glb' in /public.
 * null = block placeholders. Spec: storyboard board "Teddy 3D · what the model needs".
 */
export const TEDDY_MODEL_URL: string | null = null;

/** The app screens in chapter 06 are proposed designs until real screenshots exist. */
export const SCREENS_ARE_PROPOSED = true;

/** Coins in the 3D scene. Phones get fewer. */
export const COIN_COUNT = { desktop: 48, phone: 24 } as const;
