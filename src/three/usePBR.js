import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

/**
 * Loads a full Poly Haven material and returns props ready to spread onto
 * a standard/physical material.
 *
 * This is the pipeline the CRT televisions already use — their glTFs ship
 * diffuse, normal and an ARM map, which is why they read as photographed
 * objects. Everything hand-built in this project was running on a colour
 * map alone, so light hit it as if it were flat painted card. Same maps,
 * same behaviour, everywhere.
 *
 * ARM packs ambient occlusion, roughness and metalness into R, G and B.
 * three reads the channel each slot needs from the one image, so it costs
 * a single texture fetch rather than three.
 *
 * Fetch a set with:  node fetch-textures.mjs <slug>
 */
export default function usePBR(slug, { repeat = [1, 1], anisotropy = 8 } = {}) {
  const base = `/textures/pbr/${slug}`;
  const [map, normalMap, arm] = useTexture([
    `${base}/diff.jpg`,
    `${base}/nor.jpg`,
    `${base}/arm.jpg`,
  ]);

  return useMemo(() => {
    // Colour is the only one that carries sRGB; the rest are data and
    // must stay linear or the lighting response goes wrong.
    map.colorSpace = THREE.SRGBColorSpace;
    normalMap.colorSpace = THREE.NoColorSpace;
    arm.colorSpace = THREE.NoColorSpace;

    for (const t of [map, normalMap, arm]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(repeat[0], repeat[1]);
      t.anisotropy = anisotropy;
      t.needsUpdate = true;
    }

    return {
      map,
      normalMap,
      aoMap: arm,
      roughnessMap: arm,
      metalnessMap: arm,
    };
  }, [map, normalMap, arm, repeat[0], repeat[1], anisotropy]);
}
