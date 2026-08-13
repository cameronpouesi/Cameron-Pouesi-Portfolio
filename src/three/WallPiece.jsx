import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Screen from "./Screen";
import useProjectHover from "./useProjectHover";
import { aspectFor } from "../data/projects";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;

/** Torn newsprint edge — a strip of paper whose bottom edge is ragged
 *  rather than cut. Drawn once per piece so no two tear alike. */
function makeTornPaper(seed) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#d9d2c4";
  ctx.fillRect(0, 0, 256, 256);

  // ghost of whatever was pasted up before
  ctx.globalAlpha = 0.16;
  for (let i = 0; i < 7; i++) {
    const r = Math.abs(Math.sin((seed + i) * 12.9898) * 43758.5453) % 1;
    ctx.fillStyle = ["#7d2b2b", "#2b4a7d", "#7d6a2b", "#3a3a3a"][i % 4];
    ctx.fillRect(r * 200, ((r * 7) % 1) * 200, 40 + r * 60, 20 + r * 40);
  }
  ctx.globalAlpha = 1;

  // tear the bottom edge away
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.moveTo(0, 256);
  for (let x = 0; x <= 256; x += 8) {
    const n = Math.abs(Math.sin((x + seed * 31) * 0.618) * 43758.5453) % 1;
    ctx.lineTo(x, 236 + n * 20);
  }
  ctx.lineTo(256, 256);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * One piece of work on a wall.
 *
 * `mount` decides how it's attached — a comedy club frames its posters,
 * a paste-up wall does not. Either way the piece is built to the shape of
 * its own media: a 9:16 commercial gets a 9:16 poster, never a landscape
 * one with bars down the sides.
 */
export default function WallPiece({
  project,
  onExpand,
  onHoverChange,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  height = 1.6,
  mount = "framed",
  seed = 0,
}) {
  const groupRef = useRef();
  const [hovered, bind] = useProjectHover({ project, onExpand, onHoverChange });

  const aspect = aspectFor(project);
  const w = height * aspect;
  const h = height;

  const paper = useMemo(
    () => (mount === "pasted" ? makeTornPaper(seed + 1) : null),
    [mount, seed]
  );

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clamp(delta * 6, 0, 1);
    // lifts off the wall rather than growing — it's pinned to something
    g.position.z = lerp(g.position.z, position[2] + (hovered ? 0.16 : 0), t);
    g.scale.setScalar(lerp(g.scale.x, hovered ? 1.03 : 1, t));
  });

  const frame = mount === "framed" ? Math.max(0.05, h * 0.045) : 0;

  return (
    <group ref={groupRef} position={position} rotation={rotation} {...bind}>
      {mount === "pasted" && (
        <>
          {/* the sheet it's printed on, torn along the bottom */}
          {/* Old newsprint, not fresh stock — it should sit *under* the
              work rather than framing it in pale beige. */}
          <mesh position={[0, -h * 0.02, -0.012]}>
            <planeGeometry args={[w * 1.07, h * 1.09]} />
            <meshStandardMaterial
              map={paper}
              transparent
              roughness={0.98}
              color="#5c574c"
            />
          </mesh>
          {/* masking tape at two corners */}
          {[
            [-w / 2 + 0.04, h / 2 - 0.02, 0.42],
            [w / 2 - 0.05, -h / 2 + 0.03, -0.5],
          ].map(([tx, ty, tr]) => (
            <mesh key={tx} position={[tx, ty, 0.014]} rotation={[0, 0, tr]}>
              <planeGeometry args={[0.19, 0.062]} />
              <meshStandardMaterial
                color="#cbbf9d"
                transparent
                opacity={0.72}
                roughness={0.9}
              />
            </mesh>
          ))}
        </>
      )}

      {mount === "framed" && (
        <>
          {/* dark timber moulding */}
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[w + frame * 2, h + frame * 2, 0.05]} />
            <meshStandardMaterial color="#2a2119" roughness={0.55} metalness={0.15} />
          </mesh>
          {/* mount board just inside it */}
          <mesh position={[0, 0, 0.006]}>
            <planeGeometry args={[w + frame * 0.5, h + frame * 0.5]} />
            <meshStandardMaterial color="#0b0a09" roughness={0.9} />
          </mesh>
        </>
      )}

      <group position={[0, 0, 0.014]}>
        <Screen project={project} hovered={hovered} width={w} height={h} maxZoom={1.04} />
      </group>

      {/* glass on the framed pieces, a paper sheen on the pasted ones */}
      <mesh position={[0, 0, 0.022]}>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial
          transparent
          opacity={mount === "framed" ? (hovered ? 0.05 : 0.1) : 0.045}
          roughness={mount === "framed" ? 0.08 : 0.62}
          clearcoat={mount === "framed" ? 1 : 0.2}
          color="#cfe0ff"
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
