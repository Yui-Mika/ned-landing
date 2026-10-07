import type { RootState } from '@react-three/fiber';

/**
 * Size of the stage at z = 0 as the camera sees it, measured straight ahead of the camera. Device poses are
 * fractions of this. Measuring straight ahead (not toward the origin) keeps devices the same size while the
 * camera pans for a T5 Zoom; the zoom itself (camera.zoom) does not change it either.
 */
export function stageViewport(state: RootState) {
  const { camera } = state;
  return state.viewport.getCurrentViewport(camera, [camera.position.x, camera.position.y, 0]);
}
