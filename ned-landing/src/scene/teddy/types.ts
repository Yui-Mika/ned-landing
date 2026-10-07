import type { Object3D } from 'three';

/** Teddy appears in the hero only (3 Oct): the model needs two clips, named exactly. */
export const CLIPS = ['idle', 'wave'] as const;

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
 * The seam between the story and the team's model (GltfTeddy). Until the model arrives the hero shows
 * the 2D art in the page layer instead.
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
