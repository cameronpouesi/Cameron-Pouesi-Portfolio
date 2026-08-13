import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/** Decorative spinning film reel — atmosphere, not interactive. */
export default function FilmReelProp({ position = [0, 0, 0], scale = 1 }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.15;
  });

  return (
    <group position={position} scale={scale}>
      <mesh ref={ref}>
        <torusGeometry args={[0.8, 0.08, 12, 40]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.4} />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <mesh key={deg} rotation={[0, 0, (deg * Math.PI) / 180]}>
            <boxGeometry args={[1.5, 0.04, 0.04]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.4} />
          </mesh>
        ))}
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.1, 24]} />
        <meshStandardMaterial color="#111" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  );
}
