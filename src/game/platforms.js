export function getPlatformPosition(platform, time) {
  const { pos, motion } = platform
  if (!motion) return pos

  const offset = Math.sin(time * motion.speed + motion.phase) * motion.range
  const movingPosition = [...pos]
  movingPosition[motion.axis === 'x' ? 0 : 2] += offset
  return movingPosition
}

export function getCoinPosition(coin, platform, time) {
  if (!platform?.motion) return coin

  const platformPosition = getPlatformPosition(platform, time)
  return [
    coin[0] + platformPosition[0] - platform.pos[0],
    coin[1] + platformPosition[1] - platform.pos[1],
    coin[2] + platformPosition[2] - platform.pos[2],
  ]
}
