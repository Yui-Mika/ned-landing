import { easeFn, type EaseName } from '@/motion/tokens';

/**
 * Poses table (SPEC §10.2). Key = story vh (desktop units; K is applied by the scroll layer).
 * Components never hard-code a pose: they call `samplePose(track, vh)` every frame.
 *
 * position: x, y are fractions of the half viewport at z = 0 (−1 left/bottom … 1 right/top); z in world units.
 * rotation: [pitch, yaw, roll] in degrees. Negative yaw turns the screen toward the left.
 * size:     on desktop, fraction of viewport HEIGHT the phone's height fills;
 *           on portrait, fraction of viewport WIDTH the phone's width fills.
 * ease:     easing used on the way INTO this keyframe from the previous one.
 */
export type Owner = 'you' | 'client' | 'anyone';
export type PhoneScreen = 'home';

export type Pose = {
  vh: number;
  device: 'phone';
  position: [number, number, number];
  rotation: [number, number, number];
  size: number;
  screen: PhoneScreen;
  owner: Owner;
  ease?: EaseName;
};

export type Sampled = Omit<Pose, 'vh' | 'ease'>;

// Chapter 00 · Hero (0–140 vh). Phone rises 40 px and turns −40° → −18°, then T1 Glide to the left.
const phoneDesktop: Pose[] = [
  { vh: 0, device: 'phone', position: [0.4, -0.12, 0], rotation: [4, -40, 0], size: 0.74, screen: 'home', owner: 'you' },
  { vh: 60, device: 'phone', position: [0.4, -0.04, 0], rotation: [2, -18, 0], size: 0.74, screen: 'home', owner: 'you', ease: 'out' },
  { vh: 100, device: 'phone', position: [0.4, -0.04, 0], rotation: [2, -18, 0], size: 0.74, screen: 'home', owner: 'you' },
  // T1 Glide (40 vh): along an arc, turning toward where it goes (≤ 25°).
  { vh: 120, device: 'phone', position: [0.05, 0.04, 0.2], rotation: [0, -25, -3], size: 0.72, screen: 'home', owner: 'you', ease: 'inOut' },
  { vh: 140, device: 'phone', position: [-0.38, -0.04, 0], rotation: [2, 14, 0], size: 0.72, screen: 'home', owner: 'you', ease: 'out' },
];

// Portrait (SPEC §8): phone at 92% width rising from the bottom, top ~60% visible.
const phonePortrait: Pose[] = [
  { vh: 0, device: 'phone', position: [0.04, -1.06, 0], rotation: [6, -18, 0], size: 0.92, screen: 'home', owner: 'you' },
  { vh: 60, device: 'phone', position: [0.04, -0.88, 0], rotation: [4, -8, 0], size: 0.92, screen: 'home', owner: 'you', ease: 'out' },
  { vh: 100, device: 'phone', position: [0.04, -0.88, 0], rotation: [4, -8, 0], size: 0.92, screen: 'home', owner: 'you' },
  { vh: 140, device: 'phone', position: [-0.1, -0.94, 0], rotation: [4, 10, 0], size: 0.86, screen: 'home', owner: 'you', ease: 'inOut' },
];

export const tracks = {
  phone: { desktop: phoneDesktop, portrait: phonePortrait },
};

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
  const strip = ({ vh: _vh, ease: _ease, ...rest }: Pose): Sampled => rest;
  if (vh <= track[0].vh) return strip(track[0]);
  const last = track[track.length - 1];
  if (vh >= last.vh) return strip(last);

  let i = 1;
  while (track[i].vh < vh) i++;
  const a = track[i - 1];
  const b = track[i];
  const raw = (vh - a.vh) / (b.vh - a.vh);
  const t = still ? (raw < 0.5 ? 0 : 1) : easeFn[b.ease ?? 'inOut'](raw);
  return {
    device: b.device,
    position: lerp3(a.position, b.position, t),
    rotation: lerp3(a.rotation, b.rotation, t),
    size: lerp(a.size, b.size, t),
    // Discrete fields switch at the midpoint of the segment.
    screen: t < 0.5 ? a.screen : b.screen,
    owner: t < 0.5 ? a.owner : b.owner,
  };
}
