import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const DURATION = 1.1
const SPARK_COUNT = 8

export default function CoinPickupEffect({ position }) {
  const group = useRef()
  const ring = useRef()
  const orb = useRef()
  const sparks = useRef([])
  const elapsed = useRef(0)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (group.current) group.current.visible = false
    }, DURATION * 1000)
    return () => window.clearTimeout(timeout)
  }, [])

  useFrame((_, delta) => {
    if (!group.current?.visible) return

    elapsed.current = Math.min(DURATION, elapsed.current + delta)
    const progress = elapsed.current / DURATION
    const fade = 1 - progress

    if (ring.current) {
      ring.current.scale.setScalar(0.2 + progress * 2.5)
      ring.current.material.opacity = fade
      ring.current.rotation.y += delta * 1.8
    }
    if (orb.current) {
      orb.current.scale.setScalar(0.45 + fade * 0.8)
      orb.current.material.opacity = fade
    }
    sparks.current.forEach((spark, index) => {
      if (!spark) return
      const angle = (index / SPARK_COUNT) * Math.PI * 2
      const distance = progress * 1.25
      spark.position.set(
        Math.cos(angle) * distance,
        progress * (0.55 + (index % 3) * 0.25),
        Math.sin(angle) * distance
      )
      spark.material.opacity = fade
      spark.scale.setScalar(0.4 + fade * 0.7)
    })
  })

  return (
    <group ref={group} position={position}>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.045, 8, 40]} />
        <meshBasicMaterial
          color="#fff18a"
          transparent
          opacity={1}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={orb}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial
          color="#fff8c7"
          transparent
          opacity={1}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {Array.from({ length: SPARK_COUNT }, (_, index) => (
        <mesh
          key={index}
          ref={(node) => { sparks.current[index] = node }}
        >
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial
            color="#ffbd3f"
            transparent
            opacity={1}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}
