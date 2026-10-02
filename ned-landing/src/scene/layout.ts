import { Vector3 } from 'three';

// World layout shared by every scene object. Units are metres-ish; the hero Fund sits at
// the origin's right, the "today" scene of chapter 02 sits below it at y = -8.

export const CENTRE = new Vector3(0, -8, 0);
export const HAND = new Vector3(0.78, -6.85, 0.78);
export const MEMBER_RADIUS = 3.4;
// Six members around the centre figure; angles avoid putting one between camera and centre.
const ANGLES = [200, 255, 310, 5, 60, 130].map((d) => (d * Math.PI) / 180);

export const MEMBERS = ANGLES.map(
  (a) => new Vector3(CENTRE.x + Math.cos(a) * MEMBER_RADIUS, CENTRE.y, CENTRE.z + Math.sin(a) * MEMBER_RADIUS),
);

/** Each member's hand, held toward the centre. */
export const MEMBER_HANDS = MEMBERS.map((m) => {
  const toCentre = new Vector3().subVectors(CENTRE, m).setY(0).normalize();
  return new Vector3(m.x + toCentre.x * 0.62, HAND.y, m.z + toCentre.z * 0.62);
});

export function fundPosition(portrait: boolean) {
  return portrait ? new Vector3(0, 1.7, 0) : new Vector3(2.3, 0, 0);
}
