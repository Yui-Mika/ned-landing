import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshStandardMaterial, Quaternion, Vector3, type Group } from 'three';
import type { MotionValue } from 'motion/react';
import { TIMELINE, seg } from '../motion/timeline';
import { CENTRE, HAND, MEMBERS, MEMBER_RADIUS } from './layout';

type Props = { vh: MotionValue<number> };

/** Simple, faceless figure: capsule body and round head. Abstract on purpose (works for both segments). */
function Figure({ material }: { material: MeshStandardMaterial }) {
  return (
    <group>
      <mesh position={[0, 0.8, 0]} material={material}>
        <capsuleGeometry args={[0.4, 0.72, 6, 16]} />
      </mesh>
      <mesh position={[0, 1.78, 0]} material={material}>
        <sphereGeometry args={[0.32, 24, 16]} />
      </mesh>
    </group>
  );
}

const ghost = (color: string, emissive: string, emissiveIntensity: number) =>
  new MeshStandardMaterial({ color, emissive, emissiveIntensity, roughness: 0.65, transparent: true, opacity: 0, depthWrite: false });

/**
 * Chapter 02: six members around one centre figure who holds everyone's coins.
 * Members appear as the camera pulls back (125–170 vh); the centre figure fades (244–300 vh),
 * leaving an empty spot that glows faintly: the hand-off to chapter 03's keyhole.
 */
export function Figures({ vh }: Props) {
  const centre = useRef<Group>(null);
  const mats = useMemo(
    () => ({
      member: ghost('#EDE7F6', '#3D1270', 0.5),
      centre: ghost('#F0E4FF', '#5A1D9E', 0.6),
      ring: new MeshStandardMaterial({ color: '#9B4FDE', emissive: '#9B4FDE', emissiveIntensity: 0.8, transparent: true, opacity: 0 }),
      spot: new MeshStandardMaterial({ color: '#F0E4FF', emissive: '#B87AED', emissiveIntensity: 1.4, transparent: true, opacity: 0 }),
    }),
    [],
  );

  // The centre figure's arm, from shoulder to the open hand (relative to the figure).
  const arm = useMemo(() => {
    const shoulder = new Vector3(CENTRE.x + 0.28, CENTRE.y + 1.3, CENTRE.z + 0.28);
    const wrist = new Vector3(HAND.x - 0.16, HAND.y - 0.04, HAND.z - 0.16);
    const dir = new Vector3().subVectors(wrist, shoulder);
    const length = dir.length();
    const mid = new Vector3().addVectors(shoulder, wrist).multiplyScalar(0.5).sub(CENTRE);
    const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize());
    return { length, mid, q };
  }, []);

  useFrame(() => {
    const v = vh.get();
    const t = TIMELINE.problem;
    const membersIn = seg(v, t.membersIn);
    const centreIn = seg(v, [100, 150]);
    const fade = seg(v, t.centreFade);

    mats.member.opacity = 0.34 * membersIn;
    mats.centre.opacity = 0.42 * centreIn * (1 - fade);
    mats.ring.opacity = 0.3 * membersIn;
    mats.spot.opacity = 0.9 * seg(v, [286, 330]);
    if (centre.current) {
      centre.current.position.set(CENTRE.x, CENTRE.y - fade * 0.4, CENTRE.z);
      centre.current.visible = centreIn > 0.001 && fade < 0.999;
    }
  });

  return (
    <group>
      {MEMBERS.map((m, i) => (
        <group key={i} position={m}>
          <Figure material={mats.member} />
        </group>
      ))}

      <group ref={centre} position={CENTRE}>
        <Figure material={mats.centre} />
        <mesh position={arm.mid} quaternion={arm.q} material={mats.centre}>
          <capsuleGeometry args={[0.1, arm.length, 4, 10]} />
        </mesh>
      </group>

      {/* The ring the members stand on. */}
      <mesh position={[CENTRE.x, CENTRE.y + 0.01, CENTRE.z]} rotation={[-Math.PI / 2, 0, 0]} material={mats.ring}>
        <ringGeometry args={[MEMBER_RADIUS - 0.02, MEMBER_RADIUS + 0.02, 96]} />
      </mesh>

      {/* The empty spot left behind; chapter 03 turns it into a keyhole. */}
      <mesh position={[CENTRE.x, CENTRE.y + 0.02, CENTRE.z]} rotation={[-Math.PI / 2, 0, 0]} material={mats.spot}>
        <ringGeometry args={[0.46, 0.52, 64]} />
      </mesh>
    </group>
  );
}
