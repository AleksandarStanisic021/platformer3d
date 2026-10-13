// plat(x, topY, z, width, depth) -> box whose top surface is at topY
const plat = (x, topY, z, w, d) => ({ pos: [x, topY - 0.5, z], size: [w, 1, d] })

export const PLATFORMS = [
  plat(0, 0, 0, 8, 8),
  plat(0, 0.5, -8, 4, 4),
  plat(3, 1.5, -13, 4, 4),
  plat(7, 2.5, -18, 4, 4),
  plat(3, 3.5, -23, 4, 4),
  plat(-2, 4.5, -27, 4, 4),
  plat(-7, 5.5, -27, 4, 4),
  plat(-12, 6.5, -23, 6, 6), // goal platform
]

export const COINS = [
  [0, 1.5, -8],
  [3, 2.5, -13],
  [7, 3.5, -18],
  [3, 4.5, -23],
  [-2, 5.5, -27],
  [-7, 6.5, -27],
  [-12, 7.5, -23],
]
