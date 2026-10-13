import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function River({ river }) {
  const material = useRef()
  const time = useMemo(() => ({ value: 0 }), [])
  const [x, y, z] = river.pos
  const [width, length] = river.size

  useFrame((state) => {
    time.value = state.clock.elapsedTime
  })

  return (
    <group>
      <mesh
        position={[x, y, z]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial
          ref={material}
          color="#087ca4"
          emissive="#063b69"
          emissiveIntensity={0.24}
          roughness={0.28}
          metalness={0.12}
          transparent
          opacity={0.94}
          onBeforeCompile={(shader) => {
            shader.uniforms.uRiverTime = time
            shader.vertexShader = shader.vertexShader
              .replace(
                '#include <common>',
                `#include <common>
                varying vec3 vRiverWorldPosition;`
              )
              .replace(
                '#include <worldpos_vertex>',
                `#include <worldpos_vertex>
                vRiverWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`
              )
            shader.fragmentShader = shader.fragmentShader
              .replace(
                '#include <common>',
                `#include <common>
                uniform float uRiverTime;
                varying vec3 vRiverWorldPosition;`
              )
              .replace(
                '#include <color_fragment>',
                `#include <color_fragment>
                float currentLines = 0.5 + 0.5 * sin(
                  vRiverWorldPosition.x * 1.7 + vRiverWorldPosition.z * 0.55
                    + uRiverTime * 3.0
                );
                float ripples = 0.5 + 0.5 * sin(
                  vRiverWorldPosition.x * 3.4 - vRiverWorldPosition.z * 1.1
                    + uRiverTime * 1.8
                );
                float foam = smoothstep(0.84, 0.98, currentLines * 0.62 + ripples * 0.38);
                diffuseColor.rgb = mix(
                  diffuseColor.rgb,
                  vec3(0.28, 0.84, 0.95),
                  foam * 0.48 + currentLines * 0.1
                );`
              )
              .replace(
                '#include <emissivemap_fragment>',
                `#include <emissivemap_fragment>
                totalEmissiveRadiance += vec3(0.015, 0.18, 0.3) * (0.2 + foam * 0.55);`
              )
          }}
          customProgramCacheKey={() => 'platformer-current-river-v1'}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[x + side * (width / 2 - 0.22), y - 0.18, z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.55, 0.52, length]} />
          <meshStandardMaterial color="#536b55" roughness={0.98} />
        </mesh>
      ))}
    </group>
  )
}
