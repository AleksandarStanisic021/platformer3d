import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D } from 'three'
import { setRainSoundIntensity } from '../game/audio'
import { getWeatherState } from '../game/weather'

const DROP_COUNT = 150

const seeded = (value) => {
  const result = Math.sin(value * 127.1 + 311.7) * 43758.5453
  return result - Math.floor(result)
}

export default function Rain() {
  const drops = useRef()
  const transform = useMemo(() => new Object3D(), [])
  const positions = useMemo(() => (
    Array.from({ length: DROP_COUNT }, (_, index) => [
      (seeded(index) - 0.5) * 34,
      seeded(index + 200) * 20 - 8,
      (seeded(index + 400) - 0.5) * 32,
    ])
  ), [])

  useFrame((state, delta) => {
    const mesh = drops.current
    if (!mesh) return

    const { rain } = getWeatherState(state.clock.elapsedTime)
    setRainSoundIntensity(rain)
    mesh.visible = rain > 0.01
    if (!mesh.visible) return

    mesh.material.opacity = 0.58 * rain
    positions.forEach((position, index) => {
      position[1] -= delta * 17
      if (position[1] < -9) position[1] = 11 + seeded(index + state.clock.elapsedTime) * 4

      transform.position.set(
        state.camera.position.x + position[0],
        state.camera.position.y + position[1],
        state.camera.position.z + position[2]
      )
      transform.rotation.set(0.025, 0, -0.12)
      transform.updateMatrix()
      mesh.setMatrixAt(index, transform.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={drops}
      args={[null, null, DROP_COUNT]}
      frustumCulled={false}
      renderOrder={1}
    >
      <boxGeometry args={[0.025, 0.9, 0.025]} />
      <meshBasicMaterial
        color="#c5eaff"
        transparent
        opacity={0}
        depthWrite={false}
      />
    </instancedMesh>
  )
}
