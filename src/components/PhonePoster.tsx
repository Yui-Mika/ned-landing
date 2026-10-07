'use client';

import { useEffect } from 'react';
import { motion, useAnimationControls } from 'motion/react';
import { useReducedMotionSafe } from '@/motion/flags';
import { PHONE_SCREEN_PX } from '@/screens/phone/size';
import { PhoneScreenView } from '@/screens/phone/PhoneScreenView';
import { DeviceTag } from './DeviceTag';
import { useIntro } from '@/motion/intro';
import { EASE_OUT, intro } from '@/motion/tokens';

const BEZEL = 16;
const FRAME = { w: PHONE_SCREEN_PX.w + BEZEL * 2, h: PHONE_SCREEN_PX.h + BEZEL * 2 };

type Props = {
  /** The 3D phone has drawn its first frame: hand over to it. */
  stageReady: boolean;
};

/**
 * CSS/SVG poster of the hero phone. Sized in pure CSS (SVG viewBox), so it also shows with no JS.
 * Positioned in the hero (absolute, not fixed), so without JS / WebGL it scrolls away with the hero
 * instead of covering later chapters.
 * With JS: hidden until the hero intro is done (§16.1, no flash of a phone), then it enters like the
 * 3D phone, and fades out once the 3D phone takes over (or stays when there is no WebGL).
 */
export function PhonePoster({ stageReady }: Props) {
  const { phase } = useIntro();
  const reduced = useReducedMotionSafe();
  const controls = useAnimationControls();
  const show = phase === 'done' && !stageReady;

  useEffect(() => {
    // Inline hidden state on mount (the CSS guard covers the time before hydration).
    if (phase !== 'done') {
      controls.set(reduced ? { opacity: 0 } : { opacity: 0, y: intro.phone.rise, scale: intro.phone.scaleFrom });
      return;
    }
    if (show) {
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: (reduced ? intro.reducedFade : intro.phone.duration) / 1000, ease: EASE_OUT },
      });
    } else {
      controls.start({ opacity: 0, transition: { duration: 0.3 } });
    }
  }, [phase, show, reduced, controls]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-[calc(100svh-92vw*0.95)] left-1/2 z-0 -translate-x-1/2 md:top-[50svh] md:left-[70%] md:-translate-y-1/2 portrait:max-lg:top-[calc(100svh-92vw*0.95)] portrait:max-lg:translate-y-0"
    >
      <motion.div data-intro="" data-phone-poster="" animate={controls} className="flex flex-col items-center gap-4">
        <svg
          viewBox={`0 0 ${FRAME.w} ${FRAME.h}`}
          className="h-auto w-[92vw] md:h-[74svh] md:w-auto portrait:max-lg:h-auto portrait:max-lg:w-[92vw]"
        >
          <rect width={FRAME.w} height={FRAME.h} rx={60} fill="#1A1A22" />
          <foreignObject x={BEZEL} y={BEZEL} width={PHONE_SCREEN_PX.w} height={PHONE_SCREEN_PX.h}>
            <PhoneScreenView screen="home" owner="you" />
          </foreignObject>
        </svg>
        <div className="hidden md:block portrait:max-lg:hidden">
          <DeviceTag owner="you" size="md" />
        </div>
      </motion.div>
    </div>
  );
}
