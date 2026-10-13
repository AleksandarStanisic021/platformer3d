import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { PLATFORMS as DEFAULT_PLATFORMS } from '../game/level'

export default function Platforms({
  platforms = DEFAULT_PLATFORMS,
  colors = ['#8d99ae', '#4ecdc4', '#16435c', '#14a9a0'],
  theme = 0,
}) {
  const shaderUniforms = useMemo(() => ({
    time: { value: 0 },
    theme: { value: theme },
  }), [theme])

  useFrame((_, delta) => {
    shaderUniforms.time.value += delta
  })

  return platforms.map((pl, i) => {
    const isGoal = i === platforms.length - 1
    const color = isGoal ? colors[1] : colors[0]
    const emissive = isGoal ? colors[3] : colors[2]

    return (
      <mesh key={i} position={pl.pos} receiveShadow>
        <boxGeometry args={pl.size} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={isGoal ? 0.42 : 0.2}
          onBeforeCompile={(shader) => {
            shader.uniforms.uTime = shaderUniforms.time
            shader.uniforms.uTheme = shaderUniforms.theme
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
                uniform float uTheme;
                varying vec3 vPlatformWorldPosition;`
              )
              .replace(
                '#include <color_fragment>',
                `#include <color_fragment>
                float platformPattern;
                vec3 platformAccent;
                if (uTheme < 0.5) {
                  platformAccent = vec3(0.04, 0.86, 1.0);
                  platformPattern = 0.5 + 0.5 * sin(vPlatformWorldPosition.x * 1.1 + vPlatformWorldPosition.z * 0.7 - uTime * 2.0);
                } else if (uTheme < 1.5) {
                  platformAccent = vec3(0.76, 0.24, 1.0);
                  float grid = sin(vPlatformWorldPosition.x * 3.2) * sin(vPlatformWorldPosition.z * 3.2);
                  platformPattern = 1.0 - smoothstep(0.12, 0.48, abs(grid + sin(uTime * 1.6) * 0.14));
                } else if (uTheme < 2.5) {
                  platformAccent = vec3(1.0, 0.2, 0.025);
                  float rings = sin(length(vPlatformWorldPosition.xz) * 3.4 - uTime * 3.0);
                  platformPattern = smoothstep(0.15, 0.9, rings);
                } else if (uTheme < 3.5) {
                  platformAccent = vec3(0.08, 1.0, 0.48);
                  float circuit = sin(vPlatformWorldPosition.x * 2.3 - uTime * 1.8) * sin(vPlatformWorldPosition.z * 2.3);
                  platformPattern = smoothstep(0.45, 0.92, circuit);
                } else {
                  platformAccent = vec3(0.58, 0.34, 1.0);
                  float aurora = 0.5 + 0.5 * sin(vPlatformWorldPosition.x * 1.7 + sin(vPlatformWorldPosition.z * 1.3 - uTime) * 2.0 + uTime * 1.2);
                  platformPattern = pow(aurora, 3.0);
                }
                diffuseColor.rgb = mix(diffuseColor.rgb, platformAccent, platformPattern * 0.58);`
              )
              .replace(
                '#include <emissivemap_fragment>',
                `#include <emissivemap_fragment>
                totalEmissiveRadiance += platformAccent * platformPattern * 0.5;`
              )
          }}
          customProgramCacheKey={() => 'platformer-environment-shader-v2'}
        />
      </mesh>
    )
  })
}
