import { PLATFORMS } from '../game/level'

export default function Platforms() {
  return PLATFORMS.map((pl, i) => (
    <mesh key={i} position={pl.pos} receiveShadow>
      <boxGeometry args={pl.size} />
      <meshStandardMaterial color={i === PLATFORMS.length - 1 ? '#4ecdc4' : '#8d99ae'} />
    </mesh>
  ))
}
