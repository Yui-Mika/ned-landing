import * as THREE from 'three';
import { PHONE_SCREEN_PX } from '@/screens/phone/size';
import { PANEL_CROP, PANEL_SCALE } from '@/screens/web/WebWalletPanel';
import { laptopLive, PX_PER_UNIT as LAPTOP_PX_PER_UNIT } from './Laptop';
import { focusWorld } from './focus';

const tmp = { up: new THREE.Vector3(), n: new THREE.Vector3() };
/** The panel's app view (CSS px) crops the screen's top: the screen's centre sits this far above the view's centre. */
const VIEW_H = Math.round((PHONE_SCREEN_PX.h - PANEL_CROP) * PANEL_SCALE);
const SHIFT_PX = VIEW_H / 2 - (PHONE_SCREEN_PX.h / 2 - PANEL_CROP) * PANEL_SCALE;

/**
 * T4 Dock target (SPEC §5.3, desktop): the phone placed so that it *is* the wallet panel. Its screen is centred on
 * the panel's app screen (data-focus="wallet-view"), at the laptop screen's angle, scaled so the phone screen is as
 * wide as the panel's (390 × 86% CSS px), and just in front of the laptop screen.
 * `screenW` / `bodyD`: the phone's screen width and body depth at scale 1 (world units).
 * Writes position and rotation; returns the phone's scale, or null while the panel isn't there.
 */
export function dockTarget(screenW: number, bodyD: number, pos: THREE.Vector3, quat: THREE.Quaternion): number | null {
  const anchor = laptopLive.anchor;
  if (!anchor || laptopLive.scale <= 0 || !focusWorld('wallet-view', pos)) return null;
  anchor.getWorldQuaternion(quat);
  const pxToWorld = laptopLive.scale / LAPTOP_PX_PER_UNIT;
  const scale = (PHONE_SCREEN_PX.w * PANEL_SCALE * pxToWorld) / screenW;
  tmp.up.set(0, 1, 0).applyQuaternion(quat);
  tmp.n.set(0, 0, 1).applyQuaternion(quat);
  pos.addScaledVector(tmp.up, SHIFT_PX * pxToWorld).addScaledVector(tmp.n, (bodyD / 2) * scale + 0.002);
  return scale;
}
