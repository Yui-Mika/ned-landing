import * as THREE from 'three';

/**
 * Focus registry: lets the camera (T5 Zoom) and travelling chips (T8 Lift-off) find a `data-focus` element that
 * lives inside a device screen, in world coordinates. Each device registers a resolver for its own screen.
 */
export type FocusResolver = (el: HTMLElement, out: THREE.Vector3) => boolean;

const resolvers = new Set<FocusResolver>();

export function registerFocusResolver(r: FocusResolver) {
  resolvers.add(r);
  return () => {
    resolvers.delete(r);
  };
}

/** World position of the centre of `[data-focus="name"]`, or false if it isn't on any device right now. */
export function focusWorld(name: string, out: THREE.Vector3): boolean {
  const el = document.querySelector<HTMLElement>(`[data-focus="${name}"]`);
  if (!el) return false;
  for (const r of resolvers) if (r(el, out)) return true;
  return false;
}

/** Offset of `el` inside `root` in untransformed CSS px (layout offsets ignore 3D and CSS transforms). */
export function offsetIn(el: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/** How far the container holding `el` is panned inside its screen (CSS px); see Laptop.tsx (portrait). */
export type Shift = (el: HTMLElement) => { x: number; y: number };

/**
 * Maps an element inside a screen (CSS px, `w` × `h`, drawn on a plane at `anchor`, `pxPerUnit` CSS px per world
 * unit) to world space. `scrollY` = how far the screen's page is scrolled (subtracted for elements inside it), or a
 * Shift for screens whose page and overlays pan in two directions (portrait browser card).
 */
export function screenPointToWorld(
  el: HTMLElement,
  root: HTMLElement,
  anchor: THREE.Object3D,
  size: { w: number; h: number },
  pxPerUnit: number,
  out: THREE.Vector3,
  scrollY: number | Shift = 0,
) {
  const { x, y } = offsetIn(el, root);
  const s = typeof scrollY === 'function' ? scrollY(el) : { x: 0, y: el.closest('[data-page]') ? scrollY : 0 };
  const cx = x + el.offsetWidth / 2 - s.x;
  const cy = y + el.offsetHeight / 2 - s.y;
  out.set((cx - size.w / 2) / pxPerUnit, -(cy - size.h / 2) / pxPerUnit, 0);
  anchor.localToWorld(out);
  return out;
}
