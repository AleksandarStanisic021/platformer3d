import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { PLATFORMS } from '../game/level'

export default function Platforms() {
  const shaderUniforms = useMemo(() => ({ time: { value: 0 } }), [])

  useFrame((_, delta) => {
    shaderUniforms.time.value += delta
  })

  return PLATFORMS.map((pl, i) => {
    const isGoal = i === PLATFORMS.length - 1
    return (
      <mesh key={i} position={pl.pos} receiveShadow>
        <boxGeometry args={pl.size} />
        <meshStandardMaterial
          color={isGoal ? '#4ecdc4' : '#8d99ae'}
          emissive={isGoal ? '#14a9a0' : '#16435c'}
          emissiveIntensity={isGoal ? 0.28 : 0.12}
          onBeforeCompile={(shader) => {
            shader.uniforms.uTime = shaderUniforms.time
            shader.vertexShader = shader.vertexShader
              .replace(
                '#include <common>',
                '#include <common>\nvarying vec3 vPlatformWorldPosition;'
              )
              .replace(
                '#include <worldpos_vertex>',
                `#include <worldpos_vertex>
                vPlatformWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`
              )
            shader.fragmentShader = shader.fragmentShader
              .replace(
                '#include <common>',
                `#include <common>
                uniform float uTime;
                varying vec3 vPlatformWorldPosition;`
              )
              .replace(
                '#include <color_fragment>',
                `#include <color_fragment>
                float platformWave = 0.5 + 0.5 * sin(vPlatformWorldPosition.x * 0.75 + vPlatformWorldPosition.z * 0.42 - uTime * 1.4);
                diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.12, 0.72, 0.88), platformWave * 0.22);`
              )
              .replace(
                '#include <emissivemap_fragment>',
                `#include <emissivemap_fragment>
                totalEmissiveRadiance += vec3(0.015, 0.12, 0.2) * platformWave;`
              )
          }}
          customProgramCacheKey={() => 'platformer-environment-shader-v1'}
        />
      </mesh>
    )
  })
}
