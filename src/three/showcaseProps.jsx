import { useMemo } from "react";
import { useGLTF, Clone } from "@react-three/drei";
import * as THREE from "three";

// ============================================================================
// Set dressing for the three-chapter room.
//
// Everything here that could be a real scanned object *is* one — the
// stool, the lamp, the shelf and the books are CC0 photoscans from Poly
// Haven, arriving with their own diffuse / normal / ARM maps already
// wired in. That's the same authoring as the CRT televisions, and it is
// why they hold up beside them.
//
// The microphone is the exception, and deliberately so: there is no CC0
// scanned mic on Poly Haven, so it stays hand-built. It gets away with it
// because it is almost pure silhouette in a hard spotlight — a thin
// chrome stand and a mesh grille, seen against black.
// ============================================================================

export const PROP_MODELS = {
  stool: "/models/bar_chair_round_01/bar_chair_round_01_1k.gltf",
  lamp: "/models/desk_lamp_arm_01/desk_lamp_arm_01_1k.gltf",
  bookshelf: "/models/wooden_bookshelf_worn/wooden_bookshelf_worn_1k.gltf",
  books: "/models/book_encyclopedia_set_01/book_encyclopedia_set_01_1k.gltf",
};

Object.values(PROP_MODELS).forEach((u) => useGLTF.preload(u));

/** Drops a scanned model in, casting and receiving like a real object. */
function Prop({ url, position, rotation, scale = 1 }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  return <primitive object={model} position={position} rotation={rotation} scale={scale} />;
}

export function Stool({ position = [0, 0, 0], rotation = [0, 0.6, 0], scale = 1 }) {
  return <Prop url={PROP_MODELS.stool} position={position} rotation={rotation} scale={scale} />;
}

export function Bookshelf({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  return <Prop url={PROP_MODELS.bookshelf} position={position} rotation={rotation} scale={scale} />;
}

export function Books({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  return <Prop url={PROP_MODELS.books} position={position} rotation={rotation} scale={scale} />;
}

// The encyclopedia scan is already a run of twenty volumes standing
// together, 55cm end to end — not one book. A shelf is therefore built
// from a couple of these runs, not from twenty copies of anything.
const BOOK_SET_W = 0.55;

/**
 * A shelf of books.
 *
 * `position` is the left end of the row, at the height of the plank it
 * stands on, in the *bookshelf's* coordinates — nest this inside the
 * shelf's transform so the plank heights mean something.
 *
 * Every run shares the scan's geometry and material; what stops two runs
 * side by side from reading as a repeat is that each is squeezed and
 * stretched a little, and every other one is turned to face the other
 * way, which puts a different set of spines forward.
 */
export function BookRow({ position = [0, 0, 0], rotation = [0, 0, 0], sets = 2, seed = 0 }) {
  const { scene } = useGLTF(PROP_MODELS.books);

  const runs = useMemo(() => {
    const rand = (i, n) => Math.abs(Math.sin((i + seed * 7 + 1) * n) * 43758.5453) % 1;
    const out = [];
    let x = 0;
    for (let i = 0; i < sets; i += 1) {
      const r0 = rand(i, 12.9898);
      const r1 = rand(i, 78.233);
      const r2 = rand(i, 39.425);
      const sx = 0.92 + r0 * 0.18;
      const w = BOOK_SET_W * sx;
      out.push({
        x: x + w / 2,
        z: -0.05 + r2 * 0.03,
        sx,
        sy: 0.88 + r1 * 0.24,
        ry: i % 2 ? Math.PI : 0,
      });
      // books never quite touch, and the gap grows where one's been taken
      x += w + 0.008 + r2 * 0.045;
    }
    return out;
  }, [sets, seed]);

  return (
    <group position={position} rotation={rotation}>
      {runs.map((b, i) => (
        <group
          key={i}
          position={[b.x, 0, b.z]}
          rotation={[0, b.ry, 0]}
          scale={[b.sx, b.sy, 1]}
        >
          {/* offset so the run turns about its own middle */}
          <Clone
            object={scene}
            position={[-BOOK_SET_W / 2, 0, 0]}
            castShadow
            receiveShadow
          />
        </group>
      ))}
    </group>
  );
}

/** The scanned desk lamp, plus the light it's obviously making. */
export function DeskLamp({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  intensity = 9,
  color = "#ffb968",
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Prop url={PROP_MODELS.lamp} position={[0, 0, 0]} />
      <pointLight position={[0.1, 0.42, 0.16]} intensity={intensity} distance={7} decay={2} color={color} />
      {/* the bulb itself, so bloom has something to catch */}
      <mesh position={[0.1, 0.4, 0.16]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#ffdcae" toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * Vocal mic on a boom stand.
 *
 * Hand-built, because no scanned one exists under CC0. Chrome and matte
 * black at real PBR values so it behaves correctly under the key light,
 * and the grille is a second sphere in wireframe — from the front, under
 * a hard spot, that reads as mesh far better than geometry would.
 */
export function MicStand({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const chrome = { roughness: 0.22, metalness: 1, color: "#b9bdc4" };
  const matte = { roughness: 0.78, metalness: 0.15, color: "#141416" };

  return (
    <group position={position} rotation={rotation}>
      {/* Cast-iron base: a low dome, not a disc with a chrome rim. With
          no floor under it the rim caught the key light all the way
          round and read as a hoop hanging in the dark. */}
      <mesh position={[0, 0.018, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.31, 0.036, 40]} />
        <meshStandardMaterial {...matte} />
      </mesh>
      <mesh position={[0, 0.052, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.26, 0.036, 40]} />
        <meshStandardMaterial {...matte} roughness={0.7} />
      </mesh>

      <mesh position={[0, 0.78, 0]} castShadow>
        <cylinderGeometry args={[0.019, 0.026, 1.48, 20]} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.042, 0.042, 0.1, 20]} />
        <meshStandardMaterial {...matte} />
      </mesh>

      <mesh position={[0.16, 1.62, 0]} rotation={[0, 0, -0.5]} castShadow>
        <cylinderGeometry args={[0.014, 0.014, 0.44, 16]} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      <mesh position={[0.34, 1.79, 0]} rotation={[0, 0, -0.5]} castShadow>
        <cylinderGeometry args={[0.034, 0.03, 0.18, 20]} />
        <meshStandardMaterial {...matte} />
      </mesh>

      {/* capsule, then its grille */}
      <mesh position={[0.4, 1.89, 0]} castShadow>
        <sphereGeometry args={[0.06, 28, 22]} />
        <meshStandardMaterial roughness={0.42} metalness={1} color="#8f9298" />
      </mesh>
      <mesh position={[0.4, 1.89, 0]}>
        <sphereGeometry args={[0.063, 16, 12]} />
        <meshBasicMaterial color="#07070a" wireframe />
      </mesh>
    </group>
  );
}

/** The cable, leaving the mic and coiling away across the floor. */
export function MicCable({ from = [0, 1.66, 0], to = [-1.9, 0.03, 0.4] }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...from),
      new THREE.Vector3(from[0] - 0.1, from[1] - 0.5, from[2] + 0.05),
      new THREE.Vector3(from[0] - 0.05, from[1] - 1.05, from[2] - 0.02),
      new THREE.Vector3(from[0] - 0.08, 0.03, from[2] + 0.14),
      new THREE.Vector3((from[0] + to[0]) / 2, 0.03, to[2] + 0.22),
      new THREE.Vector3(to[0] + 0.4, 0.03, to[2] - 0.16),
      new THREE.Vector3(...to),
    ]);
    return new THREE.TubeGeometry(curve, 110, 0.013, 10, false);
  }, [from, to]);

  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color="#0a0a0b" roughness={0.62} metalness={0.05} />
    </mesh>
  );
}

/** A few soft toys and blocks on the floor. Rounded, matte, never quite
 *  lined up — small and mostly in shadow, so shape is enough. `scale`
 *  matters here: at full size the bear is nearly a metre tall and it
 *  stops being set dressing and starts being a character. */
export function ToyScatter({ position = [0, 0, 0], scale = 1 }) {
  const blocks = [
    { p: [0.55, 0.07, 0.5], c: "#d24b4b", r: 0.5 },
    { p: [0.78, 0.07, 0.28], c: "#4b7fd2", r: -0.3 },
    { p: [0.62, 0.21, 0.44], c: "#e0c14b", r: 0.15 },
  ];
  return (
    <group position={position} scale={scale}>
      <mesh position={[-0.5, 0.24, 0.3]} castShadow receiveShadow>
        <sphereGeometry args={[0.24, 24, 20]} />
        <meshStandardMaterial color="#8a6b4a" roughness={1} />
      </mesh>
      <mesh position={[-0.5, 0.52, 0.3]} castShadow>
        <sphereGeometry args={[0.17, 24, 20]} />
        <meshStandardMaterial color="#967652" roughness={1} />
      </mesh>
      {[-0.62, -0.38].map((ex) => (
        <mesh key={ex} position={[ex, 0.65, 0.3]} castShadow>
          <sphereGeometry args={[0.06, 16, 14]} />
          <meshStandardMaterial color="#967652" roughness={1} />
        </mesh>
      ))}

      {blocks.map((b, i) => (
        <mesh key={i} position={b.p} rotation={[0, b.r, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.14, 0.14, 0.14]} />
          <meshStandardMaterial color={b.c} roughness={0.72} />
        </mesh>
      ))}

      {/* Muted, not white: a pale sphere against a black room stops
          being a ball on the floor and becomes the brightest thing in
          the shot. */}
      <mesh position={[1.15, 0.13, 0.62]} castShadow receiveShadow>
        <sphereGeometry args={[0.13, 24, 20]} />
        <meshStandardMaterial color="#9d8d78" roughness={0.88} />
      </mesh>
    </group>
  );
}
