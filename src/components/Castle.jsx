import VoxelFlora from './VoxelFlora'

const BIOME_STONE = [
  ['#526d79', '#7895a0', '#4ff0dc'],
  ['#554879', '#9a80b9', '#edc5ff'],
  ['#713b2b', '#b8653c', '#ffcb64'],
  ['#386449', '#79a77a', '#b7ff9b'],
  ['#3c527c', '#798db4', '#f6a8ff'],
]
const CASTLE_OFFSET = 14
const randomFrom = (seed) => {
  let state = seed >>> 0
  return () => {
    state += 0x6D2B79F5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const topOf = (platform) => platform.pos[1] + platform.size[1] / 2

export default function Castle({ platforms, theme = 0, seed = 0 }) {
  const [stone, trim, windowLight] = BIOME_STONE[theme % BIOME_STONE.length]
  if (platforms.length < 2) return null

  const averageX = platforms.reduce((sum, platform) => sum + platform.pos[0], 0) / platforms.length
  const side = averageX >= 0 ? -1 : 1
  const random = randomFrom((seed + 1) * 104729)

  return (
    <group>
      {platforms.slice(0, -1).map((platform, index) => {
        const next = platforms[index + 1]
        const centerX = (platform.pos[0] + next.pos[0]) / 2 + side * CASTLE_OFFSET
        const centerZ = (platform.pos[2] + next.pos[2]) / 2
        const wallY = (topOf(platform) + topOf(next)) / 2 + 2.1
        const wallLength = Math.max(4.5, Math.hypot(
          next.pos[0] - platform.pos[0],
          next.pos[2] - platform.pos[2]
        ))
        const tower = index % 2 === 0 || index === platforms.length - 2
        const towerX = platform.pos[0] + side * CASTLE_OFFSET
        const towerZ = platform.pos[2]
        const towerBaseY = topOf(platform) + 2.8
        const wallFlora = random() > 0.38
        const wallPlant = {
          x: centerX + side * 0.52,
          y: wallY + 2.25,
          z: centerZ + (random() - 0.5) * wallLength * 0.55,
          type: random() < 0.36 ? 'tree' : random() < 0.5 ? 'flower' : 'grass',
          scale: 0.65 + random() * 0.5,
          rotation: random() * Math.PI * 2,
        }
        const towerPlant = {
          x: (random() - 0.5) * 0.9,
          y: 3.22,
          z: (random() - 0.5) * 0.9,
          type: random() < 0.58 ? 'tree' : random() < 0.5 ? 'flower' : 'grass',
          scale: 0.62 + random() * 0.42,
          rotation: random() * Math.PI * 2,
        }

        return (
          <group key={index}>
            <mesh
              position={[centerX, wallY, centerZ]}
              rotation={[0, Math.atan2(next.pos[0] - platform.pos[0], next.pos[2] - platform.pos[2]), 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.8, 4.2, wallLength]} />
              <meshStandardMaterial color={stone} roughness={0.9} />
            </mesh>
            <mesh position={[centerX, wallY + 2.08, centerZ]}>
              <boxGeometry args={[1.05, 0.34, wallLength]} />
              <meshStandardMaterial color={trim} roughness={0.82} />
            </mesh>
            {wallFlora && <VoxelFlora plant={wallPlant} theme={theme} />}

            {[-1, 1].map((windowSide) => (
              <mesh
                key={windowSide}
                position={[
                  centerX + side * 0.43,
                  wallY + 0.35,
                  centerZ + windowSide * wallLength * 0.24,
                ]}
              >
                <boxGeometry args={[0.06, 0.85, 0.42]} />
                <meshBasicMaterial color={windowLight} toneMapped={false} />
              </mesh>
            ))}

            {tower && (
              <group position={[towerX, towerBaseY, towerZ]}>
                <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
                  <boxGeometry args={[2.5, 5.6, 2.5]} />
                  <meshStandardMaterial color={stone} roughness={0.86} />
                </mesh>
                <mesh position={[0, 3.05, 0]} castShadow>
                  <boxGeometry args={[2.85, 0.34, 2.85]} />
                  <meshStandardMaterial color={trim} roughness={0.78} />
                </mesh>
                {[-1, 1].map((x) => [-1, 1].map((z) => (
                  <mesh key={`${x}-${z}`} position={[x * 1.05, 3.43, z * 1.05]}>
                    <boxGeometry args={[0.55, 0.48, 0.55]} />
                    <meshStandardMaterial color={trim} roughness={0.8} />
                  </mesh>
                )))}
                <mesh position={[side * 1.27, 0.45, 0]}>
                  <boxGeometry args={[0.06, 1.15, 0.48]} />
                  <meshBasicMaterial color={windowLight} toneMapped={false} />
                </mesh>
                <mesh position={[0, 3.85, 0]}>
                  <boxGeometry args={[0.12, 1.1, 0.12]} />
                  <meshStandardMaterial color="#5d4937" />
                </mesh>
                <mesh position={[side * 0.42, 4.1, 0]}>
                  <boxGeometry args={[0.82, 0.44, 0.08]} />
                  <meshStandardMaterial color={windowLight} emissive={windowLight} emissiveIntensity={0.35} />
                </mesh>
                <VoxelFlora plant={towerPlant} theme={theme} />
              </group>
            )}
          </group>
        )
      })}
    </group>
  )
}
