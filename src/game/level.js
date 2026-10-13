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
    enemyTypes: ['slime', 'fireElemental'],
    surfaces: ['earth', 'wood', 'water', 'earth', 'wood', 'water', 'stone', 'wood'],
    movingPlatforms: [
      { index: 3, axis: 'x', range: 0.8, speed: 0.8, phase: 0 },
      { index: 6, axis: 'z', range: 0.7, speed: 0.65, phase: 1 },
    ],
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
    enemyTypes: ['blaze', 'dragon', 'goo'],
    surfaces: ['earth', 'water', 'wood', 'earth', 'water', 'wood', 'earth', 'stone'],
    movingPlatforms: [
      { index: 1, axis: 'x', range: 0.65, speed: 0.62, phase: 0.8 },
      { index: 5, axis: 'z', range: 0.7, speed: 0.72, phase: 1.5 },
    ],
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
    enemyTypes: ['fireElemental', 'zombie', 'blaze'],
    surfaces: ['earth', 'wood', 'water', 'wood', 'earth', 'water', 'wood', 'stone'],
    movingPlatforms: [
      { index: 1, axis: 'z', range: 0.65, speed: 0.7, phase: 0.4 },
      { index: 4, axis: 'x', range: 0.7, speed: 0.6, phase: 1.8 },
    ],
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
    enemyTypes: ['slime', 'dragon', 'zombie'],
    surfaces: ['earth', 'water', 'wood', 'earth', 'water', 'wood', 'water', 'wood'],
    movingPlatforms: [
      { index: 1, axis: 'x', range: 0.65, speed: 0.6, phase: 0.6 },
      { index: 5, axis: 'z', range: 0.65, speed: 0.72, phase: 2 },
    ],
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
    enemyTypes: ['wisp', 'fireElemental', 'goo'],
    surfaces: ['earth', 'wood', 'water', 'earth', 'wood', 'water', 'wood', 'stone'],
    movingPlatforms: [
      { index: 1, axis: 'z', range: 0.65, speed: 0.68, phase: 1 },
      { index: 5, axis: 'x', range: 0.7, speed: 0.64, phase: 2.2 },
    ],
  },
]

const ANIMAL_TYPES = [
  'pig', 'cow', 'sheep', 'chicken', 'wolf', 'cat',
  'rabbit', 'fox', 'panda', 'horse', 'turtle', 'frog',
]

const createLevel = (layout, movingPlatforms = layout.movingPlatforms, random) => {
  const platforms = layout.platforms.map(([x, topY, z, width, depth], index) => {
    const widthScale = 0.84 + random() * 0.32
    const depthScale = 0.84 + random() * 0.32
    const minimum = index === 0 ? 6.5 : index === layout.platforms.length - 1 ? 4.8 : 3.2
    const maximum = index === 0 ? 9 : index === layout.platforms.length - 1 ? 7 : 5
    const platform = plat(
      x,
      topY,
      z,
      Math.min(maximum, Math.max(minimum, width * widthScale)),
      Math.min(maximum, Math.max(minimum, depth * depthScale))
    )
    const halfWidth = platform.size[0] / 2
    const halfDepth = platform.size[2] / 2
    const corners = [[-1, -1], [-1, 1], [1, -1], [1, 1]]

    for (let cornerIndex = corners.length - 1; cornerIndex > 0; cornerIndex -= 1) {
      const swapIndex = Math.floor(random() * (cornerIndex + 1))
      ;[corners[cornerIndex], corners[swapIndex]] = [corners[swapIndex], corners[cornerIndex]]
    }

    const floraCount = (halfWidth * halfDepth > 10 ? 2 : 1) + Math.floor(random() * 2)
    platform.flora = corners.slice(0, floraCount).map(([signX, signZ]) => ({
      x: signX * (Math.max(0.65, halfWidth - 1.25) + random() * Math.min(0.45, halfWidth * 0.12)),
      z: signZ * (Math.max(0.65, halfDepth - 1.25) + random() * Math.min(0.45, halfDepth * 0.12)),
      type: random() < 0.3 ? 'tree' : random() < 0.5 ? 'flower' : 'grass',
      scale: 0.72 + random() * 0.48,
      rotation: random() * Math.PI * 2,
    }))
    return platform
  })
  movingPlatforms.forEach(({ index, ...motion }) => {
    platforms[index].motion = motion
  })
  platforms.forEach((platform, index) => {
    platform.surface = layout.surfaces[index]
  })
  const coins = platforms.slice(1).map((platform) => [
    platform.pos[0],
    platform.pos[1] + 1.5,
    platform.pos[2],
  ])
  const enemies = layout.enemyPlatforms.map((platformIndex, index) => {
    const platform = platforms[platformIndex]
    const type = layout.enemyTypes[index]
    const axis = index % 2 === 0 ? 'x' : 'z'
    const range = Math.max(
      0.55,
      platform.size[axis === 'x' ? 0 : 2] / 2 - 0.8
    )

    return {
      center: [
        platform.pos[0],
        platform.pos[1] + (
          type === 'fireElemental' || type === 'zombie' ? 0.5 :
            type === 'dragon' || type === 'goo' ? 0.35 : 0.95
        ),
        platform.pos[2],
      ],
      axis,
      range,
      speed: 1.1 + index * 0.18,
      phase: index * 1.7,
      type,
    }
  })
  const occupiedPlatforms = new Set(layout.enemyPlatforms)
  const animalPlatforms = platforms
    .map((platform, index) => ({ platform, index }))
    .filter(({ index, platform }) => (
      !occupiedPlatforms.has(index) &&
      (platform.size[0] >= 5.5 || platform.size[2] >= 5.5)
    ))
  const animals = animalPlatforms.slice(0, 2).map(({ platform, index }) => {
    const type = ANIMAL_TYPES[Math.floor(random() * ANIMAL_TYPES.length)]
    const halfWidth = platform.size[0] / 2
    const halfDepth = platform.size[2] / 2
    const cornerX = random() < 0.5 ? -1 : 1
    const cornerZ = random() < 0.5 ? -1 : 1

    return {
      type,
      center: [
        platform.pos[0] + cornerX * Math.max(0.65, halfWidth - 1),
        platform.pos[1] + platform.size[1] / 2,
        platform.pos[2] + cornerZ * Math.max(0.65, halfDepth - 1),
      ],
      scale: 0.58 + random() * 0.16,
      phase: index * 1.3 + random() * 2,
    }
  })

  return {
    name: layout.name,
    theme: layout.theme,
    seed: layout.seed,
    colors: layout.colors,
    surfaces: layout.surfaces,
    platforms,
    coins,
    enemies,
    animals,
  }
}

const randomFrom = (seed) => {
  let state = seed >>> 0
  return () => {
    state += 0x6D2B79F5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export const LEVELS = LAYOUTS.map((layout, index) => (
  createLevel({ ...layout, seed: index }, layout.movingPlatforms, randomFrom((index + 1) * 7919))
))

const getRandomMovingPlatforms = (platformData, random) => {
  const candidateIndices = Array.from(
    { length: platformData.length - 2 },
    (_, index) => index + 1
  )

  for (let index = candidateIndices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[candidateIndices[index], candidateIndices[swapIndex]] = [
      candidateIndices[swapIndex],
      candidateIndices[index],
    ]
  }

  const movingCount = 2 + Math.floor(random() * 3)
  return candidateIndices.slice(0, movingCount).map((platformIndex) => {
    const platform = platformData[platformIndex]
    const axis = random() > 0.5 ? 'x' : 'z'
    const axisSize = axis === 'x' ? platform[3] : platform[4]
    return {
      index: platformIndex,
      axis,
      range: Math.min(0.65, Math.max(0.3, axisSize / 2 - 1.2)),
      speed: 0.45 + random() * 0.45,
      phase: random() * Math.PI * 2,
    }
  })
}

export function getLevel(index) {
  if (index < LEVELS.length) {
    const layout = { ...LAYOUTS[index], seed: index }
    const random = randomFrom((index + 1) * 7919)
    const movingPlatforms = getRandomMovingPlatforms(layout.platforms, random)
    return createLevel(
      layout,
      movingPlatforms,
      random
    )
  }

  const biome = LAYOUTS[index % LAYOUTS.length]
  const random = randomFrom((index + 1) * 7919)
  const platformData = [[0, 0, 0, 8, 8]]
  let x = 0
  let topY = 0
  let z = 0

  for (let platformIndex = 1; platformIndex < 8; platformIndex += 1) {
    x += Math.round((random() * 2 - 1) * 2.4 * 2) / 2
    x = Math.max(-8, Math.min(8, x))
    z -= 5.2 + random() * 0.65
    topY += 0.35 + random() * 0.28
    const size = platformIndex === 7 ? 6 : 3.9 + random() * 0.3
    platformData.push([x, topY, z, size, size])
  }

  const layout = {
    ...biome,
    name: `${biome.name} ${Math.floor(index / LAYOUTS.length) + 1}`,
    platforms: platformData,
    surfaces: platformData.map((_, platformIndex) => (
      biome.surfaces[(platformIndex + index) % biome.surfaces.length]
    )),
    enemyPlatforms: [2, 4, 6],
    enemyTypes: ['fireElemental', 'wisp', 'blaze'].map((_, enemyIndex) => (
      ['fireElemental', 'wisp', 'blaze', 'dragon', 'goo', 'zombie'][(enemyIndex + index) % 6]
    )),
  }

  const movingPlatforms = getRandomMovingPlatforms(platformData, random)
  return createLevel({ ...layout, seed: index }, movingPlatforms, random)
}

export const { platforms: PLATFORMS, coins: COINS } = LEVELS[0]
