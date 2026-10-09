'use client';

import { useEffect, useId, useRef, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { copy } from '@/content/copy';
import { links } from '@/content/links';
import { getLenis } from '@/motion/scroll';
import { useHydrated, useReducedMotionSafe } from '@/motion/flags';
import { EASE_OUT } from '@/motion/tokens';
import { Chip } from './Chip';

const app = links.find((l) => l.id === 'mobile')!;
/** The app URL as shown under the code: no protocol, no trailing slash. */
const appText = app.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
/** Keys that scroll the page; blocked while the dialog is open. */
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);
const FOCUSABLE = 'a[href], button:not([disabled])';

/** Desktop-like device: the QR is shown there only (on a phone the link opens the app directly). */
export const qrDevice = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth >= 768;

type Props = { open: boolean; onClose: () => void; returnFocus: RefObject<HTMLElement | null> };

/**
 * Chapter 14: "Scan to open the app" (landing layer). Portalled to <body> so it sits above the top bar; the page and
 * the 3D stage stay visible behind a dimmed backdrop. Closes on X, Escape or a backdrop click; focus moves in, Tab is
 * trapped, focus returns to the card. Smooth scrolling stops and wheel / touch / key scrolling is blocked while open.
 */
export function QrDialog({ open, onClose, returnFocus }: Props) {
  const reduced = useReducedMotionSafe();
  const hydrated = useHydrated();
  const titleId = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    const block = (e: Event) => e.preventDefault();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        const inside = dialog.current?.contains(document.activeElement);
        if (e.shiftKey && (document.activeElement === first || !inside)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      // Space still presses a focused button; every other scroll key is blocked.
      if (SCROLL_KEYS.has(e.key) && !(e.key === ' ' && (e.target as HTMLElement | null)?.tagName === 'BUTTON')) e.preventDefault();
    };
    window.addEventListener('wheel', block, { passive: false, capture: true });
    window.addEventListener('touchmove', block, { passive: false, capture: true });
    window.addEventListener('keydown', onKey, { capture: true });
    closeBtn.current?.focus();
    const back = returnFocus.current;
    return () => {
      window.removeEventListener('wheel', block, { capture: true });
      window.removeEventListener('touchmove', block, { capture: true });
      window.removeEventListener('keydown', onKey, { capture: true });
      lenis?.start();
      back?.focus();
    };
  }, [open, onClose, returnFocus]);

  const fade = reduced ? { duration: 0.15 } : { duration: 0.25, ease: EASE_OUT };
  const lift = reduced ? {} : { y: 12, scale: 0.98 };

  if (!hydrated) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="qr"
          data-qr-overlay=""
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(6,6,14,0.72)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-[400px] rounded-3xl border border-white/10 bg-surface-2 px-6 pt-8 pb-6 text-center"
            initial={{ opacity: 0, ...lift }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, ...lift }}
            transition={fade}
          >
            <button
              ref={closeBtn}
              type="button"
              aria-label={copy.qr.close}
              onClick={onClose}
              className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
            <h2 id={titleId} className="font-display text-[24px] leading-tight font-bold text-ink">
              {copy.qr.title}
            </h2>
            <p className="mx-auto mt-2 max-w-[32ch] text-[14px] leading-relaxed text-muted">{copy.qr.body}</p>
            {/* Pure white square, 24 px quiet zone around the code. */}
            <div className="mx-auto mt-5 w-fit bg-white p-6" style={{ borderRadius: 16 }}>
              <img
                src={app.qr!.svg}
                width={256}
                height={256}
                alt={copy.qr.alt}
                className="block size-64"
                onError={(e) => {
                  if (!e.currentTarget.src.endsWith(app.qr!.png)) e.currentTarget.src = app.qr!.png;
                }}
              />
            </div>
            <div className="mt-4 flex justify-center">
              <Chip tone="muted" size="xs">
                {copy.topBar.testNetwork}
              </Chip>
            </div>
            <a href={app.url} target="_blank" rel="noopener" className="mt-3 inline-block font-mono text-[13px] break-all text-accent-soft underline underline-offset-4">
              {appText}
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
