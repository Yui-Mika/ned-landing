/**
 * Chapter ranges in desktop vh (SPEC §6). Phones scale them by K (see motion/scroll.ts).
 * The top bar, orbit nav and present mode all read this table.
 */
export type Chapter = { id: string; name: string; start: number; end: number };

export const chapters: Chapter[] = [
  { id: '00', name: 'Locked before you start', start: 0, end: 140 },
  { id: '01', name: 'The problem', start: 140, end: 360 },
  { id: '02', name: 'Sign in, say where you live', start: 360, end: 560 },
  { id: '03', name: 'The brief', start: 560, end: 860 },
  { id: '04', name: 'Accept, and choose once', start: 860, end: 1120 },
  { id: '05', name: 'Lock', start: 1120, end: 1360 },
  { id: '06', name: 'Work and submit', start: 1360, end: 1620 },
  { id: '07', name: 'Review and release', start: 1620, end: 1900 },
  { id: '08', name: 'If someone goes quiet', start: 1900, end: 2200 },
  { id: '09', name: 'Two ways to receive', start: 2200, end: 2420 },
  { id: '10', name: 'Records, then close', start: 2420, end: 2620 },
  { id: '11', name: 'One wallet, two screens', start: 2620, end: 2800 },
  { id: '12', name: "What N.E.D does and doesn't do", start: 2800, end: 2960 },
  { id: '13', name: "What's real today", start: 2960, end: 3140 },
  { id: '14', name: 'See a milestone released', start: 3140, end: 3300 },
];

/** Chapters that are built so far. The page is only as long as these (plus a short spacer). */
export const BUILT_UNTIL_VH = 140;

export function chapterAt(vh: number): Chapter {
  for (let i = chapters.length - 1; i >= 0; i--) if (vh >= chapters[i].start) return chapters[i];
  return chapters[0];
}
