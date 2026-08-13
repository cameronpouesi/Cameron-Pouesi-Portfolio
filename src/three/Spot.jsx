import { useMemo } from "react";
import * as THREE from "three";

/**
 * A spotlight that actually points where you tell it.
 *
 * three.js aims a spotlight at a separate target object, and that object
 * only gets a world matrix if it's part of the scene. Setting
 * `target-position` on the light from JSX quietly does nothing for that
 * reason — the light keeps pointing at the world origin, which is how a
 * carefully placed key light ends up lighting an empty patch of floor
 * eleven metres away. This adds the target to the scene and hands it to
 * the light.
 *
 * `at` is in the same space as `position`, so both can be given in the
 * local coordinates of whatever group the light sits in.
 */
export default function Spot({
  position = [0, 4, 2],
  at = [0, 0, 0],
  angle = 0.5,
  penumbra = 0.8,
  intensity = 60,
  distance = 18,
  decay = 2,
  color = "#ffffff",
  castShadow = false,
}) {
  const target = useMemo(() => new THREE.Object3D(), []);

  return (
    <>
      <primitive object={target} position={at} />
      <spotLight
        position={position}
        target={target}
        angle={angle}
        penumbra={penumbra}
        intensity={intensity}
        distance={distance}
        decay={decay}
        color={color}
        castShadow={castShadow}
      />
    </>
  );
}
