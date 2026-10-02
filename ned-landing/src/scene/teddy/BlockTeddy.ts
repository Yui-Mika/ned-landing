import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  TorusGeometry,
  type BufferGeometry,
  type Material,
} from 'three';
import { CLIP_FADE } from '../../motion/tokens';
import { TEDDY_HEIGHT } from '../world';
import { blank, copyPose, mix, poseOf, type Pose } from './poses';
import type { ClipName, ClipRequest, Role, TeddyRig } from './types';

/**
 * Placeholder Teddy made of blocks, on purpose: it stands in for the team's model until it arrives
 * and must never be mistaken for final art. Same node names as the model spec (head, hand sockets,
 * acc_client / acc_freelancer), same clip names, same TeddyRig interface.
 */
export class BlockTeddy implements TeddyRig {
  readonly root = new Group();
  readonly headAnchor = new Object3D();
  readonly handSocket = new Object3D();
  private inner = new Group();
  private head = new Group();
  private armL = new Group();
  private armR = new Group();
  private legL = new Group();
  private legR = new Group();
  private eyes: Mesh[] = [];
  private materials: MeshStandardMaterial[] = [];
  private geometries: BufferGeometry[] = [];
  private current: ClipName | null = null;
  private from: Pose = blank();
  private target: Pose = blank();
  private out: Pose = blank();
  private fade = 1;
  private yaw = 0;
  private pitch = 0;
  private blinkIn = 2 + Math.random() * 3;
  private blinkT = -1;

  constructor(readonly role: Role) {
    const fur = this.mat(0x7236b4, 0.75);
    const furDark = this.mat(0x5a2494, 0.8);
    const cream = this.mat(0xf2e6e2, 0.85);
    const black = this.mat(0x111111, 0.3);

    this.root.name = `teddy_${role}`;
    this.root.add(this.inner);
    const scale = TEDDY_HEIGHT / 1.95;
    this.inner.scale.setScalar(scale);

    // Legs on hip pivots.
    for (const [g, x] of [
      [this.legL, -0.22],
      [this.legR, 0.22],
    ] as const) {
      g.position.set(x, 0.36, 0);
      g.add(this.box(0.27, 0.36, 0.3, fur, 0, -0.18, 0));
      this.inner.add(g);
    }

    // Body and belly.
    this.inner.add(this.box(0.95, 0.86, 0.72, fur, 0, 0.78, 0));
    this.inner.add(this.box(0.6, 0.56, 0.04, cream, 0, 0.74, 0.37));

    // Arms on shoulder pivots; the paw is the hand.
    for (const [g, x] of [
      [this.armL, -0.56],
      [this.armR, 0.56],
    ] as const) {
      g.position.set(x, 1.08, 0);
      g.add(this.box(0.22, 0.56, 0.24, fur, 0, -0.26, 0));
      g.add(this.box(0.24, 0.16, 0.26, cream, 0, -0.58, 0));
      this.inner.add(g);
    }

    // Head on a neck pivot.
    this.head.name = 'head';
    this.head.position.set(0, 1.18, 0);
    this.inner.add(this.head);
    this.head.add(this.box(1.0, 0.78, 0.8, fur, 0, 0.38, 0));
    for (const x of [-0.38, 0.38]) {
      this.head.add(this.box(0.26, 0.26, 0.14, fur, x, 0.84, -0.05));
      this.head.add(this.box(0.14, 0.14, 0.02, furDark, x, 0.84, 0.03));
    }
    for (const x of [-0.2, 0.2]) {
      const eye = this.box(0.09, 0.11, 0.03, black, x, 0.48, 0.41);
      this.eyes.push(eye);
      this.head.add(eye);
    }
    this.head.add(this.box(0.17, 0.1, 0.08, black, 0, 0.31, 0.42));
    // Mustache: two bars with lifted outer ends, a nod to the glyph.
    const stacheL = this.box(0.32, 0.075, 0.05, black, -0.16, 0.2, 0.425);
    stacheL.rotation.z = -0.3;
    const stacheR = this.box(0.32, 0.075, 0.05, black, 0.16, 0.2, 0.425);
    stacheR.rotation.z = 0.3;
    this.head.add(stacheL, stacheR);

    // Role accessories (node names match the model spec).
    const accClient = new Group();
    accClient.name = 'acc_client';
    const navy = this.mat(0x1e3a8a, 0.5);
    const white = this.mat(0xf0e4ff, 0.6);
    accClient.add(this.box(0.4, 0.06, 0.03, white, 0, 1.17, 0.36));
    accClient.add(this.box(0.12, 0.09, 0.04, navy, 0, 1.11, 0.38));
    accClient.add(this.box(0.11, 0.38, 0.03, navy, 0, 0.88, 0.38));
    accClient.visible = role === 'client';
    this.inner.add(accClient);

    const accFreelancer = new Group();
    accFreelancer.name = 'acc_freelancer';
    const lilac = this.mat(0xd4b5f7, 0.5);
    const cup = this.mat(0x2a2238, 0.5);
    const bandGeo = new TorusGeometry(0.55, 0.045, 8, 24, Math.PI);
    this.geometries.push(bandGeo);
    const band = new Mesh(bandGeo, lilac);
    band.position.set(0, 0.42, 0);
    accFreelancer.add(band);
    for (const x of [-0.54, 0.54]) accFreelancer.add(this.box(0.14, 0.26, 0.26, cup, x, 0.4, 0));
    accFreelancer.visible = role === 'freelancer';
    this.head.add(accFreelancer);

    // Sockets.
    this.headAnchor.position.set(0, TEDDY_HEIGHT + 0.25, 0);
    this.handSocket.position.set(0, 0.86 * scale + 0.05, 0.62);
    this.root.add(this.headAnchor, this.handSocket);
  }

  private mat(color: number, roughness: number) {
    const m = new MeshStandardMaterial({ color, roughness, metalness: 0 });
    this.materials.push(m);
    return m;
  }

  private box(w: number, h: number, d: number, m: Material, x: number, y: number, z: number) {
    const g = new BoxGeometry(w, h, d);
    this.geometries.push(g);
    const mesh = new Mesh(g, m);
    mesh.position.set(x, y, z);
    return mesh;
  }

  play(req: ClipRequest, dt: number, still: boolean) {
    if (req.clip !== this.current) {
      copyPose(this.out, this.from);
      this.current = req.clip;
      this.fade = still ? 1 : 0;
    }
    poseOf(req.clip, req.time, req.scrub, still, this.target);
    this.fade = Math.min(1, this.fade + dt / CLIP_FADE);
    const p = mix(this.from, this.target, this.fade, this.out);

    this.armL.rotation.set(-p.armL.fwd, 0, -p.armL.out);
    this.armR.rotation.set(-p.armR.fwd, 0, p.armR.out);
    this.legL.rotation.x = p.legL;
    this.legR.rotation.x = p.legR;
    this.head.rotation.set(p.head.x + this.pitch, p.head.y + this.yaw, p.head.z);
    this.inner.position.y = p.lift;
    this.inner.rotation.x = p.lean;

    // Blink every 3–6 s, unless still.
    let lid = 1;
    if (!still) {
      this.blinkIn -= dt;
      if (this.blinkIn <= 0 && this.blinkT < 0) this.blinkT = 0;
      if (this.blinkT >= 0) {
        this.blinkT += dt;
        lid = this.blinkT < 0.08 ? 1 - this.blinkT / 0.08 : this.blinkT < 0.16 ? (this.blinkT - 0.08) / 0.08 : 1;
        if (this.blinkT >= 0.16) {
          this.blinkT = -1;
          this.blinkIn = 3 + Math.random() * 3;
        }
      }
    }
    for (const e of this.eyes) e.scale.y = Math.max(0.1, p.eyes * lid);
  }

  look(yaw: number, pitch: number) {
    this.yaw = yaw;
    this.pitch = pitch;
  }

  setOpacity(o: number) {
    this.root.visible = o > 0.01;
    for (const m of this.materials) {
      m.opacity = o;
      const t = o < 0.999;
      if (m.transparent !== t) {
        m.transparent = t;
        m.needsUpdate = true;
      }
      m.depthWrite = !t;
    }
  }

  dispose() {
    this.geometries.forEach((g) => g.dispose());
    this.materials.forEach((m) => m.dispose());
  }
}
