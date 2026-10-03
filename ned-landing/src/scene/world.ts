import { Vector3 } from 'three';

// World layout in metres. One continuous set: the hero and close sit at the origin,
// the track runs along x, the fork and border sit further right, the record/plan set at x = 20.

export const v3 = (x: number, y: number, z: number) => new Vector3(x, y, z);

/** The Fund is a loop of ribbon now (board "Ribbon · 02–03"). */
export const LOOP_R = 0.62;
export const FUND_HERO = v3(1.7, 0.95, 0);
export const FUND_IDEA = v3(0, 1.0, 0);

/** Teddy appears in the hero only (2D art now; the team's model later, scaled to this height). */
export const TEDDY_HEIGHT = 1.7;
export const TEDDY_HERO = v3(3.15, 0, 0.7);

/** The two pebbles: client abroad, freelancer in Vietnam. Centres sit at PEBBLE_Y. */
export const PEBBLE_Y = 0.45;
export const ACTORS = {
  tcMark: v3(-2.2, 0, 0),
  tfMark: v3(2.2, 0, 0),
  tcTrack: v3(-2.4, 0, -1.8),
  tfTrack: v3(3.2, 0, 0.25),
  tcClose: v3(0.2, 0, 0.35),
  tfClose: v3(3.15, 0, 0.45),
} as const;

export const LANE_Z = 0.7;
export const GATE_X = 1.4;

export const FORK = v3(8.0, 0, LANE_Z);
export const WALLET = v3(11.5, 0, -2.6);
export const PARTNER = v3(10.6, 0, 2.4);
export const BORDER_X = 12.15;
export const BANK = v3(14.0, 0, 3.0);

/** Record and plan set (chapters 06–08). */
export const SET_X = 20;
