import { useTexture } from "@react-three/drei";
import * as THREE from "three";

/** An empty stand-up comedy stage: real brick-wall photo texture,
 * curtain panels framing the sides, floor, a mic stand + stool, and a
 * visible spotlight beam. Backdrop for floating thumbnails, not
 * interactive itself. */
export default function StageProp() {
  const brick = useTexture("/textures/brick_wall.jpg");
  brick.colorSpace = THREE.SRGBColorSpace;
  brick.wrapS = brick.wrapT = THREE.RepeatWrapping;
  brick.repeat.set(2.2, 1.4);

  return (
    <group position={[0, -2.1, -2]}>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1]}>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color="#0c0a0d" roughness={0.6} metalness={0.15} />
      </mesh>

      {/* real brick wall backdrop */}
      <mesh position={[0, 2.4, -2.6]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial map={brick} roughness={0.95} color="#8a8a8a" />
      </mesh>

      {/* curtain panels framing the sides */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 6.2, 2.4, -2.4]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[side * i * 0.34, 0, i * -0.02]}>
              <planeGeometry args={[0.4, 5]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? "#3a1319" : "#230a0e"}
                roughness={0.9}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* mic stand, center stage */}
      <group position={[-0.5, 0, 0.6]}>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.03, 16]} />
          <meshStandardMaterial color="#111" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 1.25, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.6} metalness={0.3} />
        </mesh>
      </group>

      {/* wooden stool beside the mic */}
      <group position={[0.5, 0, 0.6]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 20]} />
          <meshStandardMaterial color="#8a5a34" roughness={0.6} />
        </mesh>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.16, 0.25, Math.sin(a) * 0.16]}>
              <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
              <meshStandardMaterial color="#6b4423" roughness={0.6} />
            </mesh>
          );
        })}
      </group>

      {/* visible spotlight beam */}
      <mesh position={[0, 3.2, 0.6]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1.6, 3.4, 32, 1, true]} />
        <meshBasicMaterial
          color="#ffe9b0"
          transparent
          opacity={0.06}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
