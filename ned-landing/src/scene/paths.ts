import { curve } from './ribbon';
import { BANK, BORDER_X, FORK, GATE_X, LANE_Z, PARTNER, SET_X, WALLET } from './world';

// Every ribbon's centre line, shared by the ribbons and by the coins that travel along them,
// so the money always rides its own line.

const Z = LANE_Z;
const G = GATE_X;
const y = 0.06;

export const PATH = {
  // 02 · the promise: from the client, stopping halfway (02.8)
  promise: curve([[-1.7, 0.5, 0.25], [-1.2, 0.3, 0.5], [-0.6, 0.22, 0.62], [0, 0.25, 0.6]]),
  promiseRest: curve([[0, 0.25, 0.6], [0.6, 0.28, 0.55], [1.2, 0.36, 0.4], [1.7, 0.5, 0.25]]),
  // 02 · the work's flight, freelancer → client (02.6)
  workFlight: curve([[2.2, 1.3, 0.25], [1.1, 2.05, 0.4], [-1.1, 2.05, 0.4], [-2.2, 1.3, 0.25]]),
  // 02.16 · the seam between them
  seamL: curve([[0, 0.05, 0.2], [-0.14, 0.7, 0.2], [-0.14, 1.5, 0.2], [0, 2.15, 0.2]]),
  seamR: curve([[0, 0.05, 0.2], [0.14, 0.7, 0.2], [0.14, 1.5, 0.2], [0, 2.15, 0.2]]),
  // 03 · client into the loop, and the dotted way on to the freelancer
  clientToLoop: curve([[-1.7, 0.52, 0.18], [-1.2, 0.62, 0.2], [-0.86, 0.84, 0.1], [-0.63, 1.0, 0.02]]),
  loopToFree: curve([[0.63, 1.0, 0.02], [1.0, 0.8, 0.1], [1.4, 0.6, 0.16], [1.7, 0.52, 0.18]]),
  // 04 · two lanes, one gate each
  lane1: curve([[-1.6, y, 0], [-1.0, y, 0.36], [-0.3, y, 0.68], [0.6, y, Z], [G, y, Z]]),
  lane1b: curve([[G, y, Z], [2.0, y, Z], [2.45, 0.08, 0.55], [2.7, 0.3, 0.3]]),
  lane2: curve([[-1.6, y, 0], [-1.0, y, -0.36], [-0.3, y, -0.68], [0.6, y, -Z], [G, y, -Z]]),
  curl2: curve([[G, y, -Z], [0.9, y, -1.3], [-0.2, y, -1.75], [-1.3, y, -1.95], [-1.75, 0.1, -1.86], [-1.9, 0.3, -1.8]]),
  // 04 · where the coins go
  release: curve([[0.3, y, Z], [G, y, Z], [2.0, y, Z], [2.4, y, 0.72]]),
  giveBack: curve([[0.3, y, -Z], [G, y, -Z], [0.9, y, -1.3], [-0.2, y, -1.75], [-1.2, y, -1.6], [-1.6, y, -1.25]]),
  trunk: curve([[2.4, y, 0.72], [3.3, y, 1.1], [5.0, y, 0.85], [FORK.x, y, Z]]),
  // 05 · the fork
  branchA: curve([[FORK.x, y, Z], [9.0, y, 0.6], [9.8, y, -0.6], [10.6, y, -2.1], [WALLET.x - 0.5, y, WALLET.z + 0.1]]),
  branchB1: curve([[FORK.x, y, Z], [9.0, y, 0.8], [9.7, y, 1.8], [PARTNER.x - 0.33, y, PARTNER.z - 0.05]]),
  branchB2a: curve([[PARTNER.x + 0.33, y, PARTNER.z + 0.03], [11.4, y, 2.55], [11.75, y, 2.6]]),
  branchB2b: curve([[11.75, y, 2.6], [12.6, y, 2.75], [13.3, y, 2.9], [BANK.x - 0.46, y, BANK.z - 0.05]]),
  border: curve([[BORDER_X + 0.05, 0.03, 1.2], [BORDER_X - 0.05, 0.03, 2.0], [BORDER_X - 0.09, 0.03, 2.8], [BORDER_X - 0.05, 0.03, 3.6], [BORDER_X + 0.05, 0.03, 4.4]]),
  // 06.14 → 08 · the record, the facts, the plan
  record: curve([[SET_X - 4.2, 1.0, 0], [SET_X - 2, 1.08, 0.1], [SET_X, 0.96, 0], [SET_X + 2, 1.04, 0.1], [SET_X + 4.2, 1.0, 0]]),
  // flanking the two lists, outside the cards
  does: curve([[SET_X - 4.4, 0.35, -1.2], [SET_X - 4.48, 0.9, -1.2], [SET_X - 4.48, 1.45, -1.2], [SET_X - 4.4, 2.0, -1.2]]),
  doesnt: curve([[SET_X + 4.4, 0.35, -1.2], [SET_X + 4.48, 0.9, -1.2], [SET_X + 4.48, 1.45, -1.2], [SET_X + 4.4, 2.0, -1.2]]),
  plan: curve([[SET_X - 4.6, 0.06, 0.4], [SET_X - 2.3, 0.06, 0.05], [SET_X, 0.06, 0.5], [SET_X + 2.3, 0.06, 0.1], [SET_X + 4.6, 0.06, 0.45]]),
  // 09 · client into the rebuilt loop
  closeIn: curve([[0.68, 0.5, 0.42], [0.9, 0.62, 0.3], [1.0, 0.82, 0.12], [1.08, 0.95, 0.02]]),
  closeOn: curve([[2.32, 0.95, 0.02], [2.45, 0.8, 0.15], [2.55, 0.62, 0.32], [2.62, 0.52, 0.42]]),
};

/** Plan nodes on PATH.plan (t), NOW first. */
export const PLAN_T = [0.12, 0.38, 0.63, 0.88];
export const RECORD_T = [0.1, 0.3, 0.5, 0.7, 0.9];
