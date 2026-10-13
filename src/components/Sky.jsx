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

          float hash(vec2 point) {
            return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
          }

          void main() {
            vec3 direction = normalize(vSkyDirection);
            float height = max(direction.y, 0.0);
            vec3 horizonColor = vec3(0.58, 0.82, 1.0);
            vec3 zenithColor = vec3(0.10, 0.40, 0.88);
            vec3 skyColor = mix(horizonColor, zenithColor, smoothstep(0.0, 0.92, height));

            vec2 cloudUv = vec2(direction.x, direction.y) * 22.0;
            cloudUv += vec2(uTime * 0.12, uTime * 0.018);
            vec2 cloudBlocks = floor(cloudUv);
            float cloudMass = step(0.4, hash(floor(cloudBlocks / 4.0)));
            float cloudPixels = step(0.38, hash(cloudBlocks));
            float cloudBand = smoothstep(-0.16, 0.06, height)
              * (1.0 - smoothstep(0.82, 0.98, height));
            float clouds = cloudMass * cloudPixels * cloudBand;
            vec3 cloudColor = mix(vec3(0.78, 0.91, 1.0), vec3(1.0), smoothstep(0.08, 0.55, height));
            skyColor = mix(skyColor, cloudColor, clouds * 0.94);

            vec2 sunPosition = direction.xy / max(-direction.z, 0.12);
            float squareSun = step(abs(sunPosition.x - 0.56), 0.075)
              * step(abs(sunPosition.y - 0.42), 0.075);
            float sunAlignment = dot(direction, normalize(vec3(0.42, 0.32, -0.85)));
            float sunGlow = pow(max(sunAlignment, 0.0), 48.0) * 0.6;
            skyColor = mix(skyColor, vec3(1.0, 0.91, 0.58), squareSun);
            skyColor += vec3(1.0, 0.72, 0.3) * sunGlow * (1.0 - clouds * 0.5);

            gl_FragColor = vec4(skyColor, 1.0);
            #include <colorspace_fragment>
          }
        `}
      />
    </mesh>
  )
}
