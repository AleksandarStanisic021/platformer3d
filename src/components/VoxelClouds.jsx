import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getWeatherState } from '../game/weather'

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
      const { daylight, rain } = getWeatherState(state.clock.elapsedTime)
      const cloudColor = rain > 0.1
        ? '#aebdca'
        : daylight < 0.18
          ? '#8ca4c7'
          : '#f7fcff'
      cloudLayer.current.traverse((child) => {
        if (child.isMesh && child.material) child.material.color.set(cloudColor)
      })
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
    </group>
  )
}
