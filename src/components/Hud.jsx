const panelStyle = {
  position: 'absolute',
  top: 16,
  left: 16,
  color: '#fff',
  textShadow: '0 1px 4px #000',
}

const buttonStyle = {
  marginTop: 16,
  padding: '10px 18px',
  border: '1px solid rgba(255,255,255,0.55)',
  borderRadius: 8,
  background: '#18aeb5',
  color: '#06212b',
  font: 'inherit',
  fontWeight: 700,
  cursor: 'pointer',
}

const soundButtonStyle = {
  position: 'absolute',
  top: 16,
  right: 16,
  padding: '8px 12px',
  border: '1px solid rgba(255,255,255,0.55)',
  borderRadius: 8,
  background: 'rgba(8, 20, 38, 0.72)',
  color: '#fff',
  font: 'inherit',
  fontWeight: 700,
  cursor: 'pointer',
}

export default function Hud({
  collected,
  total,
  level,
  levelName,
  levelCount,
  phase,
  status,
  onRestart,
  soundEnabled,
  onToggleSound,
}) {
  return (
    <>
      <button style={soundButtonStyle} onClick={onToggleSound}>
        Sound: {soundEnabled ? 'On' : 'Off'}
      </button>
      <div style={panelStyle}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>
          Level {level} / {levelCount} · Coins: {collected} / {total}
        </div>
        <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>
          {levelName} · Move: WASD/arrows · Jump: Space · Restart: R
        </div>
        <div style={{ fontSize: 13, opacity: 0.75, marginTop: 3 }}>
          Avoid the glowing enemies.
        </div>
      </div>

      {status && phase === 'playing' && (
        <div style={{
          position: 'absolute',
          top: 88,
          left: 16,
          color: '#fff2a6',
          fontWeight: 700,
          textShadow: '0 1px 5px #000',
        }}>
          {status}
        </div>
      )}

      {(phase === 'transition' || phase === 'won') && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(8, 20, 38, 0.62)',
          color: '#fff',
          textAlign: 'center',
          textShadow: '0 2px 12px #000',
        }}>
          <div>
            <div style={{ fontSize: 38, fontWeight: 800 }}>
              {phase === 'won' ? 'Great platforming!' : 'Level complete!'}
            </div>
            {phase === 'won' ? (
              <>
                <div style={{ marginTop: 8 }}>Great platforming!</div>
                <button style={buttonStyle} onClick={onRestart}>
                  Play again
                </button>
              </>
            ) : (
              <div style={{ marginTop: 8 }}>Next level loading...</div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
