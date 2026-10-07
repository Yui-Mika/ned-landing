'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollVh } from '@/motion/scroll';
import { copy } from '@/content/copy';
import { FONT } from '@/screens/phone/parts';
import { chipTracks, laptopTracks, sampleLaptop, CH03_CREATE, type ChipPose } from './poses';
import { focusWorld } from './focus';
import { CARD, CARD_PX_PER_UNIT, LAPTOP, PX_PER_UNIT as LAPTOP_PX_PER_UNIT } from './Laptop';
import { SceneHtml } from './htmlLayer';
import { easeFn } from '@/motion/tokens';
import { stageViewport } from './viewport';

/** Chip px per world unit at scale 1 = the laptop screen's, so at lift-off it matches the link field exactly. */
const PX_PER_UNIT = LAPTOP_PX_PER_UNIT;

/**
 * The invite-link chip (SPEC §4: one of only two chips that travel between devices). T8 Lift-off: it appears over
 * the link field on the laptop screen, then leaves the screen as a flat chip. Text: the link from
 * phone/ContractCreated. Landing layer, so it may carry a soft shadow.
 */
export function InviteChip({ reduced, portrait }: { reduced: boolean; portrait: boolean }) {
  const group = useRef<THREE.Group>(null);
  const el = useRef<HTMLDivElement>(null);
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3() }), []);

  const place = (k: ChipPose, vp: { width: number; height: number }, out: THREE.Vector3) => {
    if (Array.isArray(k.at)) return out.set((k.at[0] * vp.width) / 2, (k.at[1] * vp.height) / 2, k.at[2]), true;
    return focusWorld(k.at.focus, out);
  };

  useFrame((state) => {
    if (!group.current || !el.current) return;
    const vh = scrollVh.get();
    const track = portrait ? chipTracks.portrait : chipTracks.desktop;
    const vp = stageViewport(state);
    let i = track.findIndex((k) => k.vh >= vh);
    if (i === -1) i = track.length - 1;
    const a = track[Math.max(0, i - 1)];
    const b = track[i];
    const raw = b.vh === a.vh ? 1 : Math.min(1, Math.max(0, (vh - a.vh) / (b.vh - a.vh)));
    const t = reduced ? (raw < 0.5 ? 0 : 1) : easeFn[b.ease ?? 'ease'](raw);
    const okA = place(a, vp, tmp.a);
    const okB = place(b, vp, tmp.b);
    const opacity = a.opacity + (b.opacity - a.opacity) * t;
    const visible = opacity > 0.001 && (okA || okB);
    group.current.visible = visible;
    el.current.style.opacity = visible ? opacity.toFixed(3) : '0';
    if (!visible) return;
    if (!okA) tmp.a.copy(tmp.b);
    if (!okB) tmp.b.copy(tmp.a);
    group.current.position.lerpVectors(tmp.a, tmp.b, t);

    // Same box as the link field it lifts off from (the field's CSS size on the laptop screen).
    const field = document.querySelector<HTMLElement>('[data-focus="invite-link"]');
    if (field && el.current.style.width !== `${field.offsetWidth}px`) {
      el.current.style.width = `${field.offsetWidth}px`;
      el.current.style.height = `${field.offsetHeight}px`;
    }

    // Base scale: the laptop screen's at the moment of creation, so the chip leaves at the field's exact size.
    const lp = sampleLaptop(portrait ? laptopTracks.portrait : laptopTracks.desktop, CH03_CREATE.createdAt);
    const laptopScale = portrait ? (lp.size * vp.width) / CARD.worldW : (lp.size * vp.width) / LAPTOP.base.w;
    const cardFix = portrait ? LAPTOP_PX_PER_UNIT / CARD_PX_PER_UNIT : 1;
    group.current.scale.setScalar(laptopScale * cardFix * (a.scale + (b.scale - a.scale) * t));
  });

  return (
    <group ref={group} visible={false}>
      <SceneHtml transform distanceFactor={400 / PX_PER_UNIT}>
        <div
          ref={el}
          data-invite-chip=""
          style={{
            opacity: 0,
            height: 52,
            padding: '0 14px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 14,
            background: '#F4F4F6',
            color: '#111116',
            fontFamily: FONT.mono,
            fontSize: 14,
            whiteSpace: 'nowrap',
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
          }}
        >
          {copy.inviteLink}
        </div>
      </SceneHtml>
    </group>
  );
}
