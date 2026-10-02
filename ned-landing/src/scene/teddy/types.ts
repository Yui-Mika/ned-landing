import type { Object3D } from 'three';

/** Clip names exactly as the Teddy model must provide them (board "Teddy 3D · what the model needs"). */
export const CLIPS = [
  'idle',
  'walk',
  'wave',
  'give',
  'catch',
  'hold',
  'lock',
  'reach',
  'think',
  'headShake',
  'approve',
  'nod',
  'proud',
  'bye',
  'happy',
  'curious',
  'surprised',
  'sleepy',
] as const;

export type ClipName = (typeof CLIPS)[number];
export type Role = 'client' | 'freelancer';

/** What the director asks of a Teddy this frame. */
export type ClipRequest = {
  clip: ClipName;
  /** Seconds since the clip started (time-driven clips). */
  time: number;
  /** 0–1 when the clip is scrubbed by scroll. */
  scrub?: number;
};

/**
 * The seam between the story and the model. BlockTeddy (placeholder) and GltfTeddy (the team's model)
 * both implement it, so the director never knows which one it drives.
 */
export interface TeddyRig {
  readonly role: Role;
  readonly root: Object3D;
  /** Point above the head, for labels and bubbles. */
  readonly headAnchor: Object3D;
  /** Point between the hands, where coins and the file sit. */
  readonly handSocket: Object3D;
  /** Apply a clip; crossfades internally (CLIP_FADE). */
  play(req: ClipRequest, dt: number, still: boolean): void;
  /** Head turn on top of any clip, radians. */
  look(yaw: number, pitch: number): void;
  setOpacity(o: number): void;
  dispose(): void;
}
