import { easeFn, type EaseName } from '@/motion/tokens';
import { chapterById } from '@/content/chapters';

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
 * dock:     optional, default 0. T4 Dock (desktop): 0 = the pose above … 1 = docked in the laptop's wallet panel
 *           (same place, size and angle as the panel's app screen; Phone.tsx measures it every frame).
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
  | 'cn3'
  | 'cdNew'
  | 'accept'
  | 'cdAccepted'
  | 'cdMiaAccepted'
  | 'lock'
  | 'lockedClient'
  | 'lockedVN'
  | 'cdVinhLocked'
  | 'submitted'
  | 'review'
  | 'releasedClient'
  | 'releasedVN'
  | 'logoSubmitted'
  | 'anyoneRelease'
  | 'anyoneRefund'
  | 'releasedB'
  | 'refunded'
  | 'disclosures'
  | 'homeVNReleased'
  | 'homeIntlReleased';
/** Where your phone is (chapter 09 T3 split): adds "· Vietnam" / "· abroad" to its owner tag. */
export type TagPlace = 'vn' | 'abroad';
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
  dock?: number;
  place?: TagPlace;
};

export type Sampled = Omit<Pose, 'vh' | 'ease' | 'opacity' | 'dim' | 'transform' | 'screenSwitch' | 'via' | 'dock'> & {
  opacity: number;
  dim: number;
  dock: number;
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
 * Default: your phone on Home → the client's phone.
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
  fromScreen?: PhoneScreen;
  fromOwner?: Owner;
  toOwner?: Owner;
}): Pose[] {
  const { fromScreen = 'home', fromOwner = 'you', toOwner = 'client' } = o;
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
    { ...k(edge - half), device: 'phone', rotation: [pitch, yaw + 86, roll], screen: fromScreen, owner: fromOwner, ease: 'linear', via: true, transform: 'T2 Flip' },
    { ...k(edge + half), device: 'phone', rotation: [pitch, yaw + 94, roll], screen: o.toScreen, owner: toOwner, ease: 'linear', via: true, screenSwitch: 'cut', transform: 'T2 Flip' },
    { ...k(1), device: 'phone', rotation: [pitch, yaw + 360, roll], screen: o.toScreen, owner: toOwner, ease: 'linear', screenSwitch: 'cut', transform: 'T2 Flip' },
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

/** Chapter 04 slide to accept: the thumb follows scroll over this window; the result shows 4 vh after 100%. */
export const CH04_SLIDE: [number, number] = [1050, 1080];

/**
 * Chapter 04 stops for your phone (860–1120 vh): out as the client's phone, in as yours on ContractDetail (new),
 * a tap on "Accept and choose where earnings go" (TAPS), ContractAccept (T5 Zoom on the camera track), the slider
 * (CH04_SLIDE), and ContractDetail (accepted) 4 vh after the slide completes.
 */
function ch04Phone(at: Vec3, rotation: Vec3, size: number, exit: Vec3, entry: Vec3): Pose[] {
  const you = (vh: number, screen: PhoneScreen, extra: Partial<Pose> = {}): Pose => ({ vh, device: 'phone', position: at, rotation, size, screen, owner: 'you', ...extra });
  return [
    { vh: 874, device: 'phone', position: exit, rotation: [rotation[0], 340, 0], size, opacity: 0, screen: 'cn2', owner: 'client', transform: 'T1 Glide' },
    // Swapped while out of view: now your phone, on the new contract.
    { vh: 878, device: 'phone', position: entry, rotation, size, opacity: 0, dim: 0.6, screen: 'cdNew', owner: 'you', screenSwitch: 'cut' },
    you(900, 'cdNew', { dim: 0.6, ease: 'easeOut', transform: 'T1 Glide' }),
    you(914, 'cdNew'), // the chip has landed: the dim lifts
    you(958, 'cdNew'), // tap on "Accept and choose where earnings go" 946–958
    you(970, 'accept'),
    you(CH04_SLIDE[1] + 4, 'accept'),
    you(CH04_SLIDE[1] + 16, 'cdAccepted'),
    you(1120, 'cdAccepted'),
  ];
}

/**
 * Chapter 05 · Lock (1120–1360 vh), every beat a window of scroll. One device on stage at a time (SPEC §5.3):
 * T2 Flip your phone → the client's (ContractDetailMiaAccepted) · the phone fades out · the client's computer fades in,
 * in place (WebWorkspace) · tap "Lock in wallet" · the wallet panel opens top-right (board app mode, ContractLock; the
 * board's open motion: scale .97 → 1 from the top-right) · T5 Zoom on the panel · slide to lock (thumb follows scroll;
 * ContractLocked 4 vh after 100%) · lock glyph stamps (landing layer) · the panel closes · the computer fades out ·
 * your phone fades in on ContractLockedVN. Each outgoing device reaches 0 where the incoming one starts.
 */
export const CH05 = {
  flip: [1122, 1146] as [number, number],
  phoneOut: [1146, 1152] as [number, number],
  laptopIn: [1152, 1164] as [number, number],
  tap: [1166, 1178] as [number, number],
  panelOpen: [1180, 1186] as [number, number],
  zoom: [1188, 1200, 1264, 1276] as [number, number, number, number],
  slide: [1220, 1248] as [number, number],
  stamp: [1254, 1262, 1268, 1276] as [number, number, number, number],
  panelClose: [1282, 1288] as [number, number],
  laptopOut: [1290, 1304] as [number, number],
  phoneIn: [1304, 1316] as [number, number],
};
/** Slide to lock: the thumb follows scroll over this window; the result shows 4 vh after 100%. */
export const CH05_SLIDE = CH05.slide;
export const CH05_LOCKED_AT = CH05.slide[1] + 4;

/** Outgoing devices shrink a little as they fade (SPEC §5.3 one device at a time): phone 1 → 0.94, laptop 1 → 0.96. */
export const FADE_SCALE = { phone: 0.94, laptop: 0.96 };

/**
 * Wallet panel in the Workspace (WebWorkspace, mode app): which app screen, and how far open (0 … 1) for the board's
 * open motion (`.ned-pop`: opacity 0 → 1, 6 px rise, scale .97 → 1 from the top-right), scrubbed by scroll.
 */
export function ch05PanelAt(vh: number): { screen: 'lock' | 'locked' | null; open: number } {
  const [a, b] = CH05.panelOpen;
  const [c, d] = CH05.panelClose;
  if (vh < a || vh > d) return { screen: null, open: 0 };
  const open = Math.max(0, Math.min(1, (vh - a) / (b - a), (d - vh) / (d - c)));
  return { screen: vh >= CH05_LOCKED_AT ? 'locked' : 'lock', open };
}

/**
 * Chapter 05 phone: T2 Flip in place to the client's phone, which fades out (and shrinks a little) before the laptop
 * fades in; after the laptop has gone, your phone fades in on ContractLockedVN.
 */
function ch05Phone(o: { at: Vec3; rotation: Vec3; size: number }): Pose[] {
  const [pitch, yaw] = o.rotation;
  const turned: Vec3 = [pitch, yaw + 360, 0];
  const small = o.size * FADE_SCALE.phone;
  const p = (vh: number, screen: PhoneScreen, owner: Owner, extra: Partial<Pose> = {}): Pose => ({ vh, device: 'phone', position: o.at, rotation: turned, size: o.size, screen, owner, ...extra });
  return [
    ...t2Flip({
      start: CH05.flip[0],
      end: CH05.flip[1],
      from: o.at,
      to: o.at,
      rotation: o.rotation,
      sizeFrom: o.size,
      sizeTo: o.size,
      fromScreen: 'cdAccepted',
      fromOwner: 'you',
      toScreen: 'cdMiaAccepted',
      toOwner: 'client',
    }),
    p(CH05.phoneOut[1], 'cdMiaAccepted', 'client', { size: small, opacity: 0, ease: 'linear' }),
    // Swapped while hidden: your phone, on the locked contract.
    p(CH05.phoneIn[0], 'lockedVN', 'you', { size: small, opacity: 0, screenSwitch: 'cut' }),
    p(CH05.phoneIn[1], 'lockedVN', 'you', { ease: 'easeOut' }),
    p(1360, 'lockedVN', 'you'),
  ];
}

/**
 * Chapter 06 · Work and submit (1360–1620 vh): your phone on ContractDetail (locked), then out (T1 Glide) · the client's
 * computer fades in seen from behind · T9 Owner turn: it turns 180° on its base and is now Your computer (WebSubmit) ·
 * the two links are typed and added · two files dropped, a thin scan line passes each (its fingerprint shows after)
 * · the four "Done when" boxes ticked (T5 Zoom follows links → files → checks) · Submit → wallet panel (sign · submit)
 * → Submitted · in review (T5 Zoom) · the computer fades out · your phone fades in on MilestoneSubmitted.
 * One device on stage at a time: each outgoing device reaches 0 where the incoming one starts.
 */
export const CH06 = {
  toDetail: [1362, 1372] as [number, number],
  phoneOut: [1382, 1392] as [number, number],
  laptopIn: [1392, 1406] as [number, number],
  turn: [1408, 1440] as [number, number],
  links: [
    [1452, 1466],
    [1466, 1480],
  ] as [number, number][],
  files: [1490, 1498],
  /** Each dropped file is scanned over this many vh; its fingerprint shows after. */
  scan: 6,
  checks: [1514, 1518, 1522, 1526],
  submitTap: [1544, 1554] as [number, number],
  panelAt: 1552,
  panelTap: [1564, 1574] as [number, number],
  doneAt: 1576,
  laptopOut: [1598, 1606] as [number, number],
  phoneIn: [1606, 1616] as [number, number],
};

export type SubmitState = { links: number; draft: string; files: number; scanned: number; checks: number; panel: 'closed' | 'sign'; done: boolean };

/** Chapter 06 WebSubmit state, a pure function of scroll. Typing: each URL over the first 85% of its window, added at the end. */
export function ch06SubmitAt(vh: number, urls: readonly string[]): SubmitState {
  let links = 0;
  let draft = '';
  CH06.links.forEach(([a, b], i) => {
    if (vh >= b) links = i + 1;
    else if (vh > a) draft = urls[i].slice(0, Math.round(urls[i].length * Math.min(1, (vh - a) / ((b - a) * 0.85))));
  });
  const files = CH06.files.filter((f) => vh >= f).length;
  const scanned = CH06.files.filter((f) => vh >= f + CH06.scan).length;
  const checks = CH06.checks.filter((c) => vh >= c).length;
  const done = vh >= CH06.doneAt;
  return { links, draft, files, scanned, checks, panel: !done && vh >= CH06.panelAt ? 'sign' : 'closed', done };
}

/** The scan line over a dropped file row: which row (data-file-row) and how far down it (0 … 1), or null. */
export function ch06ScanAt(vh: number): { row: number; p: number } | null {
  for (let i = 0; i < CH06.files.length; i++) {
    const p = (vh - CH06.files[i]) / CH06.scan;
    if (p >= 0 && p < 1) return { row: i, p };
  }
  return null;
}

function ch06Phone(o: { at: Vec3; rotation: Vec3; size: number }): Pose[] {
  const small = o.size * FADE_SCALE.phone;
  const you = (vh: number, screen: PhoneScreen, extra: Partial<Pose> = {}): Pose => ({ vh, device: 'phone', position: o.at, rotation: o.rotation, size: o.size, screen, owner: 'you', ...extra });
  return [
    you(CH06.toDetail[0], 'lockedVN'),
    you(CH06.toDetail[1], 'cdVinhLocked'),
    you(CH06.phoneOut[0], 'cdVinhLocked'),
    // Fades out in place (and shrinks a little) before the computer fades in.
    you(CH06.phoneOut[1], 'cdVinhLocked', { size: small, opacity: 0, ease: 'linear' }),
    // Swapped while hidden: the submitted state. Back in the same place once the computer has gone.
    you(CH06.phoneIn[0], 'submitted', { size: small, opacity: 0, screenSwitch: 'cut' }),
    you(CH06.phoneIn[1], 'submitted', { ease: 'easeOut' }),
    you(1620, 'submitted'),
  ];
}

/**
 * Chapter 07 · Review and release (1620–1900 vh), the key moment: T2 Flip your phone → the client's, on MilestoneReview
 * (the link matches; a changed link flashes "Doesn't match" once) · T5 Zoom on "Slide to release", the thumb follows
 * scroll · MilestoneReleased 4 vh after 100% · T3 Split: your phone comes out beside it on MilestoneReleasedVN · the
 * amount chip crosses the seam, "$ 250 USDC" → "≈ 6,500,000 VND" · the VND block holds (~60 vh).
 */
export const CH07 = {
  flip: [1622, 1646] as [number, number],
  /** The changed link: the board's "differs" sample, shown once. */
  flash: [1652, 1660] as [number, number],
  zoom: [1664, 1676, 1712, 1724] as [number, number, number, number],
  slide: [1678, 1706] as [number, number],
  released: [1710, 1718] as [number, number],
  split: [1726, 1756] as [number, number],
  chip: { show: [1756, 1760], travel: [1760, 1784], morph: [1764, 1780], settle: [1784, 1792] } as Record<'show' | 'travel' | 'morph' | 'settle', [number, number]>,
  /** The VND block under the split: in, hold (the climax, ~70 vh), out. */
  block: [1786, 1794, 1866, 1876] as [number, number, number, number],
};
export const CH07_SLIDE = CH07.slide;

/** MilestoneReview link field: the board's matching sample, except during the one flash of its changed sample. */
export const ch07LinkChanged = (vh: number) => vh >= CH07.flash[0] && vh < CH07.flash[1];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const win = (vh: number, [a, b]: [number, number]) => clamp01((vh - a) / (b - a));

/**
 * The amount chip, a pure function of scroll: `travel` 0 = over the client's amount, 1 = over yours (eased, arcs over
 * the seam), `morph` 0 = "$ 250 USDC" … 1 = "≈ 6,500,000 VND", opacity and scale (it settles into your phone).
 * `still` (reduced motion): no travel or morph in between, a cut at each window's midpoint.
 */
export function ch07ChipAt(vh: number, still = false) {
  const c = CH07.chip;
  if (vh <= c.show[0] || vh >= c.settle[1]) return null;
  const step = (x: number) => (still ? (x < 0.5 ? 0 : 1) : x);
  const opacity = Math.min(win(vh, c.show), 1 - win(vh, c.settle));
  return {
    travel: still ? step(win(vh, c.travel)) : easeFn.ease(win(vh, c.travel)),
    morph: step(win(vh, c.morph)),
    opacity: still ? (opacity > 0.5 ? 1 : 0) : opacity,
    scale: 1 - 0.15 * win(vh, c.settle),
  };
}

/** T3 Split end poses for chapter 07: side by side right of the copy column, room for the VND block below. */
const SPLIT7: Record<'desktop' | 'portrait', { left: Place; right: Place }> = {
  desktop: {
    left: { device: 'phone', position: [0.05, 0.1, 0], rotation: [2, 722, 0], size: 0.6 },
    right: { device: 'phone', position: [0.62, 0.1, 0], rotation: [2, 702, 0], size: 0.6 },
  },
  portrait: {
    left: { device: 'phone', position: [-0.48, -0.66, 0], rotation: [4, 726, 0], size: 0.42 },
    right: { device: 'phone', position: [0.48, -0.66, 0], rotation: [4, 714, 0], size: 0.42 },
  },
};

/** Chapter 07 stops for the main phone (your phone → the client's): see CH07. */
function ch07Phone(o: { at: Vec3; rotation: Vec3; size: number; left: Place }): Pose[] {
  const [pitch, yaw] = o.rotation;
  const c = (vh: number, screen: PhoneScreen, extra: Partial<Pose> = {}): Pose => ({ vh, device: 'phone', position: o.at, rotation: [pitch, yaw + 360, 0], size: o.size, screen, owner: 'client', ...extra });
  return [
    ...t2Flip({ start: CH07.flip[0], end: CH07.flip[1], from: o.at, to: o.at, rotation: o.rotation, sizeFrom: o.size, sizeTo: o.size, fromScreen: 'submitted', fromOwner: 'you', toScreen: 'review', toOwner: 'client' }),
    c(CH07.released[0], 'review'),
    c(CH07.released[1], 'releasedClient'),
    c(CH07.split[0], 'releasedClient'),
    { vh: CH07.split[1], ...o.left, screen: 'releasedClient', owner: 'client', ease: 'easeOut', transform: 'T3 Split' },
    { vh: 1900, ...o.left, screen: 'releasedClient', owner: 'client' },
  ];
}

/**
 * Chapter 08 · If someone goes quiet (1900–2200 vh): your phone fades out of the split; the client's phone becomes
 * phone A ("Approved", MilestoneReleased) and T6 Fans into three side by side. Phone B (anyone): the board's review
 * clock counts to 0 with scroll → "Release now · anyone can" sheet, the tap mark presses its slider, then the slider moves with scroll → released.
 * Phone C (anyone): "Not submitted · deadline passed" refund sheet, slider → "Refunded to client". Folds back at the end.
 */
export const CH08 = {
  youOut: [1900, 1908] as [number, number],
  fan: [1910, 1926] as [number, number],
  /** The board's review clock (60 s review, 42 s left at t = 0) counts to 0 over this window. */
  clock: [1932, 1972] as [number, number],
  toSheetB: [1976, 1984] as [number, number],
  /** Tap mark on phone B's slider (TAPS), before the slider moves. */
  tapB: [1984, 1994] as [number, number],
  slideB: [1994, 2014] as [number, number],
  releasedB: [2018, 2026] as [number, number],
  slideC: [2036, 2060] as [number, number],
  refunded: [2064, 2072] as [number, number],
  fold: [2178, 2194] as [number, number],
};
/** Seconds left on phone B's review clock (board: 42 s at t = 0), a pure function of scroll. */
export const ch08ClockLeft = (vh: number) => Math.round(42 * (1 - Math.min(1, Math.max(0, (vh - CH08.clock[0]) / (CH08.clock[1] - CH08.clock[0])))));

/** T6 Fan end poses for chapter 08: three phones side by side right of the copy column, never overlapping. */
const FAN8: Record<'desktop' | 'portrait', { left: Place; centre: Place; right: Place }> = {
  desktop: {
    left: { device: 'phone', position: [-0.0625, -0.02, 0], rotation: [2, 726, 2], size: 0.56 },
    centre: { device: 'phone', position: [0.3125, -0.02, 0], rotation: [2, 720, 0], size: 0.56 },
    right: { device: 'phone', position: [0.6875, -0.02, 0], rotation: [2, 714, -2], size: 0.56 },
  },
  portrait: {
    left: { device: 'phone', position: [-0.62, -0.62, 0], rotation: [4, 724, 2], size: 0.28 },
    centre: { device: 'phone', position: [0, -0.62, 0], rotation: [4, 720, 0], size: 0.28 },
    right: { device: 'phone', position: [0.62, -0.62, 0], rotation: [4, 716, -2], size: 0.28 },
  },
};

/** Chapter 08, phone A (the client's phone from chapter 07): waits for your phone to leave, then leads the fan. */
function ch08PhoneA(o: { from: Place; left: Place }): Pose[] {
  const a = (vh: number, place: Place, extra: Partial<Pose> = {}): Pose => ({ vh, ...place, screen: 'releasedClient', owner: 'client', ...extra });
  return [a(CH08.fan[0], o.from), a(CH08.fan[1], o.left, { ease: 'easeOut', transform: 'T6 Fan' }), a(CH08.fold[1], o.left), a(2200, o.left)];
}

/** Chapter 08, phones B and C: out from behind phone A (T6 Fan), their screens by scroll, folded back at the end. */
function ch08Side(main: Pose[], to: Place, stops: { vh: number; screen: PhoneScreen }[]): Pose[] {
  const first = stops[0].screen;
  const last = stops[stops.length - 1].screen;
  return [
    { vh: CH08.fan[0], ...behind(main, CH08.fan[0]), screen: first, owner: 'anyone', screenSwitch: 'cut' },
    { vh: CH08.fan[1], ...to, screen: first, owner: 'anyone', ease: 'easeOut', transform: 'T6 Fan' },
    ...stops.map(({ vh, screen }): Pose => ({ vh, ...to, screen, owner: 'anyone' })),
    { vh: CH08.fold[0], ...to, screen: last, owner: 'anyone' },
    { vh: CH08.fold[1], ...behind(main, CH08.fold[1]), screen: last, owner: 'anyone', transform: 'T6 Fan' },
  ];
}
const ch08B = (main: Pose[], to: Place) =>
  ch08Side(main, to, [
    { vh: CH08.toSheetB[0], screen: 'logoSubmitted' },
    { vh: CH08.toSheetB[1], screen: 'anyoneRelease' },
    { vh: CH08.releasedB[0], screen: 'anyoneRelease' },
    { vh: CH08.releasedB[1], screen: 'releasedB' },
  ]);
const ch08C = (main: Pose[], to: Place) =>
  ch08Side(main, to, [
    { vh: CH08.refunded[0], screen: 'anyoneRefund' },
    { vh: CH08.refunded[1], screen: 'refunded' },
  ]);

/**
 * Chapter 09 · Two ways to receive (2200–2420 vh, right after chapter 08). The client's phone from chapter 08 fades
 * out first; then your phone fades in on HomeVN (released) and T3 Splits: left "Your phone · Vietnam" (HomeVN), right
 * "Your phone · abroad" (HomeIntl, from behind it). The ₫ / $ tints sit behind them on the landing layer.
 * At the end the right phone fades out in place; the left one leaves at the start of chapter 13.
 */
export const CH09 = {
  phoneOut: [2200, 2208] as [number, number],
  phoneIn: [2210, 2222] as [number, number],
  split: [2228, 2256] as [number, number],
  /** Tints: [in start, in end, out start, out end], each with its phone. */
  tintVN: [2250, 2264, 2420, 2428] as [number, number, number, number],
  tintAbroad: [2250, 2264, 2392, 2400] as [number, number, number, number],
  abroadOut: [2392, 2400] as [number, number],
  end: 2420,
};
/** Chapter 09 T3 Split: the same places as chapter 07's split (clear of the copy column); centre = before the split. */
const SPLIT9: Record<'desktop' | 'portrait', { centre: Place; left: Place; right: Place }> = {
  desktop: { centre: { device: 'phone', position: [0.335, 0.1, 0], rotation: [2, 720, 0], size: 0.6 }, ...SPLIT7.desktop },
  portrait: { centre: { device: 'phone', position: [0, -0.66, 0], rotation: [4, 720, 0], size: 0.42 }, ...SPLIT7.portrait },
};

/** Chapter 09 stops for the main phone: the client's phone (chapter 08's phone A) fades out; your phone (Vietnam) fades in, splits left. */
function ch09Phone(o: { from: Place; centre: Place; left: Place }): Pose[] {
  const vn = { screen: 'homeVNReleased' as const, owner: 'you' as const, place: 'vn' as const };
  return [
    { vh: CH09.phoneOut[1], ...o.from, size: o.from.size * FADE_SCALE.phone, opacity: 0, screen: 'releasedClient', owner: 'client', ease: 'linear' },
    { vh: CH09.phoneIn[0], ...o.centre, size: o.centre.size * FADE_SCALE.phone, opacity: 0, ...vn, screenSwitch: 'cut' },
    { vh: CH09.phoneIn[1], ...o.centre, ...vn, ease: 'easeOut' },
    { vh: CH09.split[0], ...o.centre, ...vn },
    { vh: CH09.split[1], ...o.left, ...vn, ease: 'easeOut', transform: 'T3 Split' },
    { vh: CH09.end, ...o.left, ...vn },
  ];
}
/** Chapter 09, phone B (abroad): out from behind your phone (T3 Split) to the right; fades out in place at the end. */
function ch09B(main: Pose[], right: Place): Pose[] {
  const abroad = { screen: 'homeIntlReleased' as const, owner: 'you' as const, place: 'abroad' as const };
  return [
    { vh: CH09.split[0], ...behind(main, CH09.split[0]), ...abroad, screenSwitch: 'cut' },
    { vh: CH09.split[1], ...right, ...abroad, ease: 'easeOut', transform: 'T3 Split' },
    { vh: CH09.abroadOut[0], ...right, ...abroad },
    { vh: CH09.abroadOut[1], ...right, size: right.size * FADE_SCALE.phone, opacity: 0, ...abroad, ease: 'linear' },
  ];
}

/** Built chapters follow each other with no gap; their starts come from chapters.ts. */
const C12 = chapterById('12').start;
const C13 = chapterById('13').start;
const C14 = chapterById('14').start;

/**
 * Chapter 12 · What N.E.D does and doesn't do. Your phone (Vietnam) from chapter 09 fades out first; then your phone
 * fades in on ContractLocked (Vietnam: the program vault, "Owned by the program, not by N.E.D", Explorer) and turns
 * slowly with scroll (`turn`, yaw −12° → +12°), then rests until chapter 13 takes over.
 */
export const CH12 = {
  phoneOut: [C12, C12 + 8] as [number, number],
  phoneIn: [C12 + 10, C12 + 22] as [number, number],
  turn: [C12 + 22, C12 + 150] as [number, number],
  end: chapterById('12').end,
};
/** Chapter 12 places of your phone: right of the copy column, at the start and the end of the slow turn. */
const P12: Record<'desktop' | 'portrait', { from: Place; to: Place }> = {
  desktop: {
    from: { device: 'phone', position: [0.35, -0.04, 0], rotation: [2, 708, 0], size: 0.7 },
    to: { device: 'phone', position: [0.35, -0.04, 0], rotation: [2, 732, 0], size: 0.7 },
  },
  portrait: {
    from: { device: 'phone', position: [0, -0.7, 0], rotation: [2, 710, 0], size: 0.25 },
    to: { device: 'phone', position: [0, -0.7, 0], rotation: [2, 730, 0], size: 0.25 },
  },
};

/** Chapter 12 stops for the main phone: your phone (Vietnam, chapter 09) fades out, your phone fades in on ContractLocked and turns. */
function ch12Phone(o: { from: Place; to: { from: Place; to: Place } }): Pose[] {
  const locked = { screen: 'lockedVN' as const, owner: 'you' as const };
  return [
    { vh: CH12.phoneOut[1], ...o.from, size: o.from.size * FADE_SCALE.phone, opacity: 0, screen: 'homeVNReleased', owner: 'you', place: 'vn', ease: 'linear' },
    { vh: CH12.phoneIn[0], ...o.to.from, size: o.to.from.size * FADE_SCALE.phone, opacity: 0, ...locked, screenSwitch: 'cut' },
    { vh: CH12.phoneIn[1], ...o.to.from, ...locked, ease: 'easeOut' },
    { vh: CH12.turn[1], ...o.to.to, ...locked, ease: 'linear' },
    { vh: CH12.end, ...o.to.to, ...locked },
  ];
}

/**
 * Chapter 13 · What's real today (right after chapter 12). Your phone on ContractLocked from chapter 12 fades out
 * first; then your phone fades in on Disclosures. Its list scrolls with the page (`scroll`), and each row named by
 * a NOT YET item lights as that item appears in the copy column (`notYet[i]`); the timeline appears last.
 */
export const CH13 = {
  phoneOut: [C13, C13 + 8] as [number, number],
  phoneIn: [C13 + 10, C13 + 22] as [number, number],
  /** One window per NOT YET item (copy.real.notYet.items, same order): the item fades in, its row lights. */
  notYet: [
    [C13 + 28, C13 + 36],
    [C13 + 46, C13 + 54],
    [C13 + 64, C13 + 72],
    [C13 + 82, C13 + 90],
    [C13 + 100, C13 + 108],
  ] as [number, number][],
  /** The Disclosures list scrolls from its top (0) to its end (1) over this window. */
  scroll: [C13 + 32, C13 + 106] as [number, number],
  timeline: [C13 + 118, C13 + 126] as [number, number],
  end: C13 + 180,
};
/** Chapter 13 resting place of your phone: right of the copy column. */
const P13: Record<'desktop' | 'portrait', Place> = {
  desktop: { device: 'phone', position: [0.35, -0.04, 0], rotation: [2, 716, 0], size: 0.7 },
  portrait: { device: 'phone', position: [0, -0.7, 0], rotation: [2, 718, 0], size: 0.25 },
};

/** Chapter 13 stops for the main phone: your phone on ContractLocked (chapter 12) fades out, then fades in on Disclosures. */
function ch13Phone(o: { from: Place; to: Place }): Pose[] {
  return [
    { vh: CH13.phoneOut[1], ...o.from, size: o.from.size * FADE_SCALE.phone, opacity: 0, screen: 'lockedVN', owner: 'you', ease: 'linear' },
    { vh: CH13.phoneIn[0], ...o.to, size: o.to.size * FADE_SCALE.phone, opacity: 0, screen: 'disclosures', owner: 'you', screenSwitch: 'cut' },
    { vh: CH13.phoneIn[1], ...o.to, screen: 'disclosures', owner: 'you', ease: 'easeOut' },
    { vh: CH13.end, ...o.to, screen: 'disclosures', owner: 'you' },
  ];
}

/**
 * Chapter 14 · Close + product links (right after chapter 13). Your phone from chapter 13 fades out
 * first; then your phone (Home) and your computer (WebSignIn) fade in side by side, facing the camera, and rest
 * there to the end of the page. They never overlap: the computer left of the phone, the copy column left of both.
 */
export const CH14 = {
  phoneOut: [C14, C14 + 8] as [number, number],
  phoneIn: [C14 + 10, C14 + 22] as [number, number],
  laptopIn: [C14 + 12, C14 + 26] as [number, number],
  end: C14 + 160,
};
/** Chapter 14 resting place of your phone: right of the computer, facing the camera. */
const P14: Record<'desktop' | 'portrait', Place> = {
  desktop: { device: 'phone', position: [0.76, -0.02, 0], rotation: [2, 720, 0], size: 0.48 },
  portrait: { device: 'phone', position: [0.42, -0.6, 0], rotation: [2, 720, 0], size: 0.3 },
};

/** Chapter 14 stops for the main phone: your phone on Disclosures (chapter 13) fades out, then fades in on Home. */
function ch14Phone(o: { from: Place; to: Place }): Pose[] {
  return [
    { vh: CH14.phoneOut[1], ...o.from, size: o.from.size * FADE_SCALE.phone, opacity: 0, screen: 'disclosures', owner: 'you', ease: 'linear' },
    { vh: CH14.phoneIn[0], ...o.to, size: o.to.size * FADE_SCALE.phone, opacity: 0, screen: 'home', owner: 'you', screenSwitch: 'cut' },
    { vh: CH14.phoneIn[1], ...o.to, screen: 'home', owner: 'you', ease: 'easeOut' },
    { vh: CH14.end, ...o.to, screen: 'home', owner: 'you' },
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

  // Chapter 04 · Accept, and choose once (860–1120 vh). The client's phone leaves (T1 Glide); your phone (Vietnam)
  // rises dimmed on the new contract while the invite-link chip drops into it, then the dim lifts.
  ...ch04Phone([0.3, -0.04, 0], [2, -8, 0], 0.74, [1.35, -0.12, 0], [0.3, -1.8, 0]),

  // Chapter 05 · Lock (1120–1360 vh): see CH05. The phone stays centred in the stage beside the copy (as in 04).
  ...ch05Phone({ at: [0.3, -0.04, 0], rotation: [2, -8, 0], size: 0.74 }),

  // Chapter 06 · Work and submit (1360–1620 vh): see CH06. Same place; hidden while the computer is on stage.
  ...ch06Phone({ at: [0.3, -0.04, 0], rotation: [2, 352, 0], size: 0.74 }),

  // Chapter 07 · Review and release (1620–1900 vh): see CH07.
  ...ch07Phone({ at: [0.3, -0.04, 0], rotation: [2, 352, 0], size: 0.74, left: SPLIT7.desktop.left }),

  // Chapter 08 · If someone goes quiet (1900–2200 vh): see CH08.
  ...ch08PhoneA({ from: SPLIT7.desktop.left, left: FAN8.desktop.left }),

  // Chapter 09 · Two ways to receive (2200–2420 vh): see CH09.
  ...ch09Phone({ from: FAN8.desktop.left, centre: SPLIT9.desktop.centre, left: SPLIT9.desktop.left }),

  // Chapter 12 · What N.E.D does and doesn't do: see CH12.
  ...ch12Phone({ from: SPLIT9.desktop.left, to: P12.desktop }),

  // Chapter 13 · What's real today: see CH13.
  ...ch13Phone({ from: P12.desktop.to, to: P13.desktop }),

  // Chapter 14 · Close + product links: see CH14.
  ...ch14Phone({ from: P13.desktop, to: P14.desktop }),
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

  // Chapter 04 (portrait): your phone rising from the bottom, top ~60% visible.
  ...ch04Phone([0, -0.88, 0], [4, 0, 0], 0.86, [1.6, -0.76, 0], [0, -2, 0]),

  // Chapters 05 and 06 (portrait): phone rising from the bottom; hidden while the browser card is on stage.
  ...ch05Phone({ at: [0, -0.88, 0], rotation: [4, 0, 0], size: 0.86 }),
  ...ch06Phone({ at: [0, -0.88, 0], rotation: [4, 360, 0], size: 0.86 }),
  ...ch07Phone({ at: [0, -0.88, 0], rotation: [4, 360, 0], size: 0.86, left: SPLIT7.portrait.left }),
  ...ch08PhoneA({ from: SPLIT7.portrait.left, left: FAN8.portrait.left }),
  ...ch09Phone({ from: FAN8.portrait.left, centre: SPLIT9.portrait.centre, left: SPLIT9.portrait.left }),
  ...ch12Phone({ from: SPLIT9.portrait.left, to: P12.portrait }),
  ...ch13Phone({ from: P12.portrait.to, to: P13.portrait }),
  ...ch14Phone({ from: P13.portrait, to: P14.portrait }),
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
  // Chapter 07 T3 Split: your phone comes out from behind the client's, on MilestoneReleasedVN.
  { vh: CH07.split[0], ...behind(phoneDesktop, CH07.split[0]), screen: 'releasedVN', owner: 'you' },
  { vh: CH07.split[1], ...SPLIT7.desktop.right, screen: 'releasedVN', owner: 'you', ease: 'easeOut', transform: 'T3 Split' },
  { vh: 1898, ...SPLIT7.desktop.right, screen: 'releasedVN', owner: 'you' },
  // Chapter 08: your phone leaves first (fades, shrinks a little), then comes back as phone B of the fan.
  { vh: CH08.youOut[1], ...SPLIT7.desktop.right, size: SPLIT7.desktop.right.size * FADE_SCALE.phone, opacity: 0, screen: 'releasedVN', owner: 'you', ease: 'linear' },
  ...ch08B(phoneDesktop, FAN8.desktop.centre),
  ...ch09B(phoneDesktop, SPLIT9.desktop.right),
];

const phoneBPortrait: Pose[] = [
  { vh: 255, ...behind(phonePortrait, 255), screen: 'chatClient', owner: 'client' },
  { vh: 290, ...SPLIT.portrait.right, screen: 'chatClient', owner: 'client', transform: 'T3 Split' },
  { vh: 318, ...SPLIT.portrait.right, screen: 'chatClient', owner: 'client' },
  { vh: 332, ...SPLIT.portrait.right, dim: DIM, screen: 'chatClient', owner: 'client' },
  { vh: 346, ...behind(phonePortrait, 346), dim: DIM, screen: 'chatClient', owner: 'client', transform: 'T3 Split' },
  ...t6Fan(phonePortrait, FAN.portrait.left, 'cn1'),
  { vh: CH07.split[0], ...behind(phonePortrait, CH07.split[0]), screen: 'releasedVN', owner: 'you' },
  { vh: CH07.split[1], ...SPLIT7.portrait.right, screen: 'releasedVN', owner: 'you', ease: 'easeOut', transform: 'T3 Split' },
  { vh: 1898, ...SPLIT7.portrait.right, screen: 'releasedVN', owner: 'you' },
  { vh: CH08.youOut[1], ...SPLIT7.portrait.right, size: SPLIT7.portrait.right.size * FADE_SCALE.phone, opacity: 0, screen: 'releasedVN', owner: 'you', ease: 'linear' },
  ...ch08B(phonePortrait, FAN8.portrait.centre),
  ...ch09B(phonePortrait, SPLIT9.portrait.right),
];

/** Third phone: only for the T6 Fan (chapter 03). */
const phoneCDesktop: Pose[] = [...t6Fan(phoneDesktop, FAN.desktop.right, 'cn3'), ...ch08C(phoneDesktop, FAN8.desktop.right)];
const phoneCPortrait: Pose[] = [...t6Fan(phonePortrait, FAN.portrait.right, 'cn3'), ...ch08C(phonePortrait, FAN8.portrait.right)];

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
  { track: 'phone', target: 'accept', start: 946, end: 958 },
  { track: 'laptop', target: 'ws-lock', start: CH05.tap[0], end: CH05.tap[1] },
  { track: 'laptop', target: 'sb-submit', start: CH06.submitTap[0], end: CH06.submitTap[1] },
  { track: 'laptop', target: 'panel-submit', start: CH06.panelTap[0], end: CH06.panelTap[1] },
  { track: 'phoneB', target: 'anyone-release', start: CH08.tapB[0], end: CH08.tapB[1] },
];

/* ------------------------------------------------------------------------------------------------------------ */
/* Laptop (chapter 03 on). A generic body; the screen shows a web board.                                        */
/* ------------------------------------------------------------------------------------------------------------ */

export type LaptopScreen = 'webContractNew' | 'webWorkspace' | 'webSubmit' | 'webSignIn';

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

const L = { position: [0.32, -0.44, 0] as Vec3, rotation: [10, -6, 0] as Vec3, size: 0.66, screen: 'webContractNew' as const, owner: 'client' as const };
/** During the T5 Zoom: almost no tilt and a near-upright lid, so the keyboard base is nearly edge-on. */
const L_ZOOM = { rotation: [2, -2, 0] as Vec3, lid: 97 };

/**
 * Safe-area rule (chapter 03): the laptop screen stays fully inside the frame at every vh, so it fades in and out
 * in place instead of sliding in from off-screen.
 */
/** Chapter 05: the client's computer on WebWorkspace, same place as in chapter 03 (fades in and out in place). */
const L5 = { ...L, screen: 'webWorkspace' as const };

const laptopCh03: LaptopPose[] = [
  { vh: 560, ...L, lid: 0, opacity: 0, page: PAGE_TOP },
  // Fades in, then the lid opens 0° → 105°.
  { vh: 584, ...L, lid: 12, page: PAGE_TOP, ease: 'easeOut' },
  { vh: 606, ...L, lid: 105, page: PAGE_TOP },
  { vh: 632, ...L, lid: 105, page: PAGE_TOP },
  // The page scrolls inside the screen so the "Done when" list sits mid-screen; T5 Zoom on the camera track.
  { vh: 650, ...L, lid: 105, page: PAGE_DONE_WHEN },
  { vh: 664, ...L, ...L_ZOOM, page: PAGE_DONE_WHEN },
  { vh: 704, ...L, ...L_ZOOM, page: PAGE_DONE_WHEN },
  { vh: 716, ...L, lid: 105, page: PAGE_DONE_WHEN_LOW },
  { vh: 748, ...L, lid: 105, page: PAGE_DONE_WHEN_LOW },
  // Back to the top: Create → wallet panel → created.
  { vh: 760, ...L, lid: 105, page: PAGE_TOP },
  { vh: 806, ...L, lid: 105, page: PAGE_TOP },
  // Fades out in place, making room for the fan.
  { vh: 826, ...L, lid: 105, opacity: 0, page: PAGE_TOP },
];

/** Fades in and out in place; shrinks a little while faded (FADE_SCALE). */
const laptopCh05: LaptopPose[] = [
  { vh: CH05.laptopIn[0], ...L5, size: L5.size * FADE_SCALE.laptop, lid: 105, opacity: 0, page: PAGE_TOP },
  { vh: CH05.laptopIn[1], ...L5, lid: 105, page: PAGE_TOP, ease: 'easeOut' },
  { vh: CH05.laptopOut[0], ...L5, lid: 105, page: PAGE_TOP },
  { vh: CH05.laptopOut[1], ...L5, size: L5.size * FADE_SCALE.laptop, lid: 105, opacity: 0, page: PAGE_TOP, ease: 'linear' },
];

/**
 * Chapter 06: T9 Owner turn (SPEC §5.3): the client's computer fades in seen from behind (yaw + 180°), turns 180° on
 * its base and is Your computer on WebSubmit (owner and screen switch while it is edge-on). Then the page scrolls to
 * each part of the form as it is filled.
 */
const L6 = { ...L, screen: 'webSubmit' as const, owner: 'you' as const };
const BEHIND: Vec3 = [L.rotation[0], L.rotation[1] + 180, 0];
const SB_LINKS: PageScroll = { focus: 'sb-links', at: 0.45 };
const SB_FILES: PageScroll = { focus: 'sb-files', at: 0.5 };
const SB_CHECK: PageScroll = { focus: 'sb-check', at: 0.5 };
const SB_SUBMIT: PageScroll = { focus: 'sb-submit', at: 0.72 };
function ch06Laptop(k: Omit<LaptopPose, 'vh' | 'page' | 'screen' | 'owner' | 'lid'>): LaptopPose[] {
  const at = (vh: number, page: PageScroll, extra: Partial<LaptopPose> = {}): LaptopPose => ({ vh, ...k, ...L6, position: k.position, rotation: k.rotation, size: k.size, lid: 105, page, ...extra });
  return [
    at(CH06.laptopIn[0], PAGE_TOP, { rotation: BEHIND, owner: 'client', opacity: 0, size: k.size * FADE_SCALE.laptop }),
    at(CH06.laptopIn[1], PAGE_TOP, { rotation: BEHIND, owner: 'client', ease: 'easeOut' }),
    at(CH06.turn[0], PAGE_TOP, { rotation: BEHIND, owner: 'client' }),
    at(CH06.turn[1], PAGE_TOP, { transform: 'T9 Owner turn' }),
    at(CH06.links[0][0] - 6, PAGE_TOP),
    at(CH06.links[0][0], SB_LINKS),
    at(CH06.links[1][1] + 2, SB_LINKS),
    at(CH06.files[0] - 4, SB_FILES),
    at(CH06.files[1] + CH06.scan + 2, SB_FILES),
    at(CH06.checks[0] - 4, SB_CHECK),
    at(CH06.checks[3] + 4, SB_CHECK),
    at(CH06.submitTap[0] - 4, SB_SUBMIT),
    at(CH06.doneAt, SB_SUBMIT),
    at(CH06.doneAt + 2, PAGE_TOP),
    at(CH06.laptopOut[0], PAGE_TOP),
    at(CH06.laptopOut[1], PAGE_TOP, { opacity: 0, size: k.size * FADE_SCALE.laptop, ease: 'linear' }),
  ];
}
const laptopCh06: LaptopPose[] = ch06Laptop({ position: L.position, rotation: L.rotation, size: L.size });

/**
 * Chapter 14: your computer on WebSignIn fades in left of your phone (after your phone from chapter 13 has gone), facing the
 * camera (body pitch 10° + lid 100° = an upright screen), and rests there.
 */
const L14 = { position: [0.12, -0.42, 0] as Vec3, rotation: [10, 0, 0] as Vec3, size: 0.42, lid: 100, screen: 'webSignIn' as const, owner: 'you' as const, page: PAGE_TOP };
const laptopCh14: LaptopPose[] = [
  { vh: CH14.laptopIn[0], ...L14, size: L14.size * FADE_SCALE.laptop, opacity: 0 },
  { vh: CH14.laptopIn[1], ...L14, ease: 'easeOut' },
  { vh: CH14.end, ...L14 },
];

const laptopDesktop: LaptopPose[] = [...laptopCh03, ...laptopCh05, ...laptopCh06, ...laptopCh14];

/** Portrait (SPEC §8): the laptop becomes a cropped browser card (the board's narrower responsive layout). */
const laptopPortraitCh03: LaptopPose[] = laptopCh03.map((k) => {
  const shown = (k.opacity ?? 1) > 0;
  // While the wallet panel is open the card shrinks, so the whole panel (and its Create button) fits the screen.
  const panel = k.vh === 760 || k.vh === 806;
  return {
    ...k,
    // Card width 86% of the viewport keeps 24 px clear on both sides (safe area).
    position: !shown ? [0, -0.39, 0] : panel ? [0, -0.27, 0] : [0, -0.39, 0],
    rotation: [0, 0, 0],
    size: panel ? 0.72 : 0.86,
    // Zoomed, the list sits near the card's top so the card stays below the copy.
    page: k.page === PAGE_DONE_WHEN ? { focus: 'm1-done', at: 0.2 } : k.page === PAGE_DONE_WHEN_LOW ? { focus: 'm1-done', at: 0.62 } : k.page,
  };
});

/**
 * Chapter 05 (portrait): the browser card. The open panel (745 px) is taller than the card's page (640 px), so the
 * page scrolls inside the card: the panel's top half while it opens, its slider while the thumb moves.
 */
const P5 = { position: [0, -0.39, 0] as Vec3, rotation: [0, 0, 0] as Vec3, size: 0.86, screen: 'webWorkspace' as const, owner: 'client' as const, lid: 105 };
/** The narrow layout stacks the nav above the needs: the page scrolls to "Lock in wallet" for the tap. */
const NEED_LOCK: PageScroll = { focus: 'ws-lock', at: 0.4 };
const PANEL_TOP: PageScroll = { focus: 'wallet-view', at: 0.62 };
const PANEL_SLIDER: PageScroll = { focus: 'wallet-view', at: 0.44 };
const laptopPortraitCh05: LaptopPose[] = [
  { vh: CH05.laptopIn[0], ...P5, size: P5.size * FADE_SCALE.laptop, opacity: 0, page: NEED_LOCK },
  { vh: CH05.laptopIn[1], ...P5, page: NEED_LOCK, ease: 'easeOut' },
  { vh: CH05.tap[1], ...P5, page: NEED_LOCK },
  { vh: CH05.panelOpen[0], ...P5, page: PAGE_TOP },
  { vh: CH05.panelOpen[1], ...P5, page: PANEL_TOP },
  { vh: CH05.slide[0] - 2, ...P5, page: PANEL_TOP },
  { vh: CH05.slide[0] + 6, ...P5, page: PANEL_SLIDER },
  { vh: CH05.panelClose[0], ...P5, page: PANEL_SLIDER },
  { vh: CH05.panelClose[1], ...P5, page: PAGE_TOP },
  { vh: CH05.laptopOut[0], ...P5, page: PAGE_TOP },
  { vh: CH05.laptopOut[1], ...P5, size: P5.size * FADE_SCALE.laptop, opacity: 0, page: PAGE_TOP, ease: 'linear' },
];

/** Chapter 06 (portrait): the browser card turns the same way; it fades out before your phone comes back. */
const laptopPortraitCh06: LaptopPose[] = [
  ...ch06Laptop({ position: P5.position, rotation: P5.rotation, size: P5.size }).map((k) => ({
    ...k,
    rotation: (k.rotation === BEHIND ? [0, 180, 0] : [0, 0, 0]) as Vec3,
    page: k.page && { ...k.page, at: Math.min(k.page.at, 0.5) },
  })),
];

/** Chapter 14 (portrait): the browser card, left of your phone, below the copy column. */
const P14_CARD = { ...L14, position: [-0.39, -0.6, 0] as Vec3, rotation: [0, 0, 0] as Vec3, size: 0.42, lid: 105 };
const laptopPortraitCh14: LaptopPose[] = [
  { vh: CH14.laptopIn[0], ...P14_CARD, size: P14_CARD.size * FADE_SCALE.laptop, opacity: 0 },
  { vh: CH14.laptopIn[1], ...P14_CARD, ease: 'easeOut' },
  { vh: CH14.end, ...P14_CARD },
];

const laptopPortrait: LaptopPose[] = [...laptopPortraitCh03, ...laptopPortraitCh05, ...laptopPortraitCh06, ...laptopPortraitCh14];

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
  /**
   * Fit zoom (chapter 03): zoom = min(fit, the largest factor at which the focus element still fits the safe area),
   * centred on the element's centre, placed at the centre of the safe area. Overrides `zoom` / `at`.
   */
  fit?: number;
  /** id of the chapter headline: its copy column bounds the safe area (left on desktop, top on portrait). */
  copyId?: string;
  focus?: string;
  at?: { desktop: [number, number]; portrait: [number, number] };
  ease?: EaseName;
  transform?: TransformName;
};

/** Same, with the focus lower on portrait (chapter 04's copy column is taller). */
const BESIDE_COPY_LOW = { desktop: [0.45, 0] as [number, number], portrait: [0, -0.5] as [number, number] };

/** T5 Zoom (SPEC §5.3, 40–70 vh): push 1.6× onto the "Done when" list while the first items are typed, then pull out. */
export const cameraTrack: CameraPose[] = [
  { vh: 0, zoom: 1 },
  { vh: 650, zoom: 1 },
  { vh: 664, zoom: 1, fit: 1.6, focus: 'laptop-screen', copyId: 'ch03-title', transform: 'T5 Zoom' },
  { vh: 704, zoom: 1, fit: 1.6, focus: 'laptop-screen', copyId: 'ch03-title' },
  { vh: 716, zoom: 1, transform: 'T5 Zoom' },
  // Chapter 04: push onto the destination cards in ContractAccept, then pull out before the slider.
  { vh: 976, zoom: 1 },
  { vh: 990, zoom: 1.6, zoomPortrait: 1.25, focus: 'dest-cards', at: BESIDE_COPY_LOW, transform: 'T5 Zoom' },
  { vh: 1030, zoom: 1.6, zoomPortrait: 1.25, focus: 'dest-cards', at: BESIDE_COPY_LOW },
  { vh: 1044, zoom: 1, transform: 'T5 Zoom' },
  // Chapter 05: push onto the wallet panel (as far as it fits beside the copy) for the slide and the stamp. Max 1.75×,
  // not 1.6×: at 1.6× the panel's rule lines (board 14 px × 86%) measure 10.4 px on 1440 × 900, under SPEC §8's 11 px.
  { vh: CH05.zoom[0], zoom: 1 },
  { vh: CH05.zoom[1], zoom: 1, fit: 1.75, focus: 'wallet-view', copyId: 'ch05-title', transform: 'T5 Zoom' },
  { vh: CH05.zoom[2], zoom: 1, fit: 1.75, focus: 'wallet-view', copyId: 'ch05-title' },
  { vh: CH05.zoom[3], zoom: 1, transform: 'T5 Zoom' },
  // Chapter 06: push onto the form as it is filled (links → files → checks), then onto the submitted result.
  { vh: CH06.links[0][0] - 6, zoom: 1 },
  { vh: CH06.links[0][0] + 2, zoom: 1, fit: 1.75, focus: 'sb-links', copyId: 'ch06-title', transform: 'T5 Zoom' },
  { vh: CH06.links[1][1] + 2, zoom: 1, fit: 1.75, focus: 'sb-links', copyId: 'ch06-title' },
  { vh: CH06.files[0] - 2, zoom: 1, fit: 1.75, focus: 'sb-files', copyId: 'ch06-title' },
  { vh: CH06.files[1] + CH06.scan + 2, zoom: 1, fit: 1.75, focus: 'sb-files', copyId: 'ch06-title' },
  { vh: CH06.checks[0] - 2, zoom: 1, fit: 1.75, focus: 'sb-check', copyId: 'ch06-title' },
  { vh: CH06.checks[3] + 4, zoom: 1, fit: 1.75, focus: 'sb-check', copyId: 'ch06-title' },
  { vh: CH06.submitTap[0] - 6, zoom: 1, transform: 'T5 Zoom' },
  { vh: CH06.doneAt + 2, zoom: 1 },
  { vh: CH06.doneAt + 12, zoom: 1, fit: 1.75, focus: 'sb-done', copyId: 'ch06-title', transform: 'T5 Zoom' },
  { vh: CH06.laptopOut[0] - 2, zoom: 1, fit: 1.75, focus: 'sb-done', copyId: 'ch06-title' },
  { vh: CH06.laptopOut[1], zoom: 1, transform: 'T5 Zoom' },
  // Chapter 07: push onto "Slide to release" (as far as it fits beside the copy, max 1.6×) while the thumb moves.
  { vh: CH07.zoom[0], zoom: 1 },
  { vh: CH07.zoom[1], zoom: 1, fit: 1.6, focus: 'release-slider', copyId: 'ch07-title', transform: 'T5 Zoom' },
  { vh: CH07.zoom[2], zoom: 1, fit: 1.6, focus: 'release-slider', copyId: 'ch07-title' },
  { vh: CH07.zoom[3], zoom: 1, transform: 'T5 Zoom' },
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
  // Chapter 04: waits for your phone, then drops into it (onto the contract title) and is gone.
  { vh: 894, at: [0.3, 0.7, 0.8], scale: 1.25, opacity: 1 },
  { vh: 908, at: { focus: 'cd-title' }, scale: 0.7, opacity: 1, ease: 'ease' },
  { vh: 914, at: { focus: 'cd-title' }, scale: 0.6, opacity: 0 },
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
  const strip = ({ vh: _vh, ease: _ease, transform: _t, screenSwitch: _s, via: _v, opacity = 1, dim = 0, dock = 0, ...rest }: Pose): Sampled => ({
    ...rest,
    opacity,
    dim,
    dock,
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
    dock: lerp(a.dock ?? 0, b.dock ?? 0, t),
    // Discrete fields switch at the midpoint of the segment.
    screen: t < 0.5 ? a.screen : b.screen,
    owner: t < 0.5 ? a.owner : b.owner,
    place: t < 0.5 ? a.place : b.place,
    screenFrom: a.screen,
    screenTo: b.screen,
    screenMix: a.screen === b.screen ? 1 : b.screenSwitch === 'cut' ? (t < 0.5 ? 0 : 1) : t,
  };
}
