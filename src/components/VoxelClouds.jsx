import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const BLOCK_SIZE = 3

const CLOUDS = [
  {
    position: [-17, 11, -48],
    blocks: [
      [-1, 0, 0], [0, 0, 0], [1, 0, 0], [2, 0, 0],
      [0, 1, 0], [1, 1, 0], [1, 0, 1], [2, 0, 1],
    ],
  },
  {
    position: [12, 15, -60],
    blocks: [
      [-2, 0, 0], [-1, 0, 0], [0, 0, 0], [1, 0, 0],
      [-1, 1, 0], [0, 1, 0], [1, 0, 1], [2, 0, 1],
    ],
  },
  {
    position: [-2, 7, -39],
    blocks: [
      [-2, 0, 0], [-1, 0, 0], [0, 0, 0], [1, 0, 0],
      [-1, 1, 0], [0, 1, 0], [-2, 0, 1], [-1, 0, 1],
    ],
  },
  {
    position: [27, 10, -78],
    blocks: [
      [-2, 0, 0], [-1, 0, 0], [0, 0, 0], [1, 0, 0],
      [-1, 1, 0], [0, 1, 0], [1, 1, 0], [1, 0, 1],
    ],
  },
]

export default function VoxelClouds() {
  const group = useRef()
  const cloudLayer = useRef()

  useFrame((state) => {
    if (!group.current) return
    group.current.position.copy(state.camera.position)
    group.current.quaternion.copy(state.camera.quaternion)
    if (cloudLayer.current) {
      cloudLayer.current.position.x = Math.sin(state.clock.elapsedTime * 0.08) * 1.2
    }
  })

  return (
    <group ref={group} frustumCulled={false}>
      <group ref={cloudLayer}>
        {CLOUDS.map((cloud, cloudIndex) => (
          <group key={cloudIndex} position={cloud.position}>
            {cloud.blocks.map(([x, y, z], blockIndex) => (
              <mesh
                key={blockIndex}
                position={[x * BLOCK_SIZE, y * BLOCK_SIZE * 0.55, z * BLOCK_SIZE]}
                renderOrder={-900}
              >
                <boxGeometry args={[BLOCK_SIZE, BLOCK_SIZE * 0.55, BLOCK_SIZE]} />
                <meshBasicMaterial
                  color="#f7fcff"
                  toneMapped={false}
                  fog={false}
                  depthWrite={false}
                  depthTest={false}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      <mesh position={[15, 13, -58]} renderOrder={-900}>
        <boxGeometry args={[6, 6, 0.5]} />
        <meshBasicMaterial
          color="#ffe694"
          toneMapped={false}
          fog={false}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
    </group>
  )
}
