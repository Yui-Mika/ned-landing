'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { spring } from '@/motion/tokens';

const DEG = Math.PI / 180;
const MAX_YAW = 35 * DEG;
const MAX_PITCH = 15 * DEG;
const RAD_PER_PX = 0.006;
const CLICK_PX = 6;
const HOVER_TILT = 6 * DEG;

type Spring = { x: number; v: number };

/** Semi-implicit Euler, fixed 1/240 s substeps so the feel doesn't depend on frame rate. */
function stepSpring(s: Spring, target: number, cfg: { stiffness: number; damping: number }, dt: number) {
  const h = 1 / 240;
  for (let t = Math.min(dt, 0.1); t > 0; t -= h) {
    const step = Math.min(h, t);
    s.v += (-cfg.stiffness * (s.x - target) - cfg.damping * s.v) * step;
    s.x += s.v * step;
  }
}

const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

/**
 * Hero phone interaction (SPEC §5.2): drag to rotate (±35° yaw, ±15° pitch, snap back on release),
 * click/tap to flip to the other party's phone (T2), hover tilts toward the cursor.
 * All offsets are added on top of the scroll pose; the pose itself is never changed.
 */
export function usePhoneInteraction({ reduced, enabled }: { reduced: boolean; enabled: boolean }) {
  const [interacted, setInteracted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [flips, setFlips] = useState(0); // target flip angle = flips × 2π (each flip is one full T2 turn)

  const s = useRef({
    dragging: false,
    start: { x: 0, y: 0 },
    moved: 0,
    dragYaw: 0,
    dragPitch: 0,
    hoverYaw: 0,
    hoverPitch: 0,
    yaw: { x: 0, v: 0 } as Spring,
    pitch: { x: 0, v: 0 } as Spring,
    flip: { x: 0, v: 0 } as Spring,
  }).current;

  const flipsRef = useRef(0);
  flipsRef.current = flips;

  // Leaving the hero: spin back to the story owner.
  useEffect(() => {
    if (!enabled && flips % 2 === 1) setFlips((f) => f + 1);
  }, [enabled, flips]);

  // While dragging on touch, stop the page from scrolling under the finger.
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (s.dragging) e.preventDefault();
    };
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => window.removeEventListener('touchmove', onTouchMove);
  }, [s]);

  useEffect(() => {
    document.body.style.cursor = enabled && hovered ? 'grab' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered, enabled]);

  const handlers = useMemo(() => {
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - s.start.x;
      const dy = e.clientY - s.start.y;
      s.moved = Math.max(s.moved, Math.hypot(dx, dy));
      s.dragYaw = clamp(dx * RAD_PER_PX, MAX_YAW);
      s.dragPitch = clamp(dy * RAD_PER_PX, MAX_PITCH);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      s.dragging = false;
      s.dragYaw = 0;
      s.dragPitch = 0;
      document.body.style.cursor = '';
      if (s.moved < CLICK_PX) setFlips((f) => f + 1);
      setInteracted(true);
    };
    return {
      onPointerDown: (e: ThreeEvent<PointerEvent>) => {
        if (!enabled) return;
        e.stopPropagation();
        s.dragging = true;
        s.moved = 0;
        s.start = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
        document.body.style.cursor = 'grabbing';
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
      },
      onPointerOver: () => setHovered(true),
      onPointerOut: () => setHovered(false),
    };
  }, [enabled, s]);

  /**
   * Call once per frame. `pointer` is the cursor in NDC; `anchor` is the phone centre in NDC.
   * Returns rotation offsets in radians.
   */
  function step(dt: number, pointer: { x: number; y: number }, anchor: { x: number; y: number }) {
    const tiltOn = hovered && !s.dragging && enabled && !reduced;
    s.hoverYaw = tiltOn ? clamp((pointer.x - anchor.x) * 0.6, HOVER_TILT) : 0;
    s.hoverPitch = tiltOn ? clamp(-(pointer.y - anchor.y) * 0.6, HOVER_TILT) : 0;

    stepSpring(s.yaw, s.dragYaw + s.hoverYaw, spring.snap, dt);
    stepSpring(s.pitch, s.dragPitch + s.hoverPitch, spring.snap, dt);

    const flipTarget = flipsRef.current * Math.PI * 2;
    if (reduced) {
      s.flip.x = flipTarget; // hard cut, no spin
      s.flip.v = 0;
    } else {
      stepSpring(s.flip, flipTarget, spring.soft, dt);
    }
    return { yaw: s.yaw.x, pitch: s.pitch.x, flip: s.flip.x };
  }

  return { handlers, step, hovered: hovered && enabled, interacted, flips };
}
