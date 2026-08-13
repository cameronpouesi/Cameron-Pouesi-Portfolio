import { Environment } from "@react-three/drei";
import FloatingCard from "./FloatingCard";
import StageProp from "./StageProp";
import SceneCanvas from "./SceneCanvas";
import ShowInfoCard from "./ShowInfoCard";
import useHoveredProject from "./useHoveredProject";
import SceneGrade from "./SceneGrade";

const GLOW = ["#ffcf6b", "#ff8fd8", "#8fd8ff", "#c9ff8f"];

function layoutFor(index, total) {
  const spread = Math.max(total - 1, 1);
  const x = (index - spread / 2) * 2.0;
  const y = 0.3 + Math.sin(index * 1.9) * 0.5;
  const z = 1.2 + (index % 2) * 0.6;
  return { position: [x, y, z], bobPhase: index * 1.4 };
}

export default function ComedyScene({ items, onExpand }) {
  const [hoveredProject, onHoverChange] = useHoveredProject();
  return (
    <div className="comedy-scene">
      <SceneCanvas height="clamp(28rem, calc(100vh - 16rem), 46rem)" camera={{ position: [0, 0.5, 8.5], fov: 42 }}>
        <ambientLight intensity={0.1} color="#8090b0" />
        {/* the one hard key a stage has, plus two colour washes from the wings */}
        <spotLight position={[0, 6.5, 4]} angle={0.55} penumbra={0.85} intensity={90} distance={22} decay={2} color="#ffe9b0" castShadow />
        <pointLight position={[-5, 1.2, 3]} intensity={7} distance={12} decay={2} color="#ff2fd6" />
        <pointLight position={[5, 1.2, 3]} intensity={6} distance={12} decay={2} color="#2fe8ff" />
        <Environment preset="night" environmentIntensity={0.35} />

        <StageProp />

        {items.map((project, i) => (
          <FloatingCard
            key={project.id}
            project={project}
            onExpand={onExpand}
            onHoverChange={onHoverChange}
            glowColor={GLOW[i % GLOW.length]}
            {...layoutFor(i, items.length)}
          />
        ))}

        <SceneGrade bloom={0.5} threshold={0.6} vignette={0.66} offset={0.34} grain={0.032} />
      </SceneCanvas>

      <ShowInfoCard project={hoveredProject} />
    </div>
  );
}
