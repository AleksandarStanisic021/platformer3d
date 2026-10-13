import { HALF, GRAVITY, JUMP, SPEED, COIN_PICKUP_RADIUS } from './constants'
import { PLATFORMS } from './level'

const overlaps = (p, pl) =>
  Math.abs(p[0] - pl.pos[0]) < HALF + pl.size[0] / 2 &&
  Math.abs(p[1] - pl.pos[1]) < HALF + pl.size[1] / 2 &&
  Math.abs(p[2] - pl.pos[2]) < HALF + pl.size[2] / 2

// Move along one axis (0=x, 1=y, 2=z) and push back out of any platform hit.
// Returns true if a platform was hit.
export function moveAxis(p, axis, velocity, dt) {
  p[axis] += velocity * dt
  let hit = false
  for (const pl of PLATFORMS) {
    if (overlaps(p, pl)) {
      const half = pl.size[axis] / 2
      p[axis] = velocity > 0 ? pl.pos[axis] - half - HALF : pl.pos[axis] + half + HALF
      hit = true
    }
  }
  return hit
}

// Advance the player one step. `input` = { x, z, jump }. Mutates pos and vel.
// Returns whether the player is standing on something.
export function stepPlayer(pos, vel, input, onGround, dt) {
  vel[0] = input.x * SPEED
  vel[2] = input.z * SPEED
  if (input.jump && onGround) vel[1] = JUMP
  vel[1] -= GRAVITY * dt

  moveAxis(pos, 0, vel[0], dt)
  moveAxis(pos, 2, vel[2], dt)
  const hitY = moveAxis(pos, 1, vel[1], dt)

  const grounded = hitY && vel[1] < 0
  if (hitY) vel[1] = 0
  return grounded
}

export const touchesCoin = (pos, coin) =>
  Math.hypot(pos[0] - coin[0], pos[1] - coin[1], pos[2] - coin[2]) < COIN_PICKUP_RADIUS
