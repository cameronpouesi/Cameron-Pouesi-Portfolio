/** A dim edit-suite desk: PC tower with an RGB strip, keyboard, desk
 * surface — grounds the floating monitors in a real workspace. */
export default function DeskProp({ position = [0, -2.4, 0.5] }) {
  return (
    <group position={position}>
      {/* desk surface */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[7, 0.08, 1.6]} />
        <meshStandardMaterial color="#0e0e10" roughness={0.4} metalness={0.3} />
      </mesh>
      {[-3.2, 3.2].map((x) => (
        <mesh key={x} position={[x, -0.55, 0.6]}>
          <boxGeometry args={[0.08, 1.05, 0.08]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.5} />
        </mesh>
      ))}

      {/* keyboard */}
      <mesh position={[0, 0.05, 0.3]}>
        <boxGeometry args={[1.3, 0.04, 0.45]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>

      {/* PC tower with RGB strip */}
      <group position={[2.6, 0.62, -0.3]}>
        <mesh>
          <boxGeometry args={[0.5, 1.15, 1]} />
          <meshStandardMaterial color="#0c0c0d" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[0.26, 0, 0]}>
          <boxGeometry args={[0.01, 1.0, 0.85]} />
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}
