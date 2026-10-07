'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { HomeScreen, PHONE_SCREEN_PX } from '@/screens/phone/HomeScreen';
import { DeviceTag } from './DeviceTag';
import { isPortrait } from '@/motion/flags';

const BEZEL = 14;
const FRAME = { w: PHONE_SCREEN_PX.w + BEZEL * 2, h: PHONE_SCREEN_PX.h + BEZEL * 2 };

/**
 * CSS poster of the hero phone: shown while the 3D chunk loads, and as the
 * no-WebGL fallback (same copy, same screen). Sits where the 3D phone starts.
 */
export function PhonePoster({ visible }: { visible: boolean }) {
  const [scale, setScale] = useState(0);
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const fit = () => {
      const p = isPortrait();
      setPortrait(p);
      setScale(p ? (window.innerWidth * 0.92) / FRAME.w : (window.innerHeight * 0.78) / FRAME.h);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  if (!scale) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed z-0"
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4 }}
      style={
        portrait
          ? { left: '50%', top: '100%', x: '-50%', y: `-${FRAME.h * scale * 0.55}px` }
          : { left: '70%', top: '50%', x: '-50%', y: '-50%' }
      }
    >
      <div style={{ width: FRAME.w * scale, height: FRAME.h * scale }}>
        <div
          className="origin-top-left rounded-[56px] bg-[#1A1A22] shadow-[0_40px_120px_rgba(123,47,190,0.35)]"
          style={{ width: FRAME.w, height: FRAME.h, padding: BEZEL, transform: `scale(${scale})` }}
        >
          <HomeScreen owner="you" />
        </div>
      </div>
      {!portrait && (
        <div className="mt-4 flex justify-center">
          <DeviceTag owner="you" size="md" />
        </div>
      )}
    </motion.div>
  );
}
