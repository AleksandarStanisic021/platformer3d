import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboard, readInput } from '../hooks/useKeyboard'
import { stepPlayer, touchesCoin } from '../game/physics'
import { COINS } from '../game/level'
import { HALF, START, FALL_LIMIT, CAMERA_OFFSET, CAMERA_SMOOTHING } from '../game/constants'

export default function Player({ onCoin }) {
  const mesh = useRef()
  const pos = useRef([...START])
  const vel = useRef([0, 0, 0])
  const onGround = useRef(false)
  const taken = useRef(new Set())
  const keys = useKeyboard()

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.033)
    const p = pos.current
    const v = vel.current

    onGround.current = stepPlayer(p, v, readInput(keys.current), onGround.current, dt)

    // Fell off the world -> back to start
    if (p[1] < FALL_LIMIT) {
      p[0] = START[0]; p[1] = START[1]; p[2] = START[2]
      v[1] = 0
    }

    // Coin pickup
    COINS.forEach((coin, i) => {
      if (!taken.current.has(i) && touchesCoin(p, coin)) {
        taken.current.add(i)
        onCoin(i)
      }
    })

    mesh.current.position.set(p[0], p[1], p[2])

    // Camera follows the player
    const cam = state.camera
    cam.position.lerp(
      { x: p[0] + CAMERA_OFFSET[0], y: p[1] + CAMERA_OFFSET[1], z: p[2] + CAMERA_OFFSET[2] },
      CAMERA_SMOOTHING
    )
    cam.lookAt(p[0], p[1], p[2])
  })

  return (
    <mesh ref={mesh} castShadow>
      <boxGeometry args={[HALF * 2, HALF * 2, HALF * 2]} />
      <meshStandardMaterial color="#ff6b35" />
    </mesh>
  )
}
