import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import Hud from './components/Hud'
import { COINS } from './game/level'
import { CAMERA_OFFSET } from './game/constants'

export default function App() {
  const [collected, setCollected] = useState([])

  return (
    <>
      <Canvas shadows camera={{ position: CAMERA_OFFSET, fov: 60 }}>
        <Scene
          collected={collected}
          onCoin={(i) => setCollected((prev) => [...prev, i])}
        />
      </Canvas>
      <Hud collected={collected.length} total={COINS.length} />
    </>
  )
}
