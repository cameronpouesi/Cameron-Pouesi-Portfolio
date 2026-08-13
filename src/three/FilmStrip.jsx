import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import Screen from "./Screen";
import useProjectHover from "./useProjectHover";
import useReducedMotion from "./useReducedMotion";
import {
  makeFilmMaps,
  makeCurledGeometry,
  getGrainTexture,
  CURL,
  WANDER,
  FRAME_PITCH,
} from "./filmBase";

// how far a frame sits proud of the acetate it's printed on
const EMULSION = 0.004;

// The plane every frame sits on: clear of the highest point the curled
// acetate reaches anywhere on the strip.
const FRAME_Z = CURL + WANDER + EMULSION;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;

/** A neighbouring frame down the strip: the same image, printed dimmer,
 *  as it would be a few frames either side of the one being examined. */
function NeighbourFrame({ thumbnail, y, z, width, height, opacity }) {
  const texture = useTexture(thumbnail);
  texture.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh position={[0, y, z]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} toneMapped={false} />
    </mesh>
  );
}

/**
 * A length of 35mm hanging in a film archive.
 *
 * The strip is one canvas texture with the perforations punched clean
 * through it, on a plane that cups across its width and drifts down its
 * length — so it catches light along a curve and you can see the room
 * through its sprocket holes. The frames sit in the windows: the middle
 * one at full strength and interactive, the ones above and below printed
 * down, the way your eye reads a strip on a light table.
 */
export default function FilmStrip({
  project,
  onExpand,
  onHoverChange,
  position = [0, 0, 0],
  frameW = 1.12,
  frames = 5,
  seed = 0,
  swayPhase = 0,
  swaySpeed = 0.45,
}) {
  const groupRef = useRef();
  const [hovered, bind] = useProjectHover({ project, onExpand, onHoverChange });
  const reducedMotion = useReducedMotion();

  const frameH = frameW * 0.5625; // true 16:9
  const { map, normalMap, roughnessMap, stripW, stripH } = useMemo(
    () => makeFilmMaps(frameW, frameH, frames, seed),
    [frameW, frameH, frames, seed]
  );
  const stripGeo = useMemo(
    () => makeCurledGeometry(stripW, stripH),
    [stripW, stripH]
  );
  const grain = getGrainTexture();

  const pitch = frameH * FRAME_PITCH;
  const mid = Math.floor(frames / 2);

  // frame windows either side of the one being examined
  const neighbours = useMemo(
    () =>
      Array.from({ length: frames }, (_, i) => i)
        .filter((i) => i !== mid)
        .map((i) => {
          const y = (mid - i) * pitch;
          return {
            y,
            z: FRAME_Z,
            // fades off toward the ends of the strip
            opacity: 0.42 - Math.abs(mid - i) * 0.07,
          };
        }),
    [frames, mid, pitch, stripH]
  );

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime * swaySpeed + swayPhase;
    // hanging film drifts; it doesn't bounce
    const drift = reducedMotion ? 0 : Math.sin(t) * 0.035;
    const twist = reducedMotion ? 0 : Math.sin(t * 0.63) * 0.045;
    const lerpT = clamp(delta * 4, 0, 1);

    g.position.y = position[1] + drift;
    g.rotation.y = lerp(g.rotation.y, twist + (hovered ? -0.14 : 0), lerpT);
    g.rotation.z = lerp(g.rotation.z, twist * 0.35, lerpT);
    // Modest: a long strip that lunges at the camera runs out of frame.
    g.position.z = lerp(g.position.z, position[2] + (hovered ? 0.22 : 0), lerpT);
    g.scale.setScalar(lerp(g.scale.x, hovered ? 1.02 : 1, lerpT));
  });

  return (
    <group ref={groupRef} position={position}>
      {/* The acetate. Its scratches and dust are in the normal and
          roughness maps as well as the colour, so a gouge catches the
          inspection lamp instead of being a drawn line. Slightly
          transmissive, because film is — the light box behind it comes
          through the base. */}
      <mesh geometry={stripGeo}>
        <meshPhysicalMaterial
          map={map}
          normalMap={normalMap}
          normalScale={[0.7, 0.7]}
          roughnessMap={roughnessMap}
          roughness={1}
          metalness={0}
          transparent
          opacity={0.97}
          transmission={0.16}
          thickness={0.02}
          clearcoat={0.85}
          clearcoatRoughness={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {neighbours.map((n) => (
        <NeighbourFrame
          key={n.y}
          thumbnail={project.thumbnail}
          y={n.y}
          z={n.z}
          width={frameW}
          height={frameH}
          opacity={n.opacity}
        />
      ))}

      {/* the frame under examination */}
      <group position={[0, 0, FRAME_Z]} {...bind}>
        {/* Runs on its own. The stills either side of it already say
            what the project looks like; this frame's job is to move. */}
        <Screen
          project={project}
          hovered={hovered}
          width={frameW}
          height={frameH}
          maxZoom={1.08}
          autoPlay
        />

        {/* emulsion grain, sitting in the image rather than over it */}
        <mesh position={[0, 0, 0.002]}>
          <planeGeometry args={[frameW, frameH]} />
          <meshBasicMaterial
            map={grain}
            transparent
            opacity={0.14}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* No separate gloss plane over the picture.
            A clearcoat material mirrors the environment map, and on a
            flat plane facing the camera the HDRI's bright window lands
            as a soft dome across the middle of the frame — the arc that
            kept reappearing over the work. The acetate underneath
            already carries the surface response through its own
            clearcoat and normal map, so nothing is lost by leaving the
            picture itself unglazed. */}
      </group>
    </group>
  );
}
