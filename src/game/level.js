const plat = (x, topY, z, width, depth) => ({
  pos: [x, topY - 0.5, z],
  size: [width, 1, depth],
})

const LAYOUTS = [
  {
    name: 'Cyan Ruins',
    theme: 0,
    colors: ['#8d99ae', '#4ecdc4', '#16435c', '#14a9a0'],
    platforms: [
      [0, 0, 0, 8, 8], [0, 0.5, -8, 4, 4], [3, 1.5, -13, 4, 4],
      [7, 2.5, -18, 4, 4], [3, 3.5, -23, 4, 4], [-2, 4.5, -27, 4, 4],
      [-7, 5.5, -27, 4, 4], [-12, 6.5, -23, 6, 6],
    ],
    enemyPlatforms: [2, 5],
    enemyTypes: ['slime', 'wisp'],
  },
  {
    name: 'Violet Switchback',
    theme: 1,
    colors: ['#8475c7', '#e4a2ff', '#39266d', '#a23bd4'],
    platforms: [
      [0, 0, 0, 8, 8], [-2, 0.7, -7, 4, 4], [-5, 1.5, -12, 3.8, 3.8],
      [-1, 2.3, -17, 3.8, 3.8], [4, 3.1, -21, 3.8, 3.8],
      [6, 3.9, -26, 3.8, 3.8], [2, 4.7, -31, 3.8, 3.8],
      [-3, 5.5, -35, 6, 6],
    ],
    enemyPlatforms: [2, 4, 6],
    enemyTypes: ['blaze', 'wisp', 'slime'],
  },
  {
    name: 'Magma Steps',
    theme: 2,
    colors: ['#c66b50', '#ffd166', '#702a1c', '#ff572e'],
    platforms: [
      [0, 0, 0, 8, 8], [3, 0.7, -6, 3.8, 3.8], [7, 1.5, -11, 3.6, 3.6],
      [5, 2.3, -16, 3.6, 3.6], [0, 3.1, -20, 3.6, 3.6],
      [-4, 3.9, -25, 3.6, 3.6], [-1, 4.7, -30, 3.6, 3.6],
      [4, 5.5, -34, 6, 6],
    ],
    enemyPlatforms: [2, 5, 6],
    enemyTypes: ['blaze', 'slime', 'blaze'],
  },
  {
    name: 'Jade Circuit',
    theme: 3,
    colors: ['#56a681', '#a4f0a5', '#154f45', '#26d08a'],
    platforms: [
      [0, 0, 0, 8, 8], [0, 0.8, -7, 4, 4], [-0.5, 1.5, -13, 3.8, 3.8],
      [-4, 2.3, -17, 3.8, 3.8], [-8, 3.1, -22, 3.8, 3.8],
      [-5, 3.9, -27, 3.8, 3.8], [0, 4.7, -31, 3.8, 3.8],
      [4, 5.5, -36, 6, 6],
    ],
    enemyPlatforms: [2, 4, 6],
    enemyTypes: ['slime', 'wisp', 'blaze'],
  },
  {
    name: 'Aurora Spire',
    theme: 4,
    colors: ['#537bbf', '#f178d0', '#203c81', '#7b4dff'],
    platforms: [
      [0, 0, 0, 8, 8], [0, 0.8, -7, 3.8, 3.8], [4, 1.6, -11, 3.6, 3.6],
      [7, 2.4, -16, 3.6, 3.6], [3, 3.2, -21, 3.6, 3.6],
      [-2, 4, -25, 3.6, 3.6], [-7, 4.8, -30, 3.6, 3.6],
      [-12, 5.6, -35, 6, 6],
    ],
    enemyPlatforms: [2, 4, 6],
    enemyTypes: ['wisp', 'blaze', 'slime'],
  },
]

export const LEVELS = LAYOUTS.map((layout) => {
  const platforms = layout.platforms.map(([x, topY, z, width, depth]) => (
    plat(x, topY, z, width, depth)
  ))
  const coins = platforms.slice(1).map((platform) => [
    platform.pos[0],
    platform.pos[1] + 1.5,
    platform.pos[2],
  ])
  const enemies = layout.enemyPlatforms.map((platformIndex, index) => {
    const platform = platforms[platformIndex]
    const axis = index % 2 === 0 ? 'x' : 'z'
    const range = Math.max(
      0.55,
      platform.size[axis === 'x' ? 0 : 2] / 2 - 0.8
    )

    return {
      center: [platform.pos[0], platform.pos[1] + 0.95, platform.pos[2]],
      axis,
      range,
      speed: 1.1 + index * 0.18,
      phase: index * 1.7,
      type: layout.enemyTypes[index],
    }
  })

  return {
    name: layout.name,
    theme: layout.theme,
    colors: layout.colors,
    platforms,
    coins,
    enemies,
  }
})

export const { platforms: PLATFORMS, coins: COINS } = LEVELS[0]
