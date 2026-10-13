import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getEnemyPosition } from '../game/enemies'
import { playEnemySound } from '../game/audio'

export default function Enemy({ enemy }) {
  const group = useRef()
  const core = useRef()
  const orbit = useRef()
  const tail = useRef()
  const nextSoundTime = useRef(0)

  useFrame((state, delta) => {
    if (!group.current) return
    const position = getEnemyPosition(enemy, state.clock.elapsedTime)
    group.current.position.set(...position)
    const distanceToCamera = state.camera.position.distanceTo(group.current.position)
    if (distanceToCamera < 13 && state.clock.elapsedTime >= nextSoundTime.current) {
      playEnemySound(enemy.type)
      nextSoundTime.current = state.clock.elapsedTime + 5.5 + (enemy.phase % 2.5)
    }
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 5 + enemy.phase) * 0.08
    if (enemy.type === 'slime') {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8 + enemy.phase) * 0.14
      core.current.scale.set(1 + (pulse - 1) * 0.7, 1 - (pulse - 1), 1 + (pulse - 1) * 0.7)
    } else if (enemy.type === 'blaze') {
      group.current.rotation.y += delta * 0.5
      core.current.scale.setScalar(pulse)
      orbit.current.rotation.y += delta * 1.6
    } else if (enemy.type === 'wisp') {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6 + enemy.phase) * 0.28
      core.current.scale.setScalar(pulse)
      tail.current.rotation.z = Math.sin(state.clock.elapsedTime * 2.5 + enemy.phase) * 0.12
    } else {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.3 + enemy.phase) * 0.32
      core.current.scale.set(1, 1 + (pulse - 1) * 0.35, 1)
    }
  })

  return (
    <group ref={group}>
      {enemy.type === 'slime' ? (
        <>
          <mesh ref={core} castShadow>
            <boxGeometry args={[0.78, 0.62, 0.72]} />
            <meshStandardMaterial color="#78d957" roughness={0.82} />
          </mesh>
          <mesh position={[-0.18, 0.08, 0.375]}>
            <boxGeometry args={[0.1, 0.12, 0.035]} />
            <meshStandardMaterial color="#263b24" />
          </mesh>
          <mesh position={[0.18, 0.08, 0.375]}>
            <boxGeometry args={[0.1, 0.12, 0.035]} />
            <meshStandardMaterial color="#263b24" />
          </mesh>
          <mesh position={[0, -0.15, 0.38]}>
            <boxGeometry args={[0.2, 0.055, 0.035]} />
            <meshStandardMaterial color="#294b2b" />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.22, -0.32, 0]}>
              <boxGeometry args={[0.2, 0.13, 0.46]} />
              <meshStandardMaterial color="#4aab46" roughness={0.9} />
            </mesh>
          ))}
          <mesh position={[-0.25, 0.28, 0.12]}>
            <boxGeometry args={[0.15, 0.12, 0.15]} />
            <meshStandardMaterial color="#a2ef68" />
          </mesh>
          <pointLight color="#74ff59" intensity={0.45} distance={2} />
        </>
      ) : enemy.type === 'blaze' ? (
        <>
          <mesh ref={core} position={[0, 0.04, 0]} castShadow>
            <boxGeometry args={[0.52, 0.56, 0.48]} />
            <meshStandardMaterial color="#c94727" emissive="#77220d" emissiveIntensity={0.65} roughness={0.72} />
          </mesh>
          <mesh position={[0, 0.46, 0]} castShadow>
            <boxGeometry args={[0.44, 0.3, 0.42]} />
            <meshStandardMaterial color="#ed7c32" emissive="#7e3211" emissiveIntensity={0.55} />
          </mesh>
          <mesh position={[0, 0.48, 0.22]}>
            <boxGeometry args={[0.25, 0.07, 0.025]} />
            <meshBasicMaterial color="#fff0a1" toneMapped={false} />
          </mesh>
          <group ref={orbit}>
            {[-1, 1].map((side) => (
              <group key={side}>
                <mesh position={[side * 0.43, 0.1, 0]}>
                  <boxGeometry args={[0.16, 0.46, 0.16]} />
                  <meshStandardMaterial color="#ffbd36" emissive="#ff6918" emissiveIntensity={1.2} />
                </mesh>
                <mesh position={[side * 0.58, 0.1, 0]}>
                  <boxGeometry args={[0.12, 0.25, 0.12]} />
                  <meshStandardMaterial color="#ffe779" emissive="#ff9a24" emissiveIntensity={1} />
                </mesh>
                <mesh position={[side * 0.27, -0.38, 0]}>
                  <boxGeometry args={[0.14, 0.38, 0.14]} />
                  <meshStandardMaterial color="#ff8c24" emissive="#ec4d12" emissiveIntensity={1.1} />
                </mesh>
              </group>
            ))}
            {[-1, 1].map((side) => (
              <mesh key={`top-${side}`} position={[side * 0.22, 0.76, 0]}>
                <boxGeometry args={[0.13, 0.24, 0.13]} />
                <meshStandardMaterial color="#ffdd57" emissive="#ff8a1d" emissiveIntensity={1.2} />
              </mesh>
            ))}
          </group>
          <pointLight color="#ff6b20" intensity={1.1} distance={2.8} />
        </>
      ) : enemy.type === 'wisp' ? (
        <>
          <mesh ref={core} position={[0, 0.12, 0]} castShadow>
            <boxGeometry args={[0.62, 0.55, 0.55]} />
            <meshStandardMaterial
              color="#7799cb"
              emissive="#253e8e"
              emissiveIntensity={0.8}
              roughness={0.68}
            />
          </mesh>
          <mesh position={[-0.15, 0.18, 0.285]}>
            <boxGeometry args={[0.09, 0.09, 0.035]} />
            <meshBasicMaterial color="#eaffff" toneMapped={false} />
          </mesh>
          <mesh position={[0.15, 0.18, 0.285]}>
            <boxGeometry args={[0.09, 0.09, 0.035]} />
            <meshBasicMaterial color="#eaffff" toneMapped={false} />
          </mesh>
          <mesh ref={tail} position={[0, -0.3, 0]}>
            <boxGeometry args={[0.4, 0.24, 0.38]} />
            <meshStandardMaterial color="#607fb7" emissive="#253e8e" emissiveIntensity={0.55} />
          </mesh>
          <mesh position={[0, -0.53, 0.02]}>
            <boxGeometry args={[0.22, 0.18, 0.23]} />
            <meshStandardMaterial color="#526da4" emissive="#253e8e" emissiveIntensity={0.45} />
          </mesh>
          <mesh position={[-0.38, 0.02, 0]} rotation={[0, 0, -0.25]}>
            <boxGeometry args={[0.18, 0.4, 0.12]} />
            <meshStandardMaterial color="#9bc4e8" emissive="#365aab" emissiveIntensity={0.45} />
          </mesh>
          <mesh position={[0.38, 0.02, 0]} rotation={[0, 0, 0.25]}>
            <boxGeometry args={[0.18, 0.4, 0.12]} />
            <meshStandardMaterial color="#9bc4e8" emissive="#365aab" emissiveIntensity={0.45} />
          </mesh>
          <pointLight color="#69aaff" intensity={0.8} distance={2.6} />
        </>
      ) : (
        <>
          <mesh position={[0, 0.32, 0]} castShadow>
            <boxGeometry args={[0.72, 0.92, 0.48]} />
            <meshStandardMaterial color="#386f3c" roughness={0.88} />
          </mesh>
          <mesh ref={core} position={[0, 1.02, 0.02]} castShadow>
            <boxGeometry args={[0.78, 0.72, 0.62]} />
            <meshStandardMaterial color="#57934c" roughness={0.88} />
          </mesh>
          <mesh position={[0, 0.34, 0.27]} castShadow>
            <boxGeometry args={[0.82, 0.42, 0.16]} />
            <meshStandardMaterial color="#4f3828" roughness={0.98} />
          </mesh>
          <mesh position={[0, 0.32, 0.36]} castShadow>
            <boxGeometry args={[0.45, 0.16, 0.06]} />
            <meshStandardMaterial color="#9d6434" roughness={0.9} />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side}>
              <mesh position={[side * 0.53, 0.46, 0.02]} rotation={[0, 0, side * 0.12]} castShadow>
                <boxGeometry args={[0.24, 0.82, 0.28]} />
                <meshStandardMaterial color="#4d8545" roughness={0.9} />
              </mesh>
              <mesh position={[side * 0.18, 1.1, 0.34]} castShadow>
                <boxGeometry args={[0.12, 0.13, 0.07]} />
                <meshBasicMaterial color="#f4cf63" toneMapped={false} />
              </mesh>
              <mesh position={[side * 0.23, 0.82, 0.35]} rotation={[0, 0, side * 0.22]} castShadow>
                <boxGeometry args={[0.18, 0.32, 0.2]} />
                <meshStandardMaterial color="#d7c8aa" roughness={0.8} />
              </mesh>
              <mesh position={[side * 0.23, 0.64, 0.37]} rotation={[0, 0, side * 0.22]} castShadow>
                <boxGeometry args={[0.13, 0.16, 0.15]} />
                <meshStandardMaterial color="#d7c8aa" roughness={0.8} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 0.12, 0]} castShadow>
            <boxGeometry args={[0.84, 0.22, 0.54]} />
            <meshStandardMaterial color="#403c38" roughness={0.95} />
          </mesh>
          <mesh position={[0.56, 0.68, 0.03]} rotation={[0, 0, -0.2]} castShadow>
            <boxGeometry args={[0.2, 0.76, 0.2]} />
            <meshStandardMaterial color="#71502d" roughness={0.9} />
          </mesh>
          <mesh position={[0.56, 1.13, 0.03]} rotation={[0, 0, -0.2]} castShadow>
            <boxGeometry args={[0.28, 0.3, 0.28]} />
            <meshStandardMaterial color="#b4bac0" metalness={0.45} roughness={0.55} />
          </mesh>
          <mesh position={[0.56, 1.31, 0.03]} rotation={[0, 0, -0.2]} castShadow>
            <boxGeometry args={[0.18, 0.13, 0.18]} />
            <meshStandardMaterial color="#c6cbd0" metalness={0.4} roughness={0.5} />
          </mesh>
        </>
      )}
    </group>
  )
}
