import {
  AnimationMixer,
  Box3,
  Group,
  LoopOnce,
  LoopRepeat,
  Mesh,
  Object3D,
  Vector3,
  type AnimationAction,
  type AnimationClip,
  type Material,
} from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { CLIP_FADE } from '../../motion/tokens';
import { TEDDY_HEIGHT } from '../world';
import { CLIPS, type ClipName, type ClipRequest, type Role, type TeddyRig } from './types';

const LOOPING: ClipName[] = ['idle'];

/**
 * The team's model. Not used until config.TEDDY_MODEL_URL points at a .glb.
 * Expects the spec on the canvas board "Teddy 3D · what the model needs":
 * one rig, bones `head`, `hand_L`, `hand_R`, accessory nodes `acc_client` / `acc_freelancer`,
 * an optional `blink` morph target, and clips named exactly as in CLIPS. Missing clips fall back to idle.
 */
export class GltfTeddy implements TeddyRig {
  readonly root = new Group();
  readonly headAnchor = new Object3D();
  readonly handSocket = new Object3D();
  private mixer: AnimationMixer;
  private actions = new Map<ClipName, AnimationAction>();
  private current: AnimationAction | null = null;
  private headBone: Object3D | null = null;
  private hands: Object3D[] = [];
  private materials: Material[] = [];
  private blinkMeshes: { mesh: Mesh; index: number }[] = [];
  private yaw = 0;
  private pitch = 0;
  private applied = { yaw: 0, pitch: 0 };
  private blinkIn = 3;
  private blinkT = -1;
  private tmp = new Vector3();

  constructor(
    readonly role: Role,
    scene: Object3D,
    clips: AnimationClip[],
  ) {
    const model = cloneSkinned(scene);
    // Fit to the scene's Teddy height, feet on the ground.
    const box = new Box3().setFromObject(model);
    const h = Math.max(0.001, box.max.y - box.min.y);
    model.scale.setScalar(TEDDY_HEIGHT / h);
    model.position.y = -box.min.y * (TEDDY_HEIGHT / h);
    this.root.add(model);

    model.traverse((o) => {
      if (o.name === 'acc_client') o.visible = role === 'client';
      if (o.name === 'acc_freelancer') o.visible = role === 'freelancer';
      if (o.name === 'head') this.headBone = o;
      if (o.name === 'hand_L' || o.name === 'hand_R') this.hands.push(o);
      const mesh = o as Mesh;
      if (mesh.isMesh) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m, i) => {
          const c = m.clone();
          this.materials.push(c);
          if (Array.isArray(mesh.material)) mesh.material[i] = c;
          else mesh.material = c;
        });
        const index = mesh.morphTargetDictionary?.blink;
        if (index !== undefined) this.blinkMeshes.push({ mesh, index });
      }
    });

    this.mixer = new AnimationMixer(model);
    for (const name of CLIPS) {
      const clip = clips.find((c) => c.name === name);
      if (!clip) continue;
      const action = this.mixer.clipAction(clip);
      action.setLoop(LOOPING.includes(name) ? LoopRepeat : LoopOnce, Infinity);
      action.clampWhenFinished = true;
      this.actions.set(name, action);
    }

    this.headAnchor.position.set(0, TEDDY_HEIGHT + 0.25, 0);
    this.handSocket.position.set(0, TEDDY_HEIGHT * 0.5, 0.55);
    this.root.add(this.headAnchor, this.handSocket);
  }

  play(req: ClipRequest, dt: number, still: boolean) {
    const action = this.actions.get(req.clip) ?? this.actions.get('idle') ?? null;
    if (action && action !== this.current) {
      action.reset().play();
      if (this.current && !still) action.crossFadeFrom(this.current, CLIP_FADE, false);
      else if (this.current) this.current.stop();
      this.current = action;
    }
    if (action) {
      const d = action.getClip().duration;
      if (req.scrub !== undefined) action.time = req.scrub * d;
      else if (still) action.time = d * 0.5;
    }
    // Undo last frame's look offset first: a clip that doesn't animate the head would otherwise accumulate it.
    if (this.headBone) {
      this.headBone.rotation.y -= this.applied.yaw;
      this.headBone.rotation.x -= this.applied.pitch;
    }
    this.mixer.update(req.scrub !== undefined || still ? 0 : dt);
    if (this.headBone) {
      this.headBone.rotation.y += this.yaw;
      this.headBone.rotation.x += this.pitch;
      this.applied = { yaw: this.yaw, pitch: this.pitch };
    }
    // Hand socket follows the midpoint of the hand bones when they exist.
    if (this.hands.length === 2) {
      this.hands[0].getWorldPosition(this.tmp);
      const b = this.hands[1].getWorldPosition(new Vector3());
      this.tmp.add(b).multiplyScalar(0.5);
      this.root.worldToLocal(this.handSocket.position.copy(this.tmp));
    }
    // Blink.
    if (!still && this.blinkMeshes.length) {
      this.blinkIn -= dt;
      if (this.blinkIn <= 0 && this.blinkT < 0) this.blinkT = 0;
      let w = 0;
      if (this.blinkT >= 0) {
        this.blinkT += dt;
        w = this.blinkT < 0.08 ? this.blinkT / 0.08 : Math.max(0, 1 - (this.blinkT - 0.08) / 0.08);
        if (this.blinkT >= 0.16) {
          this.blinkT = -1;
          this.blinkIn = 3 + Math.random() * 3;
        }
      }
      for (const { mesh, index } of this.blinkMeshes) {
        if (mesh.morphTargetInfluences) mesh.morphTargetInfluences[index] = w;
      }
    }
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
    }
  }

  dispose() {
    this.mixer.stopAllAction();
    this.materials.forEach((m) => m.dispose());
  }
}
