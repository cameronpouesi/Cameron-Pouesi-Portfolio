import { useState } from "react";
import { Environment, ContactShadows, useTexture } from "@react-three/drei";
import * as THREE from "three";
import FlatTV from "./FlatTV";
import ToyProps from "./ToyProps";
import SceneCanvas from "./SceneCanvas";
import ShowInfoCard from "./ShowInfoCard";
import useHoveredProject from "./useHoveredProject";
import SceneGrade from "./SceneGrade";
import "./LivingRoomScene.css";

function RoomShell() {
  const [wall, floor] = useTexture(["/textures/grey_plaster.jpg", "/textures/old_wood_floor.jpg"]);
  wall.colorSpace = THREE.SRGBColorSpace;
  floor.colorSpace = THREE.SRGBColorSpace;
  wall.wrapS = wall.wrapT = THREE.RepeatWrapping;
  wall.repeat.set(2.5, 1.3);
  floor.wrapS = floor.wrapT = THREE.RepeatWrapping;
  floor.repeat.set(3, 1.6);

  return (
    <>
      {/* wall — real plaster texture, tinted playful navy */}
      <mesh position={[0, 1, -3]}>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial map={wall} color="#3a4f7a" roughness={0.95} />
      </mesh>
      {/* floor — real wood texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 2]}>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial map={floor} roughness={0.85} />
      </mesh>
    </>
  );
}

export default function LivingRoomScene({ items, onExpand }) {
  const [index, setIndex] = useState(0);
  const [hoveredProject, onHoverChange] = useHoveredProject();
  const project = items[index % items.length];

  return (
    <div className="living-room-scene">
      <SceneCanvas height="clamp(28rem, calc(100vh - 16rem), 46rem)" camera={{ position: [0, 0, 8.5], fov: 40 }}>
        <ambientLight intensity={0.25} color="#93a6c8" />
        {/* afternoon coming through a window off to the left, and the
            warm lamp in the corner of the room */}
        <directionalLight position={[-5, 5, 4]} intensity={1.35} color="#ffeccd" castShadow />
        <pointLight position={[3.4, -0.4, 1.6]} intensity={7} distance={11} decay={2} color="#ffab5c" />
        <Environment preset="apartment" environmentIntensity={0.4} />

        <RoomShell />

        {/* rug */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.08, 1.4]}>
          <circleGeometry args={[2.4, 32]} />
          <meshStandardMaterial color="#c96b4f" roughness={0.9} />
        </mesh>

        <FlatTV project={project} onExpand={onExpand} onHoverChange={onHoverChange} position={[0, 0.2, -1.4]} width={4} />
        <ToyProps />

        <ContactShadows position={[0, -2.05, 0]} opacity={0.35} scale={12} blur={2} far={3} />

        <SceneGrade bloom={0.34} threshold={0.72} vignette={0.54} offset={0.4} grain={0.025} />
      </SceneCanvas>

      <ShowInfoCard project={hoveredProject} />

      {items.length > 1 && (
        <div className="living-room-scene__channels">
          {items.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={i === index ? "is-active" : ""}
              onClick={() => setIndex(i)}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
