'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollVh } from '@/motion/scroll';
import { easeFn } from '@/motion/tokens';
import { LockGlyph } from '@/components/LockGlyph';
import { CH05 } from './poses';
import { focusWorld } from './focus';
import { SceneHtml } from './htmlLayer';

/** Glyph size in CSS px (screen space: the same size at any camera zoom). */
const SIZE = 96;

/**
 * Chapter 05: the lock glyph stamps onto the wallet panel once the money is locked (SPEC §5.2). A plain overlay on
 * the landing layer, outside the ported screen: centred on the panel's app screen, scale 1.6 → 1 while it fades in
 * (CH05.stamp), held, then faded out. Pure function of scroll. Reduced motion: opacity only.
 */
export function LockStamp({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const el = useRef<HTMLDivElement>(null);
  const at = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!group.current || !el.current) return;
    const vh = scrollVh.get();
    const [a, b, c, d] = CH05.stamp;
    const visible = vh > a && vh < d && focusWorld('wallet-view', at);
    group.current.visible = visible;
    if (!visible) {
      if (el.current.style.opacity !== '0') el.current.style.opacity = '0';
      return;
    }
    group.current.position.copy(at);
    const opacity = Math.max(0, Math.min(1, (vh - a) / (b - a), (d - vh) / (d - c)));
    const scale = reduced ? 1 : 1.6 - 0.6 * easeFn.easeOut(Math.min(1, (vh - a) / (b - a)));
    el.current.style.opacity = opacity.toFixed(3);
    el.current.style.transform = `scale(${scale.toFixed(3)})`;
  });

  return (
    <group ref={group} visible={false}>
      <SceneHtml center zIndexRange={[30, 30]}>
        <div ref={el} data-lock-stamp="" aria-hidden="true" style={{ opacity: 0, filter: 'drop-shadow(0 10px 24px rgba(6,6,14,0.45))' }}>
          <LockGlyph size={SIZE} color="#7B2FBE" />
        </div>
      </SceneHtml>
    </group>
  );
}
