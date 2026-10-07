import type { ReactNode } from 'react';
import { DeviceTag } from '@/components/DeviceTag';
import { PHONE_SCREEN_PX } from '@/screens/phone/size';

/** No-WebGL fallback (SPEC §8): a chapter's phones as still screens beside its copy, each with its owner tag. */
export function StaticPhones({ phones, scale = 0.42 }: { phones: { screen: ReactNode; owner: 'you' | 'client' }[]; scale?: number }) {
  return (
    <div aria-hidden="true" className="flex gap-4 md:gap-8">
      {phones.map(({ screen, owner }, i) => (
        <figure key={i} className="flex flex-col items-center gap-3">
          <div
            className="overflow-hidden rounded-[22px] bg-[#1A1A22] p-[6px]"
            style={{ width: PHONE_SCREEN_PX.w * scale + 12, height: PHONE_SCREEN_PX.h * scale + 12 }}
          >
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>{screen}</div>
          </div>
          <DeviceTag owner={owner} />
        </figure>
      ))}
    </div>
  );
}
