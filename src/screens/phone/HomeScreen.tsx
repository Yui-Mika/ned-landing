import type { ReactNode } from 'react';
import { copy } from '@/content/copy';
import { LockGlyph } from '@/components/LockGlyph';
import type { Owner } from '@/scene/poses';

/** Phone screen size in CSS px (SPEC §12.3: 390 × 844). Phone.tsx maps it onto the 3D screen. */
export const PHONE_SCREEN_PX = { w: 390, h: 844 };

const milestones = [
  { id: 'M1', title: 'Wireframes and visual design', usdc: '250.00 USDC' },
  { id: 'M2', title: 'Build and launch', usdc: '250.00 USDC' },
];

/** Status pill: always text + colour, never colour alone (§12.3). */
function Status({ tone, children }: { tone: 'locked' | 'warning'; children: ReactNode }) {
  const tones = {
    locked: 'bg-app-primary-tint text-app-primary-ink',
    warning: 'bg-app-warning text-app-warning-ink',
  };
  return (
    <span className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold ${tones[tone]}`}>{children}</span>
  );
}

/**
 * Home template, built on the product design system (SPEC §12): background #F4F4F6, white cards with
 * radius 20, no outlines / gradients / glows / shadows, Space Grotesk amounts, Inter rows, screen gutter 16.
 */
export function HomeScreen({ owner }: { owner: Exclude<Owner, 'anyone'> }) {
  const s = owner === 'you' ? copy.screens.youHome : copy.screens.clientHome;

  return (
    <div
      className="flex flex-col overflow-hidden rounded-[48px] bg-app font-sans text-app-ink select-none"
      style={{ width: PHONE_SCREEN_PX.w, height: PHONE_SCREEN_PX.h }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-5 pb-1">
        <span className="text-[15px] font-semibold">9:41</span>
        <Status tone="warning">{copy.screens.testNetwork}</Status>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <h3 className="font-display text-[30px] leading-[36px] font-bold">{s.greeting}</h3>
        <span
          aria-hidden="true"
          className="grid size-10 place-items-center rounded-full bg-app-primary-tint font-display text-[15px] font-bold text-app-primary-ink"
        >
          {owner === 'you' ? 'Y' : 'C'}
        </span>
      </div>

      {/* Locked card */}
      <div className="mx-4 mt-4 rounded-[20px] bg-app-surface p-5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-app-ink-3">{s.label}</span>
          <Status tone="locked">
            <LockGlyph size={16} color="#6A22B0" />
            Locked
          </Status>
        </div>
        <p className="mt-3 font-display text-[34px] leading-[36px] font-bold whitespace-nowrap">{s.amount}</p>
        {'estimate' in s && <p className="mt-1 text-[13px] text-app-ink-3">{s.estimate}</p>}
        <p className="mt-3 text-[15px] text-app-ink-2">{s.detail}</p>
      </div>

      <p className="mx-4 mt-3 px-1 text-[13px] leading-snug text-app-ink-3">{s.status}</p>

      {/* Milestones: one list, hairlines only between rows */}
      <div className="mx-4 mt-4 rounded-[20px] bg-app-surface px-4">
        {milestones.map((m, i) => (
          <div key={m.id} className={`flex min-h-[64px] items-center gap-3 py-3 ${i > 0 ? 'border-t border-app-hairline' : ''}`}>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-app-fill font-mono text-[13px] text-app-ink-2">
              {m.id}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] leading-tight font-semibold">{m.title}</span>
              {owner === 'client' && <span className="mt-0.5 block text-[13px] text-app-ink-3">{m.usdc}</span>}
            </span>
            <Status tone="locked">Locked</Status>
          </div>
        ))}
      </div>

      {/* Tab bar: tone, no border */}
      <div className="mt-auto flex justify-around bg-app-surface px-6 pt-3 pb-8 text-[13px]">
        <span className="font-semibold text-app-primary-ink">Home</span>
        <span className="text-app-ink-3">Contracts</span>
        <span className="text-app-ink-3">Records</span>
      </div>
    </div>
  );
}
