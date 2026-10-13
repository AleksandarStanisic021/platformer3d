const DAY_LENGTH = 100
const WEATHER_LENGTH = 45

const smoothstep = (edge0, edge1, value) => {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

export function getWeatherState(time) {
  const daylight = 0.5 + 0.5 * Math.cos((time / DAY_LENGTH) * Math.PI * 2)
  const twilight = Math.max(0, 1 - Math.abs(daylight - 0.5) / 0.24)
  const weatherPhase = (time % WEATHER_LENGTH) / WEATHER_LENGTH
  const rain = smoothstep(0.3, 0.36, weatherPhase)
    * (1 - smoothstep(0.7, 0.77, weatherPhase))

  return { daylight, twilight, rain }
}
