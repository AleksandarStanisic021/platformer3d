import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getEnemyPosition } from '../game/enemies'

export default function Enemy({ enemy }) {
  const group = useRef()
  const core = useRef()
  const ring = useRef()

  useFrame((state, delta) => {
    if (!group.current) return
    const position = getEnemyPosition(enemy, state.clock.elapsedTime)
    group.current.position.set(...position)
    group.current.rotation.y += delta * 1.4
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 5 + enemy.phase) * 0.08
    core.current.scale.setScalar(pulse)
    ring.current.rotation.z += delta * 2.2
  })

  return (
    <group ref={group}>
      <mesh ref={core} castShadow>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial
          color="#ff416d"
          emissive="#ff1744"
          emissiveIntensity={1.8}
          roughness={0.24}
          metalness={0.25}
        />
      </mesh>
      <mesh position={[0, 0.02, 0.34]}>
        <sphereGeometry args={[0.085, 12, 10]} />
        <meshBasicMaterial color="#fff4c2" toneMapped={false} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <torusGeometry args={[0.58, 0.035, 6, 24]} />
        <meshBasicMaterial
          color="#ffb347"
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>
      <pointLight color="#ff245d" intensity={1.2} distance={3} />
    </group>
  )
}
