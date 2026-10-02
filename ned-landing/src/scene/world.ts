import { Vector3 } from 'three';

// World layout in metres. One continuous set: the hero and close sit at the origin,
// the track runs along x, the fork and border sit further right, the role/timeline set at x = 20.

export const v3 = (x: number, y: number, z: number) => new Vector3(x, y, z);

export const FUND_HERO = v3(1.7, 0.95, 0);
export const FUND_IDEA = v3(0, 1.0, 0);
export const FUND_SIZE = { w: 1.5, h: 1.6, d: 1.2 } as const;

/** Teddy height in scene units. A model from the team is scaled to this. */
export const TEDDY_HEIGHT = 1.7;

export const TEDDY = {
  tfHero: v3(3.05, 0, 0.9),
  tfMark: v3(2.2, 0, 0),
  tcMark: v3(-2.2, 0, 0),
  tfTrack: v3(3.5, 0, 0),
  tcTrack: v3(-3.5, 0, 0),
  tfApp: v3(14.25, 0, 3.0),
  tfClose: v3(3.1, 0, 0.45),
  tcClose: v3(0.2, 0, 0.35),
} as const;

export const LANE_Z = 0.7;
export const GATE_X = 1.4;
export const TRACK_END = 3.0;

export const FORK = v3(8.0, 0, LANE_Z);
export const WALLET = v3(11.5, 0, -2.6);
export const PARTNER = v3(10.6, 0, 2.4);
export const BORDER_X = 12.2;
export const BANK = v3(14.0, 0, 3.0);

/** Role and timeline set (chapters 07–08). */
export const SET_X = 20;
