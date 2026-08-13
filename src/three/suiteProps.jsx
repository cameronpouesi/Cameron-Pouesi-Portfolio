import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// ============================================================================
// What's on an editor's bench.
//
// None of this is the work, and none of it should ever draw the eye — a
// bench with nothing on it reads as a render, and a bench covered in
// hero props reads as a showroom. These are the four things that are
// actually in front of an editor at 11pm, built to be recognised in
// silhouette and in the spill off a monitor, and no brighter than that.
// ============================================================================

export const SUITE_MODELS = {
  notebook: "/models/binder_notebook/binder_notebook_1k.gltf",
};

Object.values(SUITE_MODELS).forEach((u) => useGLTF.preload(u));

/** Sobel over a height field — the same trick the film stock uses, so a
 *  drawn surface responds to light instead of being a printed picture. */
function heightToNormal(height, size, strength) {
  const out = new Uint8ClampedArray(size * size * 4);
  const at = (x, y) =>
    height[Math.min(size - 1, Math.max(0, y)) * size + Math.min(size - 1, Math.max(0, x))];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = at(x + 1, y) - at(x - 1, y);
      const dy = at(x, y + 1) - at(x, y - 1);
      const n = new THREE.Vector3(-dx * strength, -dy * strength, 1).normalize();
      const i = (y * size + x) * 4;
      out[i] = (n.x * 0.5 + 0.5) * 255;
      out[i + 1] = (n.y * 0.5 + 0.5) * 255;
      out[i + 2] = (n.z * 0.5 + 0.5) * 255;
      out[i + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(out, size, size, THREE.RGBAFormat);
  t.colorSpace = THREE.NoColorSpace;
  t.needsUpdate = true;
  return t;
}

/**
 * The keycap field, drawn once and shared by every keyboard on the floor.
 *
 * Ninety keycaps as ninety boxes is ninety draw calls per keyboard, and
 * there are eleven of them. Drawn into a texture instead, the keys cost
 * nothing and — because the same drawing drives the normal map — they
 * still catch the light along their top edges the way real caps do.
 */
function useKeyboardMaps() {
  return useMemo(() => {
    const S = 512;
    const cols = 15;
    const rows = 5;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const ctx = c.getContext("2d");
    const height = new Float32Array(S * S);

    ctx.fillStyle = "#0d0d10";
    ctx.fillRect(0, 0, S, S);

    // Keys occupy the lower four-fifths; the strip above is the bezel.
    const padX = S * 0.03;
    const top = S * 0.2;
    const cw = (S - padX * 2) / cols;
    const ch = (S - top - padX) / rows;

    for (let r = 0; r < rows; r += 1) {
      // real keyboards stagger, and the bottom row is mostly one bar
      const offset = r === 0 ? 0 : (r * 0.18) % 1;
      const n = r === rows - 1 ? 5 : cols;
      const w = r === rows - 1 ? (S - padX * 2) / 5 : cw;
      for (let k = 0; k < n; k += 1) {
        const x = padX + (k + offset * (r === rows - 1 ? 0 : 1)) * w + w * 0.06;
        const y = top + r * ch + ch * 0.08;
        const kw = w * 0.88;
        const kh = ch * 0.84;
        if (x + kw > S - padX) continue;
        ctx.fillStyle = r === 0 ? "#26262d" : "#2e2e37";
        ctx.beginPath();
        ctx.roundRect(x, y, kw, kh, Math.min(kw, kh) * 0.18);
        ctx.fill();
        // the lit legend, barely there
        ctx.fillStyle = "rgba(180,196,224,0.13)";
        ctx.fillRect(x + kw * 0.3, y + kh * 0.35, kw * 0.34, kh * 0.18);

        for (let py = y | 0; py < y + kh && py < S; py += 1) {
          for (let px = x | 0; px < x + kw && px < S; px += 1) {
            height[py * S + px] = 1;
          }
        }
      }
    }

    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    return { map, normalMap: heightToNormal(height, S, 2.4) };
  }, []);
}

/** A low, wedged keyboard. Matte, so it never competes with the panel.
 *  Authored at real size — 46cm across — so `scale` is however many
 *  scene units a metre is worth where it's being placed. */
export function Keyboard({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, width = 0.46 }) {
  const { map, normalMap } = useKeyboardMaps();
  const d = width * 0.38;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0.007, 0]} rotation={[-0.045, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.014, d]} />
        <meshStandardMaterial color="#17171b" roughness={0.72} metalness={0.12} />
      </mesh>
      {/* the key face, laid on top so the caps read from above */}
      <mesh position={[0, 0.0145, 0]} rotation={[-Math.PI / 2 - 0.045, 0, 0]}>
        <planeGeometry args={[width * 0.985, d * 0.985]} />
        <meshStandardMaterial map={map} normalMap={normalMap} roughness={0.82} metalness={0.05} />
      </mesh>
    </group>
  );
}

/** Mouse. Two squashed spheres and a wheel — it only ever reads as a
 *  shape with a highlight running down its back. */
export function Mouse({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0.022, 0]} scale={[1, 0.62, 1.5]} castShadow receiveShadow>
        <sphereGeometry args={[0.032, 20, 16]} />
        <meshStandardMaterial color="#1b1b1f" roughness={0.42} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.038, 0.012]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.006, 0.006, 0.012, 12]} />
        <meshStandardMaterial color="#2b2b32" roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Mug. Half-full, cold, and slightly off the coaster. */
export function Mug({ position = [0, 0, 0], rotation = [0, 0.4, 0], scale = 1, color = "#cfc6b8" }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0.048, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.042, 0.036, 0.096, 28, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.34} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.003, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.036, 0.036, 0.006, 28]} />
        <meshStandardMaterial color={color} roughness={0.34} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.002, 28]} />
        <meshStandardMaterial color="#241a12" roughness={0.28} />
      </mesh>
      <mesh position={[0.05, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.022, 0.007, 10, 24, Math.PI * 1.25]} />
        <meshStandardMaterial color={color} roughness={0.34} />
      </mesh>
    </group>
  );
}

/** The scanned notebook, shut, with a pen across it. */
export function Notebook({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  const { scene } = useGLTF(SUITE_MODELS.notebook);
  const model = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  return <primitive object={model} position={position} rotation={rotation} scale={scale} />;
}

/**
 * A cable falling off the back of the bench.
 *
 * Nothing says "this is a render" like hardware with no cables. These
 * hang behind the monitors where they're half-seen, which is exactly
 * where real ones are.
 */
export function CableDrop({ from = [0, 0, 0], to = [0, -1, 0], radius = 0.008 }) {
  const geo = useMemo(() => {
    const slack = 0.34;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...from),
      new THREE.Vector3(from[0] + 0.02, from[1] - 0.12, from[2] - 0.06),
      new THREE.Vector3(
        (from[0] + to[0]) / 2 - 0.05,
        (from[1] + to[1]) / 2 - slack,
        (from[2] + to[2]) / 2 - 0.1
      ),
      new THREE.Vector3(to[0] - 0.03, to[1] + 0.1, to[2] - 0.04),
      new THREE.Vector3(...to),
    ]);
    return new THREE.TubeGeometry(curve, 60, radius, 8, false);
  }, [from, to, radius]);

  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color="#0b0b0d" roughness={0.66} metalness={0.05} />
    </mesh>
  );
}
