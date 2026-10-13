import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboard, readInput } from '../hooks/useKeyboard'
import { stepPlayer, touchesCoin } from '../game/physics'
import { COINS as DEFAULT_COINS, PLATFORMS as DEFAULT_PLATFORMS } from '../game/level'
import { HALF, START, FALL_LIMIT, CAMERA_OFFSET, CAMERA_SMOOTHING } from '../game/constants'

export default function Player({
  onCoin,
  onFall,
  active = true,
  coins = DEFAULT_COINS,
  platforms = DEFAULT_PLATFORMS,
}) {
  const mesh = useRef()
  const pos = useRef([...START])
  const vel = useRef([0, 0, 0])
  const onGround = useRef(false)
  const jumpWasHeld = useRef(false)
  const taken = useRef(new Set())
  const fallReported = useRef(false)
  const keys = useKeyboard()
  const shaderUniforms = useMemo(() => ({
    time: { value: 0 },
    pickupPulse: { value: 0 },
  }), [])

  useFrame((state, delta) => {
    if (!active) return

    const dt = Math.min(delta, 0.033)
    shaderUniforms.time.value += dt
    shaderUniforms.pickupPulse.value = Math.max(
      0,
      shaderUniforms.pickupPulse.value - dt * 2.5
    )
    const p = pos.current
    const v = vel.current
    const input = readInput(keys.current)
    const jumpPressed = input.jump && !jumpWasHeld.current
    jumpWasHeld.current = input.jump

    onGround.current = stepPlayer(
      p,
      v,
      { ...input, jump: jumpPressed },
      onGround.current,
      dt,
      platforms
    )

    if (p[1] < FALL_LIMIT) {
      if (!fallReported.current) {
        fallReported.current = true
        onFall?.()
      }
      p[0] = START[0]
      p[1] = START[1]
      p[2] = START[2]
      v[1] = 0
      onGround.current = false
      return
    }

    // Coin pickup
    coins.forEach((coin, i) => {
      if (!taken.current.has(i) && touchesCoin(p, coin)) {
        taken.current.add(i)
        shaderUniforms.pickupPulse.value = 1
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
      <meshStandardMaterial
        color="#ff6b35"
        emissive="#ff4d24"
        emissiveIntensity={0.22}
        onBeforeCompile={(shader) => {
          shader.uniforms.uTime = shaderUniforms.time
          shader.uniforms.uPickupPulse = shaderUniforms.pickupPulse
          shader.vertexShader = shader.vertexShader
            .replace(
              '#include <common>',
              '#include <common>\nvarying vec3 vPlayerLocalPosition;'
            )
            .replace(
              '#include <begin_vertex>',
              '#include <begin_vertex>\nvPlayerLocalPosition = position;'
            )
          shader.fragmentShader = shader.fragmentShader
            .replace(
              '#include <common>',
              `#include <common>
              uniform float uTime;
              uniform float uPickupPulse;
              varying vec3 vPlayerLocalPosition;`
            )
            .replace(
              '#include <color_fragment>',
              `#include <color_fragment>
              float playerScan = 0.5 + 0.5 * sin(vPlayerLocalPosition.y * 19.0 - uTime * 5.0);
              float playerGlow = smoothstep(0.78, 1.0, playerScan);
              diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.08, 0.92, 1.0), playerGlow * 0.48 + uPickupPulse * 0.42);`
            )
            .replace(
              '#include <emissivemap_fragment>',
              `#include <emissivemap_fragment>
              totalEmissiveRadiance += vec3(0.02, 0.38, 0.55) * (playerGlow * 0.7 + uPickupPulse * 2.2);`
            )
        }}
        customProgramCacheKey={() => 'platformer-player-shader-v1'}
      />
    </mesh>
  )
}
