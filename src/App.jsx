import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import Hud from './components/Hud'
import { COINS } from './game/level'
import { CAMERA_OFFSET } from './game/constants'

export default function App() {
  const [collected, setCollected] = useState([])
  const [pickupEffects, setPickupEffects] = useState([])
  const nextEffectId = useRef(0)

  const collectCoin = (index) => {
    setCollected((previous) => (
      previous.includes(index) ? previous : [...previous, index]
    ))
    setPickupEffects((previous) => [
      ...previous,
      { id: nextEffectId.current++, position: COINS[index] },
    ])
  }

  return (
    <>
      <Canvas shadows camera={{ position: CAMERA_OFFSET, fov: 60 }}>
        <Scene
          collected={collected}
          pickupEffects={pickupEffects}
          onCoin={collectCoin}
        />
      </Canvas>
      <Hud collected={collected.length} total={COINS.length} />
    </>
  )
}
