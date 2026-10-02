// Chapter 02 · The problem. SEGMENT in /src/config.ts picks the variant.
// Every figure carries its source and date. Neutral and B have no public sourced figure yet,
// so they show none (decided 2 Oct 2026).
import type { Segment } from '../config';

type ProblemCopy = {
  line1: string;
  line2: string;
  line3: string;
  figure: { text: string; source: string } | null;
};

export const problem: Record<Segment, ProblemCopy> = {
  neutral: {
    line1: 'Today, shared money usually sits with one person.',
    line2: "The client who promises to send the money once the work is done. The friend who collects the group's money.",
    line3: 'If that person disappears, keeps wrong records or changes their mind, everyone else loses.',
    figure: null,
  },
  A: {
    line1: 'Today, shared money usually sits with one person.',
    line2: "The co-worker who collects everyone's monthly money.",
    line3: 'If that person disappears, keeps wrong records or changes their mind, everyone else loses.',
    figure: {
      text: '605,906 Vietnamese work in Japan, 23.6% of all foreign workers.',
      source: 'MHLW via nippon.com · Oct 2025',
    },
  },
  B: {
    line1: 'Today, shared money usually sits with one person.',
    line2: 'The client who promises to send the money once the work is done.',
    line3: 'If that person disappears or changes their mind, the money never arrives.',
    figure: null,
  },
};
