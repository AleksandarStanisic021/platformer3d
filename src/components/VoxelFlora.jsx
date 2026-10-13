const LEAVES = ['#3f8f42', '#55a84f', '#78bd55', '#35783c', '#4c9a70']
const FLOWERS = ['#f4cc45', '#e879c8', '#f08055', '#8edcf0', '#e7e4a0']
const BARK = ['#79502f', '#8a5b35', '#69452d', '#9c7044', '#605238']

export default function VoxelFlora({ plant, theme = 0 }) {
  const leaf = LEAVES[theme % LEAVES.length]
  const flower = FLOWERS[(theme + 2) % FLOWERS.length]
  const bark = BARK[theme % BARK.length]

  return (
    <group
      position={[plant.x, plant.y ?? 0, plant.z]}
      rotation={[0, plant.rotation, 0]}
      scale={plant.scale}
    >
      {plant.type === 'tree' ? (
        <>
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[0.28, 1.4, 0.28]} />
            <meshStandardMaterial color={bark} roughness={1} />
          </mesh>
          <mesh position={[0, 1.55, 0]} castShadow>
            <boxGeometry args={[1.25, 0.72, 1.25]} />
            <meshStandardMaterial color={leaf} roughness={1} />
          </mesh>
          <mesh position={[0, 2.05, 0]} castShadow>
            <boxGeometry args={[0.78, 0.62, 0.78]} />
            <meshStandardMaterial color={LEAVES[(theme + 1) % LEAVES.length]} roughness={1} />
          </mesh>
          <mesh position={[0.58, 1.3, 0.08]} castShadow>
            <boxGeometry args={[0.55, 0.56, 0.55]} />
            <meshStandardMaterial color={leaf} roughness={1} />
          </mesh>
        </>
      ) : plant.type === 'flower' ? (
        <>
          <mesh position={[0, 0.34, 0]} castShadow>
            <boxGeometry args={[0.1, 0.68, 0.1]} />
            <meshStandardMaterial color="#438849" roughness={1} />
          </mesh>
          <mesh position={[0, 0.73, 0]} castShadow>
            <boxGeometry args={[0.38, 0.32, 0.38]} />
            <meshStandardMaterial color={flower} roughness={1} />
          </mesh>
          <mesh position={[0, 0.74, 0]} castShadow>
            <boxGeometry args={[0.13, 0.18, 0.13]} />
            <meshStandardMaterial color="#f5d75e" roughness={1} />
          </mesh>
          <mesh position={[0.12, 0.3, 0]} rotation={[0, 0, -0.65]} castShadow>
            <boxGeometry args={[0.32, 0.12, 0.12]} />
            <meshStandardMaterial color="#5a9b45" roughness={1} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[-0.16, 0.24, 0]} rotation={[0, 0, -0.15]} castShadow>
            <boxGeometry args={[0.18, 0.48, 0.18]} />
            <meshStandardMaterial color="#62a84f" roughness={1} />
          </mesh>
          <mesh position={[0.16, 0.3, 0]} rotation={[0, 0, 0.18]} castShadow>
            <boxGeometry args={[0.18, 0.6, 0.18]} />
            <meshStandardMaterial color="#438d49" roughness={1} />
          </mesh>
          <mesh position={[0, 0.2, 0.16]} rotation={[0.18, 0, 0]} castShadow>
            <boxGeometry args={[0.16, 0.4, 0.16]} />
            <meshStandardMaterial color="#78bd55" roughness={1} />
          </mesh>
        </>
      )}
    </group>
  )
}
