'use client';

import { motion, useTransform } from 'motion/react';
import { copy } from '@/content/copy';
import { scrollVh } from '@/motion/scroll';
import { CH01_CLOCK, ch01Days } from '@/scene/poses';
import { PHONE_SCREEN_PX } from './size';

/**
 * Chapter 01: a generic messaging app, before N.E.D. Neutral greys and white, plain shapes, no brand look.
 * Deliberately NOT the product design system (SPEC §12 is for N.E.D screens only).
 */
const C = {
  bg: '#FFFFFF',
  bar: '#F5F5F5',
  ink: '#1C1C1C',
  ink2: '#5C5C5C',
  ink3: '#8C8C8C',
  bubbleIn: '#ECECEC',
  bubbleOut: '#3A3A3A',
  field: '#F0F0F0',
  disabled: '#C8C8C8',
  rule: '#E4E4E4',
};

/** Your phone's status-bar clock: days since the files were sent, from scroll (never wall-clock time). */
const clockAt = (vh: number) => {
  const days = ch01Days(vh);
  return days === null ? CH01_CLOCK.sentAt : copy.chat.you.daysLater(days);
};

function YourClock() {
  // Rendered straight from the MotionValue: no React state on scroll.
  const text = useTransform(scrollVh, clockAt);
  return (
    <motion.span data-ch01-clock="" className="text-[17px] font-semibold tabular-nums">
      {text}
    </motion.span>
  );
}

function StatusBar({ clock }: { clock: React.ReactNode }) {
  return (
    <div className="flex h-12 items-end justify-between px-6 pb-1" style={{ color: C.ink }}>
      {clock}
      {/* Generic signal + battery shapes */}
      <span aria-hidden="true" className="flex items-center gap-1.5">
        <span className="flex items-end gap-[2px]">
          {[5, 8, 11, 14].map((h) => (
            <span key={h} className="w-[3px] rounded-[1px]" style={{ height: h, background: C.ink }} />
          ))}
        </span>
        <span className="ml-1 h-[12px] w-[24px] rounded-[3px] p-[2px]" style={{ boxShadow: `inset 0 0 0 1.5px ${C.ink}` }}>
          <span className="block h-full w-3/4 rounded-[1px]" style={{ background: C.ink }} />
        </span>
      </span>
    </div>
  );
}

function Header({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3" style={{ background: C.bar, borderBottom: `1px solid ${C.rule}` }}>
      <span aria-hidden="true" className="text-[22px] leading-none" style={{ color: C.ink3 }}>
        ‹
      </span>
      <span
        aria-hidden="true"
        className="grid size-10 place-items-center rounded-full text-[16px] font-semibold"
        style={{ background: C.disabled, color: C.bg }}
      >
        {name[0]}
      </span>
      <span className="text-[17px] font-semibold" style={{ color: C.ink }}>
        {name}
      </span>
    </div>
  );
}

function Composer({ draft }: { draft?: string }) {
  return (
    <div className="flex items-end gap-2 px-3 pt-2 pb-8" style={{ background: C.bar, borderTop: `1px solid ${C.rule}` }}>
      <div
        className="min-h-[48px] flex-1 rounded-[24px] px-4 py-3 text-[19px] leading-snug"
        style={{ background: C.field, color: draft ? C.ink : C.ink3 }}
      >
        {draft ?? copy.chat.placeholder}
      </div>
      {/* Grey send button: nothing has been sent */}
      <span
        className="grid h-12 shrink-0 place-items-center rounded-full px-4 text-[16px] font-semibold"
        style={{ background: C.disabled, color: C.bg }}
      >
        {copy.chat.send}
      </span>
    </div>
  );
}

function Frame({ children, screen }: { children: React.ReactNode; screen: string }) {
  return (
    <div
      data-screen={screen}
      className="flex flex-col overflow-hidden rounded-[48px] font-sans select-none"
      style={{ width: PHONE_SCREEN_PX.w, height: PHONE_SCREEN_PX.h, background: C.bg }}
    >
      {children}
    </div>
  );
}

/** Your phone: files sent, the clock jumps 3 → 14 → 30 days, no reply. */
export function ChatYouScreen() {
  const s = copy.chat.you;
  return (
    <Frame screen="chatYou">
      <StatusBar clock={<YourClock />} />
      <Header name={s.contact} />
      <div className="flex flex-1 flex-col items-end gap-2 px-4 pt-6">
        {s.files.map((f) => (
          <div key={f} className="flex w-[250px] items-center gap-3 rounded-[18px] px-3 py-3" style={{ background: C.bubbleIn }}>
            <span aria-hidden="true" className="h-10 w-8 shrink-0 rounded-[4px]" style={{ background: C.disabled }} />
            <span className="truncate text-[17px]" style={{ color: C.ink2 }}>
              {f}
            </span>
          </div>
        ))}
        <div className="mt-1 rounded-[22px] px-5 py-3 text-[24px] font-semibold" style={{ background: C.bubbleOut, color: C.bg }}>
          {s.sent}
        </div>
        <span className="pr-2 text-[17px]" style={{ color: C.ink3 }}>
          {s.receipt}
        </span>
      </div>
      <Composer />
    </Frame>
  );
}

/** The client's phone: a draft they haven't sent, grey send button. A hesitation, not a refusal. */
export function ChatClientScreen() {
  const s = copy.chat.client;
  return (
    <Frame screen="chatClient">
      <StatusBar clock={<span className="text-[17px] font-semibold">{s.clock}</span>} />
      <Header name={s.contact} />
      <div className="flex flex-1 flex-col items-start gap-2 px-4 pt-6">
        <div className="max-w-[310px] rounded-[18px] px-4 py-3 text-[18px] leading-snug" style={{ background: C.bubbleIn, color: C.ink }}>
          {s.incoming}
        </div>
      </div>
      <Composer draft={s.draft} />
    </Frame>
  );
}
