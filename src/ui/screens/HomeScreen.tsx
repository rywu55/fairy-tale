import { useRef } from 'react'
import type { Fairy } from '../../game/types'
import { ATTRIBUTE_KEYS, ATTRIBUTE_LABELS } from '../../game/types'
import { getSpriteCeiling } from '../../game/fairy'
import { getMoveName, getMovePower } from '../../game/moves'
import { getFairyDefinition } from '../../game/data/fairies'
import { FairySilhouette } from '../components/FairySilhouette'
import { HpBar } from '../components/HpBar'
import { useGameEngine } from '../useGameEngine'

interface Props {
  onEnterDungeon: () => void
  onUpgrades: () => void
}

export function HomeScreen({ onEnterDungeon, onUpgrades }: Props) {
  const { state, engine, wrap } = useGameEngine()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fairy = state.fairy as Fairy

  function handleExport() {
    const json = engine.exportSave()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fairytale_save.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      try {
        wrap(() => engine.importSave(text))
        alert('Save imported successfully!')
      } catch (err) {
        alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const def = getFairyDefinition(fairy.definitionId)
  const moveName = getMoveName(fairy.move)
  const movePower = getMovePower(fairy.move)

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 560, marginBottom: 24 }}>
        <h1 style={{ color: '#a78bfa', margin: 0 }}>✨ Fairy Tale</h1>
        <div style={{ color: '#facc15', fontWeight: 'bold', fontSize: 18 }}>
          💰 {state.gold} Gold
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, width: '100%', maxWidth: 560, flexWrap: 'wrap' }}>
        {/* Fairy Card */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <FairySilhouette element={fairy.definitionId} size={64} />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 18 }}>{fairy.name}</div>
              <div style={{ color: '#9ca3af', fontSize: 13, textTransform: 'capitalize' }}>
                {fairy.definitionId} · {def.playstyle}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ATTRIBUTE_KEYS.map(key => {
              const value = fairy.attributes[key]
              const ceiling = getSpriteCeiling(fairy.definitionId, key)
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 100, fontSize: 12, color: '#9ca3af' }}>{ATTRIBUTE_LABELS[key]}</span>
                  <HpBar current={value} max={ceiling} color="#818cf8" />
                  <span style={{ fontSize: 12, minWidth: 48, textAlign: 'right' }}>{value}/{ceiling}</span>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 16, padding: 10, background: '#0f172a', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Special Move</div>
            <div style={{ fontWeight: 'bold', color: '#a78bfa' }}>✨ {moveName}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              Power {movePower} · Level {fairy.move.level}/10 · 5 uses/dungeon
            </div>
          </div>
        </div>

        {/* Actions + Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 180 }}>
          <button onClick={onEnterDungeon} style={bigBtn('#6366f1')}>
            ⚔️ Enter Dungeon
          </button>
          <button onClick={onUpgrades} style={bigBtn('#374151')}>
            ⬆️ Upgrades
          </button>

          <div style={{ ...card, marginTop: 8 }}>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>Stats</div>
            <div style={{ fontSize: 13 }}>Dungeons cleared: {state.stats.dungeonsCompleted}</div>
            <div style={{ fontSize: 13 }}>Floors cleared: {state.stats.floorsCleared}</div>
            <div style={{ fontSize: 13 }}>Gold earned: {state.stats.totalGoldEarned}</div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
            <button onClick={handleExport} style={smallBtn}>📤 Export</button>
            <button onClick={handleImportClick} style={smallBtn}>📥 Import</button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>
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
  flex: 1,
}

const bigBtn = (bg: string): React.CSSProperties => ({
  padding: '14px 20px',
  background: bg,
  color: '#f9fafb',
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  fontSize: 15,
  fontWeight: 'bold',
  width: '100%',
})

const smallBtn: React.CSSProperties = {
  flex: 1,
  padding: '8px 12px',
  background: '#374151',
  color: '#9ca3af',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 12,
}
