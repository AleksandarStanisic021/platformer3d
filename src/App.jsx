import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import Hud from './components/Hud'
import { LEVELS } from './game/level'
import { CAMERA_OFFSET } from './game/constants'

export default function App() {
  const [levelIndex, setLevelIndex] = useState(0)
  const [collected, setCollected] = useState([])
  const [pickupEffects, setPickupEffects] = useState([])
  const [sessionId, setSessionId] = useState(0)
  const [phase, setPhase] = useState('playing')
  const [status, setStatus] = useState('')
  const collectedRef = useRef(new Set())
  const phaseRef = useRef('playing')
  const nextEffectId = useRef(0)
  const transitionTimeout = useRef()
  const statusTimeout = useRef()
  const level = LEVELS[levelIndex]

  const updatePhase = (nextPhase) => {
    phaseRef.current = nextPhase
    setPhase(nextPhase)
  }

  const clearTimers = () => {
    window.clearTimeout(transitionTimeout.current)
    window.clearTimeout(statusTimeout.current)
  }

  const restartGame = useCallback(() => {
    clearTimers()
    collectedRef.current.clear()
    setLevelIndex(0)
    setCollected([])
    setPickupEffects([])
    setStatus('')
    updatePhase('playing')
    setSessionId((previous) => previous + 1)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'KeyR' && !event.repeat) restartGame()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimers()
    }
  }, [restartGame])

  const handleCoin = (index) => {
    if (phaseRef.current !== 'playing' || collectedRef.current.has(index)) return

    collectedRef.current.add(index)
    setCollected(Array.from(collectedRef.current))
    setPickupEffects((previous) => [
      ...previous,
      { id: nextEffectId.current++, position: level.coins[index] },
    ])

    if (collectedRef.current.size !== level.coins.length) return

    updatePhase('transition')
    transitionTimeout.current = window.setTimeout(() => {
      if (levelIndex === LEVELS.length - 1) {
        updatePhase('won')
        return
      }

      collectedRef.current.clear()
      setCollected([])
      setPickupEffects([])
      setLevelIndex((previous) => previous + 1)
      setSessionId((previous) => previous + 1)
      updatePhase('playing')
    }, 1000)
  }

  const handleHazard = (reason) => {
    if (phaseRef.current !== 'playing') return

    window.clearTimeout(transitionTimeout.current)
    window.clearTimeout(statusTimeout.current)
    collectedRef.current.clear()
    setCollected([])
    setPickupEffects([])
    setSessionId((previous) => previous + 1)
    setStatus(
      reason === 'enemy'
        ? 'An enemy got you! Restarting this level...'
        : 'You fell! Restarting this level...'
    )
    statusTimeout.current = window.setTimeout(() => setStatus(''), 1800)
  }

  return (
    <>
      <Canvas shadows camera={{ position: CAMERA_OFFSET, fov: 60 }}>
        <Scene
          key={`${levelIndex}-${sessionId}`}
          level={level}
          collected={collected}
          pickupEffects={pickupEffects}
          active={phase === 'playing'}
          onCoin={handleCoin}
          onHazard={handleHazard}
        />
      </Canvas>
      <Hud
        collected={collected.length}
        total={level.coins.length}
        level={levelIndex + 1}
        levelName={level.name}
        levelCount={LEVELS.length}
        phase={phase}
        status={status}
        onRestart={restartGame}
      />
    </>
  )
}
