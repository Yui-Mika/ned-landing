import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import type { Group, MeshPhysicalMaterial, MeshStandardMaterial } from 'three';
import type { MotionValue } from 'motion/react';
import { TIMELINE, easeIn, seg } from '../motion/timeline';
import { fundPosition } from './layout';

type Props = { vh: MotionValue<number>; reduced: boolean };

/**
 * The Fund: a translucent purple, rounded, safe-like object (never named a safe on screen).
 * Chapter 01: floats and turns slowly. 50–92 vh: dissolves outward while its coins fall to a hand.
 */
export function Fund({ vh, reduced }: Props) {
  const group = useRef<Group>(null);
  const shell = useRef<MeshPhysicalMaterial>(null);
  const inner = useRef<MeshStandardMaterial>(null);
  const dial = useRef<MeshStandardMaterial>(null);
  const knob = useRef<Group>(null);
  const size = useThree((s) => s.size);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const v = vh.get();
    const portrait = size.width / Math.max(1, size.height) < 0.85;
    const home = fundPosition(portrait);
    const t = state.clock.elapsedTime;
    const d = easeIn(seg(v, TIMELINE.hero.fundDissolve));

    g.visible = d < 0.999;
    g.position.set(home.x, home.y + (reduced ? 0 : Math.sin(t * 0.8) * 0.08), home.z);
    g.rotation.y = reduced ? -0.35 : -0.35 + Math.sin(t * 0.25) * 0.25;
    g.rotation.x = reduced ? 0.05 : Math.sin(t * 0.3) * 0.05;
    g.scale.setScalar(1 + d * 0.18);

    if (shell.current) shell.current.opacity = 0.62 * (1 - d);
    if (inner.current) inner.current.opacity = 0.18 * (1 - d);
    if (dial.current) dial.current.opacity = 1 - d;
    if (knob.current) knob.current.rotation.z = reduced ? 0 : t * 0.2;
  });

  return (
    <group ref={group}>
      <RoundedBox args={[2.1, 2.35, 1.6]} radius={0.42} smoothness={5}>
        <meshPhysicalMaterial
          ref={shell}
          color="#7B2FBE"
          emissive="#3D1270"
          emissiveIntensity={0.55}
          roughness={0.22}
          metalness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.15}
          transparent
          opacity={0.62}
          depthWrite={false}
        />
      </RoundedBox>
      <RoundedBox args={[1.72, 1.96, 0.02]} radius={0.28} smoothness={4} position={[0, 0, 0.81]}>
        <meshStandardMaterial ref={inner} color="#F0E4FF" transparent opacity={0.18} depthWrite={false} />
      </RoundedBox>
      <group ref={knob} position={[0, 0.12, 0.84]}>
        <mesh>
          <torusGeometry args={[0.32, 0.035, 12, 48]} />
          <meshStandardMaterial ref={dial} color="#D4B5F7" emissive="#B87AED" emissiveIntensity={0.9} transparent />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos((i * Math.PI) / 2) * 0.42, Math.sin((i * Math.PI) / 2) * 0.42, 0]}>
            <boxGeometry args={[0.04, 0.04, 0.02]} />
            <meshStandardMaterial color="#D4B5F7" emissive="#B87AED" emissiveIntensity={0.9} />
          </mesh>
        ))}
        <mesh>
          <circleGeometry args={[0.08, 24]} />
          <meshStandardMaterial color="#D4B5F7" emissive="#B87AED" emissiveIntensity={1.2} />
        </mesh>
      </group>
    </group>
  );
}
