export function getEnemyPosition(enemy, time) {
  const patrol = Math.sin(time * enemy.speed + enemy.phase) * enemy.range
  return [
    enemy.center[0] + (enemy.axis === 'x' ? patrol : 0),
    enemy.center[1] + Math.sin(time * 3 + enemy.phase) * 0.12,
    enemy.center[2] + (enemy.axis === 'z' ? patrol : 0),
  ]
}

export function touchesEnemy(player, enemyPosition) {
  return Math.hypot(
    player[0] - enemyPosition[0],
    player[1] - enemyPosition[1],
    player[2] - enemyPosition[2]
  ) < 0.86
}
