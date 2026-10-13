import Platforms from './Platforms'
import Sky from './Sky'
import VoxelClouds from './VoxelClouds'
import Rain from './Rain'
import Castle from './Castle'
import Coin from './Coin'
import Enemy from './Enemy'
import VoxelAnimal from './VoxelAnimal'
import Player from './Player'
import CoinPickupEffect from './CoinPickupEffect'

// Everything that lives inside the 3D canvas
export default function Scene({
  level,
  collected,
  onCoin,
  onHazard,
  onJump,
  pickupEffects,
  active,
}) {
  return (
    <>
      <color attach="background" args={['#1b2a41']} />
      <fog attach="fog" args={['#1b2a41', 30, 82]} />
      <Sky />
      <VoxelClouds />
      <Rain />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />

      <Platforms
        platforms={level.platforms}
        colors={level.colors}
        theme={level.theme}
      />
      <Castle platforms={level.platforms} theme={level.theme} seed={level.seed} />
      {level.coins.map((c, i) => (
        <Coin
          key={i}
          position={c}
          platform={level.platforms[i + 1]}
          collected={collected.includes(i)}
        />
      ))}
      {level.enemies.map((enemy, i) => (
        <Enemy key={i} enemy={enemy} />
      ))}
      {level.animals.map((animal, i) => (
        <VoxelAnimal key={`${animal.type}-${i}`} animal={animal} />
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
        onJump={onJump}
      />
    </>
  )
}
