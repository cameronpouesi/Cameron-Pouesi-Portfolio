import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { motion } from "framer-motion";
import { isLowEndDevice } from "./deviceTier";
import { SceneOwnerContext } from "./SceneOwnerContext";
import { releaseOwner } from "./screenAudio";
import "./SceneCanvas.css";

const REFERENCE_ASPECT = 16 / 9;

// The fov passed into each scene is tuned for a ~16:9 container. On
// narrower/taller viewports (most phones), keeping that same *vertical*
// fov makes the horizontal framing much tighter and content overflows
// the sides. This derives a wider vertical fov as aspect narrows so the
// horizontal field of view — and therefore the composition width —
// stays roughly consistent across screen shapes.
//
// It only ever widens. Scenes frame themselves by fitting their contents
// to `baseFov`, so letting this fall below that on a container wider
// than 16:9 would quietly crop the top of whatever they'd fitted — which
// is what was slicing the lid off the television at the top of the pile
// as it rose on hover.
function responsiveFov(baseFov, aspect) {
  const baseFovRad = (baseFov * Math.PI) / 180;
  const hFovRad = 2 * Math.atan(Math.tan(baseFovRad / 2) * REFERENCE_ASPECT);
  const newFovRad = 2 * Math.atan(Math.tan(hFovRad / 2) / Math.max(aspect, 0.4));
  return Math.max(baseFov, (newFovRad * 180) / Math.PI);
}

/**
 * Eases the camera toward wherever the scene currently wants it, rather
 * than cutting. A scene that reveals more of itself therefore reads as
 * the camera slowly pulling back to take it all in.
 *
 * The camera's own position/fov props are set once at mount and never
 * touched again — this owns them from then on, so React re-renders can't
 * yank the shot mid-move.
 */
function CameraDolly({ position, fov }) {
  const target = useRef({ position, fov });
  target.current = { position, fov };

  useFrame((state, delta) => {
    const cam = state.camera;
    const { position: p, fov: f } = target.current;
    // slow enough to feel like a dolly, quick enough not to hold the
    // viewer up; frame-rate independent
    const t = 1 - Math.exp(-delta * 2.4);

    cam.position.x += (p[0] - cam.position.x) * t;
    cam.position.y += (p[1] - cam.position.y) * t;
    cam.position.z += (p[2] - cam.position.z) * t;

    if (Math.abs(cam.fov - f) > 0.01) {
      cam.fov += (f - cam.fov) * t;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}

/**
 * Shared wrapper for every environment's 3D world: fades/scales in on
 * scroll like the rest of the site, keeps framing consistent across
 * screen shapes, and dials back render cost on lower-end devices.
 */
export default function SceneCanvas({
  children,
  height = "90vh",
  camera,
  far = 60,
  className = "",
}) {
  const containerRef = useRef(null);
  const [aspect, setAspect] = useState(REFERENCE_ASPECT);
  const [lowEnd] = useState(isLowEndDevice);

  // Identifies this room to the audio manager. A plain stable object —
  // its only job is to be comparable.
  const owner = useRef({}).current;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height: h } = entry.contentRect;
      if (h > 0) setAspect(width / h);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scrolling away from a room fades its sound out. Screens inside carry
  // on playing — it's only the listening that follows the visitor.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) releaseOwner(owner);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      releaseOwner(owner);
    };
  }, [owner]);

  const baseFov = camera?.fov ?? 40;
  const basePosition = camera?.position ?? [0, 0, 8];
  const fov = responsiveFov(baseFov, aspect);

  // Frozen at mount so React never re-applies them and fights the dolly.
  const initial = useRef({ position: basePosition, fov });

  return (
    <motion.div
      ref={containerRef}
      className={`scene-canvas ${className}`.trim()}
      style={{ "--scene-height": height }}
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Shadows are what make an object sit *in* a room rather than in
          front of it. Every castShadow/receiveShadow in this project was
          inert until this was turned on. "soft" is PCSS — contact stays
          tight and the penumbra opens with distance, which is the whole
          tell. Dropped entirely on low-end hardware. */}
      {/* "percentage" rather than "soft": three deprecated PCFSoft and
          silently substitutes PCF anyway, so asking for soft only bought
          six deprecation warnings a page and the same shadows. */}
      <Canvas
        shadows={lowEnd ? false : "percentage"}
        dpr={lowEnd ? 1 : [1, 2]}
        gl={{ antialias: !lowEnd, powerPreference: "high-performance" }}
      >
        {/* far is kept tight (room scale, not 2000 units) so post
            effects that work in normalized depth have predictable,
            tunable values. */}
        <PerspectiveCamera
          makeDefault
          position={initial.current.position}
          fov={initial.current.fov}
          near={0.1}
          far={far}
        />
        <CameraDolly position={basePosition} fov={fov} />
        <Suspense fallback={null}>
          <SceneOwnerContext.Provider value={owner}>
            {children}
          </SceneOwnerContext.Provider>
        </Suspense>
      </Canvas>
    </motion.div>
  );
}
