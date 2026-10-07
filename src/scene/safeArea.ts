/**
 * Safe area (CSS px) a device screen must stay inside: 16 px below the top bar, 24 px from the bottom and right
 * edges, and clear of the chapter's copy column (24 px to its right on desktop; 16 px below it on portrait).
 * `copyId` = the chapter headline's id; its parent is the copy column.
 */
export function safeArea(copyId: string | undefined, portrait: boolean) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const bar = document.querySelector('[data-top-bar]')?.getBoundingClientRect().bottom ?? 56;
  const area = { l: 24, t: bar + 16, r: vw - 24, b: vh - 24, vw, vh };
  const copyEl = copyId ? document.getElementById(copyId)?.parentElement : null;
  if (copyEl) {
    const c = copyEl.getBoundingClientRect();
    if (portrait) area.t = Math.max(area.t, c.bottom + 16);
    else area.l = c.right + 24;
  }
  return area;
}

/** The same area pulled in by `m` px on every side (headroom for damping and rounding). */
export function inset(area: ReturnType<typeof safeArea>, m: number) {
  return { ...area, l: area.l + m, t: area.t + m, r: area.r - m, b: area.b - m };
}
