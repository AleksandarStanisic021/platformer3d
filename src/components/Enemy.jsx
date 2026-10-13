import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getEnemyPosition } from '../game/enemies'

export default function Enemy({ enemy }) {
  const group = useRef()
  const core = useRef()
  const orbit = useRef()
  const ring = useRef()

  useFrame((state, delta) => {
    if (!group.current) return
    const position = getEnemyPosition(enemy, state.clock.elapsedTime)
    group.current.position.set(...position)
    group.current.rotation.y += delta * 1.4
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 5 + enemy.phase) * 0.08
    if (enemy.type === 'slime') {
      core.current.scale.set(1 + (pulse - 1) * 0.7, 1 - (pulse - 1), 1 + (pulse - 1) * 0.7)
    } else {
      core.current.scale.setScalar(pulse)
    }
    if (ring.current) ring.current.rotation.z += delta * 2.2
    if (orbit.current) orbit.current.rotation.y += delta * 2.8
  })

  return (
    <group ref={group}>
      {enemy.type === 'slime' ? (
        <>
          <mesh ref={core} castShadow>
            <boxGeometry args={[0.78, 0.7, 0.72]} />
            <meshStandardMaterial color="#67e36f" emissive="#1f8c43" emissiveIntensity={0.7} />
          </mesh>
          <mesh position={[-0.17, 0.08, 0.37]}>
            <boxGeometry args={[0.1, 0.14, 0.04]} />
            <meshBasicMaterial color="#153b28" />
          </mesh>
          <mesh position={[0.17, 0.08, 0.37]}>
            <boxGeometry args={[0.1, 0.14, 0.04]} />
            <meshBasicMaterial color="#153b28" />
          </mesh>
          <pointLight color="#63ff82" intensity={0.8} distance={2.5} />
        </>
      ) : enemy.type === 'blaze' ? (
        <>
          <mesh ref={core} castShadow>
            <octahedronGeometry args={[0.38, 0]} />
            <meshStandardMaterial color="#ff842e" emissive="#ff4a12" emissiveIntensity={2} />
          </mesh>
          <group ref={orbit}>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[side * 0.6, 0.12, 0]}>
                <boxGeometry args={[0.2, 0.52, 0.2]} />
                <meshStandardMaterial color="#ffd34e" emissive="#ff8a00" emissiveIntensity={1.5} />
              </mesh>
            ))}
            {[-1, 1].map((side) => (
              <mesh key={`upper-${side}`} position={[side * 0.38, 0.5, 0]}>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                <meshStandardMaterial color="#fff0a1" emissive="#ff9b22" emissiveIntensity={1.4} />
              </mesh>
            ))}
          </group>
          <pointLight color="#ff7628" intensity={1.4} distance={3} />
        </>
      ) : (
        <>
          <mesh ref={core} castShadow>
            <icosahedronGeometry args={[0.42, 1]} />
            <meshStandardMaterial
              color="#69d9ff"
              emissive="#167cff"
              emissiveIntensity={1.8}
              roughness={0.24}
              metalness={0.25}
            />
          </mesh>
          <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
            <torusGeometry args={[0.58, 0.035, 6, 24]} />
            <meshBasicMaterial color="#b5f4ff" toneMapped={false} />
          </mesh>
          <pointLight color="#38bfff" intensity={1.2} distance={3} />
        </>
      )}
    </group>
  )
}
