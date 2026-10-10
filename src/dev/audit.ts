/**
 * Dev-only layout audit (never in production: page.tsx imports it behind `process.env.NODE_ENV !== 'production'`).
 *
 *   window.__nedAudit.run({ mode, name?, from?, to?, step? })   → starts; poll window.__nedAudit.status
 *     mode 'record'  : saves every step (device boxes, opacities, copy strings) to docs/audit/<name>.json
 *     mode 'compare' : loads docs/audit/<name>.json and lists differences (boxes > 1 px, opacity > 0.01, copy text)
 *     mode 'check'   : portrait rules R1–R6, violations only
 *
 * Steps `scrollVh` in 10 vh increments over every built chapter and waits for the stage to settle at each step.
 * Results go through scripts/audit-sink.mjs (node, port 3999), which reads and writes docs/audit/.
 * If the preview pane is hidden, load the page with `?__raf` (layout.tsx) so frames keep running.
 */
import { chapters, chapterAt } from '@/content/chapters';
import { CH04_SLIDE, CH05, CH07, CH08, CH10, TAPS, cameraTrack } from '@/scene/poses';
import { getK, getLenis, scrollVh, syncScrollVh } from '@/motion/scroll';
import { isPortrait } from '@/motion/flags';

const SINK = 'http://localhost:3999';

type Box = { l: number; t: number; r: number; b: number };
type CopyRec = { ch: string; i: number; text: string; box: Box; op: number; blur: string; style: string };
type DevRec = { id: string; box: Box; op: number };
type Step = { vh: number; ch: string; dev: DevRec[]; copy: CopyRec[]; sw: number; iw: number };
type Row = [string, string, number, string, string];

const r1 = (n: number) => Math.round(n * 10) / 10;
const boxOf = (el: Element): Box => {
  const r = el.getBoundingClientRect();
  return { l: r1(r.left), t: r1(r.top), r: r1(r.right), b: r1(r.bottom) };
};
/** The part of `el` that can show: its box cut by every ancestor that clips (overflow other than visible). */
function visibleBox(el: Element): Box {
  const b = boxOf(el);
  for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
    const cs = getComputedStyle(e);
    if (cs.overflow === 'visible' && cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
    const c = boxOf(e);
    b.l = Math.max(b.l, c.l);
    b.t = Math.max(b.t, c.t);
    b.r = Math.min(b.r, c.r);
    b.b = Math.min(b.b, c.b);
  }
  return b;
}
const hit = (a: Box, b: Box) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
const onScreen = (b: Box) => b.r > 0 && b.l < innerWidth && b.b > 0 && b.t < innerHeight;

/** Opacity as painted: the product of every ancestor's computed opacity; 0 if hidden. */
function paintedOpacity(el: Element): number {
  let o = 1;
  for (let e: Element | null = el; e && e !== document.documentElement; e = e.parentElement) {
    const cs = getComputedStyle(e);
    if (cs.display === 'none') return 0;
    o *= parseFloat(cs.opacity);
  }
  if (getComputedStyle(el).visibility === 'hidden') return 0;
  return Math.round(o * 1000) / 1000;
}

/** Elements that carry text directly (SplitText animates each word, not the heading). */
const hasText = (e: Element) => [...e.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? '').trim());
/** Opacity of the text as painted: the most visible text-bearing element inside `el`. */
function textOpacity(el: Element): number {
  let o = -1;
  for (const e of [el, ...Array.from(el.querySelectorAll('*'))]) if (hasText(e)) o = Math.max(o, paintedOpacity(e));
  return o < 0 ? paintedOpacity(el) : o;
}

/** Any blur on the element or its ancestors (computed `filter`). */
function blurOf(el: Element): string {
  for (let e: Element | null = el; e && e !== document.body; e = e.parentElement) {
    const f = getComputedStyle(e).filter;
    const m = /blur\(([\d.]+)px\)/.exec(f);
    if (m && parseFloat(m[1]) > 0.01) return f;
  }
  return '';
}

/** Copy columns: the parent of each chapter's headline; one record per direct child (block). */
function copyBlocks(): CopyRec[] {
  const out: CopyRec[] = [];
  document.querySelectorAll<HTMLElement>('#main section[id^="chapter-"]').forEach((sec) => {
    const ch = sec.id.replace('chapter-', '');
    const title = document.getElementById(sec.getAttribute('aria-labelledby') ?? '');
    const col = title?.parentElement;
    if (!col) return;
    Array.from(col.children).forEach((el, i) => {
      let blur = blurOf(el);
      el.querySelectorAll('*').forEach((d) => (blur ||= blurOf(d)));
      // Inline-animated properties on the block and its descendants (R6: only opacity / transform).
      const keys = new Set<string>();
      [el, ...Array.from(el.querySelectorAll<HTMLElement>('*'))].forEach((d) => {
        const st = (d as HTMLElement).style;
        for (let k = 0; k < st.length; k++) {
          const p = st[k];
          if (p === 'filter' && (st.filter === 'none' || st.filter === '')) continue;
          if (!['opacity', 'transform', 'visibility', 'will-change', 'translate', 'scale', 'rotate'].includes(p)) keys.add(p);
        }
      });
      out.push({ ch, i, text: (el.textContent ?? '').replace(/\s+/g, ' ').trim(), box: boxOf(el), op: textOpacity(el), blur, style: [...keys].join(',') });
    });
  });
  return out;
}

/** Device screens (and on portrait their tags and the hero hint). */
function devices(withExtras: boolean): DevRec[] {
  const out: DevRec[] = [];
  document.querySelectorAll('[data-phone-front]').forEach((el) => {
    out.push({ id: `phone:${el.getAttribute('data-phone-front')}`, box: boxOf(el), op: paintedOpacity(el) });
  });
  const lap = document.querySelector('[data-laptop-card]') ?? document.querySelector('[data-focus="laptop-screen"]');
  if (lap) out.push({ id: 'laptop', box: boxOf(lap), op: paintedOpacity(lap) });
  if (withExtras) {
    document.querySelectorAll('[data-device-tag]').forEach((el, i) => out.push({ id: `tag:${el.getAttribute('data-device-tag') || i}`, box: boxOf(el), op: paintedOpacity(el) }));
    document.querySelectorAll('[data-phone-hint]').forEach((el) => out.push({ id: 'hint', box: boxOf(el), op: paintedOpacity(el) }));
    // Landing-layer items that travel with the devices.
    for (const [sel, id] of [['[data-invite-chip]', 'invite chip'], ['[data-fan-caption]', 'fan caption'], ['[data-lock-stamp]', 'lock stamp'], ['[data-amount-chip]', 'amount chip']])
      document.querySelectorAll(sel).forEach((el) => out.push({ id, box: boxOf(el), op: paintedOpacity(el) }));
  }
  return out.map((d) => ({ ...d, op: d.box.r - d.box.l < 1 ? 0 : d.op }));
}

/** Beats whose active element must sit inside the stage zone (R4): taps, zoom holds, sliders. */
type Beat = { name: string; win: [number, number]; find: () => Element | null };
const visible = (sel: string, map: (e: Element) => Element = (e) => e) => () =>
  Array.from(document.querySelectorAll(sel)).find((e) => paintedOpacity(e) > 0.15 && e.getBoundingClientRect().width > 0) ? map(Array.from(document.querySelectorAll(sel)).find((e) => paintedOpacity(e) > 0.15 && e.getBoundingClientRect().width > 0)!) : null;
function beats(): Beat[] {
  const out: Beat[] = TAPS.map((t) => ({ name: `tap ${t.target}`, win: [t.start, t.end] as [number, number], find: visible(`[data-tap-target="${t.target}"]`) }));
  for (let i = 0; i + 1 < cameraTrack.length; i++) {
    const a = cameraTrack[i];
    const b = cameraTrack[i + 1];
    if (a.focus && a.focus === b.focus) out.push({ name: `zoom ${a.focus}`, win: [a.vh, b.vh], find: visible(`[data-focus="${a.focus}"]`) });
  }
  const slider = visible('[data-slider-thumb]', (e) => e.parentElement ?? e);
  for (const [name, win] of [
    ['slide accept', CH04_SLIDE],
    ['slide lock', CH05.slide],
    ['slide release', CH07.slide],
    ['slide anyone B', CH08.slideB],
    ['slide anyone C', CH08.slideC],
    ['slide close', CH10.slide],
  ] as [string, [number, number]][])
    out.push({ name, win, find: slider });
  return out;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function goTo(vh: number) {
  const top = (vh * innerHeight * getK()) / 100;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo(0, top);
  // A hidden pane does not deliver scroll events: send one (scroll listeners) and sync the story position.
  window.dispatchEvent(new Event('scroll'));
  syncScrollVh();
  // Wait until the stage settles (damped camera, scroll-linked styles): two equal readings in a row.
  let last = '';
  for (let i = 0; i < 40; i++) {
    await wait(i === 0 ? 120 : 80);
    syncScrollVh();
    const sig = JSON.stringify(devices(true).map((d) => [d.box, Math.round(d.op * 100)])) + copyBlocks().map((c) => Math.round(c.op * 100)).join();
    if (sig === last) return;
    last = sig;
  }
}

function measure(vh: number): Step {
  return { vh, ch: chapterAt(vh).id, dev: devices(isPortrait()), copy: copyBlocks(), sw: document.documentElement.scrollWidth, iw: innerWidth };
}

/** Portrait rules R1–R6 at one step. */
function check(s: Step, bts: Beat[]): Row[] {
  const vp = `${innerWidth}×${innerHeight}`;
  const rows: Row[] = [];
  const add = (rule: string, detail: string) => rows.push([vp, s.ch, s.vh, rule, detail]);
  const bar = document.querySelector('[data-top-bar]')?.getBoundingClientRect().bottom ?? 56;
  const shown = s.copy.filter((c) => c.op > 0.15 && onScreen(c.box));
  // R1: no blur; a headline over 0.5 opacity is fully on screen below the top bar.
  for (const c of s.copy) if (c.blur && c.op > 0.01) add('R1', `ch${c.ch}#${c.i} ${c.blur}`);
  document.querySelectorAll<HTMLElement>('#main h1, #main h2').forEach((h) => {
    const o = textOpacity(h);
    const b = boxOf(h);
    if (o > 0.5 && onScreen(b) && (b.t < bar - 1 || b.b > innerHeight || b.l < 0 || b.r > innerWidth)) add('R1', `headline "${(h.textContent ?? '').slice(0, 24)}" cut [${b.t},${b.b}] op ${o}`);
  });
  // R2: no device (or tag / hint) over the copy.
  for (const d of s.dev) if (d.op > 0.15) for (const c of shown) if (hit(d.box, c.box)) add('R2', `${d.id} × ch${c.ch}#${c.i} "${c.text.slice(0, 18)}"`);
  // R3: devices inside the side edges (12 px); no horizontal scroll.
  for (const d of s.dev) if (d.op > 0.15 && onScreen(d.box) && (d.box.l < 12 || d.box.r > innerWidth - 12)) add('R3', `${d.id} x ${d.box.l}..${d.box.r}`);
  if (s.sw > s.iw + 0.5) add('R3', `scrollWidth ${s.sw} > ${s.iw}`);
  // R4: the active element inside the stage zone (below the copy) with 16 px margin.
  const zoneTop = Math.max(bar, ...shown.map((c) => c.box.b));
  for (const b of bts) {
    if (s.vh < b.win[0] || s.vh > b.win[1]) continue;
    const el = b.find();
    if (!el) continue;
    // What shows of it (clipped by its screen); a tap target or a slider must show whole.
    const full = boxOf(el);
    const x = visibleBox(el);
    if (!b.name.startsWith('zoom') && (Math.abs(x.t - full.t) > 1 || Math.abs(x.b - full.b) > 1 || Math.abs(x.l - full.l) > 1 || Math.abs(x.r - full.r) > 1))
      add('R4', `${b.name} clipped [${full.l},${full.t},${full.r},${full.b}] shows [${x.l},${x.t},${x.r},${x.b}]`);
    // A zoom focus larger than the stage zone cannot fit; its slider / tap beats carry R4 instead.
    if (b.name.startsWith('zoom') && (x.b - x.t > innerHeight - 16 - (zoneTop + 16) || x.r - x.l > innerWidth - 32)) continue;
    if (x.t < zoneTop + 16 || x.b > innerHeight - 16 || x.l < 16 || x.r > innerWidth - 16) add('R4', `${b.name} [${x.l},${x.t},${x.r},${x.b}] zone top ${Math.round(zoneTop)}`);
  }
  // R5: type sizes and tap targets in the copy.
  document.querySelectorAll<HTMLElement>('#main section[id^="chapter-"]').forEach((sec) => {
    const col = document.getElementById(sec.getAttribute('aria-labelledby') ?? '')?.parentElement;
    if (!col || !onScreen(boxOf(col))) return;
    col.querySelectorAll<HTMLElement>('*').forEach((e) => {
      if (!hasText(e) || textOpacity(e) < 0.15 || !onScreen(boxOf(e))) return;
      const fs = parseFloat(getComputedStyle(e).fontSize);
      const min = e.closest('h1, h2') ? 26 : e.closest('[data-chip], .font-mono') ? 12 : e.closest('[data-small]') ? 13 : 15;
      if (fs < min) add('R5', `"${(e.textContent ?? '').trim().slice(0, 20)}" ${fs}px < ${min}`);
    });
    col.querySelectorAll<HTMLElement>('a[href], button').forEach((e) => {
      const r = e.getBoundingClientRect();
      if (textOpacity(e) > 0.15 && onScreen(boxOf(e)) && r.height && r.height < 44) add('R5', `tap target "${(e.textContent ?? '').trim().slice(0, 20)}" ${Math.round(r.height)}px`);
    });
  });
  // R6: only opacity / transform animate on the copy.
  for (const c of s.copy) if (c.style) add('R6', `ch${c.ch}#${c.i} inline ${c.style}`);
  return rows;
}

/**
 * R7: the browser toolbar (innerHeight −80 px) must not move the story or resize the stage. Checks that the story
 * position ignores innerHeight, that the stage keeps the large viewport height (100lvh) and that the pinned copy
 * containers use the small one (100svh). Emulators change lvh / svh with the window, so this checks the units.
 */
function toolbar(): Row[] {
  const rows: Row[] = [];
  const vp = `${innerWidth}×${innerHeight}`;
  const ch = chapterAt(scrollVh.get()).id;
  const before = scrollVh.get();
  const desc = Object.getOwnPropertyDescriptor(window, 'innerHeight');
  const real = window.innerHeight;
  Object.defineProperty(window, 'innerHeight', { configurable: true, get: () => real - 80 });
  syncScrollVh();
  const after = scrollVh.get();
  if (desc) Object.defineProperty(window, 'innerHeight', desc);
  else delete (window as { innerHeight?: number }).innerHeight;
  syncScrollVh();
  if (Math.abs(after - before) > 0.01) rows.push([vp, ch, Math.round(before), 'R7', `story vh ${before.toFixed(1)} → ${after.toFixed(1)} when innerHeight −80`]);
  const probe = (h: string) => {
    const d = document.createElement('div');
    d.style.cssText = `position:fixed;top:0;left:0;width:0;height:${h};visibility:hidden`;
    document.body.appendChild(d);
    const v = d.offsetHeight;
    d.remove();
    return v;
  };
  const stage = document.querySelector<HTMLElement>('[data-stage]');
  if (stage && Math.abs(stage.offsetHeight - probe('100lvh')) > 0.5) rows.push([vp, ch, Math.round(before), 'R7', `stage ${stage.offsetHeight}px ≠ 100lvh`]);
  document.querySelectorAll<HTMLElement>('.sticky').forEach((s) => {
    if (s.querySelector('[data-copy]') && Math.abs(s.offsetHeight - probe('100svh')) > 0.5) rows.push([vp, ch, Math.round(before), 'R7', `copy container ${s.offsetHeight}px ≠ 100svh`]);
  });
  return rows;
}

/** Rows that repeat over consecutive steps collapse into one with a vh range. */
function collapse(rows: Row[]): string[] {
  type G = { vp: string; ch: string; rule: string; detail: string; from: number; to: number };
  const open = new Map<string, G>();
  const done: G[] = [];
  for (const [vp, ch, vh, rule, detail] of rows) {
    const key = `${vp}|${ch}|${rule}|${detail.replace(/-?\d+(\.\d+)?/g, '#')}`;
    const g = open.get(key);
    if (g && vh - g.to <= 10) g.to = vh;
    else {
      const n = { vp, ch, rule, detail, from: vh, to: vh };
      open.set(key, n);
      done.push(n);
    }
  }
  return done.map((g) => `${g.vp} | ch${g.ch} | ${g.from === g.to ? g.from : `${g.from}–${g.to}`} | ${g.rule} | ${g.detail}`);
}

type Opts = { mode: 'record' | 'compare' | 'check'; name?: string; from?: number; to?: number; step?: number };
type Status = { running: boolean; at: number; result: unknown; counts?: Record<string, number> };
const status: Status = { running: false, at: 0, result: null };

async function run(o: Opts) {
  status.running = true;
  status.result = null;
  status.counts = undefined;
  // The hero intro must have finished (the phone is hidden until then).
  for (let i = 0; i < 100 && !document.documentElement.classList.contains('intro-done'); i++) await wait(100);
  // No device screens means the stage never rendered (a hidden pane without ?__raf): refuse to report "clean".
  if (!document.querySelector('[data-phone-front]')) {
    status.result = 'no device screens on the page: load it with ?__raf if the pane is hidden';
    status.running = false;
    return status.result;
  }
  const end = chapters[chapters.length - 1].end;
  const from = o.from ?? 0;
  const to = Math.min(o.to ?? end, end);
  const step = o.step ?? 10;
  const steps: Step[] = [];
  const rows: Row[] = [];
  const bts = beats();
  for (let vh = from; vh <= to; vh += step) {
    status.at = vh;
    await goTo(vh);
    const s = measure(vh);
    if (o.mode === 'check') rows.push(...check(s, bts), ...(isPortrait() ? toolbar() : []));
    else steps.push(s);
  }
  if (o.mode === 'record') {
    // Copy strings once (they do not depend on scroll); device boxes and opacities per step.
    const body = JSON.stringify({ viewport: [innerWidth, innerHeight], copy: steps[0]?.copy.map((c) => [c.ch, c.i, c.text]) ?? [], steps: steps.map((s) => ({ vh: s.vh, ch: s.ch, dev: s.dev })) });
    status.result = await fetch(`${SINK}/${o.name}`, { method: 'POST', body }).then((r) => r.text());
  } else if (o.mode === 'compare') {
    const base = (await fetch(`${SINK}/${o.name}`).then((r) => r.json())) as { copy: [string, number, string][]; steps: { vh: number; dev: DevRec[] }[] };
    const diffs: string[] = [];
    const btexts = base.copy.map((c) => `${c[0]}|${c[1]}|${c[2]}`).join('\n');
    for (const s of steps) {
      const b = base.steps.find((x) => x.vh === s.vh);
      if (!b) continue;
      for (const d of b.dev) {
        const n = s.dev.find((x) => x.id === d.id);
        if (!n) {
          diffs.push(`${s.vh} ${d.id} missing`);
          continue;
        }
        const db = Math.max(...(['l', 't', 'r', 'b'] as const).map((k) => Math.abs(n.box[k] - d.box[k])));
        // Boxes only matter while the device shows.
        if ((d.op > 0.01 || n.op > 0.01) && db > 1) diffs.push(`${s.vh} ${d.id} box Δ${db.toFixed(1)}px`);
        if (Math.abs(n.op - d.op) > 0.01) diffs.push(`${s.vh} ${d.id} opacity ${d.op} → ${n.op}`);
      }
      const texts = s.copy.map((c) => `${c.ch}|${c.i}|${c.text}`).join('\n');
      if (texts !== btexts) diffs.push(`${s.vh} copy text differs`);
    }
    status.result = diffs.length ? diffs : 'no differences';
  } else {
    status.result = collapse(rows);
    // Raw step counts per rule and chapter, for the before / after report.
    const counts: Record<string, number> = {};
    for (const r of rows) counts[`${r[3]} ch${r[1]}`] = (counts[`${r[3]} ch${r[1]}`] ?? 0) + 1;
    status.counts = counts;
  }
  status.running = false;
  return status.result;
}

export function installAudit() {
  (window as unknown as { __nedAudit: unknown }).__nedAudit = { run: (o: Opts) => void run(o), status, measure: () => measure(0) };
}
