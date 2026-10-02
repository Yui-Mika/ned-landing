import { motion, type MotionValue } from 'motion/react';

// Teddy's mustache: the brand glyph. One-colour vector, traced from the mascot art.
// Pending team sign-off as the brand mark (mascot-brief A5).
export const MUSTACHE_PATH =
  'M0,4 C-14,-10 -40,-20 -62,-12 C-80,-5 -88,10 -100,14 C-110,17 -120,12 -122,2 C-126,22 -108,34 -86,30 C-60,26 -30,18 0,22 C30,18 60,26 86,30 C108,34 126,22 122,2 C120,12 110,17 100,14 C88,10 80,-5 62,-12 C40,-20 14,-10 0,4 Z';

type Props = {
  /** 0–1 stroke drawn. Omit for a filled glyph. */
  draw?: MotionValue<number>;
  filled?: boolean;
  className?: string;
};

export function Mustache({ draw, filled = true, className }: Props) {
  return (
    <svg className={className} viewBox="-130 -24 260 64" aria-hidden="true" focusable="false">
      {draw ? (
        <>
          <path d={MUSTACHE_PATH} fill="none" stroke="var(--line-faint)" strokeWidth={4} />
          <motion.path
            d={MUSTACHE_PATH}
            fill="none"
            stroke="var(--glyph)"
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ pathLength: draw }}
          />
        </>
      ) : (
        <path d={MUSTACHE_PATH} fill={filled ? 'var(--glyph)' : 'none'} stroke="var(--glyph)" strokeWidth={filled ? 0 : 4.5} />
      )}
    </svg>
  );
}
