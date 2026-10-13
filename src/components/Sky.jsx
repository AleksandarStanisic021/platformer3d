import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide, Color } from 'three'
import { getWeatherState } from '../game/weather'

const NIGHT_FOG = new Color('#17243e')
const DAY_FOG = new Color('#b6dff6')
const RAIN_FOG = new Color('#586f88')

export default function Sky() {
  const material = useRef()
  const fogColor = useMemo(() => new Color(), [])
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDaylight: { value: 1 },
    uTwilight: { value: 0 },
    uRain: { value: 0 },
  }), [])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const weather = getWeatherState(time)
    uniforms.uTime.value = time
    uniforms.uDaylight.value = weather.daylight
    uniforms.uTwilight.value = weather.twilight
    uniforms.uRain.value = weather.rain

    if (material.current) {
      material.current.uniforms.uTime.value = time
      material.current.uniforms.uDaylight.value = weather.daylight
      material.current.uniforms.uTwilight.value = weather.twilight
      material.current.uniforms.uRain.value = weather.rain
    }

    if (state.scene.fog) {
      fogColor.copy(NIGHT_FOG).lerp(DAY_FOG, weather.daylight)
      fogColor.lerp(RAIN_FOG, weather.rain * 0.82)
      state.scene.fog.color.copy(fogColor)
    }
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
          uniform float uDaylight;
          uniform float uTwilight;
          uniform float uRain;
          varying vec3 vSkyDirection;

          float hash(vec2 point) {
            return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
          }

          void main() {
            vec3 direction = normalize(vSkyDirection);
            float height = max(direction.y, 0.0);
            vec3 horizonColor = mix(vec3(0.035, 0.075, 0.17), vec3(0.58, 0.82, 1.0), uDaylight);
            vec3 zenithColor = mix(vec3(0.008, 0.02, 0.09), vec3(0.10, 0.40, 0.88), uDaylight);
            vec3 skyColor = mix(horizonColor, zenithColor, smoothstep(0.0, 0.92, height));

            vec3 twilightColor = mix(vec3(0.92, 0.32, 0.2), vec3(0.95, 0.58, 0.38), height);
            skyColor = mix(skyColor, twilightColor, uTwilight * (1.0 - uRain * 0.55) * 0.72);

            vec2 sunPosition = direction.xy / max(-direction.z, 0.12);
            float squareSun = step(abs(sunPosition.x - 0.56), 0.075)
              * step(abs(sunPosition.y - 0.42), 0.075);
            float sunVisibility = smoothstep(0.08, 0.5, uDaylight) * (1.0 - uRain * 0.88);
            vec3 sunColor = mix(vec3(1.0, 0.68, 0.46), vec3(1.0, 0.93, 0.62), uDaylight);
            float sunGlow = pow(max(dot(direction, normalize(vec3(0.42, 0.32, -0.85))), 0.0), 48.0) * 0.5;
            skyColor = mix(skyColor, sunColor, squareSun * sunVisibility);
            skyColor += vec3(1.0, 0.72, 0.4) * sunGlow * sunVisibility;

            vec2 starCell = floor(direction.xy * 175.0);
            float starNoise = hash(starCell);
            float stars = step(0.9985, starNoise) * (1.0 - uDaylight) * (1.0 - uRain);
            skyColor += vec3(stars * (0.7 + 0.3 * sin(uTime * 2.0 + starNoise * 6.28)));

            vec3 overcastColor = mix(vec3(0.14, 0.2, 0.3), vec3(0.38, 0.47, 0.56), height);
            skyColor = mix(skyColor, overcastColor, uRain * 0.84);

            gl_FragColor = vec4(skyColor, 1.0);
            #include <colorspace_fragment>
          }
        `}
      />
    </mesh>
  )
}
