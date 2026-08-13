/** Scattered toys on the floor — a ball, some blocks — just atmosphere,
 * not interactive. Bright saturated colors, opposite mood to the darker
 * adult-facing environments. */
export default function ToyProps() {
  return (
    <group position={[0, -1.9, 1.5]}>
      <mesh position={[-1.6, 0.22, 0.3]}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial color="#ff5d5d" roughness={0.4} />
      </mesh>

      {[
        { pos: [1.4, 0.13, 0.6], color: "#ffcc4d", rot: 0.3 },
        { pos: [1.75, 0.13, 0.4], color: "#4dc9ff", rot: -0.4 },
        { pos: [1.55, 0.38, 0.5], color: "#7cd992", rot: 0.6 },
      ].map((b, i) => (
        <mesh key={i} position={b.pos} rotation={[0, b.rot, 0]}>
          <boxGeometry args={[0.26, 0.26, 0.26]} />
          <meshStandardMaterial color={b.color} roughness={0.5} />
        </mesh>
      ))}

      <mesh position={[0, 0.06, 1.2]} rotation={[-Math.PI / 2, 0, 0.4]}>
        <torusGeometry args={[0.35, 0.07, 12, 24]} />
        <meshStandardMaterial color="#ff9d4d" roughness={0.5} />
      </mesh>
    </group>
  );
}
