/**
 * Chapter ranges in desktop vh (SPEC §6). Phones scale them by K (see motion/scroll.ts).
 * The top bar, orbit nav and present mode all read this table.
 */
import { text } from '@/motion/tokens';

type Window = [number, number];
export type Chapter = {
  id: string;
  name: string;
  start: number;
  end: number;
  /** Scrubbed copy entrance window (vh). null = no scrubbed entrance (chapter 00 uses the load reveal). */
  copyIn: Window | null;
  /** Scrubbed copy exit window (vh). */
  copyOut: Window;
};

type Base = Pick<Chapter, 'id' | 'name' | 'start' | 'end'> & Partial<Pick<Chapter, 'copyIn' | 'copyOut'>>;

/** Defaults (SPEC §14.2): enter over the first 12 vh of the chapter, exit over the last 12 vh. */
const withCopyWindows = (c: Base): Chapter => ({
  ...c,
  copyIn: c.copyIn === undefined ? [c.start, c.start + text.scrub.window] : c.copyIn,
  copyOut: c.copyOut ?? [c.end - text.scrub.window, c.end],
});

const base: Base[] = [
  // Chapter 00: copy arrives with the load reveal, then exits between 20 and 70 vh.
  { id: '00', name: 'Locked before you start', start: 0, end: 140, copyIn: null, copyOut: [20, 70] },
  { id: '01', name: 'The problem', start: 140, end: 360 },
  { id: '02', name: 'Sign in, say where you live', start: 360, end: 560 },
  { id: '03', name: 'The brief', start: 560, end: 860 },
  { id: '04', name: 'Accept, and choose once', start: 860, end: 1120 },
  { id: '05', name: 'Lock', start: 1120, end: 1360 },
  { id: '06', name: 'Work and submit', start: 1360, end: 1620 },
  { id: '07', name: 'Review and release', start: 1620, end: 1900 },
  { id: '08', name: 'If someone goes quiet', start: 1900, end: 2200 },
  { id: '09', name: 'Two ways to receive', start: 2200, end: 2420 },
  // Chapters 10–12 are not built yet (SPEC: 10 2420–2620 · 11 2620–2800 · 12 2800–2960). Built chapters follow each
  // other with no gap: 13 starts where 09 ends (SPEC length 180 vh), 14 where 13 ends (160 vh).
  { id: '13', name: "What's real today", start: 2420, end: 2600 },
  // The last chapter's copy never exits: the exit window lies past the end of the page.
  { id: '14', name: 'See a milestone released', start: 2600, end: 2760, copyOut: [2800, 2800 + text.scrub.window] },
];

export const chapters: Chapter[] = base.map(withCopyWindows);

export const chapterById = (id: string): Chapter => {
  const c = chapters.find((ch) => ch.id === id);
  if (!c) throw new Error(`Unknown chapter ${id}`);
  return c;
};

/** Chapters that are built so far. The page is only as long as these (plus a short spacer). */
export const BUILT_UNTIL_VH = 2760;

export function chapterAt(vh: number): Chapter {
  for (let i = chapters.length - 1; i >= 0; i--) if (vh >= chapters[i].start) return chapters[i];
  return chapters[0];
}
