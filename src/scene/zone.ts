/**
 * Portrait layout zones (mobile layout pass). Top to bottom: the top bar, the copy zone (each chapter's copy
 * column, pinned at the top, content-fit) and the stage zone (the rest). Devices, their tags and hints live only
 * in the stage zone. Desktop never calls this.
 *
 * The stage zone's top follows the copy as a pure function of scroll: it sits under a chapter's copy column while
 * any of its lines is more than 15% visible, and moves up to the top bar only once the copy has faded below that
 * (chapter 00: the phone moves up and grows after the copy has gone). Heights are layout sizes (no transforms) of
 * the registered columns, re-measured on resize; viewport sizes use stable units (svh, safe-area insets).
 */
import { chapters, type Chapter } from '@/content/chapters';
import { lineWindow } from '@/components/text/ChapterCopy';

/** Gap between the copy and the stage (≥ the copy's 12 px of travel), and the stage's own side / bottom margin. */
export const ZONE_GAP = 16;
export const ZONE_MARGIN = 12;
/** A copy line counts as present above this opacity (the device rule R2 uses the same threshold). */
const PRESENT = 0.15;

type Column = { el: HTMLElement; lines: number; stagger: boolean };
const columns = new Map<string, Column>();
const bottoms = new Map<string, number>();

/** ChapterCopy registers its column on portrait (layout height and scrub lines). */
export function registerCopyColumn(id: string, el: HTMLElement, lines: number, stagger: boolean) {
  columns.set(id, { el, lines, stagger });
  measured = false;
  return () => {
    if (columns.get(id)?.el === el) columns.delete(id);
    measured = false;
  };
}

type Units = { svh: number; vw: number; top: number; right: number; bottom: number; left: number; bar: number };
let units: Units | null = null;
let probe: HTMLDivElement | null = null;
let measured = false;

/** Stable viewport units: 100svh and the safe-area insets, read from a probe element; the top bar's bottom. */
function readUnits(): Units {
  if (!probe) {
    probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText =
      'position:fixed;left:0;top:0;width:0;height:100svh;visibility:hidden;pointer-events:none;' +
      'padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
    document.body.appendChild(probe);
  }
  const cs = getComputedStyle(probe);
  const bar = document.querySelector('[data-top-bar]');
  return {
    svh: parseFloat(cs.height) || window.innerHeight,
    vw: document.documentElement.clientWidth,
    top: parseFloat(cs.paddingTop) || 0,
    right: parseFloat(cs.paddingRight) || 0,
    bottom: parseFloat(cs.paddingBottom) || 0,
    left: parseFloat(cs.paddingLeft) || 0,
    bar: bar ? (bar as HTMLElement).offsetTop + (bar as HTMLElement).offsetHeight : 56,
  };
}

function measure() {
  units = readUnits();
  bottoms.clear();
  // While pinned, a column sits at its offsetTop inside the sticky (viewport-high) container.
  columns.forEach((c, id) => bottoms.set(id, c.el.offsetTop + c.el.offsetHeight));
  measured = true;
}

if (typeof window !== 'undefined') {
  const invalidate = () => (measured = false);
  window.addEventListener('resize', invalidate);
  document.fonts?.ready.then(invalidate);
}

/** Most visible copy line of a chapter at `vh` (0 … 1): its first line on the way in, its last on the way out. */
export function copyPresence(c: Chapter, vh: number): number {
  const col = columns.get(c.id);
  const n = Math.max(1, col?.lines ?? 1);
  const stagger = col?.stagger ?? true;
  const ramp = (w: [number, number], up: boolean) => {
    const t = Math.min(1, Math.max(0, (vh - w[0]) / Math.max(1e-6, w[1] - w[0])));
    return up ? t : 1 - t;
  };
  const enter = c.copyIn ? ramp(lineWindow(c.copyIn, 0, n, stagger), true) : 1;
  const exit = ramp(lineWindow(c.copyOut, n - 1, n, stagger), false);
  return Math.min(enter, exit);
}

export type Zone = { l: number; t: number; r: number; b: number; rows: { top: number; chip: number; caption: number } };

/** Rows at the top of the stage zone, for landing-layer items that must not sit on a device (CSS px). */
export const CHIP_ROW = 48;
export const CAPTION_ROW = 32;
/** Chapter 03 on portrait: the invite chip (after its lift-off) and the carousel caption. Eased 6 vh in and out. */
const CHIP_WINDOW: [number, number, number, number] = [806, 814, 888, 896];
const CAPTION_WINDOW: [number, number, number, number] = [826, 832, 860, 866];
const ramp = (vh: number, [a, b, c, d]: [number, number, number, number]) =>
  Math.max(0, Math.min(1, (vh - a) / (b - a), (d - vh) / (d - c)));

/** The stage zone at `vh`, in CSS px from the viewport's top-left. */
export function stageZone(vh: number): Zone {
  // Server render (a motion value's first computation): no layout yet.
  if (typeof document === 'undefined') return { l: 0, t: 0, r: 0, b: 0, rows: { top: 0, chip: 0, caption: 0 } };
  if (!measured || !units) measure();
  const u = units!;
  const floor = u.bar + ZONE_GAP;
  let top = floor;
  for (const c of chapters) {
    const p = copyPresence(c, vh);
    const bottom = bottoms.get(c.id);
    if (p <= 0 || bottom === undefined) continue;
    top = Math.max(top, floor + (bottom + ZONE_GAP - floor) * Math.min(1, p / PRESENT));
  }
  const chip = CHIP_ROW * ramp(vh, CHIP_WINDOW);
  const caption = CAPTION_ROW * ramp(vh, CAPTION_WINDOW);
  return {
    l: u.left + ZONE_MARGIN,
    r: u.vw - u.right - ZONE_MARGIN,
    t: top + chip + caption,
    b: u.svh - u.bottom - ZONE_MARGIN,
    rows: { top, chip, caption },
  };
}

/** Smallest viewport height (100svh) in CSS px: the stage zone's reference height. */
export const stableViewportHeight = () => {
  if (!measured || !units) measure();
  return units!.svh;
};
