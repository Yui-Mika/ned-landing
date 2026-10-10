'use client';

import { Children, type ReactNode } from 'react';
import { motion, useTransform } from 'motion/react';
import { scrollVh } from '@/motion/scroll';
import { useHydrated } from '@/motion/flags';
import { useIsMobile } from '@/motion/reveal';

/** Crossfade per page boundary (vh): the outgoing page fades out over the first half, the next in over the second. */
const FADE = 6;

/** Opacity of page `i` at `vh`, pages split at `bounds` (vh, ascending). */
export function pageOpacity(vh: number, i: number, bounds: number[]) {
  const half = FADE / 2;
  const inn = i === 0 ? 1 : Math.min(1, Math.max(0, (vh - bounds[i - 1]) / half));
  const out = i === bounds.length ? 1 : Math.min(1, Math.max(0, (bounds[i] - half - vh) / half + 1));
  return Math.min(inn, out);
}

function Page({ i, bounds, children }: { i: number; bounds: number[]; children: ReactNode }) {
  const opacity = useTransform(scrollVh, (vh) => pageOpacity(vh, i, bounds));
  const pointerEvents = useTransform(opacity, (o): 'auto' | 'none' => (o > 0.5 ? 'auto' : 'none'));
  return (
    <motion.div data-copy-page={i} style={{ gridArea: '1 / 1', opacity, pointerEvents }}>
      {children}
    </motion.div>
  );
}

/**
 * Portrait only (mobile layout pass): a chapter's body copy, too tall for the copy zone (at most 40% of the screen),
 * shows one page at a time in the same place; pages change at `bounds` (vh) with an opacity crossfade. The copy zone
 * is as tall as the tallest page. Text is unchanged and stays in the accessibility tree (opacity only).
 * Desktop (and the server HTML): the children as they are, nothing added.
 */
export function PortraitPages({ bounds, children }: { bounds: number[]; children: ReactNode }) {
  const mobile = useIsMobile();
  const hydrated = useHydrated();
  const pages = Children.toArray(children);
  if (!mobile || !hydrated) return <>{children}</>;
  return (
    <div data-copy-pages="" style={{ display: 'grid' }}>
      {pages.map((p, i) => (
        <Page key={i} i={i} bounds={bounds}>
          {p}
        </Page>
      ))}
    </div>
  );
}
