import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getEnemyPosition } from '../game/enemies'
import { playEnemySound } from '../game/audio'

const ENEMY_SHADER_EFFECTS = {
  slime: `
    float spotNoise = enemyHash(floor(vEnemyPosition.xz * 8.0));
    float spots = smoothstep(0.72, 0.9, spotNoise);
    float slimePulse = 0.5 + 0.5 * sin(uEnemyTime * 3.2 + vEnemyPosition.y * 7.0);
    enemyGlow = vec3(0.2, 1.0, 0.08) * (spots * 0.5 + slimePulse * 0.12);
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.48, 1.0, 0.25), spots * 0.48);
  `,
  blaze: `
    float fireWave = 0.5 + 0.5 * sin(vEnemyPosition.y * 16.0 - uEnemyTime * 5.0);
    float fireFlicker = 0.72 + 0.28 * sin(uEnemyTime * 13.0 + vEnemyPosition.x * 9.0);
    enemyGlow = vec3(1.0, 0.2 + fireWave * 0.38, 0.015) * fireWave * fireFlicker;
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0, 0.32, 0.025), fireWave * 0.34);
  `,
  wisp: `
    float wispWave = 0.5 + 0.5 * sin(vEnemyPosition.y * 9.0 + uEnemyTime * 3.0
      + sin(vEnemyPosition.x * 7.0 + uEnemyTime * 1.6));
    float wispGrid = step(0.76, enemyHash(floor(vEnemyPosition.xz * 11.0)));
    enemyGlow = vec3(0.16, 0.62, 1.0) * (0.24 + wispWave * 0.52 + wispGrid * 0.22);
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.4, 0.82, 1.0), wispWave * 0.28);
  `,
  orc: `
    vec2 runeCell = floor(vEnemyPosition.xy * vec2(5.0, 6.0));
    float runeBits = step(0.68, enemyHash(runeCell));
    float runePulse = 0.65 + 0.35 * sin(uEnemyTime * 4.0 + runeCell.y);
    enemyGlow = vec3(0.16, 1.0, 0.34) * runeBits * runePulse;
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.35, 1.0, 0.4), runeBits * runePulse * 0.62);
  `,
  dragon: `
    float scaleCells = floor(vEnemyPosition.y * 13.0 + vEnemyPosition.x * 4.0);
    float scales = step(0.58, enemyHash(floor(vEnemyPosition.xz * 13.0) + scaleCells));
    float ember = smoothstep(0.45, 0.95, sin(uEnemyTime * 5.0 + vEnemyPosition.y * 12.0));
    enemyGlow = vec3(1.0, 0.16, 0.025) * ember * 0.72;
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.9, 0.38, 0.08), scales * 0.42);
  `,
  goo: `
    float gooCells = enemyHash(floor(vEnemyPosition.xz * 9.0 + sin(uEnemyTime + vEnemyPosition.y) * 2.0));
    float bubbles = smoothstep(0.7, 0.96, gooCells);
    float gooWave = 0.5 + 0.5 * sin(uEnemyTime * 2.8 + vEnemyPosition.x * 8.0 + vEnemyPosition.z * 5.0);
    enemyGlow = vec3(0.15, 1.0, 0.46) * (bubbles * 0.65 + gooWave * 0.18);
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.28, 1.0, 0.55), bubbles * 0.58);
  `,
  zombie: `
    float stitchCell = floor(vEnemyPosition.xy * vec2(8.0, 10.0));
    float stitches = step(0.88, enemyHash(stitchCell));
    float rotPulse = 0.5 + 0.5 * sin(uEnemyTime * 2.4 + vEnemyPosition.y * 5.0);
    enemyGlow = vec3(0.22, 0.86, 0.25) * stitches * 0.35;
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.55, 0.82, 0.34), stitches * 0.42);
    diffuseColor.rgb *= 0.88 + rotPulse * 0.12;
  `,
}

function applyEnemyShader(shader, uniforms, effect) {
  shader.uniforms.uEnemyTime = uniforms.time
  shader.vertexShader = shader.vertexShader
    .replace(
      '#include <common>',
      `#include <common>
      varying vec3 vEnemyPosition;`
    )
    .replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      vEnemyPosition = position;`
    )
  shader.fragmentShader = shader.fragmentShader
    .replace(
      '#include <common>',
      `#include <common>
      uniform float uEnemyTime;
      varying vec3 vEnemyPosition;

      float enemyHash(vec2 point) {
        return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
      }`
    )
    .replace(
      '#include <color_fragment>',
      `#include <color_fragment>
      vec3 enemyGlow = vec3(0.0);
      ${ENEMY_SHADER_EFFECTS[effect] ?? ENEMY_SHADER_EFFECTS.slime}`
    )
    .replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
      totalEmissiveRadiance += enemyGlow;`
    )
}

export default function Enemy({ enemy }) {
  const group = useRef()
  const core = useRef()
  const orbit = useRef()
  const tail = useRef()
  const leftWing = useRef()
  const rightWing = useRef()
  const leftArm = useRef()
  const rightArm = useRef()
  const nextSoundTime = useRef(0)
  const shaderUniforms = useMemo(() => ({ time: { value: 0 } }), [])

  useFrame((state, delta) => {
    if (!group.current) return
    shaderUniforms.time.value = state.clock.elapsedTime
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
    } else if (enemy.type === 'dragon') {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.75 + enemy.phase) * 0.2
      leftWing.current.rotation.z = Math.sin(state.clock.elapsedTime * 8 + enemy.phase) * 0.65
      rightWing.current.rotation.z = -leftWing.current.rotation.z
      tail.current.rotation.y = Math.sin(state.clock.elapsedTime * 2.2 + enemy.phase) * 0.25
      core.current.scale.y = 1 + (pulse - 1) * 0.4
    } else if (enemy.type === 'goo') {
      core.current.scale.set(1 + (pulse - 1) * 1.7, 1 - (pulse - 1) * 1.25, 1 + (pulse - 1) * 1.7)
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7 + enemy.phase) * 0.16
    } else if (enemy.type === 'zombie') {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8 + enemy.phase) * 0.12
      leftArm.current.rotation.x = Math.sin(state.clock.elapsedTime * 2.2 + enemy.phase) * 0.16
      rightArm.current.rotation.x = -leftArm.current.rotation.x
    } else {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.3 + enemy.phase) * 0.32
      core.current.scale.set(1, 1 + (pulse - 1) * 0.35, 1)
    }
  })

  return (
    <group ref={group} scale={enemy.type === 'orc' ? 0.7 : 1}>
      {enemy.type === 'slime' ? (
        <>
          <mesh ref={core} castShadow>
            <boxGeometry args={[0.78, 0.62, 0.72]} />
            <meshStandardMaterial
              color="#78d957"
              roughness={0.82}
              onBeforeCompile={(shader) => applyEnemyShader(shader, shaderUniforms, enemy.type)}
              customProgramCacheKey={() => `enemy-shader-${enemy.type}-v1`}
            />
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
            <meshStandardMaterial
              color="#c94727"
              emissive="#77220d"
              emissiveIntensity={0.65}
              roughness={0.72}
              onBeforeCompile={(shader) => applyEnemyShader(shader, shaderUniforms, enemy.type)}
              customProgramCacheKey={() => `enemy-shader-${enemy.type}-v1`}
            />
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
              onBeforeCompile={(shader) => applyEnemyShader(shader, shaderUniforms, enemy.type)}
              customProgramCacheKey={() => `enemy-shader-${enemy.type}-v1`}
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
      ) : enemy.type === 'orc' ? (
        <>
          <mesh position={[0, 0.32, 0]} castShadow>
            <boxGeometry args={[0.72, 0.92, 0.48]} />
            <meshStandardMaterial
              color="#386f3c"
              roughness={0.88}
              onBeforeCompile={(shader) => applyEnemyShader(shader, shaderUniforms, enemy.type)}
              customProgramCacheKey={() => `enemy-shader-${enemy.type}-v1`}
            />
          </mesh>
          <mesh ref={core} position={[0, 1.02, 0.02]} castShadow>
            <boxGeometry args={[0.78, 0.72, 0.62]} />
            <meshStandardMaterial
              color="#57934c"
              roughness={0.88}
              onBeforeCompile={(shader) => applyEnemyShader(shader, shaderUniforms, enemy.type)}
              customProgramCacheKey={() => `enemy-shader-${enemy.type}-v1`}
            />
          </mesh>
          <mesh position={[0, 0.34, 0.27]} castShadow>
            <boxGeometry args={[0.82, 0.42, 0.16]} />
            <meshStandardMaterial
              color="#4f3828"
              roughness={0.98}
              onBeforeCompile={(shader) => applyEnemyShader(shader, shaderUniforms, enemy.type)}
              customProgramCacheKey={() => `enemy-shader-${enemy.type}-v1`}
            />
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
      ) : enemy.type === 'dragon' ? (
        <>
          <mesh ref={core} position={[0, 0.48, 0]} castShadow>
            <boxGeometry args={[0.52, 0.43, 0.84]} />
            <meshStandardMaterial
              color="#668a35"
              roughness={0.78}
              onBeforeCompile={(shader) => applyEnemyShader(shader, shaderUniforms, enemy.type)}
              customProgramCacheKey={() => `enemy-shader-${enemy.type}-v1`}
            />
          </mesh>
          <mesh position={[0, 0.66, 0.37]} castShadow>
            <boxGeometry args={[0.36, 0.34, 0.38]} />
            <meshStandardMaterial
              color="#86a94a"
              roughness={0.78}
              onBeforeCompile={(shader) => applyEnemyShader(shader, shaderUniforms, enemy.type)}
              customProgramCacheKey={() => `enemy-shader-${enemy.type}-v1`}
            />
          </mesh>
          <mesh position={[0, 0.55, 0.61]}>
            <boxGeometry args={[0.26, 0.13, 0.16]} />
            <meshStandardMaterial color="#d67537" emissive="#7d2810" emissiveIntensity={0.55} />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side}>
              <mesh position={[side * 0.1, 0.72, 0.51]}>
                <boxGeometry args={[0.065, 0.065, 0.035]} />
                <meshBasicMaterial color="#ffed9a" toneMapped={false} />
              </mesh>
              <mesh position={[side * 0.2, 0.91, 0.27]} rotation={[0, 0, side * 0.32]} castShadow>
                <boxGeometry args={[0.1, 0.22, 0.1]} />
                <meshStandardMaterial color="#d6c17b" />
              </mesh>
              <mesh position={[side * 0.2, 0.24, 0.2]} castShadow>
                <boxGeometry args={[0.16, 0.3, 0.18]} />
                <meshStandardMaterial color="#4c672f" />
              </mesh>
              <mesh ref={side === -1 ? leftWing : rightWing} position={[side * 0.4, 0.56, -0.05]} castShadow>
                <boxGeometry args={[0.52, 0.09, 0.56]} />
                <meshStandardMaterial
                  color="#a34836"
                  emissive="#4b140d"
                  emissiveIntensity={0.28}
                  roughness={0.8}
                  onBeforeCompile={(shader) => applyEnemyShader(shader, shaderUniforms, enemy.type)}
                  customProgramCacheKey={() => `enemy-shader-${enemy.type}-v1`}
                />
              </mesh>
              <mesh position={[side * 0.52, 0.68, -0.08]} rotation={[0, 0, side * 0.35]}>
                <boxGeometry args={[0.32, 0.06, 0.08]} />
                <meshStandardMaterial color="#e5a45b" />
              </mesh>
            </group>
          ))}
          <mesh ref={tail} position={[0, 0.43, -0.55]} castShadow>
            <boxGeometry args={[0.18, 0.2, 0.44]} />
            <meshStandardMaterial color="#587c32" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.52, -0.79]} rotation={[0.25, 0, 0]} castShadow>
            <boxGeometry args={[0.24, 0.2, 0.2]} />
            <meshStandardMaterial color="#d97835" emissive="#a93612" emissiveIntensity={0.72} />
          </mesh>
          <pointLight color="#ff6e2c" intensity={0.38} distance={1.8} />
        </>
      ) : enemy.type === 'goo' ? (
        <>
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[0.96, 0.16, 0.86]} />
            <meshStandardMaterial color="#267c45" roughness={0.32} metalness={0.06} />
          </mesh>
          <mesh ref={core} position={[0, 0.42, 0]} castShadow>
            <boxGeometry args={[0.76, 0.58, 0.72]} />
            <meshStandardMaterial
              color="#42bd66"
              emissive="#11682d"
              emissiveIntensity={0.42}
              roughness={0.28}
              metalness={0.04}
              onBeforeCompile={(shader) => applyEnemyShader(shader, shaderUniforms, enemy.type)}
              customProgramCacheKey={() => `enemy-shader-${enemy.type}-v1`}
            />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.18, 0.49, 0.37]}>
              <boxGeometry args={[0.09, 0.12, 0.035]} />
              <meshBasicMaterial color="#efffc1" toneMapped={false} />
            </mesh>
          ))}
          <mesh position={[0.35, 0.75, -0.12]} castShadow>
            <boxGeometry args={[0.23, 0.25, 0.23]} />
            <meshStandardMaterial color="#78ed84" emissive="#32a64f" emissiveIntensity={0.28} />
          </mesh>
          <mesh position={[-0.33, 0.64, -0.22]} castShadow>
            <boxGeometry args={[0.17, 0.2, 0.17]} />
            <meshStandardMaterial color="#a0f58c" emissive="#32a64f" emissiveIntensity={0.28} />
          </mesh>
          <pointLight color="#50ff8c" intensity={0.45} distance={2} />
        </>
      ) : (
        <>
          <mesh position={[0, 0.48, 0]} castShadow>
            <boxGeometry args={[0.54, 0.76, 0.38]} />
            <meshStandardMaterial
              color="#537b46"
              roughness={0.95}
              onBeforeCompile={(shader) => applyEnemyShader(shader, shaderUniforms, enemy.type)}
              customProgramCacheKey={() => `enemy-shader-${enemy.type}-v1`}
            />
          </mesh>
          <mesh position={[0, 1.02, 0.05]} castShadow>
            <boxGeometry args={[0.58, 0.5, 0.48]} />
            <meshStandardMaterial
              color="#72a455"
              roughness={0.94}
              onBeforeCompile={(shader) => applyEnemyShader(shader, shaderUniforms, enemy.type)}
              customProgramCacheKey={() => `enemy-shader-${enemy.type}-v1`}
            />
          </mesh>
          <mesh position={[0, 0.9, 0.3]}>
            <boxGeometry args={[0.24, 0.12, 0.035]} />
            <meshStandardMaterial color="#392d2a" />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side} ref={side === -1 ? leftArm : rightArm} position={[side * 0.38, 0.64, 0]}>
              <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.19, 0.62, 0.2]} />
                <meshStandardMaterial color="#64894b" roughness={0.95} />
              </mesh>
              <mesh position={[0, -0.37, 0.1]} castShadow>
                <boxGeometry args={[0.22, 0.19, 0.22]} />
                <meshStandardMaterial color="#8c9b62" roughness={0.95} />
              </mesh>
            </group>
          ))}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.16, 0.13, 0]} castShadow>
              <boxGeometry args={[0.2, 0.32, 0.22]} />
              <meshStandardMaterial color="#394a45" roughness={0.96} />
            </mesh>
          ))}
          <mesh position={[-0.14, 1.08, 0.26]}>
            <boxGeometry args={[0.08, 0.09, 0.04]} />
            <meshBasicMaterial color="#dbff8c" toneMapped={false} />
          </mesh>
          <mesh position={[0.14, 1.08, 0.26]}>
            <boxGeometry args={[0.08, 0.09, 0.04]} />
            <meshBasicMaterial color="#dbff8c" toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  )
}
