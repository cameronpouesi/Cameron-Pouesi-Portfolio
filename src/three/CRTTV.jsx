import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Clone } from "@react-three/drei";
import * as THREE from "three";
import Screen from "./Screen";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;

// How far the tube's face domes outward, and how far the picture floats
// off it. Both are small: the picture belongs *on* the glass, and every
// millimetre of daylight between them shows up as parallax the moment a
// set is turned even slightly off square.
const BULGE = 0.014;
const PICTURE_LIFT = 0.003;

// Real sets overscan — the picture is broadcast slightly larger than the
// mask so the edges of the raster never show. Doing the same here means
// the measured aperture doesn't have to be perfect to the millimetre for
// the glass to read as lit corner to corner.
const OVERSCAN = 1.02;

/**
 * How hard this show's artwork is pushed toward filling its glass.
 *
 * Defaults to the cabinet's own setting, which fills completely. A show
 * whose title lockup runs to the very edge of its key art can override
 * it in projects.js: "whole" keeps every pixel and accepts bars above
 * and below, and a number between the two trades one against the other.
 */
function artFitFor(project, model) {
  const fit = project.artFit;
  if (fit === "whole") return 1;
  if (typeof fit === "number") return fit;
  return model.maxZoom;
}

/**
 * Real CRT glass bulges outward. A flat plane instantly reads as a
 * sticker on the front of the set, so the overlays sit on a subtly
 * domed surface instead — enough to catch light across the curve.
 *
 * The dome runs from 0 at its edges to `bulge` at its centre, so a mesh
 * placed at local z sits no closer than z anywhere on it. That's what
 * lets the overlays be stacked in front of the flat picture without any
 * of them punching through it near the corners.
 */
function useCurvedScreenGeometry(width, height, bulge = BULGE) {
  return useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, 16, 16);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) / (width / 2);
      const y = pos.getY(i) / (height / 2);
      // falls off toward the edges, peaks at centre
      const z = Math.cos((x * Math.PI) / 2) * Math.cos((y * Math.PI) / 2) * bulge;
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, [width, height, bulge]);
}

/**
 * One television in the repair-shop stack. The cabinet is a real
 * photoscanned CC0 model (weathering, scratches and smudges baked into
 * its PBR maps); we only supply what it can't — the picture on the
 * glass.
 *
 * Transform is driven in useFrame rather than as JSX props so the whole
 * stack can smoothly re-settle when the layout changes.
 */
export default function CRTTV({
  model,
  project,
  onExpand,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  // Where this set travels in from on its very first frame. Sets that
  // were already on screen barely move; ones revealed later come in
  // from beyond the edge of frame.
  entryFrom = null,
  // Staggers this set's move so the pile re-forms in a wave rather than
  // every television lurching at once.
  delay = 0,
  onHoverChange,
}) {
  const { scene } = useGLTF(model.url);
  const groupRef = useRef();
  const settledRef = useRef(false);
  const clockRef = useRef(0);
  const targetKeyRef = useRef("");
  const [hovered, setHovered] = useState(false);

  const s = model.screen;
  const glassGeo = useCurvedScreenGeometry(s.w, s.h);
  const scanlines = getScanlineTexture();

  // Restart the stagger whenever this set is given a new resting place.
  const targetKey = `${position[0]},${position[1]},${position[2]}`;
  if (targetKeyRef.current !== targetKey) {
    targetKeyRef.current = targetKey;
    clockRef.current = 0;
  }

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;

    // First frame: come in from wherever the scene says, so a newly
    // revealed television travels into the pile instead of popping.
    if (!settledRef.current) {
      const from = entryFrom ?? [position[0], position[1] - 0.9, position[2] - 0.6];
      g.position.set(from[0], from[1], from[2]);
      g.rotation.set(rotation[0], rotation[1], rotation[2]);
      g.scale.setScalar(scale * 0.82);
      settledRef.current = true;
    }

    clockRef.current += delta;

    // Nothing moves until this set's turn comes round; then it eases in
    // rather than starting at full speed, which is what makes the pile
    // re-form as one flowing motion.
    const since = clockRef.current - delay;
    if (since <= 0) return;
    const ramp = 1 - Math.exp(-since * 2.2); // 0 → 1, soft start
    const t = clamp(delta * 4.2 * ramp, 0, 1);

    g.position.x = lerp(g.position.x, position[0], t);
    g.position.y = lerp(g.position.y, position[1], t);
    // Hovered set eases toward the viewer, out of the pile. Kept
    // modest — a big lunge toward the camera pushes sets at the top of
    // the pile outside the frame.
    const hoverT = clamp(delta * 7, 0, 1);
    g.position.z = lerp(g.position.z, position[2] + (hovered ? 0.26 : 0), hoverT);
    g.rotation.y = lerp(g.rotation.y, rotation[1] + (hovered ? -0.05 : 0), hoverT);

    // Always uniform. A cabinet squashed to suit its artwork stops
    // looking like a photographed object, which is the one thing these
    // models are here for — the picture is fitted to the glass instead.
    const targetScale = scale * (hovered ? 1.06 : 1);
    g.scale.setScalar(lerp(g.scale.y, targetScale, Math.max(t, hoverT * 0.6)));
  });

  // Reports which project is entering/leaving rather than just "some
  // project left" — moving straight from one set to another fires the
  // new one's enter before the old one's leave, so the scene needs to
  // know who is leaving to avoid clearing a credit that just appeared.
  const setHover = (entering) => {
    setHovered(entering);
    onHoverChange?.(project, entering);
  };

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHover(false);
        document.body.style.cursor = "default";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onExpand(project);
      }}
    >
      <Clone object={scene} castShadow receiveShadow />

      {/* The picture, on the glass itself — the group is anchored to the
          measured centre of the tube face, not to the front of the
          cabinet, which on these models is the speaker grille sticking
          out several centimetres further forward. */}
      <group position={[s.x, s.y, s.z]}>
        {/* dark backing, in case a texture is still loading */}
        <mesh position={[0, 0, -BULGE - 0.001]} geometry={glassGeo} renderOrder={1}>
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Sized to the glass opening, with this set's own allowance for
            how far a picture may be pushed toward filling it. */}
        <group position={[0, 0, PICTURE_LIFT]}>
          <Screen
            project={project}
            hovered={hovered}
            width={s.w * OVERSCAN}
            height={s.h * OVERSCAN}
            maxZoom={artFitFor(project, model)}
          />
        </group>

        {/* phosphor scanlines + a soft sheen raking across the curve —
            domed, so the tube's shape reads across the picture */}
        <mesh position={[0, 0, PICTURE_LIFT + 0.001]} geometry={glassGeo} renderOrder={2}>
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={0.12}
            depthWrite={false}
            alphaMap={scanlines}
          />
        </mesh>
        <mesh position={[0, 0, PICTURE_LIFT + 0.003]} geometry={glassGeo} renderOrder={3}>
          <meshPhysicalMaterial
            transparent
            opacity={hovered ? 0.04 : 0.07}
            roughness={0.08}
            metalness={0}
            color="#cfe0ff"
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

// A tiny repeating stripe used as an alpha map to lay fine dark
// scanlines over the picture — the single most recognisable CRT tell.
// Built once and shared by every television in the stack.
let scanlineTexture = null;
function getScanlineTexture() {
  if (scanlineTexture) return scanlineTexture;
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 4;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 4, 4);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 4, 2);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 220);
  tex.magFilter = THREE.LinearFilter;
  scanlineTexture = tex;
  return tex;
}
