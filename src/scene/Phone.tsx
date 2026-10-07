'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { scrollVh } from '@/motion/scroll';
import { CAMERA_LAMBDA, easeFn, intro } from '@/motion/tokens';
import { entranceProgress } from '@/motion/intro';
import { copy } from '@/content/copy';
import { DeviceTag, OWNER_COLOR } from '@/components/DeviceTag';
import { PHONE_SCREEN_PX } from '@/screens/phone/HomeScreen';
import { PhoneScreenView } from '@/screens/phone/PhoneScreenView';
import { samplePose, tracks, type Owner, type PhoneScreen, type TrackName } from './poses';
import { usePhoneInteraction } from './usePhoneInteraction';
import { SceneHtml } from './htmlLayer';

/** Generic phone body in world units (no real brand shape). */
export const BODY = { w: 0.96, h: 2.0, d: 0.1, r: 0.12 };
/** CSS px per world unit on the screen: the 390 px wide app screen fills 0.88 units (bezel 0.04 each side). */
const PX_PER_UNIT = PHONE_SCREEN_PX.w / 0.88;
const SCREEN = { w: PHONE_SCREEN_PX.w / PX_PER_UNIT, h: PHONE_SCREEN_PX.h / PX_PER_UNIT, r: 48 / PX_PER_UNIT };
const DEG = Math.PI / 180;
/** Drag, flip and hover are live only in the hero, before the T1 glide starts. */
const INTERACTIVE_UNTIL_VH = 100;

type Person = Exclude<Owner, 'anyone'>;
const other = (o: Person): Person => (o === 'you' ? 'client' : 'you');

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return new THREE.ShapeGeometry(s, 8);
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

type Props = {
  reduced: boolean;
  portrait: boolean;
  /** Which poses-table track drives this phone ('phoneB' = the second phone of a T3 Split). */
  track?: TrackName;
  /** Hero drag / flip / hover and the "Drag me" hint (your phone only). */
  interactive?: boolean;
};

export function Phone({ reduced, portrait, track = 'phone', interactive = true }: Props) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const frontEl = useRef<HTMLDivElement>(null);
  const backEl = useRef<HTMLDivElement>(null);
  const tagEl = useRef<HTMLDivElement>(null);
  const hintEl = useRef<HTMLDivElement>(null);
  const toEl = useRef<HTMLDivElement>(null);
  const dimEl = useRef<HTMLDivElement>(null);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  const glowBase = useRef(0.28);

  const [inHero, setInHero] = useState(true);
  // Hero intro (§16): hidden until the sweep ends; drag / flip only once the entrance has finished.
  const [entered, setEntered] = useState(false);
  const { handlers, step, hovered, interacted, flips } = usePhoneInteraction({ reduced, enabled: interactive && inHero && entered });
  // Screen crossfade layers (from the poses table); state changes only when a switch starts or ends.
  const [layers, setLayers] = useState<{ from: PhoneScreen; to: PhoneScreen }>({ from: 'home', to: 'home' });
  const firstFrameAt = useRef<number | null>(null);
  const fadeMats = useRef<{ mat: THREE.Material; base: number; transparent: boolean }[] | null>(null);

  // Story owner comes from the poses table; a click flips to the other party.
  const [storyOwner, setStoryOwner] = useState<Person>('you');
  const [frontFlips, setFrontFlips] = useState(0);
  const frontOwner = frontFlips % 2 ? other(storyOwner) : storyOwner;
  const backOwner = flips % 2 ? other(storyOwner) : storyOwner;

  const screenGeo = useMemo(() => roundedRect(SCREEN.w + 0.02, SCREEN.h + 0.02, SCREEN.r + 0.01), []);
  const glowTex = useMemo(() => glowTexture(), []);
  const colorTarget = useMemo(() => new THREE.Color(), []);
  useEffect(
    () => () => {
      screenGeo.dispose();
      glowTex.dispose();
    },
    [screenGeo, glowTex],
  );

  const tmp = useMemo(
    () => ({ q: new THREE.Quaternion(), n: new THREE.Vector3(), p: new THREE.Vector3(), ndc: new THREE.Vector3() }),
    [],
  );

  useFrame((state, dt) => {
    if (!outer.current || !inner.current) return;
    const vh = scrollVh.get();
    const pose = samplePose(portrait ? tracks[track].portrait : tracks[track].desktop, vh, reduced);
    const vp = state.viewport.getCurrentViewport(state.camera, [0, 0, 0]);

    // Intro entrance (§16.1): opacity 0 → 1, rises 24 px, scale 0.96 → 1 (reduced: 200 ms fade only).
    // If the 3D chunk arrives after the intro, the entrance starts from its first frame instead.
    const now = performance.now();
    firstFrameAt.current ??= now;
    const enterRaw = entranceProgress(now, reduced ? intro.reducedFade : intro.phone.duration, 0, firstFrameAt.current);
    const enter = reduced ? enterRaw : easeFn.easeOut(enterRaw);
    const companions = entranceProgress(now, reduced ? intro.reducedFade : intro.phone.duration, reduced ? 0 : intro.companionsDelay, firstFrameAt.current);
    if (enterRaw >= 1 && !entered) setEntered(true);
    const opacity = enter * pose.opacity;
    outer.current.visible = opacity > 0.001;

    // Pose → world.
    const pxToWorld = vp.height / state.size.height;
    const lift = reduced ? 0 : (1 - enter) * intro.phone.rise * pxToWorld;
    const grow = reduced ? 1 : intro.phone.scaleFrom + (1 - intro.phone.scaleFrom) * enter;
    const scale = (portrait ? (pose.size * vp.width) / BODY.w : (pose.size * vp.height) / BODY.h) * grow;
    outer.current.position.set((pose.position[0] * vp.width) / 2, (pose.position[1] * vp.height) / 2 - lift, pose.position[2]);
    outer.current.scale.setScalar(scale);

    // Fade every material with the entrance (glow handled below). Opaque again once fully in.
    if (!fadeMats.current) {
      fadeMats.current = [];
      inner.current.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.Material | undefined;
        if (m) fadeMats.current!.push({ mat: m, base: m.opacity, transparent: m.transparent });
      });
    }
    for (const f of fadeMats.current) {
      const fading = opacity < 0.999;
      if (f.mat.transparent !== (fading || f.transparent)) {
        f.mat.transparent = fading || f.transparent;
        f.mat.needsUpdate = true;
      }
      f.mat.opacity = f.base * opacity;
    }
    for (const el of [frontEl.current, tagEl.current, backEl.current]) if (el) el.style.opacity = String(opacity);

    // Screen crossfade and dim, straight from the pose.
    if (pose.screenFrom !== layers.from || pose.screenTo !== layers.to) setLayers({ from: pose.screenFrom, to: pose.screenTo });
    if (toEl.current) toEl.current.style.opacity = String(pose.screenMix);
    if (dimEl.current) dimEl.current.style.opacity = String(pose.dim);

    // Interaction offsets on top of the pose.
    tmp.ndc.copy(outer.current.position).project(state.camera);
    const o = step(dt, state.pointer, tmp.ndc);
    inner.current.rotation.set(pose.rotation[0] * DEG + o.pitch, pose.rotation[1] * DEG + o.yaw + o.flip, pose.rotation[2] * DEG);

    // Which side faces the camera? Swap the visible face; the front owner changes while the back is showing.
    inner.current.getWorldQuaternion(tmp.q);
    tmp.n.set(0, 0, 1).applyQuaternion(tmp.q);
    inner.current.getWorldPosition(tmp.p);
    const facing = tmp.n.dot(tmp.p.subVectors(state.camera.position, tmp.p)) > 0;
    if (frontEl.current) frontEl.current.style.visibility = facing ? 'visible' : 'hidden';
    if (tagEl.current) tagEl.current.style.visibility = facing ? 'visible' : 'hidden';
    if (backEl.current) backEl.current.style.visibility = facing ? 'hidden' : 'visible';
    const turns = Math.round(o.flip / (Math.PI * 2));
    if (turns !== frontFlips) setFrontFlips(turns);

    const p = pose.owner === 'anyone' ? 'you' : pose.owner;
    if (p !== storyOwner) setStoryOwner(p);
    const hero = vh < INTERACTIVE_UNTIL_VH;
    if (hero !== inHero) setInHero(hero);

    // Glow in the owner colour, brighter on hover.
    if (glowMat.current) {
      colorTarget.set(OWNER_COLOR[facing ? frontOwner : backOwner]);
      glowMat.current.color.lerp(colorTarget, 1 - Math.exp(-CAMERA_LAMBDA * dt));
      glowBase.current = THREE.MathUtils.damp(glowBase.current, hovered ? 0.55 : 0.28, CAMERA_LAMBDA, dt);
      glowMat.current.opacity = glowBase.current * opacity * (1 - pose.dim);
    }

    // Hint enters with Teddy, just after the phone; fades after the first interaction or with scroll.
    if (hintEl.current) {
      const fade = interacted ? 0 : Math.max(0, 1 - vh / 40);
      hintEl.current.style.opacity = String(fade * companions * pose.opacity);
    }
  });

  return (
    <group ref={outer}>
      {/* Soft glow behind the phone */}
      <mesh position={[0, 0, -0.35]} scale={[BODY.w * 3, BODY.h * 1.9, 1]}>
        <planeGeometry />
        <meshBasicMaterial
          ref={glowMat}
          map={glowTex}
          color={OWNER_COLOR.you}
          transparent
          opacity={0.28}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <group ref={inner}>
        {/* Body: six faces with visible thickness */}
        <RoundedBox args={[BODY.w, BODY.h, BODY.d]} radius={BODY.r * 0.5} smoothness={5} {...(interactive ? handlers : {})}>
          <meshStandardMaterial color="#1A1A22" metalness={0.75} roughness={0.32} />
        </RoundedBox>
        {/* Side buttons */}
        <mesh position={[BODY.w / 2 + 0.004, 0.42, 0]}>
          <boxGeometry args={[0.012, 0.26, 0.04]} />
          <meshStandardMaterial color="#2A2A34" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-BODY.w / 2 - 0.004, 0.5, 0]}>
          <boxGeometry args={[0.012, 0.14, 0.04]} />
          <meshStandardMaterial color="#2A2A34" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Front glass + real HTML screen */}
        <mesh geometry={screenGeo} position={[0, 0, BODY.d / 2 + 0.001]}>
          <meshBasicMaterial color="#05050A" />
        </mesh>
        <SceneHtml transform distanceFactor={400 / PX_PER_UNIT} position={[0, 0, BODY.d / 2 + 0.003]}>
          <div ref={frontEl} data-phone-front={track} className="relative" style={{ opacity: 0 }}>
            <PhoneScreenView key={layers.from} screen={layers.from} owner={frontOwner} />
            {layers.to !== layers.from && (
              <div key={layers.to} ref={toEl} className="absolute inset-0" style={{ opacity: 0 }}>
                <PhoneScreenView screen={layers.to} owner={frontOwner} />
              </div>
            )}
            {/* Dim (landing layer, over the screen): "both dim" in chapter 01. */}
            <div ref={dimEl} aria-hidden="true" className="absolute inset-0 rounded-[48px] bg-black" style={{ opacity: 0 }} />
          </div>
        </SceneHtml>

        {/* Owner tag under (desktop) or above (portrait) the phone */}
        <SceneHtml
          transform
          distanceFactor={1}
          position={portrait ? [-BODY.w / 2 + 0.24, BODY.h / 2 + 0.09, BODY.d / 2] : [0, -BODY.h / 2 - 0.13, BODY.d / 2]}
        >
          <div ref={tagEl} style={{ opacity: 0 }}>
            <DeviceTag owner={frontOwner} size="md" />
          </div>
        </SceneHtml>

        {/* Back: owner tag (T2) */}
        <mesh geometry={screenGeo} position={[0, 0, -BODY.d / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
          <meshStandardMaterial color="#231537" metalness={0.5} roughness={0.45} />
        </mesh>
        <SceneHtml
          transform
          distanceFactor={1}
          position={[0, 0, -BODY.d / 2 - 0.003]}
          rotation={[0, Math.PI, 0]}
        >
          <div ref={backEl} style={{ visibility: 'hidden' }} className="flex flex-col items-center gap-6">
            <span className="font-display text-[44px] font-bold tracking-tight text-white/80">{copy.site.wordmark}</span>
            <DeviceTag owner={backOwner} size="lg" />
          </div>
        </SceneHtml>
      </group>

      {/* "Drag me" hint (right of the phone; above it on portrait). Fades after the first interaction. */}
      {interactive && (
        <SceneHtml position={portrait ? [BODY.w / 2 - 0.04, BODY.h / 2 + 0.09, BODY.d / 2] : [BODY.w / 2 + 0.12, -0.35, 0]}>
          <div
            ref={hintEl}
            data-phone-hint=""
            style={{ opacity: 0 }}
            className={`whitespace-nowrap font-mono text-[12px] tracking-wider text-muted uppercase ${portrait ? '-translate-x-full -translate-y-1/2 text-right' : '-translate-y-1/2'}`}
          >
            <span aria-hidden="true">{portrait ? '↓ ' : '← '}</span>
            {copy.hero.dragHint}
            <span className={portrait ? 'opacity-70' : 'block text-[11px] opacity-70'}>
              {portrait ? ' · ' : ''}
              {copy.hero.tapHint}
            </span>
          </div>
        </SceneHtml>
      )}
    </group>
  );
}
