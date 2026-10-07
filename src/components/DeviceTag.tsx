import { copy } from '@/content/copy';
import type { Owner } from '@/scene/poses';

/** Owner colours (SPEC §4): indigo = Client's, purple = Yours, grey = Anyone. */
export const OWNER_COLOR: Record<Owner, string> = {
  you: '#B87AED',
  client: '#818CF8',
  anyone: '#9CA3AF',
};

type Props = { owner: Owner; device?: 'phone' | 'computer'; size?: 'sm' | 'md' | 'lg'; className?: string };

const sizes = {
  sm: { pill: 'px-3 py-1 text-[12px]', dot: 'size-2' },
  md: { pill: 'px-3.5 py-1.5 text-[14px]', dot: 'size-2.5' },
  lg: { pill: 'px-5 py-2.5 text-[22px]', dot: 'size-3' },
};

export function DeviceTag({ owner, device = 'phone', size = 'sm', className = '' }: Props) {
  const color = OWNER_COLOR[owner];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-mono whitespace-nowrap uppercase tracking-wider ${sizes[size].pill} ${className}`}
      style={{ borderColor: color, color, background: `${color}1f` }}
    >
      <span aria-hidden="true" className={`${sizes[size].dot} rounded-full`} style={{ background: color }} />
      {copy.owners[owner][device]}
    </span>
  );
}
