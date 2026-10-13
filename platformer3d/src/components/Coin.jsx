import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Coin({ position, collected }) {
  const ref = useRef()
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 3
  })
  if (collected) return null
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[0.35, 0.35, 0.1, 24]} />
      <meshStandardMaterial color="#ffd23f" emissive="#b8860b" emissiveIntensity={0.5} />
    </mesh>
  )
}
