'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { links } from '@/content/links';
import { copy } from '@/content/copy';
import { EASE_OUT } from '@/motion/tokens';
import { Chip } from './Chip';

type Props = { variant?: 'bar' | 'hero'; align?: 'left' | 'right' };

/** "Try the demo ↗" button + product menu. URLs come only from content/links.ts. */
export function LinkMenu({ variant = 'bar', align = 'right' }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const button =
    variant === 'hero'
      ? 'rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-bg hover:bg-accent-2'
      : 'rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[14px] font-medium text-ink hover:border-accent/60 hover:bg-accent/10';

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        className={`transition-colors ${button}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        {copy.topBar.demo} <span aria-hidden="true">↗</span>
      </button>

      {/* Without JavaScript the menu can't open: list the product links plainly (SPEC §14.4). */}
      {variant === 'hero' && (
        <noscript>
          <ul className="mt-3 flex flex-col gap-1 text-[14px]">
            {links.map((l) => (
              <li key={l.id}>
                {l.url ? (
                  <a href={l.url} target="_blank" rel="noopener" className="text-accent-soft underline">
                    {l.label} ↗
                  </a>
                ) : (
                  <span className="text-muted">
                    {l.label} · {copy.topBar.comingSoon}
                  </span>
                )}{' '}
                <span className="text-muted">· {copy.topBar.testNetwork}</span>
              </li>
            ))}
          </ul>
        </noscript>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            className={`absolute top-full z-50 mt-2 w-[min(340px,calc(100vw-32px))] rounded-2xl border border-white/10 bg-surface-2/95 p-2 shadow-2xl backdrop-blur ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            <p className="px-3 pt-2 pb-1 font-mono text-[11px] tracking-wider text-muted uppercase">{copy.topBar.menuTitle}</p>
            <ul className="flex flex-col gap-1">
              {links.map((l) => {
                const body = (
                  <>
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[15px] font-semibold text-ink">{l.label}</span>
                      {l.url && <span aria-hidden="true" className="text-accent">↗</span>}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-muted">
                      {l.product}
                      <Chip tone="muted" size="xs">{copy.topBar.testNetwork}</Chip>
                      {!l.url && <Chip tone="amber" size="xs">{copy.topBar.comingSoon}</Chip>}
                    </span>
                  </>
                );
                return (
                  <li key={l.id}>
                    {l.url ? (
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener"
                        className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
                        onClick={() => setOpen(false)}
                      >
                        {body}
                      </a>
                    ) : (
                      <div aria-disabled="true" className="block cursor-not-allowed rounded-xl px-3 py-2.5 opacity-60">
                        {body}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
