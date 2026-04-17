import { useState } from 'react'
import type { Element, Attributes, AttributeKey } from '../../game/types'
import { ATTRIBUTE_KEYS } from '../../game/types'
import { getAllFairyDefinitions } from '../../game/data/fairies'
import { getMovePower } from '../../game/data/moves'
import { FairySilhouette } from '../components/FairySilhouette'
import { AttributeAllocator } from '../components/AttributeAllocator'
import { useGameEngine } from '../useGameEngine'

const ZERO_POINTS: Attributes = { attack: 0, defense: 0, heal: 0, evasiveness: 0, health: 0 }
const TOTAL_STARTER_POINTS = 3

export function FtueScreen() {
  const { engine, wrap } = useGameEngine()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedElement, setSelectedElement] = useState<Element | null>(null)
  const [allocatedPoints, setAllocatedPoints] = useState<Attributes>({ ...ZERO_POINTS })
  const [fairyName, setFairyName] = useState('')

  const defs = getAllFairyDefinitions()
  const remainingPoints = TOTAL_STARTER_POINTS - ATTRIBUTE_KEYS.reduce((s, k) => s + allocatedPoints[k], 0)

  function handleSelectFairy(element: Element) {
    setSelectedElement(element)
    const def = defs.find(d => d.element === element)!
    setFairyName(def.defaultName)
    setAllocatedPoints({ ...ZERO_POINTS })
    setStep(2)
  }

  function handleAllocate(key: AttributeKey, delta: number) {
    setAllocatedPoints(prev => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }))
  }

  function handleConfirm() {
    if (!selectedElement) return
    wrap(() => engine.createFairy(selectedElement, allocatedPoints, fairyName))
  }

  const selectedDef = selectedElement ? defs.find(d => d.element === selectedElement)! : null

  return (
    <div style={pageStyle}>
      <h1 style={{ color: '#a78bfa', marginBottom: 4 }}>✨ Fairy Tale</h1>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>Begin your journey</p>

      {/* Step 1: Choose fairy */}
      {step === 1 && (
        <div>
          <h2 style={{ marginBottom: 16 }}>Choose your fairy</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {defs.map(def => (
              <div
                key={def.element}
                onClick={() => handleSelectFairy(def.element)}
                style={{
                  background: '#1f2937',
                  border: '2px solid #374151',
                  borderRadius: 12,
                  padding: 16,
                  width: 140,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#374151')}
              >
                <FairySilhouette element={def.element} size={64} />
                <div style={{ fontWeight: 'bold', marginTop: 8 }}>{def.name}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{def.playstyle}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Allocate starter points */}
      {step === 2 && selectedDef && (
        <div style={{ maxWidth: 360, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <FairySilhouette element={selectedDef.element} size={56} />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 18 }}>{selectedDef.name}</div>
              <div style={{ color: '#9ca3af', fontSize: 13 }}>{selectedDef.playstyle}</div>
            </div>
          </div>
          <h3 style={{ marginBottom: 12 }}>Allocate 3 starter points</h3>
          <AttributeAllocator
            element={selectedElement!}
            points={allocatedPoints}
            remainingPoints={remainingPoints}
            onAllocate={handleAllocate}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button onClick={() => setStep(1)} style={secondaryBtn}>← Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={remainingPoints !== 0}
              style={primaryBtn(remainingPoints === 0)}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Move preview */}
      {step === 3 && selectedDef && (
        <div style={{ maxWidth: 360, width: '100%' }}>
          <h3 style={{ marginBottom: 16 }}>Your starting move</h3>
          <div style={{ background: '#1f2937', border: '2px solid #4c1d95', borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 'bold', fontSize: 16, color: '#a78bfa', marginBottom: 8 }}>
              ✨ {selectedDef.starterMoveId.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
            </div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              Element: <span style={{ color: '#f9fafb', textTransform: 'capitalize' }}>{selectedDef.element}</span>
            </div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
              Base Power: <span style={{ color: '#f9fafb' }}>{getMovePower(selectedDef.starterMoveId, 1)}</span>
            </div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
              Uses per dungeon: <span style={{ color: '#f9fafb' }}>5</span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
              Special moves use their own Power — not your Attack stat.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button onClick={() => setStep(2)} style={secondaryBtn}>← Back</button>
            <button onClick={() => setStep(4)} style={primaryBtn(true)}>Next →</button>
          </div>
        </div>
      )}

      {/* Step 4: Name your fairy */}
      {step === 4 && selectedDef && (
        <div style={{ maxWidth: 360, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <FairySilhouette element={selectedDef.element} size={80} />
          </div>
          <h3 style={{ marginBottom: 12 }}>Name your fairy</h3>
          <input
            value={fairyName}
            onChange={e => setFairyName(e.target.value.slice(0, 16))}
            maxLength={16}
            style={{
              background: '#1f2937',
              border: '2px solid #374151',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#f9fafb',
              fontSize: 18,
              width: '100%',
              marginBottom: 8,
            }}
          />
          <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'right' }}>
            {fairyName.trim().length} / 16
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={() => setStep(3)} style={secondaryBtn}>← Back</button>
            <button
              onClick={handleConfirm}
              disabled={fairyName.trim().length === 0}
              style={primaryBtn(fairyName.trim().length > 0)}
            >
              Begin Adventure ✨
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '100vh',
  padding: 32,
}

const primaryBtn = (enabled: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '10px 20px',
  background: enabled ? '#6366f1' : '#1f2937',
  color: enabled ? '#fff' : '#4b5563',
  border: 'none',
  borderRadius: 8,
  cursor: enabled ? 'pointer' : 'not-allowed',
  fontSize: 14,
  fontWeight: 'bold',
})

const secondaryBtn: React.CSSProperties = {
  padding: '10px 16px',
  background: '#374151',
  color: '#f9fafb',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 14,
}
