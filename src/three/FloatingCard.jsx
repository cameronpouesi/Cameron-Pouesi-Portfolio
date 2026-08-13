import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import Screen from "./Screen";
import useProjectHover from "./useProjectHover";
import useReducedMotion from "./useReducedMotion";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * A thumbnail floating in open space in front of a backdrop — no frame
 * or bezel, just the artwork with a soft edge glow. Bobs gently, pops
 * forward and brightens on hover.
 */
export default function FloatingCard({
  project,
  onExpand,
  onHoverChange,
  position = [0, 0, 0],
  width = 1.7,
  bobPhase = 0,
  bobSpeed = 0.45,
  glowColor = "#ffcf6b",
}) {
  const groupRef = useRef();
  const basePosition = useRef(position);
  const [hovered, bind] = useProjectHover({ project, onExpand, onHoverChange });
  const reducedMotion = useReducedMotion();

  const height = width * 0.6;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * bobSpeed + bobPhase;
    const bob = reducedMotion ? 0 : Math.sin(t) * 0.12;
    const [bx, by, bz] = basePosition.current;

    const targetZ = bz + (hovered ? 0.9 : 0);
    const targetScale = hovered ? 1.15 : 1;
    const t2 = clamp(delta * 6, 0, 1);

    groupRef.current.position.x = bx;
    groupRef.current.position.y = by + bob;
    groupRef.current.position.z = lerp(groupRef.current.position.z, targetZ, t2);
    groupRef.current.scale.setScalar(lerp(groupRef.current.scale.x, targetScale, t2));
  });

  return (
    <group
      ref={groupRef}
      position={position}
      {...bind}
    >
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[width + 0.08, height + 0.08]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={hovered ? 0.9 : 0.35}
          toneMapped={false}
        />
      </mesh>
      <Screen project={project} hovered={hovered} width={width} height={height} />
    </group>
  );
}
