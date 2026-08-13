import { useCallback, useMemo, useState } from "react";
import { Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import CRTTV from "./CRTTV";
import SceneCanvas from "./SceneCanvas";
import SceneGrade from "./SceneGrade";
import ShowInfoCard from "./ShowInfoCard";
import { TV_MODELS, TV_MODEL_URLS } from "./tvModels";
import { buildPile, framePile } from "./pileLayout";
import "./RealityTVScene.css";

TV_MODEL_URLS.forEach((u) => useGLTF.preload(u));

const CAMERA_FAR = 60;
const BASE_FOV = 40;

/**
 * The pile stands in black, lit from behind.
 *
 * There is no room any more: no textured wall, no lit floor. Both read
 * as grey surfaces the moment anything falls on them, and the archive
 * next door proved how much better these objects look floating. What
 * replaces them is a wide, soft pool *behind* the stack — the sets are
 * rimmed by it and separated from the background by their own silhouette
 * rather than by a backdrop.
 *
 * The floor stays, but black and untextured, purely so the stack still
 * catches a contact shadow and reads as standing on something.
 */
function Backdrop({ width, height }) {
  const glow = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(150,170,205,0.55)");
    g.addColorStop(0.35, "rgba(112,132,168,0.16)");
    g.addColorStop(0.72, "rgba(70,84,112,0.03)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);

  return (
    <>
      {/* No floor either. Even at pure black it still picks up specular
          from the environment map and shows as a grey band with a hard
          horizon where its far edge ends — a wall lying down. The sets
          rest on each other, so they still shadow one another; nothing
          is lost but the horizon. */}

      {/* the light behind the stack */}
      <mesh position={[0, height * 0.45, -3.2]}>
        <planeGeometry args={[width * 1.9, height * 2.4]} />
        <meshBasicMaterial
          map={glow}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

function Pile({ visible, slots, onExpand, onHoverChange }) {
  return visible.map((project, i) => {
    const slot = slots[i];
    return (
      <CRTTV
        key={project.id}
        model={TV_MODELS[slot.m]}
        project={project}
        onExpand={onExpand}
        onHoverChange={onHoverChange}
        position={slot.pos}
        entryFrom={slot.from}
        rotation={[0, slot.rotY, 0]}
        scale={slot.scale}
        delay={slot.delay}
      />
    );
  });
}

export default function RealityTVScene({ items, onExpand }) {
  const [expanded, setExpanded] = useState(false);
  const [hoveredProject, setHoveredProject] = useState(null);

  // Only the set that is actually showing may clear the credit — see
  // the note in CRTTV about enter/leave ordering.
  const handleHoverChange = useCallback((project, entering) => {
    setHoveredProject((prev) => {
      if (entering) return project;
      return prev && prev.id === project.id ? null : prev;
    });
  }, []);

  // Shows flagged `featured` in projects.js open the section, in the
  // order they appear there. Everything else waits behind "View All".
  const { ordered, featuredCount } = useMemo(() => {
    const featured = items.filter((p) => p.featured);
    const rest = items.filter((p) => !p.featured);
    return {
      ordered: [...featured, ...rest],
      // if nothing is flagged, fall back to opening with a sensible few
      featuredCount: featured.length || Math.min(items.length, 8),
    };
  }, [items]);

  const coreCount = Math.min(featuredCount, ordered.length);
  const visibleCount = expanded ? ordered.length : coreCount;
  const visible = ordered.slice(0, visibleCount);

  // The opening arrangement occupies the first `coreCount` slots and is
  // identical in both states, so expanding never moves a set that was
  // already on screen — the pile simply grows outward around it.
  const slots = useMemo(
    () => buildPile(visibleCount, coreCount),
    [visibleCount, coreCount]
  );
  const camera = useMemo(() => framePile(slots, BASE_FOV), [slots]);

  // The backlight and its pool are sized to the stack, so they still sit
  // behind it once the archive opens out to twenty sets.
  const { pileW, pileH } = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let maxY = 0;
    slots.forEach((s) => {
      minX = Math.min(minX, s.pos[0] - s.w / 2);
      maxX = Math.max(maxX, s.pos[0] + s.w / 2);
      maxY = Math.max(maxY, s.pos[1] + s.h);
    });
    return { pileW: Math.max(1, maxX - minX), pileH: Math.max(1, maxY) };
  }, [slots]);

  // The room opens up as the archive does: the lamp reaches further and
  // the fill lifts a little, so a wider pile isn't a darker one.
  const spread = expanded ? 1 : 0;

  return (
    <div className="reality-tv-scene">
      <SceneCanvas
        height="clamp(28rem, calc(100vh - 17rem), 46rem)"
        camera={camera}
        far={CAMERA_FAR}
      >
        {/* Almost no fill — the sets are lit by what's behind them. */}
        <ambientLight intensity={0.18 + spread * 0.05} color="#7f8ba3" />
        <Environment preset="warehouse" environmentIntensity={0.28} />

        {/* Backlight. Behind and above the stack, so it rims the cabinets
            and separates them from the black without ever landing on a
            surface that would read as a wall. */}
        <pointLight position={[0, pileH * 0.7, -2.4]} intensity={26} distance={11} decay={2} color="#9db3dc" />
        <pointLight position={[-pileW * 0.34, pileH * 0.35, -2.0]} intensity={12} distance={8} decay={2} color="#7f9ed0" />
        <pointLight position={[pileW * 0.34, pileH * 0.35, -2.0]} intensity={12} distance={8} decay={2} color="#7f9ed0" />

        {/* Screen spill: pools of light standing in for the glow the
            televisions throw onto each other. Cheaper than one light per
            set, and reads the same once bloom is doing the heavy work. */}
        <pointLight position={[-0.9 - spread, 0.9, 1.1]} intensity={2.4} distance={4.4} decay={2} color="#7fb4ff" />
        <pointLight position={[0.8 + spread, 1.4, 1.1]} intensity={2.2} distance={4.2} decay={2} color="#ffb27f" />
        <pointLight position={[0.1, 2.1 + spread * 0.4, 1.0]} intensity={1.6} distance={4} decay={2} color="#a98fff" />

        <Backdrop width={pileW} height={pileH} />

        <Pile
          visible={visible}
          slots={slots}
          onExpand={onExpand}
          onHoverChange={handleHoverChange}
        />

        {/* Atmosphere only — deliberately no depth of field, so the
            shows stay crisp. */}
        <SceneGrade bloom={0.55} threshold={0.55} vignette={0.62} offset={0.38} grain={0.035} />
      </SceneCanvas>

      {/* Below the pile, never over it. */}
      <div className="reality-tv-scene__footer">
        <ShowInfoCard project={hoveredProject} />

        {ordered.length > coreCount && (
          <button
            type="button"
            className="reality-tv-scene__toggle"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Show Less" : `View All ${items[0].category}`}
          </button>
        )}
      </div>
    </div>
  );
}
