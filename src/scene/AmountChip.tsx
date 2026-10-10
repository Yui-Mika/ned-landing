'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollVh } from '@/motion/scroll';
import { copy } from '@/content/copy';
import { easeFn } from '@/motion/tokens';
import { FONT } from '@/screens/phone/parts';
import { ch07ChipAt } from './poses';
import { focusWorld } from './focus';
import { SceneHtml } from './htmlLayer';
import { stageViewport } from './viewport';

const c = copy.release.chip;
/** SPEC §4: blue for $ / USDC moments, green for ₫ / VND moments (tokens --color-usdc / --color-vnd). */
const COLOR = { usdc: '#60A5FA', vnd: '#34D399' };
/** The morph shows the USDC text up to here, then the VND figure counts up (rounded to 10,000 like the boards). */
const SWITCH = 0.4;

const grp = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
function chipText(morph: number) {
  if (morph < SWITCH) return c.usdc;
  const k = easeFn.easeOut((morph - SWITCH) / (1 - SWITCH));
  return c.vndPrefix + grp(Math.max(10000, Math.round((c.vnd * k) / 10000) * 10000)) + c.vndUnit;
}

/**
 * Chapter 07: the amount chip (SPEC §4, the one chip that crosses between the two phones). A plain landing-layer chip,
 * not part of any board: it appears over the client's receipt amount, arcs over the seam of the T3 Split and settles
 * on your receipt amount, while "$ 250 USDC" becomes "≈ 6,500,000 VND". A soft purple glow sits behind it. Everything
 * is a pure function of scroll (ch07ChipAt); no particles. Reduced motion: cuts, no travel.
 */
export function AmountChip({ reduced, portrait = false }: { reduced: boolean; portrait?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const el = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), p: new THREE.Vector3() }), []);

  useFrame((state) => {
    if (!group.current || !el.current || !text.current) return;
    const chip = ch07ChipAt(scrollVh.get(), reduced);
    const okA = chip && focusWorld('rel-amount-client', tmp.a);
    const okB = chip && focusWorld('rel-amount-you', tmp.b);
    const visible = !!chip && chip.opacity > 0.001 && !!okA && !!okB;
    group.current.visible = visible;
    if (!visible || !chip) {
      if (el.current.style.opacity !== '0') el.current.style.opacity = '0';
      return;
    }
    // Arc over the seam, a little toward the camera so it passes in front of both phones.
    const vp = stageViewport(state);
    const arc = Math.sin(Math.PI * chip.travel);
    group.current.position.lerpVectors(tmp.a, tmp.b, chip.travel);
    group.current.position.y += arc * vp.height * 0.12;
    group.current.position.z += arc * 0.5 + 0.05;

    if (portrait) {
      // Mobile layout pass: never past 12 px from the side edges (14 px: room for the projection; the right phone sits near the edge).
      const w = state.size.width;
      const half = (el.current.offsetWidth * chip.scale) / 2;
      tmp.p.copy(group.current.position).project(state.camera);
      const px = ((tmp.p.x + 1) / 2) * w;
      const want = Math.min(w - 14 - half, Math.max(14 + half, px));
      const atZ = state.viewport.getCurrentViewport(state.camera, [state.camera.position.x, state.camera.position.y, group.current.position.z]);
      group.current.position.x += ((want - px) * atZ.width) / w;
    }
    el.current.style.opacity = chip.opacity.toFixed(3);
    el.current.style.transform = `scale(${chip.scale.toFixed(3)})`;
    const t = chipText(chip.morph);
    if (text.current.textContent !== t) {
      text.current.textContent = t;
      text.current.style.color = chip.morph < SWITCH ? COLOR.usdc : COLOR.vnd;
    }
  });

  return (
    <group ref={group} visible={false}>
      <SceneHtml center zIndexRange={[30, 30]}>
        <div ref={el} data-amount-chip="" aria-hidden="true" style={{ opacity: 0, position: 'relative' }}>
          {/* Soft purple glow (landing layer). */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 280,
              height: 150,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(closest-side, rgba(184,122,237,0.55), rgba(123,47,190,0.18) 55%, rgba(6,6,14,0) 100%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'relative',
              height: 44,
              padding: '0 18px',
              display: 'inline-flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              borderRadius: 9999,
              background: '#16161D',
              border: '1px solid rgba(184,122,237,0.45)',
              boxShadow: '0 14px 34px rgba(0,0,0,0.4)',
              fontFamily: FONT.mono,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            <span ref={text} style={{ color: COLOR.usdc }}>
              {c.usdc}
            </span>
          </div>
        </div>
      </SceneHtml>
    </group>
  );
}
