// 2D overlay on top of the canvas
export default function Hud({ collected, total }) {
  const done = collected === total
  return (
    <div style={{ position: 'absolute', top: 16, left: 16, color: '#fff', textShadow: '0 1px 4px #000' }}>
      <div style={{ fontSize: 22, fontWeight: 700 }}>
        Coins: {collected} / {total}
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
  )
}
