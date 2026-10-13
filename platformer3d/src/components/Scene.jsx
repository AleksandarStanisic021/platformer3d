import Platforms from './Platforms'
import Coin from './Coin'
import Player from './Player'
import { COINS } from '../game/level'

// Everything that lives inside the 3D canvas
export default function Scene({ collected, onCoin }) {
  return (
    <>
      <color attach="background" args={['#1b2a41']} />
      <fog attach="fog" args={['#1b2a41', 20, 60]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />

      <Platforms />
      {COINS.map((c, i) => (
        <Coin key={i} position={c} collected={collected.includes(i)} />
      ))}
      <Player onCoin={onCoin} />
    </>
  )
}
