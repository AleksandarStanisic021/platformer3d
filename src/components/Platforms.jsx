import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PLATFORMS as DEFAULT_PLATFORMS } from '../game/level'
import { getPlatformPosition } from '../game/platforms'

const SURFACE_IDS = { earth: 0, water: 1, wood: 2, stone: 3 }

export default function Platforms({
  platforms = DEFAULT_PLATFORMS,
  colors = ['#8d99ae', '#4ecdc4', '#16435c', '#14a9a0'],
  theme = 0,
}) {
  const meshes = useRef([])
  const shaderUniforms = useMemo(() => ({
    time: { value: 0 },
    theme: { value: theme },
  }), [theme])

  useFrame((state, delta) => {
    shaderUniforms.time.value += delta
    platforms.forEach((platform, index) => {
      const mesh = meshes.current[index]
      if (!mesh) return
      mesh.position.set(...getPlatformPosition(platform, state.clock.elapsedTime))
    })
  })

  return platforms.map((pl, i) => {
    const isGoal = i === platforms.length - 1
    const color = isGoal ? colors[1] : colors[0]
    const emissive = isGoal ? colors[3] : colors[2]
    const surfaceId = SURFACE_IDS[pl.surface] ?? SURFACE_IDS.stone

    return (
      <mesh
        key={i}
        ref={(mesh) => { meshes.current[i] = mesh }}
        position={pl.pos}
        receiveShadow
      >
        <boxGeometry args={pl.size} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={isGoal ? 0.42 : 0.2}
          onBeforeCompile={(shader) => {
            shader.uniforms.uTime = shaderUniforms.time
            shader.uniforms.uTheme = shaderUniforms.theme
            shader.uniforms.uSurface = { value: surfaceId }
            shader.vertexShader = shader.vertexShader
              .replace(
                '#include <common>',
                `#include <common>
                varying vec3 vPlatformWorldPosition;
                varying vec3 vPlatformWorldNormal;`
              )
              .replace(
                '#include <worldpos_vertex>',
                `#include <worldpos_vertex>
                vPlatformWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
                vPlatformWorldNormal = normalize(mat3(modelMatrix) * normal);`
              )
            shader.fragmentShader = shader.fragmentShader
              .replace(
                '#include <common>',
                `#include <common>
                uniform float uTime;
                uniform float uTheme;
                uniform float uSurface;
                varying vec3 vPlatformWorldPosition;
                varying vec3 vPlatformWorldNormal;

                float platformHash(vec2 point) {
                  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
                }`
              )
              .replace(
                '#include <color_fragment>',
                `#include <color_fragment>
                float topFace = smoothstep(0.45, 0.9, vPlatformWorldNormal.y);
                vec2 surfaceUv = vPlatformWorldPosition.xz;
                float platformPattern;
                vec3 platformAccent;
                if (uSurface < 0.5) {
                  float dirtPixels = platformHash(floor(surfaceUv * 2.2));
                  float dirtVariation = platformHash(floor(surfaceUv * 0.72));
                  vec3 dirtTop = mix(vec3(0.24, 0.13, 0.065), vec3(0.43, 0.27, 0.14), step(0.48, dirtPixels));
                  vec3 dirtSide = mix(vec3(0.19, 0.105, 0.055), vec3(0.33, 0.19, 0.095), step(0.52, dirtVariation));
                  diffuseColor.rgb = mix(dirtSide, dirtTop, topFace);
                  diffuseColor.rgb *= 0.9 + dirtVariation * 0.16;
                  platformAccent = vec3(0.34, 0.19, 0.08);
                  platformPattern = dirtPixels * 0.12;
                } else if (uSurface < 1.5) {
                  float wave = sin(surfaceUv.x * 2.6 + surfaceUv.y * 1.8 - uTime * 2.3);
                  float ripple = sin(surfaceUv.x * 5.2 - surfaceUv.y * 3.4 + uTime * 1.7);
                  float glint = smoothstep(0.62, 0.96, wave * 0.62 + ripple * 0.38);
                  vec3 waterTop = mix(vec3(0.035, 0.29, 0.58), vec3(0.08, 0.62, 0.86), 0.5 + wave * 0.22);
                  waterTop = mix(waterTop, vec3(0.58, 0.9, 1.0), glint * 0.8);
                  diffuseColor.rgb = mix(vec3(0.025, 0.16, 0.32), waterTop, topFace);
                  platformAccent = vec3(0.12, 0.72, 1.0);
                  platformPattern = glint;
                } else if (uSurface < 2.5) {
                  float plankPosition = fract(surfaceUv.y * 0.72);
                  float plankLine = 1.0 - smoothstep(0.025, 0.09, min(plankPosition, 1.0 - plankPosition));
                  float plankTone = platformHash(vec2(floor(surfaceUv.y * 0.72), floor(surfaceUv.x * 0.5)));
                  float grain = sin(surfaceUv.x * 7.0 + sin(surfaceUv.y * 2.6) * 1.6 + uTime * 0.12);
                  vec3 woodTop = mix(vec3(0.42, 0.22, 0.085), vec3(0.67, 0.39, 0.16), plankTone * 0.55 + grain * 0.12 + 0.3);
                  woodTop = mix(woodTop, vec3(0.2, 0.095, 0.035), plankLine * 0.72);
                  vec3 woodSide = vec3(0.28, 0.14, 0.055) + vec3(0.08, 0.04, 0.015) * sin(surfaceUv.x * 5.0);
                  diffuseColor.rgb = mix(woodSide, woodTop, topFace);
                  platformAccent = vec3(0.48, 0.26, 0.1);
                  platformPattern = plankLine;
                } else {
                  if (uTheme < 0.5) {
                    platformAccent = vec3(0.04, 0.86, 1.0);
                    platformPattern = 0.5 + 0.5 * sin(surfaceUv.x * 1.1 + surfaceUv.y * 0.7 - uTime * 2.0);
                  } else if (uTheme < 1.5) {
                    platformAccent = vec3(0.76, 0.24, 1.0);
                    float grid = sin(surfaceUv.x * 3.2) * sin(surfaceUv.y * 3.2);
                    platformPattern = 1.0 - smoothstep(0.12, 0.48, abs(grid + sin(uTime * 1.6) * 0.14));
                  } else if (uTheme < 2.5) {
                    platformAccent = vec3(1.0, 0.2, 0.025);
                    float rings = sin(length(surfaceUv) * 3.4 - uTime * 3.0);
                    platformPattern = smoothstep(0.15, 0.9, rings);
                  } else if (uTheme < 3.5) {
                    platformAccent = vec3(0.08, 1.0, 0.48);
                    float circuit = sin(surfaceUv.x * 2.3 - uTime * 1.8) * sin(surfaceUv.y * 2.3);
                    platformPattern = smoothstep(0.45, 0.92, circuit);
                  } else {
                    platformAccent = vec3(0.58, 0.34, 1.0);
                    float aurora = 0.5 + 0.5 * sin(surfaceUv.x * 1.7 + sin(surfaceUv.y * 1.3 - uTime) * 2.0 + uTime * 1.2);
                    platformPattern = pow(aurora, 3.0);
                  }
                  diffuseColor.rgb = mix(diffuseColor.rgb, platformAccent, platformPattern * 0.58);
                }
                `
              )
              .replace(
                '#include <emissivemap_fragment>',
                `#include <emissivemap_fragment>
                totalEmissiveRadiance += platformAccent * platformPattern * (uSurface > 2.5 ? 0.5 : 0.08);`
              )
          }}
          customProgramCacheKey={() => 'platformer-environment-shader-v3'}
        />
      </mesh>
    )
  })
}
