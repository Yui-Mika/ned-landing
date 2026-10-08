'use client';

import { motion, useTransform } from 'motion/react';
import { scrollVh } from '@/motion/scroll';
import { CH09 } from '@/scene/poses';

type Tint = {
  /** Fade window: in start, in end, out start, out end (vh), with its phone. */
  window: [number, number, number, number];
  glyph: string;
  /** rgb triplet of the landing colour (globals.css: --color-vnd / --color-usdc). */
  rgb: string;
  /** Centre of its phone (SPLIT9 places), in % of the viewport: desktop, then portrait. */
  className: string;
};

/**
 * Chapter 09 (SPEC row 09): a green ₫ tint behind "Your phone · Vietnam" and a blue $ tint behind "Your phone ·
 * abroad". Landing layer only (gradients are allowed here, never inside the screens): fixed behind the 3D canvas,
 * opacity scrubbed by scroll (CH09), so reduced motion needs nothing extra. Decorative.
 */
const TINTS: Tint[] = [
  { window: CH09.tintVN, glyph: '₫', rgb: '52 211 153', className: 'left-[52.5%] top-[45%] portrait:max-lg:top-[83%] portrait:max-lg:left-[26%]' },
  { window: CH09.tintAbroad, glyph: '$', rgb: '96 165 250', className: 'left-[81%] top-[45%] portrait:max-lg:top-[83%] portrait:max-lg:left-[74%]' },
];

function TintSpot({ window: w, glyph, rgb, className }: Tint) {
  const opacity = useTransform(scrollVh, w, [0, 1, 1, 0]);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? 'hidden' : 'visible'));
  return (
    <motion.div
      aria-hidden="true"
      data-tint={glyph}
      style={{ opacity, visibility }}
      className={`pointer-events-none fixed z-0 flex size-[62svh] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full portrait:max-lg:size-[56vw] ${className}`}
    >
      <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(closest-side, rgb(${rgb} / 0.2), rgb(${rgb} / 0) 100%)` }} />
      <span className="relative font-display text-[44svh] leading-none font-bold portrait:max-lg:text-[40vw]" style={{ color: `rgb(${rgb} / 0.14)` }}>
        {glyph}
      </span>
    </motion.div>
  );
}

export function CurrencyTints() {
  return (
    <>
      {TINTS.map((t) => (
        <TintSpot key={t.glyph} {...t} />
      ))}
    </>
  );
}
