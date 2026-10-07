'use client';

import { createContext, useContext, type ComponentProps, type RefObject } from 'react';
import { Html } from '@react-three/drei';

/** The DOM layer (inside the Stage's fixed wrapper) that every device screen portals into. */
export const HtmlLayerContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

/** drei <Html> pinned to the Stage's HTML layer. Use this instead of <Html> in scene components. */
export function SceneHtml(props: ComponentProps<typeof Html>) {
  const layer = useContext(HtmlLayerContext);
  return <Html pointerEvents="none" zIndexRange={[20, 0]} portal={layer as RefObject<HTMLElement>} {...props} />;
}
