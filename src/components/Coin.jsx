import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getPlatformPosition } from '../game/platforms'

export default function Coin({ position, platform, collected }) {
  const ref = useRef()
  useFrame((state, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * 3
    if (!platform?.motion) return
    const movingPosition = getPlatformPosition(platform, state.clock.elapsedTime)
    ref.current.position.set(
      position[0] + movingPosition[0] - platform.pos[0],
      position[1] + movingPosition[1] - platform.pos[1],
      position[2] + movingPosition[2] - platform.pos[2]
    )
  })
  if (collected) return null
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[0.35, 0.35, 0.1, 24]} />
      <meshStandardMaterial color="#ffd23f" emissive="#b8860b" emissiveIntensity={0.5} />
    </mesh>
  )
}
