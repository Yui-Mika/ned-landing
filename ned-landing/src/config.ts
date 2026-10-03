// Site-wide switches. Copy lives in src/content so it can be reviewed without touching code.

export const DEMO_URL = 'https://tdat10052499.github.io/Unihackfest-2026/';
export const GITHUB_URL = 'https://github.com/Tdat10052499/Unihackfest-2026';

/** Waitlist storage must stay in Vietnam. Until an approved endpoint exists, no email is collected. */
export const WAITLIST_ENDPOINT: string | null = null;

/**
 * The team's Teddy model (.glb) for the hero, relative to the site root, e.g. 'models/teddy.glb' in /public.
 * null = the 2D art. Teddy appears in the hero only; the model needs clips "idle" and "wave".
 */
export const TEDDY_MODEL_URL: string | null = null;

/** The app screens in chapter 06 are proposed designs until real screenshots exist. */
export const SCREENS_ARE_PROPOSED = true;



