import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide } from 'three'

export default function Sky() {
  const material = useRef()
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame((state, delta) => {
    uniforms.uTime.value += delta
    if (material.current) material.current.uniforms.uTime.value = uniforms.uTime.value
  })

  return (
    <mesh scale={90} renderOrder={-1000} frustumCulled={false}>
      <sphereGeometry args={[1, 32, 24]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        side={BackSide}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
        vertexShader={`
          varying vec3 vSkyDirection;

          void main() {
            vSkyDirection = normalize((viewMatrix * modelMatrix * vec4(position, 0.0)).xyz);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec3 vSkyDirection;

          void main() {
            vec3 direction = normalize(vSkyDirection);
            float height = max(direction.y, 0.0);
            vec3 horizonColor = vec3(0.58, 0.82, 1.0);
            vec3 zenithColor = vec3(0.10, 0.40, 0.88);
            vec3 skyColor = mix(horizonColor, zenithColor, smoothstep(0.0, 0.92, height));

            gl_FragColor = vec4(skyColor, 1.0);
            #include <colorspace_fragment>
          }
        `}
      />
    </mesh>
  )
}
