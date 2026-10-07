import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { motion, useTransform } from 'motion/react';
import { storyVh as vh } from '../motion/useScrollVh';
import { seg, stagger, within, type Range } from '../motion/timeline';
import { anchor, type AnchorName } from '../motion/anchors';
import { scrollToVhPosition } from '../motion/useSmoothScroll';

// Text recipes from the motion system board: words(range), fade(range), out(range).

type Tag = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div' | 'li';

/** Split by word; word i runs over 40 % of the range, starts spread evenly. y .5em → 0, opacity 0 → 1. */
export function Words({ text, range, as = 'h2', className, id }: { text: string; range: Range; as?: Tag; className?: string; id?: string }) {
  const words = text.split(' ');
  const Tag = as;
  return (
    <Tag className={className} id={id}>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <Word word={w} r={stagger(range, i, words.length)} />
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}

function Word({ word, r }: { word: string; r: Range }) {
  const opacity = useTransform(vh, (v) => seg(v, r));
  const y = useTransform(vh, (v) => `${(1 - seg(v, r)) * 0.5}em`);
  return (
    <motion.span className="word" style={{ opacity, y }}>
      {word}
    </motion.span>
  );
}

/** opacity 0 → 1, y 16 px → 0 over the range. Optional fade-out range. */
export function Fade({
  range,
  out,
  as = 'p',
  className,
  children,
  x,
  style,
}: {
  range: Range;
  out?: Range;
  as?: Tag;
  className?: string;
  children: ReactNode;
  x?: number;
  style?: CSSProperties;
}) {
  const opacity = useTransform(vh, (v) => seg(v, range) * (out ? 1 - seg(v, out) : 1));
  const move = useTransform(vh, (v) => (1 - seg(v, range)) * (x ?? 16));
  const M = motion[as];
  return (
    <M className={className} style={{ ...style, opacity, ...(x !== undefined ? { x: move } : { y: move }) }}>
      {children}
    </M>
  );
}

/**
 * A chapter's fixed layer. Children fade themselves in; the layer fades out over `out` and only takes
 * pointer events while it is on stage. All chapters stay in the accessibility tree in reading order;
 * when keyboard focus lands in a chapter that is off stage, the page scrolls to it (`focusAt`).
 */
export function Chapter({
  id,
  label,
  stage,
  out,
  focusAt,
  outY = -40,
  className,
  children,
}: {
  id: string;
  label: string;
  stage: Range;
  out: Range;
  focusAt: number;
  outY?: number;
  className?: string;
  children: ReactNode;
}) {
  const opacity = useTransform(vh, (v) => seg(v, [stage[0] - 6, stage[0]]) * (1 - seg(v, out)));
  const y = useTransform(vh, (v) => seg(v, out) * outY);
  const pointerEvents = useTransform(vh, (v) => (v >= stage[0] && v <= out[0] ? 'auto' : 'none'));
  const onFocus = () => {
    const v = vh.get();
    if (v < stage[0] || v > out[0]) scrollToVhPosition(focusAt, 0.6);
  };
  return (
    <motion.section
      id={id}
      aria-label={label}
      className={`layer ${className ?? ''}`}
      style={{ opacity, y, pointerEvents }}
      onFocusCapture={onFocus}
    >
      {children}
    </motion.section>
  );
}

/** A page-layer element pinned over a point in the 3D scene. */
export function Anchored({
  name,
  show,
  className,
  children,
  dy = 0,
}: {
  name: AnchorName;
  show: Range;
  className?: string;
  children: ReactNode;
  dy?: number;
}) {
  const a = anchor(name);
  const opacity = useTransform([vh, a.visible], ([v, vis]: number[]) => within(v, show, 6) * vis);
  const y = useTransform(a.y, (y) => y + dy);
  return (
    <motion.div className={`anchored ${className ?? ''}`} style={{ x: a.x, y, opacity }} aria-hidden="true">
      <div className="anchored-inner">{children}</div>
    </motion.div>
  );
}
