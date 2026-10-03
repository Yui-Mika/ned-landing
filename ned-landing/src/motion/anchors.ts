import { motionValue, type MotionValue } from 'motion/react';

// Screen positions of points in the 3D scene, written by the stage every frame and read by
// page-layer elements that sit on top of them (role labels, bubbles, the wallet card…).

export type AnchorName =
  | 'tc'
  | 'tf'
  | 'teddy'
  | 'teddy-top'
  | 'gate1'
  | 'wallet'
  | 'partner'
  | 'abroad'
  | 'vietnam';

export type Anchor = { x: MotionValue<number>; y: MotionValue<number>; visible: MotionValue<number> };

const registry = new Map<AnchorName, Anchor>();

export function anchor(name: AnchorName): Anchor {
  let a = registry.get(name);
  if (!a) {
    a = { x: motionValue(-9999), y: motionValue(-9999), visible: motionValue(0) };
    registry.set(name, a);
  }
  return a;
}

/** Small shared signals between the page layer and the scene. */
export const signals = {
  /** 1 while the pointer is over a call to action. */
  ctaHover: motionValue(0),
  /** True once the preloader has finished. */
  ready: motionValue(0),
  /** 1 once the team's Teddy model is in the scene (the 2D art then hides). */
  teddyModel: motionValue(0),
};
