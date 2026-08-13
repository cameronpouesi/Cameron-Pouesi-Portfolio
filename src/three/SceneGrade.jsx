import { useState } from "react";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { isLowEndDevice } from "./deviceTier";

/**
 * The grade every environment is finished through.
 *
 * Having one of these rather than a composer per scene is what keeps the
 * rooms feeling like parts of the same building: the same bloom rolloff,
 * the same grain, the same falloff into the corners. Individual scenes
 * can push a value where the room genuinely calls for it — a dark
 * warehouse wants more vignette than a lit archive — but they start from
 * a common look.
 *
 * multisampling matters here: EffectComposer bypasses the canvas's own
 * antialiasing, so without it every edge in the scene turns to steps.
 */
export default function SceneGrade({
  bloom = 0.45,
  threshold = 0.62,
  vignette = 0.62,
  offset = 0.36,
  grain = 0.03,
}) {
  const [lowEnd] = useState(isLowEndDevice);

  return (
    <EffectComposer disableNormalPass multisampling={lowEnd ? 0 : 4}>
      <Bloom
        intensity={bloom}
        luminanceThreshold={threshold}
        luminanceSmoothing={0.4}
        mipmapBlur
      />
      <Noise opacity={grain} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={offset} darkness={vignette} />
    </EffectComposer>
  );
}
