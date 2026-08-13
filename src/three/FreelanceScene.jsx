import { useMemo, useState } from "react";
import { Environment, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import MonitorPanel from "./MonitorPanel";
import SceneCanvas from "./SceneCanvas";
import ShowInfoCard from "./ShowInfoCard";
import useHoveredProject from "./useHoveredProject";
import SceneGrade from "./SceneGrade";
import RailNav from "./RailNav";
import usePBR from "./usePBR";
import { DeskLamp } from "./showcaseProps";
import { Keyboard, Mouse, Mug, Notebook, CableDrop } from "./suiteProps";

// The suite runs off to both sides of the frame; the camera tracks along
// it rather than everything being crammed into one shot.
const PITCH = 2.55;
const PER_VIEW = 3;
const DESK_Y = -1.15;
const CAMERA_Z = 6.2;
const CAMERA_Y = 0.15;

// One metre, in this scene's units.
//
// The panels are 2.3 units wide and stand in for 27" reference monitors,
// which are 0.6m across. Every prop on the bench is modelled at real
// size — a keyboard is 46cm, a mug is 9cm — so each is scaled by this to
// arrive at the size it would actually be next to the hardware. Without
// it a keyboard is a stamp and a desk lamp is a matchstick.
const M = 3.8;

/**
 * The bench, and nothing else.
 *
 * There used to be a plaster wall and a grid of acoustic panels behind
 * this. They were the brightest thing in the section — a lit grey
 * rectangle sitting in a page that is otherwise black — and they made
 * the suite read as a room built out of boxes rather than a bay at
 * night. What's left is one surface: the thing the hardware stands on.
 *
 * That surface is reflective, and that is the whole trick. A dark edit
 * bay is legible almost entirely through what the panels throw down onto
 * the desk in front of them. Take the reflection away and you have a
 * brown plank; leave it in and the bench is obviously lacquered, the
 * monitors are obviously emitting, and the room is obviously dark.
 */
function Bench({ span }) {
  const oak = usePBR("wood_table_001", { repeat: [Math.max(6, span / 3), 1.1] });

  // The scan's diffuse is a pale honey oak — a bright surface running the
  // full width of the frame, and the single loudest thing in this
  // section. What's wanted from it is the grain, not the colour, and the
  // grain lives in the normal and roughness maps: at the grazing angle
  // this bench is seen from, those are what draw it anyway. So the
  // colour map is dropped and the tone is set by hand.
  const { map, ...grain } = oak;

  return (
    <group>
      {/* the top */}
      {/* Only as deep as it needs to be to hold the hardware. Every
          extra centimetre behind the panels is bench seen at a grazing
          angle, which is where a reflective surface is brightest — a
          deep top puts a pale band across a quarter of the frame. */}
      <mesh position={[0, DESK_Y, 0.28]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[span + 16, 1.6]} />
        <MeshReflectorMaterial
          {...grain}
          // Kept deliberately cheap: half-res buffer, one blur pass. The
          // reflection only has to carry the panels' glow, not resolve
          // detail, and there are six live canvases on this page.
          resolution={512}
          mixBlur={1.4}
          // Low. The reflection is meant to be the only thing lighting
          // this surface, not a second light source of its own — pushed
          // up, it stops being a dark lacquered bench and becomes a pale
          // band across the bottom of the shot.
          mirror={0.6}
          mixStrength={0.9}
          blur={[380, 140]}
          depthScale={1.6}
          minDepthThreshold={0.2}
          maxDepthThreshold={1.1}
          depthToBlurRatioBias={0.4}
          color="#2a2119"
          roughness={0.5}
          metalness={0.14}
          envMapIntensity={0.3}
        />
      </mesh>

      {/* the front edge, so the top has thickness you can see */}
      <mesh position={[0, DESK_Y - 0.026, 1.06]} castShadow>
        <boxGeometry args={[span + 16, 0.052, 0.04]} />
        <meshStandardMaterial {...grain} color="#2b231b" roughness={0.62} metalness={0.05} />
      </mesh>

      {/* There was a modesty panel here — a 0.6-unit slab standing
          behind the bench, meant to stop it floating. It faced three
          monitors square on at close range, so however dark its own
          colour was it came back as a pale band running the full width
          of the frame, and it was that, not the reflection, that was
          washing this section out. Nothing replaces it: below the front
          edge, the bench is meant to end in black like everything else
          on this page. */}
    </group>
  );
}

function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(126,158,208,0.5)");
    g.addColorStop(0.45, "rgba(80,104,150,0.17)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
}

/**
 * The glow one panel throws back into the dark behind the bench.
 *
 * Same device as the Reality TV pile: no wall, just the light a wall
 * would have caught. It has to be per-monitor and roughly square —
 * stretched across the whole run, a radial gradient falls off over
 * forty units horizontally and seven vertically, which is a band with a
 * visible top edge, not a glow.
 */
function Backdrop({ x, width, map }) {
  return (
    <mesh position={[x, 0.35, -3.4]}>
      <planeGeometry args={[width * 2.6, width * 2.6]} />
      <meshBasicMaterial
        map={map}
        transparent
        opacity={0.34}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default function FreelanceScene({ items, onExpand }) {
  const [hoveredProject, onHoverChange] = useHoveredProject();
  const glow = useGlowTexture();
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / PER_VIEW));
  const span = Math.max(items.length - 1, 1) * PITCH;

  // Every project gets a station on the desk; the camera visits them.
  const stations = useMemo(
    () =>
      items.map((project, i) => ({
        project,
        // A portrait panel is taller, so it needs a narrower body and to
        // sit lower for its base to still meet the desk.
        width: project.orientation === "portrait" ? 1.45 : 2.3,
        position: [
          (i - (items.length - 1) / 2) * PITCH,
          DESK_Y + (project.orientation === "portrait" ? 1.32 : 0.92),
          // alternating a few centimetres of depth stops the row of
          // panels reading as one flat wall of glass
          i % 2 === 0 ? 0 : -0.18,
        ],
        // each monitor turned very slightly toward the middle of its group
        rotation: [0, -((i % PER_VIEW) - 1) * 0.06, 0],
      })),
    [items]
  );

  // What sits in front of each panel. Derived from the station rather
  // than placed by hand so it stays right however many projects there
  // are, and varied by index so no two positions are identical — a row
  // of keyboards at the same angle is the tell.
  const benchTop = DESK_Y + 0.001;

  // Slide the camera to the middle of the current group of stations.
  const camera = useMemo(() => {
    const first = page * PER_VIEW;
    const last = Math.min(first + PER_VIEW, items.length) - 1;
    const midIndex = (first + last) / 2;
    const x = (midIndex - (items.length - 1) / 2) * PITCH;
    return { position: [x, CAMERA_Y, CAMERA_Z], fov: 40 };
  }, [page, items.length]);

  const go = (dir) => setPage((p) => Math.min(pages - 1, Math.max(0, p + dir)));

  return (
    <div className="freelance-scene scene-rail">
      <SceneCanvas height="clamp(26rem, calc(100vh - 16rem), 44rem)" camera={camera} far={70}>
        {/* Barely any ambient. In a real bay the panels are the light;
            everything else is what they happen to fall on. */}
        <ambientLight intensity={0.09} color="#8fa2c4" />
        <Environment preset="night" environmentIntensity={0.35} />

        <Bench span={span} />

        {stations.map(({ project, position, rotation, width }, i) => {
          const x = position[0];
          const jitter = ((i * 7) % 5) / 5 - 0.5;
          return (
            <group key={project.id}>
              <Backdrop x={x} width={width} map={glow} />
              <MonitorPanel
                project={project}
                onExpand={onExpand}
                onHoverChange={onHoverChange}
                position={position}
                rotation={rotation}
                width={width}
              />
              <Keyboard
                position={[x + jitter * 0.3, benchTop, 0.62]}
                rotation={[0, jitter * 0.14, 0]}
                scale={M}
              />
              <Mouse
                position={[x + 1.35, benchTop, 0.56 + jitter * 0.16]}
                rotation={[0, jitter, 0]}
                scale={M}
              />
              {/* a cable off the back of every other panel */}
              {i % 2 === 0 && (
                <CableDrop
                  from={[x - 0.2, position[1] - 0.35, -0.12]}
                  to={[x - 0.34, DESK_Y - 0.42, -0.46]}
                  radius={0.016}
                />
              )}
            </group>
          );
        })}

        {/* The bits that make it one person's bench rather than a shop
            floor: they sit at fixed points along the run, so the camera
            passes them as it tracks. */}
        <Mug position={[-PITCH * 0.62, benchTop, 0.9]} scale={M} />
        {/* Smaller than life and pushed to the front edge: the scan is
            58cm end to end, which at full size lays a slab as long as a
            monitor across the keyboards. */}
        <Notebook position={[PITCH * 1.75, benchTop, 0.95]} rotation={[0, -0.42, 0]} scale={M * 0.5} />
        <Mug position={[PITCH * 2.6, benchTop, 0.82]} rotation={[0, -1.1, 0]} scale={M} color="#3f4650" />

        {/* The room's one practical, at the near end of the run. Folded
            down rather than at full extension: an anglepoise at its real
            0.9m stands five times the height of a panel and its bulb
            ends up over the first picture, which is the one place a
            light in this project may never be. */}
        <DeskLamp
          position={[-span / 2 - 1.15, DESK_Y, -0.35]}
          rotation={[0, 1.15, 0]}
          scale={M * 0.62}
          intensity={11}
          color="#ffc98d"
        />
        {/* cool wash from the far end, so the bench has two sources */}
        <pointLight
          position={[span / 2 + 1.5, 1.6, 1.5]}
          intensity={2.2}
          distance={9}
          decay={2}
          color="#6f8fd0"
        />

        {/* Threshold high enough that the bench and the chassis stay out
            of it — bloom's luminance smoothing reaches a long way below
            its own threshold, and a mid-tone surface caught in it turns
            into haze. */}
        <SceneGrade bloom={0.38} threshold={0.9} vignette={0.66} offset={0.32} grain={0.03} />
      </SceneCanvas>

      <ShowInfoCard project={hoveredProject} />

      <RailNav
        page={page}
        pages={pages}
        onGo={go}
        labels={{ prev: "Previous monitors", next: "More monitors" }}
      />
    </div>
  );
}
