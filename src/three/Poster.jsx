import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import Screen from "./Screen";
import useProjectHover from "./useProjectHover";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * A poster pinned flat to a wall — thin frame, slight per-instance
 * rotation like it was pasted up by hand. Lifts and straightens on
 * hover. Kept at 16:9 so real show artwork fills it edge to edge.
 */
export default function Poster({
  project,
  onExpand,
  onHoverChange,
  position = [0, 0, 0],
  width = 2.2,
  rotationZ = 0,
}) {
  const groupRef = useRef();
  const [hovered, bind] = useProjectHover({ project, onExpand, onHoverChange });
  const height = width * 0.5625;

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clamp(delta * 6, 0, 1);
    g.position.z = lerp(g.position.z, hovered ? 0.35 : 0, t);
    g.rotation.z = lerp(g.rotation.z, hovered ? 0 : rotationZ, t);
    g.scale.setScalar(lerp(g.scale.x, hovered ? 1.05 : 1, t));
  });

  return (
    <group
      ref={groupRef}
      position={position}
      {...bind}
    >
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[width + 0.05, height + 0.05]} />
        <meshStandardMaterial color="#050505" roughness={0.7} />
      </mesh>
      <Screen project={project} hovered={hovered} width={width} height={height} />
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width * 1.01, height * 1.01]} />
        <meshPhysicalMaterial
          transparent
          opacity={hovered ? 0.04 : 0.09}
          roughness={0.15}
          color="#ffffff"
          emissive={hovered ? "#ffe3c2" : "#000000"}
          emissiveIntensity={hovered ? 0.15 : 0}
        />
      </mesh>
    </group>
  );
}
