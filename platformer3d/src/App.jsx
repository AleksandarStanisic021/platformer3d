import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

// ---------- Level ----------
// plat(x, topY, z, width, depth) -> box whose top surface is at topY
const plat = (x, topY, z, w, d) => ({ pos: [x, topY - 0.5, z], size: [w, 1, d] })

const PLATFORMS = [
  plat(0, 0, 0, 8, 8),
  plat(0, 0.5, -8, 4, 4),
  plat(3, 1.5, -13, 4, 4),
  plat(7, 2.5, -18, 4, 4),
  plat(3, 3.5, -23, 4, 4),
  plat(-2, 4.5, -27, 4, 4),
  plat(-7, 5.5, -27, 4, 4),
  plat(-12, 6.5, -23, 6, 6),
]

const COINS = [
  [0, 1.5, -8],
  [3, 2.5, -13],
  [7, 3.5, -18],
  [3, 4.5, -23],
  [-2, 5.5, -27],
  [-7, 6.5, -27],
  [-12, 7.5, -23],
]

// ---------- Physics (simple AABB) ----------
const HALF = 0.4
const SPEED = 6
const JUMP = 11
const GRAVITY = 28
const START = [0, 2, 0]

const overlaps = (p, pl) =>
  Math.abs(p[0] - pl.pos[0]) < HALF + pl.size[0] / 2 &&
  Math.abs(p[1] - pl.pos[1]) < HALF + pl.size[1] / 2 &&
  Math.abs(p[2] - pl.pos[2]) < HALF + pl.size[2] / 2

// Move along one axis, push back out of any platform we hit. Returns true if hit.
function moveAxis(p, i, v, dt) {
  p[i] += v * dt
  let hit = false
  for (const pl of PLATFORMS) {
    if (overlaps(p, pl)) {
      const half = pl.size[i] / 2
      p[i] = v > 0 ? pl.pos[i] - half - HALF : pl.pos[i] + half + HALF
      hit = true
    }
  }
  return hit
}

// ---------- Components ----------
function Player({ onCoin }) {
  const mesh = useRef()
  const pos = useRef([...START])
  const vel = useRef([0, 0, 0])
  const onGround = useRef(false)
  const keys = useRef(new Set())
  const taken = useRef(new Set())

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

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.033)
    const k = keys.current
    const p = pos.current
    const v = vel.current

    const left = k.has('KeyA') || k.has('ArrowLeft')
    const right = k.has('KeyD') || k.has('ArrowRight')
    const up = k.has('KeyW') || k.has('ArrowUp')
    const down = k.has('KeyS') || k.has('ArrowDown')

    v[0] = ((right ? 1 : 0) - (left ? 1 : 0)) * SPEED
    v[2] = ((down ? 1 : 0) - (up ? 1 : 0)) * SPEED
    if (k.has('Space') && onGround.current) {
      v[1] = JUMP
      onGround.current = false
    }
    v[1] -= GRAVITY * dt

    moveAxis(p, 0, v[0], dt)
    moveAxis(p, 2, v[2], dt)
    const hitY = moveAxis(p, 1, v[1], dt)
    onGround.current = hitY && v[1] < 0
    if (hitY) v[1] = 0

    // Fell off the world -> back to start
    if (p[1] < -15) {
      p[0] = START[0]; p[1] = START[1]; p[2] = START[2]
      v[1] = 0
    }

    // Coins
    COINS.forEach((c, i) => {
      if (taken.current.has(i)) return
      const d = Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2])
      if (d < 0.9) {
        taken.current.add(i)
        onCoin(i)
      }
    })

    mesh.current.position.set(p[0], p[1], p[2])

    // Camera follows the player
    const cam = state.camera
    cam.position.lerp({ x: p[0], y: p[1] + 6, z: p[2] + 10 }, 0.08)
    cam.lookAt(p[0], p[1], p[2])
  })

  return (
    <mesh ref={mesh} castShadow>
      <boxGeometry args={[HALF * 2, HALF * 2, HALF * 2]} />
      <meshStandardMaterial color="#ff6b35" />
    </mesh>
  )
}

function Coin({ position, collected }) {
  const ref = useRef()
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 3
  })
  if (collected) return null
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[0.35, 0.35, 0.1, 24]} />
      <meshStandardMaterial color="#ffd23f" emissive="#b8860b" emissiveIntensity={0.5} />
    </mesh>
  )
}

export default function App() {
  const [collected, setCollected] = useState([])
  const done = collected.length === COINS.length

  return (
    <>
      <Canvas shadows camera={{ position: [0, 6, 10], fov: 60 }}>
        <color attach="background" args={['#1b2a41']} />
        <fog attach="fog" args={['#1b2a41', 20, 60]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />

        {PLATFORMS.map((pl, i) => (
          <mesh key={i} position={pl.pos} receiveShadow>
            <boxGeometry args={pl.size} />
            <meshStandardMaterial color={i === PLATFORMS.length - 1 ? '#4ecdc4' : '#8d99ae'} />
          </mesh>
        ))}

        {COINS.map((c, i) => (
          <Coin key={i} position={c} collected={collected.includes(i)} />
        ))}

        <Player onCoin={(i) => setCollected((prev) => [...prev, i])} />
      </Canvas>

      <div style={{ position: 'absolute', top: 16, left: 16, color: '#fff', textShadow: '0 1px 4px #000' }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>
          Coins: {collected.length} / {COINS.length}
        </div>
        <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
          Move: WASD or arrows. Jump: Space.
        </div>
        {done && (
          <div style={{ fontSize: 20, marginTop: 8, color: '#ffd23f' }}>
            You collected every coin!
          </div>
        )}
      </div>
    </>
  )
}
