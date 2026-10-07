import { easeFn, type EaseName } from '@/motion/tokens';

/**
 * Poses table (SPEC §10.2). Key = story vh (desktop units; K is applied by the scroll layer).
 * Components never hard-code a pose: they call `samplePose(track, vh)` every frame.
 *
 * position: x, y are fractions of the half viewport at z = 0 (−1 left/bottom … 1 right/top); z in world units.
 * rotation: [pitch, yaw, roll] in degrees. Negative yaw turns the screen toward the left.
 * opacity:  optional, default 1. Multiplied with the hero intro entrance (SPEC §16.3).
 * dim:      optional, default 0. Darkens the device (screen overlay + glow), 0 … 1.
 * size:     on desktop, fraction of viewport HEIGHT the phone's height fills;
 *           on portrait, fraction of viewport WIDTH the phone's width fills.
 * screen:   switching screens crossfades over the whole segment (keep those segments short).
 * ease:     easing used on the way INTO this keyframe from the previous one.
 * transform: the named device transform (SPEC §5.3) played on the way INTO this keyframe. A label for
 *           readers, the orbit nav and present mode; the motion itself is the keyframes.
 * screenSwitch: 'cut' = the screen changes at the segment's midpoint instead of crossfading (T2 Flip,
 *           where the change happens while the phone is edge-on).
 * via:      an in-between keyframe that only shapes motion (e.g. the edge-on moment of a flip).
 *           Skipped under reduced motion, so reduced motion cuts straight between the real stops.
 */
export type Owner = 'you' | 'client' | 'anyone';
/**
 * home = Home for the owner (yours: HomeVN; flipped to the client: ContractLocked) · homeIntl = the client's Home
 * · chatYou / chatClient = a generic messaging app (chapter 01, not N.E.D) · splash / onb* = onboarding boards.
 */
export type PhoneScreen =
  | 'home'
  | 'homeIntl'
  | 'chatYou'
  | 'chatClient'
  | 'splash'
  | 'onbWelcome'
  | 'onbSetup'
  | 'onbResidence'
  | 'cn1'
  | 'cn2'
  | 'cn3';
/** Device transform vocabulary, exactly as named in SPEC §5.3. */
export type TransformName =
  | 'T1 Glide'
  | 'T2 Flip'
  | 'T3 Split'
  | 'T4 Dock'
  | 'T5 Zoom'
  | 'T6 Fan'
  | 'T7 Tilt'
  | 'T8 Lift-off'
  | 'T9 Owner turn';

export type Pose = {
  vh: number;
  device: 'phone';
  position: [number, number, number];
  rotation: [number, number, number];
  size: number;
  opacity?: number;
  dim?: number;
  screen: PhoneScreen;
  owner: Owner;
  ease?: EaseName;
  transform?: TransformName;
  screenSwitch?: 'cut';
  via?: true;
};

export type Sampled = Omit<Pose, 'vh' | 'ease' | 'opacity' | 'dim' | 'transform' | 'screenSwitch' | 'via'> & {
  opacity: number;
  dim: number;
  /** Screen crossfade: `screenTo` is drawn over `screenFrom` at opacity `screenMix` (both equal when not switching). */
  screenFrom: PhoneScreen;
  screenTo: PhoneScreen;
  screenMix: number;
};

type Place = Pick<Pose, 'device' | 'position' | 'rotation' | 'size'>;

/** How dark "both dim" gets (chapter 01). */
const DIM = 0.62;

/** T3 Split end poses: two phones side by side, turned a little toward each other, copy column left free. */
const SPLIT: Record<'desktop' | 'portrait', { left: Place; right: Place }> = {
  desktop: {
    left: { device: 'phone', position: [-0.62, -0.04, 0], rotation: [2, 16, 0], size: 0.66 },
    right: { device: 'phone', position: [-0.06, -0.04, 0], rotation: [2, -14, 0], size: 0.66 },
  },
  portrait: {
    left: { device: 'phone', position: [-0.5, -0.46, 0], rotation: [3, 12, 0], size: 0.47 },
    right: { device: 'phone', position: [0.5, -0.46, 0], rotation: [3, -12, 0], size: 0.47 },
  },
};

/** Hidden behind another track's keyframe at `vh`: same place, pushed back on z, invisible. */
function behind(track: Pose[], vh: number): Place & { opacity: 0 } {
  const k = track.find((p) => p.vh === vh);
  if (!k) throw new Error(`No keyframe at ${vh} vh`);
  const [x, y, z] = k.position;
  return { device: k.device, position: [x, y, z - 0.3], rotation: k.rotation, size: k.size, opacity: 0 };
}

type Vec3 = [number, number, number];

/** Chapter 02 screen stops on a still phone (360–516 vh). Each switch crossfades over 12 vh. */
function ch02Screens(position: Vec3, rotation: Vec3, size: number): Pose[] {
  const at = (vh: number, screen: PhoneScreen, rot: Vec3 = rotation): Pose => ({ vh, device: 'phone', position, rotation: rot, size, screen, owner: 'you' });
  const settled: Vec3 = [rotation[0], rotation[1] + 2, rotation[2]];
  return [
    at(374, 'onbWelcome', settled),
    at(404, 'onbWelcome', settled), // the tap on "Continue with Google" plays 390–404 (TAPS)
    at(416, 'onbSetup', settled),
    at(456, 'onbSetup', settled), // steps tick 416 → 446, then "Your account is ready" (CH02_SETUP)
    at(468, 'onbResidence', settled),
    at(490, 'onbResidence', settled),
    at(502, 'home', rotation),
    at(516, 'home', rotation),
  ];
}

/**
 * T2 Flip (SPEC §5.3, 20–30 vh): one full turn around the vertical axis at constant speed, moving from `from`
 * to `to`. Two `via` keyframes straddle the edge-on moment (yaw + 90°), where owner and screen switch (cut).
 */
function t2Flip(o: {
  start: number;
  end: number;
  from: Vec3;
  to: Vec3;
  rotation: Vec3;
  sizeFrom: number;
  sizeTo: number;
  toScreen: PhoneScreen;
}): Pose[] {
  const [pitch, yaw, roll] = o.rotation;
  const span = o.end - o.start;
  const k = (f: number): Pick<Pose, 'vh' | 'position' | 'size'> => ({
    vh: o.start + span * f,
    position: [0, 1, 2].map((i) => o.from[i] + (o.to[i] - o.from[i]) * f) as Vec3,
    size: o.sizeFrom + (o.sizeTo - o.sizeFrom) * f,
  });
  const edge = 90 / 360;
  const half = 4 / 360;
  return [
    { ...k(edge - half), device: 'phone', rotation: [pitch, yaw + 86, roll], screen: 'home', owner: 'you', ease: 'linear', via: true, transform: 'T2 Flip' },
    { ...k(edge + half), device: 'phone', rotation: [pitch, yaw + 94, roll], screen: o.toScreen, owner: 'client', ease: 'linear', via: true, screenSwitch: 'cut', transform: 'T2 Flip' },
    { ...k(1), device: 'phone', rotation: [pitch, yaw + 360, roll], screen: o.toScreen, owner: 'client', ease: 'linear', screenSwitch: 'cut', transform: 'T2 Flip' },
  ];
}

/** T6 Fan end poses (chapter 03): the client's phone in the middle, steps 1 and 3 fanned out on either side. */
const FAN: Record<'desktop' | 'portrait', { centre: Place; left: Place; right: Place }> = {
  desktop: {
    centre: { device: 'phone', position: [0.3, -0.12, 0.4], rotation: [2, 360, 0], size: 0.54 },
    left: { device: 'phone', position: [0.0, -0.16, 0.15], rotation: [2, 14, 7], size: 0.48 },
    right: { device: 'phone', position: [0.6, -0.16, 0.15], rotation: [2, -14, -7], size: 0.48 },
  },
  portrait: {
    centre: { device: 'phone', position: [0, -0.76, 0.4], rotation: [4, 360, 0], size: 0.48 },
    left: { device: 'phone', position: [-0.5, -0.8, 0.15], rotation: [4, 14, 7], size: 0.4 },
    right: { device: 'phone', position: [0.5, -0.8, 0.15], rotation: [4, -14, -7], size: 0.4 },
  },
};

/**
 * T6 Fan (SPEC §5.3, 30–40 vh): one phone fans into three, then folds back. This builds one of the side phones:
 * hidden behind the centre phone, fanned out 828 → 840, held, folded back 848 → 860.
 */
function t6Fan(centre: Pose[], to: Place, screen: PhoneScreen): Pose[] {
  const hidden = (vh: number): Pose => ({ vh, ...behind(centre, vh), screen, owner: 'client' });
  return [
    hidden(828),
    { vh: 840, ...to, screen, owner: 'client', ease: 'easeOut', transform: 'T6 Fan' },
    { vh: 848, ...to, screen, owner: 'client' },
    { ...hidden(860), transform: 'T6 Fan' },
  ];
}

const phoneDesktop: Pose[] = [
  // Chapter 00 · Hero (0–140 vh). Phone rises 40 px and turns −40° → −18°, then T1 Glide to the left.
  { vh: 0, device: 'phone', position: [0.4, -0.12, 0], rotation: [4, -40, 0], size: 0.74, screen: 'home', owner: 'you' },
  { vh: 60, device: 'phone', position: [0.4, -0.04, 0], rotation: [2, -18, 0], size: 0.74, screen: 'home', owner: 'you', ease: 'easeOut' },
  { vh: 100, device: 'phone', position: [0.4, -0.04, 0], rotation: [2, -18, 0], size: 0.74, screen: 'home', owner: 'you' },
  // T1 Glide (40 vh): along an arc, turning toward where it goes (≤ 25°).
  { vh: 120, device: 'phone', position: [0.05, 0.04, 0.2], rotation: [0, -25, -3], size: 0.72, screen: 'home', owner: 'you', ease: 'ease', transform: 'T1 Glide' },
  { vh: 140, device: 'phone', position: [-0.38, -0.04, 0], rotation: [2, 14, 0], size: 0.72, screen: 'home', owner: 'you', ease: 'easeOut', transform: 'T1 Glide' },

  // Chapter 01 · The problem (140–360 vh). Before N.E.D: a generic messaging app.
  // Home → "Files sent ✓"; the status-bar clock jumps 3 → 14 → 30 days (CH01_CLOCK below).
  { vh: 158, device: 'phone', position: [-0.4, -0.04, 0], rotation: [2, 12, 0], size: 0.72, screen: 'chatYou', owner: 'you' },
  { vh: 255, device: 'phone', position: [-0.42, -0.04, 0], rotation: [2, 10, 0], size: 0.72, screen: 'chatYou', owner: 'you' },
  // T3 Split (35 vh): your phone steps left; the client's phone comes out from behind it (phoneB track).
  { vh: 290, ...SPLIT.desktop.left, screen: 'chatYou', owner: 'you', transform: 'T3 Split' },
  { vh: 318, ...SPLIT.desktop.left, screen: 'chatYou', owner: 'you' },
  // Both dim.
  { vh: 332, ...SPLIT.desktop.left, dim: DIM, screen: 'chatYou', owner: 'you' },
  // The split reverses: the client's phone folds back in; yours moves to the centre and shows the N.E.D splash.
  { vh: 346, device: 'phone', position: [-0.2, -0.03, 0], rotation: [1, 8, 0], size: 0.77, dim: DIM, screen: 'chatYou', owner: 'you', transform: 'T3 Split' },
  { vh: 360, device: 'phone', position: [0, -0.02, 0], rotation: [2, -6, 0], size: 0.82, screen: 'splash', owner: 'you', ease: 'easeOut' },

  // Chapter 02 · Sign in, say where you live (360–560 vh). Your phone stays centred at 82%; screens change by
  // scroll: Welcome → tap "Continue with Google" (TAPS) → Setup (steps: CH02_SETUP) → Residence → Home.
  ...ch02Screens([0, -0.02, 0], [2, -6, 0], 0.82),
  // T2 Flip (28 vh): one full turn at constant speed while gliding right; the back (owner tag) shows mid-turn and
  // the phone comes back as the client's, on their Home. Owner and screen switch while it is edge-on.
  ...t2Flip({ start: 516, end: 544, from: [0, -0.02, 0], to: [0.42, -0.04, 0], rotation: [2, -6, 0], sizeFrom: 0.82, sizeTo: 0.74, toScreen: 'homeIntl' }),
  { vh: 560, device: 'phone', position: [0.42, -0.04, 0], rotation: [2, 354, 0], size: 0.74, screen: 'homeIntl', owner: 'client' },

  // Chapter 03 · The brief (560–860 vh). The client's phone glides out as the laptop slides in (T1 Glide), waits
  // off-screen, and glides back on ContractNew2 for the T6 Fan (phoneB / phoneC carry steps 1 and 3).
  { vh: 584, device: 'phone', position: [1.35, -0.04, 0], rotation: [2, 334, 0], size: 0.74, opacity: 0, screen: 'homeIntl', owner: 'client', transform: 'T1 Glide' },
  { vh: 800, device: 'phone', position: [1.35, -0.04, 0], rotation: [2, 334, 0], size: 0.66, opacity: 0, screen: 'cn2', owner: 'client', screenSwitch: 'cut' },
  { vh: 828, ...FAN.desktop.centre, screen: 'cn2', owner: 'client', ease: 'easeOut', transform: 'T1 Glide' },
  { vh: 860, ...FAN.desktop.centre, screen: 'cn2', owner: 'client' },
];

// Portrait (SPEC §8): phone at 92% width rising from the bottom, top ~60% visible.
const phonePortrait: Pose[] = [
  { vh: 0, device: 'phone', position: [0.04, -1.06, 0], rotation: [6, -18, 0], size: 0.92, screen: 'home', owner: 'you' },
  { vh: 60, device: 'phone', position: [0.04, -0.88, 0], rotation: [4, -8, 0], size: 0.92, screen: 'home', owner: 'you', ease: 'easeOut' },
  { vh: 100, device: 'phone', position: [0.04, -0.88, 0], rotation: [4, -8, 0], size: 0.92, screen: 'home', owner: 'you' },
  { vh: 140, device: 'phone', position: [-0.1, -0.94, 0], rotation: [4, 10, 0], size: 0.86, screen: 'home', owner: 'you', ease: 'ease', transform: 'T1 Glide' },

  // Chapter 01 (portrait): copy on top, phone rising from the bottom; the split shrinks both phones.
  { vh: 158, device: 'phone', position: [0, -0.9, 0], rotation: [4, 6, 0], size: 0.86, screen: 'chatYou', owner: 'you' },
  { vh: 255, device: 'phone', position: [0, -0.9, 0], rotation: [4, 4, 0], size: 0.86, screen: 'chatYou', owner: 'you' },
  { vh: 290, ...SPLIT.portrait.left, screen: 'chatYou', owner: 'you', transform: 'T3 Split' },
  { vh: 318, ...SPLIT.portrait.left, screen: 'chatYou', owner: 'you' },
  { vh: 332, ...SPLIT.portrait.left, dim: DIM, screen: 'chatYou', owner: 'you' },
  { vh: 346, device: 'phone', position: [-0.12, -0.84, 0], rotation: [4, 6, 0], size: 0.72, dim: DIM, screen: 'chatYou', owner: 'you', transform: 'T3 Split' },
  { vh: 360, device: 'phone', position: [0, -0.88, 0], rotation: [4, 0, 0], size: 0.86, screen: 'splash', owner: 'you', ease: 'easeOut' },

  // Chapter 02 (portrait): copy on top, phone rising from the bottom; the flip parks it a little right.
  ...ch02Screens([0, -0.88, 0], [4, 0, 0], 0.86),
  ...t2Flip({ start: 516, end: 544, from: [0, -0.88, 0], to: [0.06, -0.88, 0], rotation: [4, 0, 0], sizeFrom: 0.86, sizeTo: 0.86, toScreen: 'homeIntl' }),
  { vh: 560, device: 'phone', position: [0.06, -0.88, 0], rotation: [4, 360, 0], size: 0.86, screen: 'homeIntl', owner: 'client' },

  // Chapter 03 (portrait): out to the right while the browser card rises; back for the fan.
  { vh: 584, device: 'phone', position: [1.6, -0.88, 0], rotation: [4, 340, 0], size: 0.86, opacity: 0, screen: 'homeIntl', owner: 'client', transform: 'T1 Glide' },
  { vh: 800, device: 'phone', position: [1.6, -0.7, 0], rotation: [4, 340, 0], size: 0.5, opacity: 0, screen: 'cn2', owner: 'client', screenSwitch: 'cut' },
  { vh: 828, ...FAN.portrait.centre, screen: 'cn2', owner: 'client', ease: 'easeOut', transform: 'T1 Glide' },
  { vh: 860, ...FAN.portrait.centre, screen: 'cn2', owner: 'client' },
];

/**
 * The second phone: only on screen during a T3 Split. Before and after, it waits hidden behind
 * your phone (pushed back, opacity 0), so the split reads as one phone becoming two.
 */
const phoneBDesktop: Pose[] = [
  { vh: 255, ...behind(phoneDesktop, 255), screen: 'chatClient', owner: 'client' },
  { vh: 290, ...SPLIT.desktop.right, screen: 'chatClient', owner: 'client', transform: 'T3 Split' },
  { vh: 318, ...SPLIT.desktop.right, screen: 'chatClient', owner: 'client' },
  { vh: 332, ...SPLIT.desktop.right, dim: DIM, screen: 'chatClient', owner: 'client' },
  { vh: 346, ...behind(phoneDesktop, 346), dim: DIM, screen: 'chatClient', owner: 'client', transform: 'T3 Split' },
  ...t6Fan(phoneDesktop, FAN.desktop.left, 'cn1'),
];

const phoneBPortrait: Pose[] = [
  { vh: 255, ...behind(phonePortrait, 255), screen: 'chatClient', owner: 'client' },
  { vh: 290, ...SPLIT.portrait.right, screen: 'chatClient', owner: 'client', transform: 'T3 Split' },
  { vh: 318, ...SPLIT.portrait.right, screen: 'chatClient', owner: 'client' },
  { vh: 332, ...SPLIT.portrait.right, dim: DIM, screen: 'chatClient', owner: 'client' },
  { vh: 346, ...behind(phonePortrait, 346), dim: DIM, screen: 'chatClient', owner: 'client', transform: 'T3 Split' },
  ...t6Fan(phonePortrait, FAN.portrait.left, 'cn1'),
];

/** Third phone: only for the T6 Fan (chapter 03). */
const phoneCDesktop: Pose[] = t6Fan(phoneDesktop, FAN.desktop.right, 'cn3');
const phoneCPortrait: Pose[] = t6Fan(phonePortrait, FAN.portrait.right, 'cn3');

export const tracks = {
  phone: { desktop: phoneDesktop, portrait: phonePortrait },
  phoneB: { desktop: phoneBDesktop, portrait: phoneBPortrait },
  phoneC: { desktop: phoneCDesktop, portrait: phoneCPortrait },
};
export type TrackName = keyof typeof tracks;

/**
 * Chapter 01 status-bar clock on your phone: days since the files were sent. A step function of scroll
 * (never wall-clock time); before the first step it shows the time the files went out.
 */
export const CH01_CLOCK = {
  sentAt: '9:41',
  steps: [
    { vh: 172, days: 3 },
    { vh: 204, days: 14 },
    { vh: 236, days: 30 },
  ],
};

/** Chapter 02 OnbSetup steps (board: one per 1.1 s; here one per 10 vh). 3 = finished ("Your account is ready"). */
export const CH02_SETUP = { steps: [416, 426, 436, 446] };
export function ch02SetupStep(vh: number): number {
  let step = 0;
  CH02_SETUP.steps.forEach((at, i) => {
    if (vh >= at) step = i;
  });
  return step;
}

/** Tap marks on the landing layer (not part of the screen). The target element in the screen has data-tap-target. */
export const TAPS: { track: TrackName | 'laptop'; target: string; start: number; end: number }[] = [
  { track: 'phone', target: 'google', start: 390, end: 404 },
  { track: 'laptop', target: 'create', start: 762, end: 772 },
  { track: 'laptop', target: 'panel-create', start: 778, end: 788 },
];

/* ------------------------------------------------------------------------------------------------------------ */
/* Laptop (chapter 03 on). A generic body; the screen shows a web board.                                        */
/* ------------------------------------------------------------------------------------------------------------ */

export type LaptopScreen = 'webContractNew';

/** Page scroll inside the laptop screen: an element (data-focus) placed at `at` (0 top … 1 bottom) of the screen. */
export type PageScroll = { focus: string; at: number } | null;

export type LaptopPose = {
  vh: number;
  position: Vec3;
  rotation: Vec3;
  /** Desktop: fraction of viewport WIDTH the laptop base fills. Portrait (browser card): fraction of viewport width. */
  size: number;
  /** Lid angle in degrees: 0 closed … 105 open. Ignored on portrait (browser card). */
  lid: number;
  opacity?: number;
  page: PageScroll;
  screen: LaptopScreen;
  owner: Owner;
  ease?: EaseName;
  transform?: TransformName;
};

const PAGE_TOP: PageScroll = null;
const PAGE_DONE_WHEN: PageScroll = { focus: 'm1-done', at: 0.5 };
/** At 1×: the "Done when" list low on the screen, so the summary's fingerprint stays in view above. */
const PAGE_DONE_WHEN_LOW: PageScroll = { focus: 'm1-done', at: 0.88 };

const laptopDesktop: LaptopPose[] = [
  { vh: 560, position: [1.7, -0.5, 0], rotation: [10, -24, 0], size: 0.66, lid: 0, opacity: 0, page: PAGE_TOP, screen: 'webContractNew', owner: 'client' },
  // Slides in (T1 Glide), then the lid opens 0° → 105°.
  { vh: 588, position: [0.32, -0.44, 0], rotation: [10, -6, 0], size: 0.66, lid: 12, page: PAGE_TOP, screen: 'webContractNew', owner: 'client', ease: 'easeOut', transform: 'T1 Glide' },
  { vh: 608, position: [0.32, -0.44, 0], rotation: [10, -6, 0], size: 0.66, lid: 105, page: PAGE_TOP, screen: 'webContractNew', owner: 'client' },
  { vh: 632, position: [0.32, -0.44, 0], rotation: [10, -6, 0], size: 0.66, lid: 105, page: PAGE_TOP, screen: 'webContractNew', owner: 'client' },
  // The page scrolls to milestone 1 ("Done when"); T5 Zoom happens on the camera track.
  { vh: 650, position: [0.32, -0.44, 0], rotation: [10, -6, 0], size: 0.66, lid: 105, page: PAGE_DONE_WHEN, screen: 'webContractNew', owner: 'client' },
  { vh: 704, position: [0.32, -0.44, 0], rotation: [10, -6, 0], size: 0.66, lid: 105, page: PAGE_DONE_WHEN, screen: 'webContractNew', owner: 'client' },
  { vh: 716, position: [0.32, -0.44, 0], rotation: [10, -6, 0], size: 0.66, lid: 105, page: PAGE_DONE_WHEN_LOW, screen: 'webContractNew', owner: 'client' },
  { vh: 748, position: [0.32, -0.44, 0], rotation: [10, -6, 0], size: 0.66, lid: 105, page: PAGE_DONE_WHEN_LOW, screen: 'webContractNew', owner: 'client' },
  // Back to the top: Create → wallet panel → created.
  { vh: 760, position: [0.32, -0.44, 0], rotation: [10, -6, 0], size: 0.66, lid: 105, page: PAGE_TOP, screen: 'webContractNew', owner: 'client' },
  { vh: 806, position: [0.32, -0.44, 0], rotation: [10, -6, 0], size: 0.66, lid: 105, page: PAGE_TOP, screen: 'webContractNew', owner: 'client' },
  // Out, making room for the fan.
  { vh: 826, position: [1.7, -0.6, 0], rotation: [10, -24, 0], size: 0.66, lid: 105, opacity: 0, page: PAGE_TOP, screen: 'webContractNew', owner: 'client', transform: 'T1 Glide' },
];

/** Portrait (SPEC §8): the laptop becomes a cropped browser card (the board's narrower responsive layout). */
const laptopPortrait: LaptopPose[] = laptopDesktop.map((k) => {
  const shown = (k.opacity ?? 1) > 0;
  // While the wallet panel is open the card shrinks, so the whole panel (and its Create button) fits the screen.
  const panel = k.vh === 760 || k.vh === 806;
  return {
    ...k,
    position: !shown ? [0, -1.9, 0] : panel ? [0, -0.27, 0] : [0, -0.39, 0],
    rotation: [0, 0, 0],
    size: panel ? 0.72 : 0.92,
    // Zoomed, the list sits near the card's top so the card stays below the copy.
    page: k.page === PAGE_DONE_WHEN ? { focus: 'm1-done', at: 0.2 } : k.page === PAGE_DONE_WHEN_LOW ? { focus: 'm1-done', at: 0.62 } : k.page,
  };
});

export const laptopTracks = { desktop: laptopDesktop, portrait: laptopPortrait };

export type LaptopSampled = Omit<LaptopPose, 'vh' | 'ease' | 'transform' | 'page' | 'opacity'> & {
  opacity: number;
  pageFrom: PageScroll;
  pageTo: PageScroll;
  pageMix: number;
};

export function sampleLaptop(track: LaptopPose[], vh: number, still = false): LaptopSampled {
  const out = (a: LaptopPose, b: LaptopPose, t: number): LaptopSampled => ({
    position: lerp3(a.position, b.position, t),
    rotation: lerp3(a.rotation, b.rotation, t),
    size: lerp(a.size, b.size, t),
    lid: lerp(a.lid, b.lid, t),
    opacity: lerp(a.opacity ?? 1, b.opacity ?? 1, t),
    screen: t < 0.5 ? a.screen : b.screen,
    owner: t < 0.5 ? a.owner : b.owner,
    pageFrom: a.page,
    pageTo: b.page,
    pageMix: t,
  });
  if (vh <= track[0].vh) return out(track[0], track[0], 1);
  const last = track[track.length - 1];
  if (vh >= last.vh) return out(last, last, 1);
  let i = 1;
  while (track[i].vh < vh) i++;
  const a = track[i - 1];
  const b = track[i];
  const raw = (vh - a.vh) / (b.vh - a.vh);
  return out(a, b, still ? (raw < 0.5 ? 0 : 1) : easeFn[b.ease ?? 'ease'](raw));
}

/* ------------------------------------------------------------------------------------------------------------ */
/* Camera (T5 Zoom). zoom 1 = the default stage; focus = a data-focus element inside a device screen.          */
/* ------------------------------------------------------------------------------------------------------------ */

/** `at`: where the focus should sit on screen (fractions of the half viewport), clear of the copy column. */
export type CameraPose = {
  vh: number;
  zoom: number;
  /** Portrait zoom when it differs (the zoomed detail must still fit the narrow screen). */
  zoomPortrait?: number;
  focus?: string;
  at?: { desktop: [number, number]; portrait: [number, number] };
  ease?: EaseName;
  transform?: TransformName;
};

const BESIDE_COPY = { desktop: [0.45, 0] as [number, number], portrait: [0, -0.27] as [number, number] };

/** T5 Zoom (SPEC §5.3, 40–70 vh): push 1.6× onto the "Done when" list while the first items are typed, then pull out. */
export const cameraTrack: CameraPose[] = [
  { vh: 0, zoom: 1 },
  { vh: 650, zoom: 1 },
  { vh: 664, zoom: 1.6, zoomPortrait: 1.3, focus: 'm1-done', at: BESIDE_COPY, transform: 'T5 Zoom' },
  { vh: 704, zoom: 1.6, zoomPortrait: 1.3, focus: 'm1-done', at: BESIDE_COPY },
  { vh: 716, zoom: 1, transform: 'T5 Zoom' },
];

export const cameraZoom = (k: CameraPose, portrait: boolean) => (portrait ? (k.zoomPortrait ?? k.zoom) : k.zoom);

export function sampleCamera(vh: number, still = false, portrait = false) {
  const t0 = cameraTrack[0];
  if (vh <= t0.vh) return { zoom: cameraZoom(t0, portrait), from: t0, to: t0, mix: 1 };
  const last = cameraTrack[cameraTrack.length - 1];
  if (vh >= last.vh) return { zoom: cameraZoom(last, portrait), from: last, to: last, mix: 1 };
  let i = 1;
  while (cameraTrack[i].vh < vh) i++;
  const a = cameraTrack[i - 1];
  const b = cameraTrack[i];
  const raw = (vh - a.vh) / (b.vh - a.vh);
  const t = still ? (raw < 0.5 ? 0 : 1) : easeFn[b.ease ?? 'ease'](raw);
  return { zoom: lerp(cameraZoom(a, portrait), cameraZoom(b, portrait), t), from: a, to: b, mix: t };
}

/* ------------------------------------------------------------------------------------------------------------ */
/* Invite-link chip (T8 Lift-off). `at` is a place (fractions of the half viewport) or a data-focus element.    */
/* ------------------------------------------------------------------------------------------------------------ */

export type ChipPose = { vh: number; at: Vec3 | { focus: string }; scale: number; opacity: number; ease?: EaseName; transform?: TransformName };

const chipDesktop: ChipPose[] = [
  { vh: 790, at: { focus: 'invite-link' }, scale: 1, opacity: 0 },
  // Appears exactly over the link field, then lifts off the screen as a flat chip (T8).
  { vh: 794, at: { focus: 'invite-link' }, scale: 1, opacity: 1 },
  { vh: 814, at: [0.3, 0.7, 0.8], scale: 1.25, opacity: 1, ease: 'easeOut', transform: 'T8 Lift-off' },
  { vh: 860, at: [0.3, 0.7, 0.8], scale: 1.25, opacity: 1 },
];
const chipPortrait: ChipPose[] = chipDesktop.map((k) => (Array.isArray(k.at) ? { ...k, at: [0, -0.04, 0.8] as Vec3, scale: 0.9 } : k));

export const chipTracks = { desktop: chipDesktop, portrait: chipPortrait };

/* ------------------------------------------------------------------------------------------------------------ */
/* Chapter 03 brief state on the laptop screen (WebContractNew), a pure function of scroll.                      */
/* ------------------------------------------------------------------------------------------------------------ */

/**
 * The four "Done when" items of milestone 1 are typed into the board's own "Add something you can check" field
 * and added one by one (the board's add flow). Each window: typing over the first 85%, added at the end.
 */
export const CH03_TYPING: [number, number][] = [
  [664, 684],
  [684, 704],
  [716, 732],
  [732, 748],
];
export const CH03_CREATE = { panelAt: 772, createdAt: 790 };

export type BriefState = { added: number; draft: string; panel: 'closed' | 'sign'; created: boolean };

export function ch03BriefAt(vh: number, items: readonly string[]): BriefState {
  let added = 0;
  let draft = '';
  CH03_TYPING.forEach(([a, b], i) => {
    if (vh >= b) added = i + 1;
    else if (vh > a) {
      const p = Math.min(1, (vh - a) / ((b - a) * 0.85));
      draft = items[i].slice(0, Math.round(items[i].length * p));
    }
  });
  const created = vh >= CH03_CREATE.createdAt;
  const panel = !created && vh >= CH03_CREATE.panelAt ? 'sign' : 'closed';
  return { added, draft, panel, created };
}

export function ch01Days(vh: number): number | null {
  let days: number | null = null;
  for (const s of CH01_CLOCK.steps) if (vh >= s.vh) days = s.days;
  return days;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

/**
 * Pure function of scroll: same vh in, same pose out (back-scroll and jumps stay exact).
 * `still` (reduced motion): no in-between poses, a hard cut at each segment's midpoint.
 */
const stillTracks = new WeakMap<Pose[], Pose[]>();

export function samplePose(trackIn: Pose[], vh: number, still = false): Sampled {
  let track = trackIn;
  if (still) {
    if (!stillTracks.has(trackIn)) stillTracks.set(trackIn, trackIn.filter((p) => !p.via));
    track = stillTracks.get(trackIn)!;
  }
  const strip = ({ vh: _vh, ease: _ease, transform: _t, screenSwitch: _s, via: _v, opacity = 1, dim = 0, ...rest }: Pose): Sampled => ({
    ...rest,
    opacity,
    dim,
    screenFrom: rest.screen,
    screenTo: rest.screen,
    screenMix: 1,
  });
  if (vh <= track[0].vh) return strip(track[0]);
  const last = track[track.length - 1];
  if (vh >= last.vh) return strip(last);

  let i = 1;
  while (track[i].vh < vh) i++;
  const a = track[i - 1];
  const b = track[i];
  const raw = (vh - a.vh) / (b.vh - a.vh);
  const t = still ? (raw < 0.5 ? 0 : 1) : easeFn[b.ease ?? 'ease'](raw);
  return {
    device: b.device,
    position: lerp3(a.position, b.position, t),
    rotation: lerp3(a.rotation, b.rotation, t),
    size: lerp(a.size, b.size, t),
    opacity: lerp(a.opacity ?? 1, b.opacity ?? 1, t),
    dim: lerp(a.dim ?? 0, b.dim ?? 0, t),
    // Discrete fields switch at the midpoint of the segment.
    screen: t < 0.5 ? a.screen : b.screen,
    owner: t < 0.5 ? a.owner : b.owner,
    screenFrom: a.screen,
    screenTo: b.screen,
    screenMix: a.screen === b.screen ? 1 : b.screenSwitch === 'cut' ? (t < 0.5 ? 0 : 1) : t,
  };
}
