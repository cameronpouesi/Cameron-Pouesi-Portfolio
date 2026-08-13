import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import Screen from "./Screen";
import useProjectHover from "./useProjectHover";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * A grading monitor on a desk: aluminium chassis, matte black bezel, a
 * hooded top edge, and a neck onto a weighted base.
 *
 * The details that sell it aren't the shapes — they're the materials.
 * The chassis is metal (high metalness, mid roughness) so it picks up
 * the room; the bezel is deep matte plastic that stays dark from every
 * angle; the glass is a near-mirror at grazing incidence, which is what
 * makes a dark panel read as glass rather than paint. A bias light
 * behind the panel throws the pale wash onto the wall that every edit
 * suite has, and the screen spills its own pool onto the desk.
 */
export default function MonitorPanel({
  project,
  onExpand,
  onHoverChange,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 2.3,
  tilt = -0.05,
}) {
  const groupRef = useRef();
  const [hovered, bind] = useProjectHover({ project, onExpand, onHoverChange });

  // A 9:16 piece gets 9:16 hardware. Letterboxing vertical work into a
  // landscape panel is exactly what an edit suite wouldn't do — you'd
  // turn a monitor on its side, so that's what this does.
  const portrait = project.orientation === "portrait";
  const height = portrait ? width * 1.34 : width * 0.58;
  const depth = 0.08;
  const bezelSide = width * 0.018;
  const bezelBottom = width * 0.05;
  const screenW = width - bezelSide * 2;
  const screenH = height - bezelSide - bezelBottom;
  // the panel is bottom-heavy, so the picture sits above centre
  const screenY = (bezelBottom - bezelSide) / 2;

  const standH = height * 0.34;
  const baseY = -height / 2 - standH;

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    // No bobbing — these are heavy objects standing on a desk. Hovering
    // leans one a few millimetres toward the viewer, and that's all.
    const t = clamp(delta * 6, 0, 1);
    g.position.z = lerp(g.position.z, position[2] + (hovered ? 0.12 : 0), t);
    const s = lerp(g.scale.x, hovered ? 1.03 : 1, t);
    g.scale.setScalar(s);
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      {...bind}
    >
      <group rotation={[tilt, 0, 0]}>
        {/* Chassis. Dark anodised, not bright aluminium: a grading
            monitor is deliberately neutral and dark so nothing in the
            room reflects into the operator's eye, and a pale metal box
            is the brightest thing in a dark suite — which is the one
            thing the picture must be. */}
        <RoundedBox args={[width + 0.03, height + 0.03, depth]} radius={0.012} smoothness={3} castShadow>
          <meshStandardMaterial color="#2f3238" roughness={0.5} metalness={0.8} />
        </RoundedBox>

        {/* vent slots down the back */}
        <mesh position={[0, 0, -depth / 2 - 0.001]}>
          <planeGeometry args={[width * 0.5, height * 0.4]} />
          <meshStandardMaterial color="#17191d" roughness={0.9} metalness={0.3} />
        </mesh>

        {/* bezel — deep matte plastic, stays black off-axis */}
        <mesh position={[0, 0, depth / 2 + 0.001]}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial color="#0b0b0c" roughness={0.85} metalness={0.05} />
        </mesh>

        {/* the maker's rail along the chin, and the row of soft keys
            every reference monitor carries under the panel */}
        <mesh position={[-width / 2 + 0.11, -height / 2 + bezelBottom * 0.5, depth / 2 + 0.004]}>
          <boxGeometry args={[0.1, 0.012, 0.004]} />
          <meshStandardMaterial color="#6e737c" roughness={0.35} metalness={0.9} />
        </mesh>
        {[0, 1, 2, 3].map((k) => (
          <mesh
            key={k}
            position={[k * 0.05 - 0.075, -height / 2 + bezelBottom * 0.5, depth / 2 + 0.004]}
          >
            <boxGeometry args={[0.026, 0.009, 0.004]} />
            <meshStandardMaterial color="#33363c" roughness={0.6} metalness={0.4} />
          </mesh>
        ))}

        {/* hood over the top edge, as every grading monitor has */}
        <mesh position={[0, height / 2 + 0.012, depth / 2 - 0.03]} rotation={[-0.32, 0, 0]}>
          <boxGeometry args={[width + 0.03, 0.11, 0.016]} />
          <meshStandardMaterial color="#141416" roughness={0.75} metalness={0.2} />
        </mesh>

        {/* the picture */}
        <group position={[0, screenY, depth / 2 + 0.004]}>
          <Screen
            project={project}
            hovered={hovered}
            width={screenW}
            height={screenH}
            maxZoom={1.06}
          />
        </group>

        {/* Glass. Low roughness with a clearcoat is what reads as a
            panel rather than a printed picture — it catches the room
            across its surface as the monitor turns. */}
        <mesh position={[0, screenY, depth / 2 + 0.012]}>
          <planeGeometry args={[screenW, screenH]} />
          <meshPhysicalMaterial
            transparent
            opacity={hovered ? 0.05 : 0.09}
            roughness={0.12}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.06}
            color="#b9c6da"
            depthWrite={false}
          />
        </mesh>

        {/* tally light under the bezel */}
        <mesh position={[width / 2 - 0.09, -height / 2 + bezelBottom * 0.45, depth / 2 + 0.003]}>
          <circleGeometry args={[0.008, 12]} />
          <meshBasicMaterial color={hovered ? "#7dffb0" : "#1d4a30"} toneMapped={false} />
        </mesh>

      </group>

      {/* Stand: a VESA plate, a flat column, and a weighted foot with a
          cable channel through it. Three parts with gaps between them
          read as engineering; one box reads as a stick. */}
      <mesh position={[0, -height / 2 + 0.02, -depth / 2 - 0.012]}>
        <boxGeometry args={[width * 0.16, height * 0.14, 0.022]} />
        <meshStandardMaterial color="#25282d" roughness={0.55} metalness={0.75} />
      </mesh>
      <mesh position={[0, -height / 2 - standH / 2, -0.01]} castShadow>
        <boxGeometry args={[width * 0.075, standH, 0.042]} />
        <meshStandardMaterial color="#3a3e45" roughness={0.42} metalness={0.85} />
      </mesh>
      <mesh position={[0, -height / 2 - standH * 0.34, -0.032]}>
        <boxGeometry args={[width * 0.045, standH * 0.3, 0.014]} />
        <meshStandardMaterial color="#15171a" roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, baseY + 0.014, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[width * 0.36, 0.028, 0.28]} />
        <meshStandardMaterial color="#31353b" roughness={0.44} metalness={0.82} />
      </mesh>
      <mesh position={[0, baseY + 0.003, 0.05]}>
        <boxGeometry args={[width * 0.33, 0.008, 0.25]} />
        <meshStandardMaterial color="#0e0f11" roughness={0.95} />
      </mesh>

      {/* The screen's own light on the desk used to be a painted
          additive decal here — a 3.5 x 1.5 unit card lying flat. Three
          of them side by side merged into one pale band across the
          bottom of the frame, which is what was making the bench look
          lit from nowhere. The bench reflects for real now, so the
          decal is gone and only the light that causes it remains. */}
      <pointLight
        position={[0, screenY, 0.7]}
        intensity={hovered ? 5.5 : 3}
        distance={4.5}
        decay={2}
        color="#93b4e8"
      />
    </group>
  );
}
