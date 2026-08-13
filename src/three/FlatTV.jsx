import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import Screen from "./Screen";
import useProjectHover from "./useProjectHover";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;

// Real panel-TV materials rather than one flat grey. The three surfaces
// a modern set actually has: injection-moulded shell at the back, gloss
// piano-black bezel at the front, and a brushed metal foot.
const SHELL = { color: "#17181a", roughness: 0.62, metalness: 0.12 };
// Not pure black: a bezel that reflects nothing disappears against a
// black room and the picture is left floating with no set around it.
const BEZEL = { color: "#15151a", roughness: 0.26, metalness: 0.62 };
const METAL = { color: "#3a3d42", roughness: 0.32, metalness: 0.92 };

/**
 * A modern flat-screen television.
 *
 * `position` is the foot of the stand, not the middle of the panel — the
 * set is something you put *on* a surface, and giving it the same origin
 * a real one has means the call site places it on the unit rather than
 * guessing at a centre offset.
 *
 * `width` is the outer width of the panel. Everything else — bezel,
 * chin, depth, stand — is derived from it, so the proportions hold at
 * any size.
 */
export default function FlatTV({
  project,
  onExpand,
  onHoverChange,
  position = [0, 0, 0],
  width = 4,
}) {
  const groupRef = useRef();
  const [hovered, bind] = useProjectHover({ project, onExpand, onHoverChange });

  // Bezels on a current set are a few millimetres; the chin below the
  // screen is two or three times that because the driver board and the
  // brand live there.
  const bez = width * 0.026;
  const chin = width * 0.058;
  const screenW = width - bez * 2;
  const screenH = (screenW * 9) / 16;

  const panelW = width;
  const panelH = screenH + bez + chin;
  const panelYC = (bez - chin) / 2; // panel centre, relative to the screen
  const depth = width * 0.022;

  const standH = width * 0.15;
  const baseR = width * 0.17;

  // The screen's own centre, measured up from the foot.
  const screenY = standH + chin + screenH / 2;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const t = clamp(delta * 6, 0, 1);
    const s = lerp(groupRef.current.scale.x, hovered ? 1.02 : 1, t);
    groupRef.current.scale.setScalar(s);
  });

  return (
    <group position={position}>
      {/* ---- stand: plate, tapered neck, bracket ---- */}
      <mesh position={[0, width * 0.006, width * 0.02]} castShadow receiveShadow>
        <cylinderGeometry args={[baseR, baseR * 1.04, width * 0.012, 48]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      <mesh position={[0, width * 0.016, width * 0.02]} castShadow>
        <cylinderGeometry args={[baseR * 0.86, baseR, width * 0.01, 48]} />
        <meshStandardMaterial {...METAL} roughness={0.45} />
      </mesh>
      {/* the neck leans back a touch, the way a real foot does to get the
          panel's weight over the plate */}
      <mesh
        position={[0, standH * 0.55, width * 0.012]}
        rotation={[0.05, 0, 0]}
        castShadow
      >
        <boxGeometry args={[width * 0.075, standH * 1.05, width * 0.024]} />
        <meshStandardMaterial {...METAL} roughness={0.4} />
      </mesh>
      <mesh position={[0, standH + chin * 0.3, -depth * 0.4]} castShadow>
        <boxGeometry args={[width * 0.13, chin * 0.9, depth * 0.9]} />
        <meshStandardMaterial {...SHELL} />
      </mesh>

      {/* ---- the panel ---- */}
      <group ref={groupRef} position={[0, screenY, 0]} {...bind}>
        {/* Back shell. Slightly narrower than the front so the bezel
            reads as an edge you could catch a highlight on. */}
        <RoundedBox
          args={[panelW * 0.985, panelH * 0.985, depth]}
          radius={depth * 0.22}
          smoothness={3}
          position={[0, panelYC, -depth / 2 - 0.002]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial {...SHELL} />
        </RoundedBox>

        {/* Bezel: four bars around the picture rather than one plate over
            it, so nothing is ever laid across the work. */}
        <mesh position={[0, screenH / 2 + bez / 2, depth * 0.05]} castShadow>
          <boxGeometry args={[panelW, bez, depth * 0.28]} />
          <meshStandardMaterial {...BEZEL} />
        </mesh>
        <mesh position={[0, -screenH / 2 - chin / 2, depth * 0.05]} castShadow>
          <boxGeometry args={[panelW, chin, depth * 0.28]} />
          <meshStandardMaterial {...BEZEL} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh
            key={s}
            position={[s * (screenW / 2 + bez / 2), panelYC, depth * 0.05]}
            castShadow
          >
            <boxGeometry args={[bez, panelH, depth * 0.28]} />
            <meshStandardMaterial {...BEZEL} />
          </mesh>
        ))}

        {/* The picture, sitting just behind the bezel's front face the
            way a panel sits behind its frame. */}
        <group position={[0, 0, depth * 0.04]}>
          <Screen project={project} hovered={hovered} width={screenW} height={screenH} />
        </group>

        {/* Chin detail: the sensor strip and the standby lamp. Tiny, but
            they're the two things every set has and no coded box does. */}
        <mesh position={[0, -screenH / 2 - chin * 0.55, depth * 0.14]}>
          <boxGeometry args={[width * 0.09, chin * 0.18, depth * 0.05]} />
          <meshStandardMaterial color="#050506" roughness={0.35} metalness={0.2} />
        </mesh>
        <mesh position={[width * 0.055, -screenH / 2 - chin * 0.55, depth * 0.15]}>
          <sphereGeometry args={[width * 0.0045, 10, 8]} />
          <meshBasicMaterial color="#7ad4a0" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
