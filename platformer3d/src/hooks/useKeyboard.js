import { useEffect, useRef } from 'react'

// Tracks which keys are currently held. Returns a ref to a Set of key codes.
export function useKeyboard() {
  const keys = useRef(new Set())

  useEffect(() => {
    const down = (e) => keys.current.add(e.code)
    const up = (e) => keys.current.delete(e.code)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  return keys
}

// Turns the held keys into a simple input object.
export function readInput(keys) {
  const has = (...codes) => codes.some((c) => keys.has(c))
  return {
    x: (has('KeyD', 'ArrowRight') ? 1 : 0) - (has('KeyA', 'ArrowLeft') ? 1 : 0),
    z: (has('KeyS', 'ArrowDown') ? 1 : 0) - (has('KeyW', 'ArrowUp') ? 1 : 0),
    jump: has('Space'),
  }
}
