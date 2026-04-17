import type { AttributeKey } from '../../game/types'
import { ATTRIBUTE_KEYS, ATTRIBUTE_LABELS } from '../../game/types'
import { getSpriteCeiling, canUpgradeAttribute } from '../../game/fairy'
import { canAfford } from '../../game/economy'
import { getMoveName, getMovePower } from '../../game/moves'
import { useGameEngine } from '../useGameEngine'

interface Props {
  onBack: () => void
}

export function UpgradeScreen({ onBack }: Props) {
  const { state, engine, wrap } = useGameEngine()
  const fairy = state.fairy!

  function handleUpgradeAttribute(key: AttributeKey) {
    try {
      wrap(() => engine.upgradeAttribute(key))
    } catch (e) {
      console.error(e)
    }
  }

  function handleUpgradeMove() {
    try {
      wrap(() => engine.upgradeMove())
    } catch (e) {
      console.error(e)
    }
  }

  const moveName = getMoveName(fairy.move)
  const movePower = getMovePower(fairy.move)
  const moveLevel = fairy.move.level
  const moveCost = engine.getMoveUpgradeCost()
  const moveAtMax = moveLevel >= 10
  const canAffordMove = canAfford(state.gold, moveCost)

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 480, marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>⬆️ Upgrades</h2>
        <div style={{ color: '#facc15', fontWeight: 'bold' }}>💰 {state.gold} Gold</div>
      </div>

      {/* Attribute upgrades */}
      <div style={{ ...card, width: '100%', maxWidth: 480, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px' }}>Attributes</h3>
        {ATTRIBUTE_KEYS.map(key => {
          const value = fairy.attributes[key]
          const ceiling = getSpriteCeiling(fairy.definitionId, key)
          const cost = engine.getAttributeUpgradeCost(key)
          const atCeiling = !canUpgradeAttribute(fairy, key)
          const affordable = canAfford(state.gold, cost)
          const canUpgrade = !atCeiling && affordable

          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ width: 100, fontSize: 13 }}>{ATTRIBUTE_LABELS[key]}</span>
              <span style={{ width: 60, fontSize: 13, color: atCeiling ? '#6b7280' : '#f9fafb' }}>
                {value} / {ceiling}
              </span>
              <span style={{ flex: 1 }} />
              {atCeiling ? (
                <span style={{ fontSize: 11, color: '#6b7280' }}>MAX</span>
              ) : (
                <span style={{ fontSize: 12, color: affordable ? '#facc15' : '#6b7280', marginRight: 8 }}>
                  {cost}g
                </span>
              )}
              <button
                onClick={() => handleUpgradeAttribute(key)}
                disabled={!canUpgrade}
                style={upgradeBtn(canUpgrade)}
              >
                +1
              </button>
            </div>
          )
        })}
      </div>

      {/* Move upgrade */}
      <div style={{ ...card, width: '100%', maxWidth: 480, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px' }}>Special Move</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', color: '#a78bfa' }}>✨ {moveName}</div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              Level {moveLevel}/10 · Power {movePower}
            </div>
            {!moveAtMax && (
              <div style={{ fontSize: 12, color: '#9ca3af' }}>
                Next level: Power {movePower + 5}
              </div>
            )}
          </div>
          {moveAtMax ? (
            <span style={{ color: '#6b7280', fontSize: 13 }}>MAX LEVEL</span>
          ) : (
            <>
              <span style={{ fontSize: 12, color: canAffordMove ? '#facc15' : '#6b7280' }}>
                {moveCost}g
              </span>
              <button
                onClick={handleUpgradeMove}
                disabled={!canAffordMove || moveAtMax}
                style={upgradeBtn(canAffordMove && !moveAtMax)}
              >
                Upgrade
              </button>
            </>
          )}
        </div>
      </div>

      <button onClick={onBack} style={backBtn}>← Back to Home</button>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: 24,
  minHeight: '100vh',
}

const card: React.CSSProperties = {
  background: '#1f2937',
  border: '2px solid #374151',
  borderRadius: 12,
  padding: 16,
}

const upgradeBtn = (enabled: boolean): React.CSSProperties => ({
  padding: '6px 14px',
  background: enabled ? '#6366f1' : '#1f2937',
  color: enabled ? '#fff' : '#4b5563',
  border: 'none',
  borderRadius: 6,
  cursor: enabled ? 'pointer' : 'not-allowed',
  fontSize: 13,
  fontWeight: 'bold',
})

const backBtn: React.CSSProperties = {
  padding: '10px 20px',
  background: '#374151',
  color: '#f9fafb',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 14,
}
