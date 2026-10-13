import Platforms from './Platforms'
import Coin from './Coin'
import Enemy from './Enemy'
import Player from './Player'
import CoinPickupEffect from './CoinPickupEffect'

// Everything that lives inside the 3D canvas
export default function Scene({
  level,
  collected,
  onCoin,
  onHazard,
  pickupEffects,
  active,
}) {
  return (
    <>
      <color attach="background" args={['#1b2a41']} />
      <fog attach="fog" args={['#1b2a41', 24, 68]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />

      <Platforms
        platforms={level.platforms}
        colors={level.colors}
        theme={level.theme}
      />
      {level.coins.map((c, i) => (
        <Coin key={i} position={c} collected={collected.includes(i)} />
      ))}
      {level.enemies.map((enemy, i) => (
        <Enemy key={i} enemy={enemy} />
      ))}
      {pickupEffects.map((effect) => (
        <CoinPickupEffect
          key={effect.id}
          position={effect.position}
        />
      ))}
      <Player
        active={active}
        coins={level.coins}
        enemies={level.enemies}
        platforms={level.platforms}
        onCoin={onCoin}
        onHazard={onHazard}
      />
    </>
  )
}
