import type { ReactNode } from 'react';

type Tone = 'accent' | 'muted' | 'amber';

const tones: Record<Tone, string> = {
  accent: 'border-accent/40 bg-accent/10 text-accent-soft',
  muted: 'border-white/15 bg-white/5 text-muted',
  amber: 'border-amber/40 bg-amber/10 text-amber',
};

const sizes = {
  sm: 'px-3 py-1 text-[12px]',
  xs: 'px-2 py-0.5 text-[11px]',
};

type Props = { children: ReactNode; tone?: Tone; size?: keyof typeof sizes; className?: string };

export function Chip({ children, tone = 'accent', size = 'sm', className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono uppercase tracking-wider ${sizes[size]} ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
