import { useEffect, useMemo, useRef, useState } from "react";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import Spot from "./Spot";
import FilmStrip from "./FilmStrip";
import SceneCanvas from "./SceneCanvas";
import SceneGrade from "./SceneGrade";
import ShowInfoCard from "./ShowInfoCard";
import RailNav from "./RailNav";
import useHoveredProject from "./useHoveredProject";
import { STRIP_MARGIN } from "./filmBase";

// Big enough to actually read the work. Three lengths of film fill the
// frame at a time and the camera tracks along the archive to reach the
// rest — the same gesture as the edit suite, so moving through the site
// feels like one building rather than several carousels.
const FRAME_W = 1.72;
const FRAMES = 3;
const STRIP_W = FRAME_W * STRIP_MARGIN;
const PITCH = STRIP_W + 0.62;
const PER_VIEW = 3;
const BASE_FOV = 40;
// Far enough back that a strip which lifts toward the viewer on hover
// still has its full length inside the frame — the same mistake the
// television pile made, and worth not repeating.
const CAMERA_Z = 6.6;
// A little air past the end strip, so the row is held near the edge of
// the frame rather than jammed flush against it.
const EDGE_MARGIN = 0.4;

function hash(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * A soft pool of light directly behind one strip.
 *
 * There is no room here — no wall, no floor, nothing to light. The film
 * hangs in black, and the only thing separating it from the background
 * is its own backlight. Keeping that glow local to each strip is what
 * makes the black stay black: a wall plane, however dark, is a surface
 * that catches light and immediately reads as grey.
 */
function StripGlow({ position, width, height }) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    // Falls away fast. A slow falloff spreads into a lit rectangle that
    // reads as the very wall this replaced.
    g.addColorStop(0, "rgba(150,178,214,0.6)");
    g.addColorStop(0.3, "rgba(120,146,184,0.12)");
    g.addColorStop(0.7, "rgba(90,112,146,0.02)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);

  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.24}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function DocumentaryScene({ items, onExpand }) {
  const [hoveredProject, onHoverChange] = useHoveredProject();
  const [page, setPage] = useState(0);
  const railRef = useRef(null);
  const [aspect, setAspect] = useState(16 / 9);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (height > 0) setAspect(width / height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pages = Math.max(1, Math.ceil(items.length / PER_VIEW));

  const strips = useMemo(
    () =>
      items.map((project, i) => ({
        project,
        /**
         * Evenly pitched, and all on one plane.
         *
         * The strips used to sit at their own depths, which gave the
         * archive volume but cost the two things that matter more: under
         * a perspective camera, depth *is* size, so a strip further
         * forward was drawn larger than its neighbours; and the row is
         * tracked rather than static, so each depth parallaxed by a
         * different amount as the camera panned and the gaps opened and
         * closed with it. Every previous attempt to correct the spacing
         * fought one of those two and lost, because both come from the
         * same place.
         *
         * Coplanar makes both exact rather than approximate. One shared
         * distance means one shared scale, so every print is the same
         * size; and it means the camera's offset divides out of all of
         * them equally, so the gap is a constant
         * (PITCH - STRIP_W) / CAMERA_Z at every camera position and
         * every viewport width, not merely close.
         *
         * The height stagger stays: it varies nothing that is projected.
         */
        position: [(i - (items.length - 1) / 2) * PITCH, (hash(i * 3.1) - 0.5) * 0.5, 0],
        swayPhase: i * 1.7,
        seed: i + 1,
      })),
    [items]
  );

  /**
   * Where the camera sits, kept against the archive rather than against
   * the current group.
   *
   * Centring the group is right until the frame is wider than the group
   * is. On a wide monitor the first page put the three strips in the
   * middle of a view that reached a long way past the left-hand end of
   * the row — so there was two units of dead black on the left while the
   * archive carried on off the right-hand side. Clamping the camera to
   * the row's own ends spends that width on film instead, and on a
   * narrow viewport, where the group already fills the frame, the clamp
   * never engages and nothing moves.
   */
  const camera = useMemo(() => {
    const first = page * PER_VIEW;
    const last = Math.min(first + PER_VIEW, items.length) - 1;
    const mid = (first + last) / 2;
    let x = (mid - (items.length - 1) / 2) * PITCH;

    // Half the visible width at the film's depth. SceneCanvas only ever
    // widens the fov below 16:9, so above it the base value holds.
    const halfView = Math.tan((BASE_FOV * Math.PI) / 360) * CAMERA_Z * aspect;
    const halfRow = ((items.length - 1) / 2) * PITCH + STRIP_W / 2;
    const lo = -halfRow + halfView - EDGE_MARGIN;
    const hi = halfRow - halfView + EDGE_MARGIN;
    // When the frame is wider than the whole archive there is nothing to
    // clamp against, so it simply centres.
    x = lo <= hi ? Math.min(Math.max(x, lo), hi) : 0;

    return { position: [x, 0.1, CAMERA_Z], fov: BASE_FOV };
  }, [page, items.length, aspect]);

  const go = (dir) => setPage((p) => Math.min(pages - 1, Math.max(0, p + dir)));

  return (
    <div className="doc-scene">
      {/* The rail's containing block is the picture, not the whole
          section. It used to wrap the credit card too, which put the
          progress dots 1.5rem above the bottom of *that* — i.e. on top
          of the caption — and pushed the arrows below the middle of the
          film they belong to. */}
      <div className="scene-rail" ref={railRef}>
        <SceneCanvas
          height="clamp(30rem, calc(100vh - 15rem), 48rem)"
          camera={camera}
          far={90}
        >
        {/* There is no room here — the film hangs in black. Ambient is
            almost nothing and there is no wall for it to land on, so the
            background stays true black instead of drifting to grey. */}
        <ambientLight intensity={0.12} color="#8b96ab" />
        <Environment preset="apartment" environmentIntensity={0.22} />

        {/* Each strip is backlit only by its own pool — see StripGlow —
            and lifted by one short-range light behind it. Nothing here
            reaches far enough to reveal a surface that isn't film. */}
        {strips.map((s) => (
          <pointLight
            key={`glow-${s.project.id}`}
            position={[s.position[0], s.position[1], s.position[2] - 1.1]}
            intensity={5}
            distance={3.4}
            decay={2}
            color="#9db6dc"
          />
        ))}

        {/* The inspection lamp, raking in from the front left. Not
            casting: with nothing in the room to receive a shadow it only
            produced artefacts on the film itself. */}
        <Spot
          position={[-4.5, 5, 5.5]}
          at={[-0.5, 0.4, -0.4]}
          angle={0.85}
          penumbra={0.94}
          intensity={110}
          distance={26}
          color="#ffd2a0"
        />

        {strips.map((s) => (
          <StripGlow
            key={`halo-${s.project.id}`}
            position={[s.position[0], s.position[1], s.position[2] - 0.5]}
            width={STRIP_W * 1.3}
            height={FRAME_W * 0.5625 * 1.16 * FRAMES * 1.12}
          />
        ))}

        {strips.map((s) => (
          <FilmStrip
            key={s.project.id}
            project={s.project}
            onExpand={onExpand}
            onHoverChange={onHoverChange}
            position={s.position}
            frameW={FRAME_W}
            frames={FRAMES}
            seed={s.seed}
            swayPhase={s.swayPhase}
          />
        ))}

        <SceneGrade bloom={0.46} threshold={0.66} vignette={0.66} offset={0.36} grain={0.032} />
      </SceneCanvas>

        <RailNav
          page={page}
          pages={pages}
          onGo={go}
          labels={{ prev: "Previous documentaries", next: "More documentaries" }}
        />
      </div>

      <ShowInfoCard project={hoveredProject} />
    </div>
  );
}
