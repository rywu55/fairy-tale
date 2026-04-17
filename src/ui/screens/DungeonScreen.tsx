import { useState, useEffect, useCallback } from 'react'
import type { CombatAction, Direction } from '../../game/types'
import { FloorMap } from '../components/FloorMap'
import { DPad } from '../components/DPad'
import { CombatView } from '../components/CombatView'
import { HpBar } from '../components/HpBar'
import { useGameEngine } from '../useGameEngine'

interface Props {
  onExit: () => void
}

export function DungeonScreen({ onExit }: Props) {
  const { engine, dungeon, state, wrap, refresh } = useGameEngine()
  const [showCombat, setShowCombat] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [timeDisplay, setTimeDisplay] = useState('10:00')

  // Timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      if (!dungeon || dungeon.status !== 'active') return
      if (engine.checkTimeout()) {
        refresh()
        return
      }
      const ms = engine.getTimeRemainingMs()
      const totalSecs = Math.ceil(ms / 1000)
      const mins = Math.floor(totalSecs / 60)
      const secs = totalSecs % 60
      setTimeDisplay(`${mins}:${secs.toString().padStart(2, '0')}`)
    }, 500)
    return () => clearInterval(interval)
  }, [dungeon, engine, refresh])

  const currentDungeon = engine.getActiveDungeon()
  const currentCombat = engine.getActiveCombat()

  const handleMove = useCallback((dir: Direction) => {
    if (!currentDungeon) return
    try {
      const result = wrap(() => engine.movePlayer(dir))
      if (result.goldGained > 0) {
        setMessage(`+${result.goldGained} Gold!`)
        setTimeout(() => setMessage(null), 1500)
      }
      if (result.combatStarted) {
        setShowCombat(true)
      }
    } catch (e) {
      console.error(e)
    }
  }, [currentDungeon, engine, wrap])

  // Arrow key listener
  useEffect(() => {
    const keyMap: Record<string, Direction> = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    }
    const handler = (e: KeyboardEvent) => {
      if (showCombat) return
      const dir = keyMap[e.key]
      if (dir) {
        e.preventDefault()
        handleMove(dir)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleMove, showCombat])

  const handleCombatAction = useCallback((type: 'basic_attack' | 'special_move', targetIndex: number) => {
    const action: CombatAction = { type, targetIndex }
    wrap(() => engine.executeTurn(action))
  }, [engine, wrap])

  const handleCombatClose = useCallback(() => {
    setShowCombat(false)
    refresh()
  }, [refresh])

  if (!currentDungeon) return null

  const floorIndex = currentDungeon.currentFloor - 1
  const floor = currentDungeon.floors[floorIndex]
  if (!floor) return null

  const fairy = state.fairy!
  const dungeonFairy = currentDungeon.fairy
  const isDone = currentDungeon.status !== 'active'
  const inCombat = showCombat && !!currentCombat

  const timerColor = (() => {
    const ms = engine.getTimeRemainingMs()
    if (ms < 60_000) return '#ef4444'
    if (ms < 120_000) return '#facc15'
    return '#4ade80'
  })()

  return (
    <div style={pageStyle}>
      {/* HUD */}
      <div style={hud}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 160 }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{fairy.name}</div>
            <HpBar current={dungeonFairy.currentHp} max={dungeonFairy.maxHp} label="HP" />
          </div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            Floor <span style={{ color: '#f9fafb', fontWeight: 'bold' }}>{currentDungeon.currentFloor}</span>/5
          </div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            💰 <span style={{ color: '#facc15' }}>{currentDungeon.goldCollected}</span>
          </div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            ✨ <span style={{ color: '#a78bfa' }}>{dungeonFairy.moveUsesRemaining}</span> uses
          </div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: timerColor }}>
            ⏱ {timeDisplay}
          </div>
        </div>
      </div>

      {/* Gold flash */}
      {message && (
        <div style={{ color: '#facc15', fontWeight: 'bold', fontSize: 18, marginBottom: 8, textAlign: 'center' }}>
          {message}
        </div>
      )}

      {/* Combat */}
      {inCombat ? (
        <div style={{ width: '100%' }}>
          <h3 style={{ marginBottom: 12, textAlign: 'center' }}>⚔️ Battle!</h3>
          <CombatView
            combat={currentCombat}
            fairyName={fairy.name}
            onAction={handleCombatAction}
            onClose={handleCombatClose}
          />
        </div>
      ) : (
        <>
          {/* Tile map */}
          <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              Floor {currentDungeon.currentFloor} — Find the chest 📦 to advance
            </div>
            <FloorMap floor={floor} />
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#6b7280', marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span>🧚 You</span>
            <span>👺😈🦇🌟🫧 Monsters</span>
            <span>💰 Loot</span>
            <span>📦 Chest</span>
            <span>🪜 Stairs (F5)</span>
          </div>

          {/* D-Pad */}
          {!isDone && (
            <DPad onDirection={handleMove} disabled={isDone} />
          )}
        </>
      )}

      {/* End states */}
      {isDone && !inCombat && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <div style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: currentDungeon.status === 'victory' ? '#4ade80'
              : currentDungeon.status === 'timeout' ? '#facc15' : '#ef4444',
            marginBottom: 8,
          }}>
            {currentDungeon.status === 'victory' && '🏆 Dungeon Cleared!'}
            {currentDungeon.status === 'defeat' && '💀 Defeated!'}
            {currentDungeon.status === 'timeout' && "⏱ Time's Up!"}
          </div>
          <div style={{ fontSize: 15, color: '#9ca3af', marginBottom: 4 }}>
            Gold collected: <span style={{ color: '#facc15' }}>+{currentDungeon.goldCollected}</span>
          </div>
          <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>
            Floors cleared: {currentDungeon.currentFloor - (currentDungeon.status === 'victory' ? 0 : 1)} / 5
          </div>
          <button onClick={onExit} style={exitBtn}>Return to Home</button>
        </div>
      )}

      {!isDone && !inCombat && (
        <button
          onClick={onExit}
          style={{ ...exitBtn, background: '#374151', marginTop: 12, fontSize: 12, padding: '6px 14px' }}
        >
          ✕ Abandon Run
        </button>
      )}
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px 16px',
  minHeight: '100vh',
  maxWidth: 700,
  margin: '0 auto',
  width: '100%',
}

const hud: React.CSSProperties = {
  background: '#1f2937',
  border: '2px solid #374151',
  borderRadius: 12,
  padding: '14px 20px',
  width: '100%',
  marginBottom: 16,
}

const exitBtn: React.CSSProperties = {
  padding: '12px 28px',
  background: '#6366f1',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  fontSize: 15,
  fontWeight: 'bold',
}
