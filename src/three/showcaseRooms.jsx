import { useMemo } from "react";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import SceneCanvas from "./SceneCanvas";
import SceneGrade from "./SceneGrade";
import Spot from "./Spot";
import usePBR from "./usePBR";
import WallPiece from "./WallPiece";
import FlatTV from "./FlatTV";
import { MicStand, MicCable, Stool, DeskLamp, Bookshelf, BookRow, ToyScatter } from "./showcaseProps";

// Each room is its own compact shot rather than one long pan. They stack
// down the page in alternating rows, so the visitor moves through three
// spaces without any of them demanding a full screen.
const ROOM_HEIGHT = "clamp(19rem, 42vh, 27rem)";

/**
 * An alpha mask that fades a surface out to nothing at its edges.
 *
 * The only surface in these three rooms that survives is the paste-up
 * wall, and it has to arrive out of the black rather than end at a
 * rectangle. Masking the material is better than dimming it: a dark wall
 * is still a visible plane, whereas this genuinely stops existing.
 */
function useEdgeFade(softness = 0.42) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(128, 128, 128 * (1 - softness), 128, 128, 128);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.55, "#8a8a8a");
    g.addColorStop(1, "#000000");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.NoColorSpace;
    return t;
  }, [softness]);
}

/* ------------------------------------------------------------------ */
/* Comedy — a mic and a stool in the dark, and nothing else.           */
/* ------------------------------------------------------------------ */
export function ComedyRoom(props) {
  return (
    <SceneCanvas height={ROOM_HEIGHT} camera={{ position: [0.9, 1.25, 5.6], fov: 38 }} far={60}>
      <ComedyContents {...props} />
    </SceneCanvas>
  );
}

function ComedyContents({ items, onExpand, onHoverChange }) {
  return (
    <>
      {/* No brick, no floor. A wall lights up and reads as grey the
          instant anything lands on it, and the pool the key light threw
          across the boards was the brightest thing in the section. What
          is left is a mic, a stool and the dark. */}
      <ambientLight intensity={0.07} color="#7f8ba8" />
      <Environment preset="night" environmentIntensity={0.16} />

      <MicStand position={[-0.62, 0, 0.06]} rotation={[0, 0.4, 0]} />
      <MicCable from={[-0.5, 1.66, 0.06]} to={[-2.4, 0.03, 0.5]} />
      <Stool position={[-2.0, 0, -0.3]} rotation={[0, 0.9, 0]} scale={1.05} />

      {/* Tight and low. Enough to find the chrome and the stool's edge,
          not enough to announce a room that isn't there. */}
      <Spot
        position={[-0.7, 4.4, 1.9]}
        at={[-0.62, 1.3, 0.06]}
        angle={0.34}
        penumbra={1}
        intensity={58}
        distance={12}
        color="#ffe6b6"
      />
      <Spot
        position={[-2.2, 3.6, 1.6]}
        at={[-2.0, 0.5, -0.3]}
        angle={0.42}
        penumbra={1}
        intensity={20}
        distance={10}
        color="#ffdca8"
      />
      {/* a breath of colour from the wings, barely there */}
      <pointLight position={[2.6, 1.4, 1.6]} intensity={3.2} distance={7} decay={2} color="#b3407a" />
      <pointLight position={[-3.2, 2.0, 1.2]} intensity={2.2} distance={7} decay={2} color="#3f6bd8" />

      {items.map((project, i) => (
        <WallPiece
          key={project.id}
          project={project}
          onExpand={onExpand}
          onHoverChange={onHoverChange}
          mount="framed"
          height={1.24}
          // Spacing has to clear the frame's own width (height x 16:9
          // plus the moulding) or the pieces sit on top of one another.
          position={[1.25 + i * 2.5, 1.82, -2.3]}
          rotation={[0, -0.08 - i * 0.03, 0]}
          seed={i}
        />
      ))}

      <SceneGrade bloom={0.42} threshold={0.62} vignette={0.7} offset={0.3} grain={0.03} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Advertising — a real paste-up wall, evenly and dimly lit.           */
/* ------------------------------------------------------------------ */
export function AdvertisingRoom(props) {
  return (
    <SceneCanvas height={ROOM_HEIGHT} camera={{ position: [0, 1.95, 5.2], fov: 38 }} far={60}>
      <AdvertisingContents {...props} />
    </SceneCanvas>
  );
}

function AdvertisingContents({ items, onExpand, onHoverChange }) {
  // Finer repeat than the wall is wide: at 4-5 units a tile the plaster
  // stretches until there's no grain left to catch the light.
  const plaster = usePBR("plastered_wall_03", { repeat: [6, 3.4] });
  const fade = useEdgeFade(0.5);

  // Campaigns that were up before this one, half stripped back. Denser
  // near the middle, thinning out as the wall fades away.
  const remnants = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const r = (n) => Math.abs(Math.sin((i + 1) * n) * 43758.5453) % 1;
        const x = (r(12.9) - 0.5) * 8.6;
        // These have to disappear where the wall does. The wall's own
        // fade is a radial alpha map, and it can't be reused here — on a
        // small quad it makes a soft round blob, which is how a torn
        // sheet of paper turns into a lens flare. So the falloff is done
        // in the opacity instead, from the middle of the wall out.
        const out = Math.min(Math.abs(x) / 4.3, 1);
        return {
          x,
          y: 0.7 + r(7.3) * 3.0,
          w: 0.55 + r(4.1) * 1.15,
          h: 0.75 + r(9.7) * 1.4,
          rot: (r(3.3) - 0.5) * 0.18,
          // Sun-bleached rather than dark: these are the layers under the
          // current campaign, and at the tones they had before they read
          // as nothing at all on an unlit wall.
          tone: ["#574d40", "#484441", "#5e5340", "#3f4855", "#584340"][i % 5],
          op: (0.24 + r(6.6) * 0.3) * (1 - out ** 2),
        };
      }),
    []
  );

  const span = Math.max(items.length - 1, 1) * 2.3;

  return (
    <>
      {/* Flat and low. A paste-up wall in a street at night has no hero
          light on it — it's read by whatever is spilling from nearby. */}
      <ambientLight intensity={0.34} color="#9aa6bd" />
      <Environment preset="night" environmentIntensity={0.4} />
      <directionalLight position={[1.6, 4, 4]} intensity={0.78} color="#e8d8c0" />
      <pointLight position={[-3.2, 2.4, 2.6]} intensity={5} distance={11} decay={2} color="#6f86b8" />
      <pointLight position={[3.4, 2.2, 2.4]} intensity={4} distance={11} decay={2} color="#c08a5a" />

      {/* The wall itself, masked so it arrives out of the black instead
          of ending at an edge. */}
      <mesh position={[0, 1.9, -2.64]} receiveShadow>
        <planeGeometry args={[Math.max(15, span + 7), 8.5]} />
        <meshStandardMaterial
          {...plaster}
          alphaMap={fade}
          transparent
          color="#4a443b"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {remnants.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, -2.6 + i * 0.003]} rotation={[0, 0, p.rot]}>
          <planeGeometry args={[p.w, p.h]} />
          <meshStandardMaterial color={p.tone} roughness={1} transparent opacity={p.op} />
        </mesh>
      ))}

      {items.map((project, i) => {
        // Bill-posters don't work to a grid: sizes vary and the sheets
        // sit at their own angles.
        const portrait = project.orientation === "portrait";
        const h = portrait ? 2.2 : 1.32 + ((i * 5) % 3) * 0.16;
        return (
          <WallPiece
            key={project.id}
            project={project}
            onExpand={onExpand}
            onHoverChange={onHoverChange}
            mount="pasted"
            height={h}
            position={[
              (i - (items.length - 1) / 2) * 2.3,
              1.85 + (((i * 3) % 3) - 1) * 0.12,
              -2.55 + i * 0.006,
            ]}
            rotation={[0, 0, (((i * 7) % 3) - 1) * 0.022]}
            seed={i + 3}
          />
        );
      })}

      {/* This is the one room with a large mid-tone surface in it, and
          bloom's luminance smoothing reaches well below its threshold —
          at 0.72 the torn paper on the wall was picking up a wide mipmap
          halo and reading as out-of-focus bokeh rather than paper. The
          artwork still blooms; the wall no longer does. */}
      <SceneGrade bloom={0.26} threshold={0.94} vignette={0.62} offset={0.36} grain={0.03} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Children's TV — furniture in the dark, lit by its own lamp.         */
/* ------------------------------------------------------------------ */
export function ChildrensRoom(props) {
  return (
    <SceneCanvas height={ROOM_HEIGHT} camera={{ position: [0.1, 1.35, 4.7], fov: 38 }} far={60}>
      <ChildrensContents {...props} />
    </SceneCanvas>
  );
}

function ChildrensContents({ items, onExpand, onHoverChange }) {
  const timber = usePBR("wood_floor_deck", { repeat: [1.6, 0.7] });
  const tv = items[0];

  return (
    <>
      {/* Furniture in black — no floor, no wall. The lamp and the set
          are the only sources, which is what a bedroom at bedtime
          actually looks like. */}
      <ambientLight intensity={0.17} color="#7d84ad" />
      <Environment preset="apartment" environmentIntensity={0.3} />
      {/* A cool fill from where the viewer is standing. Without it the
          set's own bezel and the front of the unit face nothing but the
          dark, and the picture ends up floating with no television
          around it. */}
      <directionalLight position={[-1.4, 2.2, 4.5]} intensity={0.34} color="#93a4cc" />

      {/* The unit the set stands on, in real boards rather than a flat
          brown box. */}
      {/* Top slab, carcass set back behind it, two drawer fronts and a
          recessed plinth. One box of the same size reads as a slab; it's
          the shadow gaps between these that make it furniture. */}
      <mesh position={[0.1, 0.575, -1.5]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.05, 0.6]} />
        <meshStandardMaterial {...timber} color="#6a5136" roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0.1, 0.32, -1.52]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.46, 0.54]} />
        <meshStandardMaterial {...timber} color="#5c4630" roughness={0.94} metalness={0} />
      </mesh>
      {[-0.51, 0.71].map((x) => (
        <mesh key={x} position={[x, 0.33, -1.24]} castShadow receiveShadow>
          <boxGeometry args={[1.14, 0.4, 0.03]} />
          <meshStandardMaterial {...timber} color="#6f553a" roughness={0.88} metalness={0} />
        </mesh>
      ))}
      <mesh position={[0.1, 0.05, -1.53]}>
        <boxGeometry args={[2.2, 0.1, 0.46]} />
        <meshStandardMaterial color="#1a140e" roughness={1} />
      </mesh>

      {tv && (
        <FlatTV
          project={tv}
          onExpand={onExpand}
          onHoverChange={onHoverChange}
          // stood on the unit, not floating at a guessed centre height
          position={[0.1, 0.6, -1.5]}
          width={2.2}
        />
      )}

      {/* The scanned shelf, with its books nested inside its own
          transform so the rows can be placed in the model's coordinates
          — the plank heights below are measured off the scan, and they'd
          be meaningless in world space. */}
      <group position={[-2.75, 0, -1.45]} rotation={[0, 0.26, 0]} scale={1.12}>
        <Bookshelf />
        <BookRow position={[-0.57, 0.357, 0]} sets={2} seed={0} />
        <BookRow position={[-0.52, 0.723, 0]} sets={2} seed={1} />
        <BookRow position={[-0.57, 1.08, 0]} sets={2} seed={2} />
        <BookRow position={[-0.3, 1.438, 0]} sets={1} seed={3} />
      </group>
      <ToyScatter position={[-1.0, 0, 0.5]} scale={0.6} />

      {/* the lamp, and the light it is obviously making */}
      <DeskLamp position={[2.3, 0.6, -1.42]} rotation={[0, -0.7, 0]} scale={1.3} intensity={14} />
      <mesh position={[2.3, 0.3, -1.42]} castShadow receiveShadow>
        <boxGeometry args={[0.66, 0.6, 0.52]} />
        <meshStandardMaterial {...timber} color="#6a5136" roughness={0.92} metalness={0} />
      </mesh>

      {/* the set's own glow, thrown back into the room */}
      <pointLight position={[0.1, 1.34, -0.9]} intensity={7} distance={5} decay={2} color="#8fb6e8" />
      {/* a low cool wash so the shelf isn't a silhouette */}
      <Spot
        position={[-3.4, 3.4, 2.4]}
        at={[-2.4, 1.0, -1.2]}
        angle={0.75}
        penumbra={1}
        intensity={38}
        distance={13}
        color="#8fa6dd"
      />

      <SceneGrade bloom={0.36} threshold={0.7} vignette={0.6} offset={0.36} grain={0.026} />
    </>
  );
}
