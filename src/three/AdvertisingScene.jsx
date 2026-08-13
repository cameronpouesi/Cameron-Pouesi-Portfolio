import { Environment } from "@react-three/drei";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import Poster from "./Poster";
import SceneCanvas from "./SceneCanvas";
import ShowInfoCard from "./ShowInfoCard";
import useHoveredProject from "./useHoveredProject";
import SceneGrade from "./SceneGrade";

function hash(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function layoutFor(index, total) {
  const cols = Math.min(total, 3);
  const col = index % cols;
  const row = Math.floor(index / cols);
  const x = (col - (cols - 1) / 2) * 2.6 + (hash(index * 3.1) - 0.5) * 0.4;
  const y = 0.6 - row * 1.9 + (hash(index * 6.3) - 0.5) * 0.3;
  const rotationZ = (hash(index * 4.7) - 0.5) * 0.1;
  return { position: [x, y, 0], rotationZ };
}

function PosterWall() {
  const metal = useTexture("/textures/corrugated_iron.jpg");
  metal.colorSpace = THREE.SRGBColorSpace;
  metal.wrapS = metal.wrapT = THREE.RepeatWrapping;
  metal.repeat.set(3, 2);

  return (
    <mesh position={[0, 0, -0.6]}>
      <planeGeometry args={[16, 9]} />
      <meshStandardMaterial map={metal} roughness={0.9} metalness={0.3} color="#b8b8b8" />
    </mesh>
  );
}

export default function AdvertisingScene({ items, onExpand }) {
  const [hoveredProject, onHoverChange] = useHoveredProject();
  return (
    <div className="advertising-scene">
      <SceneCanvas height="clamp(28rem, calc(100vh - 16rem), 46rem)" camera={{ position: [0, 0.3, 8.5], fov: 40 }}>
        <ambientLight intensity={0.24} color="#9fb0cc" />
        {/* late-afternoon sun raking across the hoarding, and the cool
            bounce coming back off the street */}
        <directionalLight position={[5, 6, 5]} intensity={1.5} color="#ffdcb0" castShadow />
        <pointLight position={[-5, 1.5, 4]} intensity={6} distance={16} decay={2} color="#5f86c8" />
        <Environment preset="city" environmentIntensity={0.45} />

        <PosterWall />

        {items.map((project, i) => (
          <Poster key={project.id} project={project} onExpand={onExpand} onHoverChange={onHoverChange} {...layoutFor(i, items.length)} />
        ))}

        <SceneGrade bloom={0.38} threshold={0.7} vignette={0.58} offset={0.38} grain={0.028} />
      </SceneCanvas>

      <ShowInfoCard project={hoveredProject} />
    </div>
  );
}
