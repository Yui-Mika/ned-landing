import { Vector3 } from 'three';

// World layout in metres (motion map v4.1, Airmail). One continuous set: the hero and close sit at the origin,
// the milestone track around x 0, the fork and border further right, the record/plan set at x = 20.

export const v3 = (x: number, y: number, z: number) => new Vector3(x, y, z);

/** Hero: the sealed envelope, and Teddy beside it (2D art now; the team's model later). */
export const ENV_HERO = v3(1.7, 0.95, 0);
export const TEDDY_HEIGHT = 1.7;
export const TEDDY_HERO = v3(3.15, 0, 0.7);

/** Mailboxes: client abroad (left), you in Vietnam (right). */
export const MB = {
  clientMark: v3(-2.2, 0, 0),
  youMark: v3(2.2, 0, 0),
  clientTrack: v3(-1.6, 0, -1.4),
  youTrack: v3(3.35, 0, 0.6),
  clientClose: v3(0.3, 0, 0.55),
  youClose: v3(3.15, 0, 0.5),
} as const;
/** Height above a mailbox where an envelope or the brief rests. */
export const MB_TOP = 1.5;

/** The contract: one slot (03, 09), three slots on the track (04). */
export const RACK_IDEA = v3(0, 1.0, 0);
export const RACK_TRACK = v3(0.8, 0.85, -0.3);
export const RACK_CLOSE = v3(1.7, 0.95, 0);
export const BRIEF_IDEA = v3(-1.15, 1.15, 0.55);

/** 05 · two routes. */
export const FORK = v3(8.0, 0.9, 0.7);
export const WALLET = v3(11.5, 0, -2.6);
export const PARTNER = v3(10.6, 0, 2.4);
export const BORDER_X = 12.15;
export const BANK = v3(13.05, 0, 3.0);

/** Record and plan set (chapters 07–08). */
export const SET_X = 20;
