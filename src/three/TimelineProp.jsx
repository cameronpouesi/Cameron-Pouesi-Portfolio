/** Decorative glowing timeline bar — grounds the floating monitors in an
 * "editing suite" idea without needing a literal desk model. */
export default function TimelineProp({ position = [0, -1.8, 0], width = 10 }) {
  const ticks = 24;
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[width, 0.02, 0.4]} />
        <meshStandardMaterial
          color="#4d9dff"
          emissive="#4d9dff"
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>
      {Array.from({ length: ticks }).map((_, i) => {
        const x = -width / 2 + (width / (ticks - 1)) * i;
        const tall = i % 4 === 0;
        return (
          <mesh key={i} position={[x, tall ? 0.06 : 0.03, 0]}>
            <boxGeometry args={[0.015, tall ? 0.12 : 0.06, 0.015]} />
            <meshStandardMaterial
              color="#8ec4ff"
              emissive="#8ec4ff"
              emissiveIntensity={0.6}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
