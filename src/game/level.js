const plat = (x, topY, z, width, depth) => ({
  pos: [x, topY - 0.5, z],
  size: [width, 1, depth],
})

const LAYOUTS = [
  [[0, 0], [0, -8], [3, -13], [7, -18], [3, -23], [-2, -27], [-7, -27], [-12, -23]],
  [[0, 0], [-0.5, -8], [2.5, -13], [6.5, -18], [2.5, -23], [-2.5, -27], [-7, -27], [-11.5, -23]],
  [[0, 0], [0.5, -8], [3.5, -13], [7.5, -18], [4, -23], [-1, -27], [-6.5, -27], [-11, -23]],
  [[0, 0], [-0.5, -8], [3.5, -13], [7, -18], [2.5, -23], [-2.5, -27], [-7.5, -27], [-12, -23]],
  [[0, 0], [0.5, -8], [2.5, -13], [6.5, -18], [3.5, -23], [-1.5, -27], [-7, -27], [-12.5, -23]],
]

const HEIGHTS = [0, 0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5]
const SIZES = [[8, 8], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [4, 4], [6, 6]]

export const LEVELS = LAYOUTS.map((layout, index) => {
  const platforms = layout.map(([x, z], platformIndex) => {
    const [width, depth] = SIZES[platformIndex]
    return plat(x, HEIGHTS[platformIndex], z, width, depth)
  })
  const coins = platforms.slice(1).map((platform) => [
    platform.pos[0],
    platform.pos[1] + 1.5,
    platform.pos[2],
  ])

  return {
    name: `Level ${index + 1}`,
    platforms,
    coins,
  }
})

export const { platforms: PLATFORMS, coins: COINS } = LEVELS[0]
