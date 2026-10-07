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
 */
export type Owner = 'you' | 'client' | 'anyone';
/** home = N.E.D Home · chatYou / chatClient = a generic messaging app (chapter 01, not N.E.D) · splash = N.E.D splash. */
export type PhoneScreen = 'home' | 'chatYou' | 'chatClient' | 'splash';
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
};

export type Sampled = Omit<Pose, 'vh' | 'ease' | 'opacity' | 'dim' | 'transform'> & {
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
];

const phoneBPortrait: Pose[] = [
  { vh: 255, ...behind(phonePortrait, 255), screen: 'chatClient', owner: 'client' },
  { vh: 290, ...SPLIT.portrait.right, screen: 'chatClient', owner: 'client', transform: 'T3 Split' },
  { vh: 318, ...SPLIT.portrait.right, screen: 'chatClient', owner: 'client' },
  { vh: 332, ...SPLIT.portrait.right, dim: DIM, screen: 'chatClient', owner: 'client' },
  { vh: 346, ...behind(phonePortrait, 346), dim: DIM, screen: 'chatClient', owner: 'client', transform: 'T3 Split' },
];

export const tracks = {
  phone: { desktop: phoneDesktop, portrait: phonePortrait },
  phoneB: { desktop: phoneBDesktop, portrait: phoneBPortrait },
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
export function samplePose(track: Pose[], vh: number, still = false): Sampled {
  const strip = ({ vh: _vh, ease: _ease, transform: _t, opacity = 1, dim = 0, ...rest }: Pose): Sampled => ({
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
    screenMix: a.screen === b.screen ? 1 : t,
  };
}
