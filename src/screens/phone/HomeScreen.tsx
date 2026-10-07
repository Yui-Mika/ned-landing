import { copy } from '@/content/copy';
import { LockGlyph } from '@/components/LockGlyph';
import { OWNER_COLOR } from '@/components/DeviceTag';
import type { Owner } from '@/scene/poses';

/** Phone screen size in CSS px. Matches the screen plane in scene/Phone.tsx at 400 px per world unit. */
export const PHONE_SCREEN_PX = { w: 352, h: 768 };

const milestones = [
  { id: 'M1', title: 'Wireframes and visual design', usdc: '250.00 USDC' },
  { id: 'M2', title: 'Build and launch', usdc: '250.00 USDC' },
];

/** Home template. Light app theme inside the dark site; always shows "Test network". */
export function HomeScreen({ owner }: { owner: Exclude<Owner, 'anyone'> }) {
  const accent = OWNER_COLOR[owner];
  const s = owner === 'you' ? copy.screens.youHome : copy.screens.clientHome;

  return (
    <div
      className="flex flex-col overflow-hidden rounded-[44px] bg-app text-app-ink select-none"
      style={{ width: PHONE_SCREEN_PX.w, height: PHONE_SCREEN_PX.h }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-7 pt-5 pb-2 font-mono text-[13px] font-bold">
        <span>9:41</span>
        <span className="rounded-full bg-amber/20 px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#92600A] uppercase">
          {copy.screens.testNetwork}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-4">
        <h3 className="font-display text-[26px] font-bold">{s.greeting}</h3>
        <span
          className="grid size-10 place-items-center rounded-full font-display text-[15px] font-bold text-white"
          style={{ background: accent }}
          aria-hidden="true"
        >
          {owner === 'you' ? 'Y' : 'C'}
        </span>
      </div>

      {/* Locked card */}
      <div className="mx-5 mt-5 rounded-[28px] p-6 text-white" style={{ background: `linear-gradient(150deg, ${accent}, #4C1D95)` }}>
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-medium opacity-90">{s.label}</span>
          <LockGlyph size={38} color="rgba(255,255,255,0.95)" />
        </div>
        <p className="mt-3 font-mono text-[25px] leading-tight font-bold tracking-tight whitespace-nowrap">{s.amount}</p>
        {'estimate' in s && <p className="mt-1 font-mono text-[12px] opacity-85">{s.estimate}</p>}
        <p className="mt-4 text-[13px] opacity-90">{s.detail}</p>
      </div>

      <p className="mx-6 mt-4 flex items-start gap-2 text-[13px] leading-snug text-app-muted">
        <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: accent }} />
        {s.status}
      </p>

      {/* Milestones */}
      <div className="mx-5 mt-5 flex flex-col gap-2.5">
        {milestones.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(16,16,30,0.06)]">
            <span className="font-mono text-[12px] font-bold text-app-muted">{m.id}</span>
            <span className="flex-1 text-[14px] leading-tight font-medium">{m.title}</span>
            <span className="text-right font-mono text-[11px] font-bold uppercase" style={{ color: accent }}>
              Locked
              {owner === 'client' && <span className="block font-medium text-app-muted normal-case">{m.usdc}</span>}
            </span>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="mt-auto flex justify-around border-t border-black/5 bg-white/70 px-6 pt-3 pb-7 text-[12px] font-medium text-app-muted">
        <span style={{ color: accent }}>Home</span>
        <span>Contracts</span>
        <span>Records</span>
      </div>
    </div>
  );
}
