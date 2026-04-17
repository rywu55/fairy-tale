import { useState } from 'react'
import type { CombatState, MonsterInstance } from '../../game/types'
import { HpBar } from './HpBar'
import { getMoveName, getMovePower } from '../../game/moves'

interface Props {
  combat: CombatState
  fairyName: string
  onAction: (type: 'basic_attack' | 'special_move', targetIndex: number) => void
  onClose: () => void
}

export function CombatView({ combat, fairyName, onAction, onClose }: Props) {
  const [selectedTarget, setSelectedTarget] = useState(0)
  const isPlayerTurn = combat.status === 'player_turn'
  const isDone = combat.status === 'victory' || combat.status === 'defeat'
  const moveName = getMoveName(combat.fairy.move)
  const movePower = getMovePower(combat.fairy.move)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Combatants */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between' }}>
        {/* Fairy side */}
        <div style={cardStyle}>
          <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#60a5fa' }}>{fairyName}</div>
          <HpBar current={combat.fairy.currentHp} max={combat.fairy.maxHp} label="HP" />
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
            Moves: {combat.fairy.moveUsesRemaining}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>
            {isPlayerTurn && combat.actionsPerTurn > 1
              ? `Action ${combat.actionsThisTurn + 1} / ${combat.actionsPerTurn}`
              : ''}
          </div>
        </div>

        {/* Monster side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {combat.monsters.map((monster: MonsterInstance, i: number) => (
            <div
              key={i}
              onClick={() => monster.currentHp > 0 && setSelectedTarget(i)}
              style={{
                ...cardStyle,
                opacity: monster.currentHp <= 0 ? 0.4 : 1,
                border: selectedTarget === i && monster.currentHp > 0
                  ? '2px solid #f59e0b'
                  : '2px solid #374151',
                cursor: monster.currentHp > 0 ? 'pointer' : 'default',
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 4 }}>
                {monster.currentHp <= 0 ? '💀 ' : ''}{monster.name}
              </div>
              <HpBar current={monster.currentHp} max={monster.maxHp} />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {!isDone && isPlayerTurn && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onAction('basic_attack', selectedTarget)}
            style={actionBtn('#374151')}
          >
            ⚔️ Basic Attack
          </button>
          <button
            onClick={() => combat.fairy.moveUsesRemaining > 0 && onAction('special_move', selectedTarget)}
            disabled={combat.fairy.moveUsesRemaining <= 0}
            style={actionBtn(combat.fairy.moveUsesRemaining > 0 ? '#4c1d95' : '#1f2937')}
          >
            ✨ {moveName} (PWR {movePower})
            <br />
            <span style={{ fontSize: 11 }}>{combat.fairy.moveUsesRemaining} uses left</span>
          </button>
        </div>
      )}

      {!isDone && !isPlayerTurn && (
        <div style={{ textAlign: 'center', color: '#9ca3af', padding: 8 }}>
          Monsters are attacking...
        </div>
      )}

      {/* End state */}
      {combat.status === 'victory' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#4ade80', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            ✨ Victory!
          </div>
          <button onClick={onClose} style={actionBtn('#166534')}>Continue</button>
        </div>
      )}
      {combat.status === 'defeat' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ef4444', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            💀 Defeated!
          </div>
          <button onClick={onClose} style={actionBtn('#7f1d1d')}>Continue</button>
        </div>
      )}

      {/* Turn log */}
      <div style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 8,
        padding: 8,
        maxHeight: 120,
        overflowY: 'auto',
        fontSize: 12,
        color: '#9ca3af',
      }}>
        {combat.turnLog.length === 0
          ? <span>Battle begins...</span>
          : [...combat.turnLog].reverse().map((entry, i) => (
            <div key={i} style={{ marginBottom: 2 }}>
              {entry.missed
                ? `${entry.actor} attacked ${entry.target} — MISSED!`
                : entry.healed > 0
                  ? `${entry.actor} recovered ${entry.healed} HP`
                  : `${entry.actor} used ${entry.action} on ${entry.target} — ${entry.damage} dmg`
              }
            </div>
          ))
        }
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#1f2937',
  border: '2px solid #374151',
  borderRadius: 8,
  padding: 12,
  minWidth: 120,
}

function actionBtn(bg: string): React.CSSProperties {
  return {
    background: bg,
    color: '#f9fafb',
    border: 'none',
    borderRadius: 8,
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: 13,
    flex: 1,
    lineHeight: 1.4,
  }
}
