import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboard, readInput } from '../hooks/useKeyboard'
import { stepPlayer, touchesCoin } from '../game/physics'
import { getEnemyPosition, touchesEnemy } from '../game/enemies'
import { getCoinPosition, getPlatformPosition } from '../game/platforms'
import { COINS as DEFAULT_COINS, PLATFORMS as DEFAULT_PLATFORMS } from '../game/level'
import { HALF, START, FALL_LIMIT, CAMERA_OFFSET, CAMERA_SMOOTHING } from '../game/constants'

export default function Player({
  onCoin,
  onHazard,
  onJump,
  active = true,
  coins = DEFAULT_COINS,
  enemies = [],
  platforms = DEFAULT_PLATFORMS,
}) {
  const mesh = useRef()
  const pos = useRef([...START])
  const vel = useRef([0, 0, 0])
  const onGround = useRef(false)
  const groundPlatform = useRef(-1)
  const platformPositions = useRef([])
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
    const time = state.clock.elapsedTime
    const activePlatforms = platforms.map((platform) => ({
      ...platform,
      pos: getPlatformPosition(platform, time),
    }))
    if (platformPositions.current.length !== platforms.length) {
      platformPositions.current = activePlatforms.map((platform) => [...platform.pos])
    }
    if (onGround.current && groundPlatform.current !== -1) {
      const previousPosition = platformPositions.current[groundPlatform.current]
      const currentPosition = activePlatforms[groundPlatform.current]?.pos
      if (previousPosition && currentPosition) {
        p[0] += currentPosition[0] - previousPosition[0]
        p[2] += currentPosition[2] - previousPosition[2]
      }
    }
    const input = readInput(keys.current)
    const jumpPressed = input.jump && !jumpWasHeld.current
    jumpWasHeld.current = input.jump

    if (mesh.current && (input.x !== 0 || input.z !== 0)) {
      const targetRotation = Math.atan2(input.x, input.z)
      const rotationDelta = Math.atan2(
        Math.sin(targetRotation - mesh.current.rotation.y),
        Math.cos(targetRotation - mesh.current.rotation.y)
      )
      mesh.current.rotation.y += rotationDelta * Math.min(1, dt * 12)
    }

    if (jumpPressed && onGround.current) onJump?.()
    onGround.current = stepPlayer(
      p,
      v,
      { ...input, jump: jumpPressed },
      onGround.current,
      dt,
      activePlatforms
    )
    groundPlatform.current = onGround.current
      ? activePlatforms.findIndex((platform) => (
        Math.abs(p[1] - (platform.pos[1] + platform.size[1] / 2 + HALF)) < 0.035 &&
        Math.abs(p[0] - platform.pos[0]) < HALF + platform.size[0] / 2 &&
        Math.abs(p[2] - platform.pos[2]) < HALF + platform.size[2] / 2
      ))
      : -1
    platformPositions.current = activePlatforms.map((platform) => [...platform.pos])

    if (p[1] < FALL_LIMIT) {
      if (!fallReported.current) {
        fallReported.current = true
        onHazard?.('fall')
      }
      p[0] = START[0]
      p[1] = START[1]
      p[2] = START[2]
      v[1] = 0
      onGround.current = false
      return
    }

    const enemyHit = enemies.some((enemy) => (
      touchesEnemy(p, getEnemyPosition(enemy, state.clock.elapsedTime))
    ))
    if (enemyHit) {
      if (!fallReported.current) {
        fallReported.current = true
        onHazard?.('enemy')
      }
      return
    }

    // Coin pickup
    coins.forEach((coin, i) => {
      const coinPosition = getCoinPosition(coin, platforms[i + 1], time)
      if (!taken.current.has(i) && touchesCoin(p, coinPosition)) {
        taken.current.add(i)
        shaderUniforms.pickupPulse.value = 1
        onCoin(i, coinPosition)
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
    <group ref={mesh}>
      <mesh castShadow>
        <boxGeometry args={[HALF * 2, HALF * 2, HALF * 2]} />
        <meshStandardMaterial
          color="#f5d52e"
          emissive="#6f5600"
          emissiveIntensity={0.16}
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
                float poreHash(vec3 point) {
                  return fract(sin(dot(point, vec3(127.1, 311.7, 74.7))) * 43758.5453);
                }
                uniform float uTime;
                uniform float uPickupPulse;
                varying vec3 vPlayerLocalPosition;`
              )
              .replace(
                '#include <color_fragment>',
                `#include <color_fragment>
                vec3 poreCell = floor(vPlayerLocalPosition * 11.0);
                vec3 poreUv = fract(vPlayerLocalPosition * 11.0);
                vec3 poreCenter = vec3(
                  poreHash(poreCell),
                  poreHash(poreCell + vec3(1.0)),
                  poreHash(poreCell + vec3(2.0))
                ) * 0.32 + vec3(0.34);
                float poreDistance = length((poreUv - poreCenter) * vec3(0.9, 0.9, 0.75));
                float poreRadius = 0.12 + poreHash(poreCell + 3.0) * 0.08;
                float pore = 1.0 - smoothstep(poreRadius * 0.62, poreRadius, poreDistance);
                float poreRim = smoothstep(poreRadius * 0.55, poreRadius * 0.78, poreDistance)
                  * (1.0 - smoothstep(poreRadius * 0.78, poreRadius, poreDistance));
                float spongeShimmer = 0.5 + 0.5 * sin(vPlayerLocalPosition.x * 8.0 + uTime * 2.0);
                diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.36, 0.22, 0.035), pore * 0.72);
                diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0, 0.88, 0.28), poreRim * 0.55);
                diffuseColor.rgb += vec3(0.1, 0.07, 0.01) * spongeShimmer * 0.1;
                diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.08, 0.9, 1.0), uPickupPulse * 0.48);`
              )
              .replace(
                '#include <emissivemap_fragment>',
                `#include <emissivemap_fragment>
                totalEmissiveRadiance += vec3(0.28, 0.2, 0.015) * (poreRim * 0.22 + uPickupPulse * 2.0);`
              )
          }}
          customProgramCacheKey={() => 'platformer-player-shader-v2'}
        />
      </mesh>

      <mesh position={[0, -0.29, 0]} castShadow>
        <boxGeometry args={[0.81, 0.18, 0.81]} />
        <meshStandardMaterial color="#168b8a" roughness={0.48} />
      </mesh>
      <mesh position={[-0.27, -0.29, 0.42]} castShadow>
        <boxGeometry args={[0.14, 0.13, 0.04]} />
        <meshStandardMaterial color="#c879da" emissive="#632f85" emissiveIntensity={0.25} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.15, 0.13, 0.35]}>
            <sphereGeometry args={[0.105, 16, 12]} />
            <meshStandardMaterial color="#fff9de" />
          </mesh>
          <mesh position={[side * 0.15, 0.13, 0.445]}>
            <sphereGeometry args={[0.046, 12, 10]} />
            <meshStandardMaterial color="#253543" />
          </mesh>
          <mesh position={[side * 0.25, -0.015, 0.398]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#db8b48" />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.015, 0.465]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshStandardMaterial color="#f0bb22" />
      </mesh>
      <mesh position={[0, -0.105, 0.405]} scale={[0.15, 0.052, 0.025]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#7a382c" />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`tooth-${side}`} position={[side * 0.04, -0.19, 0.43]}>
          <boxGeometry args={[0.055, 0.045, 0.025]} />
          <meshStandardMaterial color="#fff2cf" />
        </mesh>
      ))}
    </group>
  )
}
