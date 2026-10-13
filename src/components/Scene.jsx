import Platforms from './Platforms'
import Sky from './Sky'
import VoxelClouds from './VoxelClouds'
import Rain from './Rain'
import Castle from './Castle'
import Coin from './Coin'
import Enemy from './Enemy'
import VoxelAnimal from './VoxelAnimal'
import River from './River'
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
      <directionalLight
        position={[10, 24, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-near={0.1}
        shadow-camera-far={100}
        shadow-bias={-0.00015}
        shadow-normalBias={0.025}
        shadow-radius={3}
      />

      <Platforms
        platforms={level.platforms}
        colors={level.colors}
        theme={level.theme}
      />
      {level.river && <River river={level.river} />}
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
        river={level.river}
        onCoin={onCoin}
        onHazard={onHazard}
        onJump={onJump}
      />
    </>
  )
}
