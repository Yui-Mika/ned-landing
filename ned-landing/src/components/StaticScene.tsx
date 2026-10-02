import { Mustache } from './Mustache';

/**
 * Fallback when WebGL is not available: a still frame with the 2D Teddy art (fetched at build time by
 * scripts/fetch-teddy.mjs). The story copy still reads in full on top.
 */
export function StaticScene() {
  const base = import.meta.env.BASE_URL;
  return (
    <div className="static-scene">
      <div className="static-glow" />
      <img className="static-teddy" src={`${base}assets/teddy/waving.png`} alt="" />
      <div className="static-glyph">
        <Mustache />
      </div>
    </div>
  );
}
