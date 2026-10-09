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

/** One SPEC §6 row: its length in vh and whether it is built yet. Ranges are laid out from these (`layout`). */
type Row = { id: string; name: string; length: number; built: boolean };

/**
 * Story order and SPEC §6 lengths (00 0–140 … 14 3140–3300). Only built chapters are on the page: they follow each
 * other with no gap, so every range after an unbuilt chapter moves up by its length until it is built.
 */
const rows: Row[] = [
  { id: '00', name: 'Locked before you start', length: 140, built: true },
  { id: '01', name: 'The problem', length: 220, built: true },
  { id: '02', name: 'Sign in, say where you live', length: 200, built: true },
  { id: '03', name: 'The brief', length: 300, built: true },
  { id: '04', name: 'Accept, and choose once', length: 260, built: true },
  { id: '05', name: 'Lock', length: 240, built: true },
  { id: '06', name: 'Work and submit', length: 260, built: true },
  { id: '07', name: 'Review and release', length: 280, built: true },
  { id: '08', name: 'If someone goes quiet', length: 300, built: true },
  { id: '09', name: 'Two ways to receive', length: 220, built: true },
  { id: '10', name: 'Records, then close', length: 200, built: false },
  { id: '11', name: 'One wallet, two screens', length: 180, built: false },
  { id: '12', name: "What N.E.D does and doesn't do", length: 160, built: true },
  { id: '13', name: "What's real today", length: 180, built: true },
  { id: '14', name: 'See a milestone released', length: 160, built: true },
];

/**
 * Copy windows (SPEC §14.2): enter over the first 12 vh, exit over the last 12 vh. Chapter 00: the load reveal, then
 * exit between 20 and 70 vh. The last chapter's copy never exits: its exit window lies past the end of the page.
 */
function layout(): Chapter[] {
  const built = rows.filter((r) => r.built);
  let start = 0;
  return built.map((r, i) => {
    const end = start + r.length;
    const last = i === built.length - 1;
    const c: Chapter = {
      id: r.id,
      name: r.name,
      start,
      end,
      copyIn: r.id === '00' ? null : [start, start + text.scrub.window],
      copyOut: r.id === '00' ? [20, 70] : last ? [end + 40, end + 40 + text.scrub.window] : [end - text.scrub.window, end],
    };
    start = end;
    return c;
  });
}

export const chapters: Chapter[] = layout();

export const chapterById = (id: string): Chapter => {
  const c = chapters.find((ch) => ch.id === id);
  if (!c) throw new Error(`Unknown chapter ${id}`);
  return c;
};

/** End of the last built chapter: the page is only as long as the built chapters. */
export const BUILT_UNTIL_VH = chapters[chapters.length - 1].end;

export function chapterAt(vh: number): Chapter {
  for (let i = chapters.length - 1; i >= 0; i--) if (vh >= chapters[i].start) return chapters[i];
  return chapters[0];
}
