import { useGameEngine } from '../useGameEngine'

interface Props {
  onSelect: (dungeonId: string) => void
  onBack: () => void
}

function difficultyInfo(multiplier: number): { label: string; color: string; stars: string } {
  if (multiplier <= 0.5) return { label: 'Easy',    color: '#4ade80', stars: '★☆☆☆' }
  if (multiplier <= 1.0) return { label: 'Normal',  color: '#facc15', stars: '★★☆☆' }
  if (multiplier <= 2.0) return { label: 'Hard',    color: '#f97316', stars: '★★★☆' }
  return                        { label: 'Extreme', color: '#ef4444', stars: '★★★★' }
}

function formatTime(ms: number): string {
  const mins = Math.floor(ms / 60_000)
  const secs = Math.round((ms % 60_000) / 1000)
  return secs === 0 ? `${mins}:00` : `${mins}:${secs.toString().padStart(2, '0')}`
}

export function DungeonSelectScreen({ onSelect, onBack }: Props) {
  const { engine } = useGameEngine()
  const dungeons = engine.getDungeons()

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 520, marginBottom: 24 }}>
        <button onClick={onBack} style={backBtn}>← Back</button>
        <h2 style={{ margin: 0, color: '#a78bfa' }}>Choose Dungeon</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 520 }}>
        {dungeons.map((dungeon) => {
          const unlocked = engine.isDungeonUnlocked(dungeon.id)
          const clears = engine.getDungeonClears(dungeon.id)
          const diff = difficultyInfo(dungeon.difficultyMultiplier)
          const prevDungeon = dungeon.previousDungeonId
            ? dungeons.find(d => d.id === dungeon.previousDungeonId)
            : null
          const prevClears = prevDungeon ? engine.getDungeonClears(prevDungeon.id) : 0

          return (
            <div
              key={dungeon.id}
              style={{
                background: unlocked ? '#1f2937' : '#111827',
                border: `2px solid ${unlocked ? '#374151' : '#1f2937'}`,
                borderRadius: 12,
                padding: '16px 20px',
                opacity: unlocked ? 1 : 0.65,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: 17, color: unlocked ? '#f9fafb' : '#6b7280' }}>
                    {unlocked ? '' : '🔒 '}{dungeon.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {dungeon.description}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                  <div style={{ fontSize: 13, color: diff.color, fontWeight: 'bold' }}>
                    {diff.stars} {diff.label}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>⏱ {formatTime(dungeon.timeLimitMs)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                  {clears > 0 ? (
                    <span style={{ color: '#4ade80' }}>✓ Cleared {clears}×</span>
                  ) : (
                    <span>Not yet cleared</span>
                  )}
                  {!unlocked && prevDungeon && (
                    <span style={{ marginLeft: 10, color: '#f97316' }}>
                      Needs {prevClears}/{dungeon.unlockAfterClears} {prevDungeon.name} clears
                    </span>
                  )}
                </div>
                <button
                  onClick={() => unlocked && onSelect(dungeon.id)}
                  disabled={!unlocked}
                  style={{
                    padding: '8px 20px',
                    background: unlocked ? '#6366f1' : '#374151',
                    color: unlocked ? '#fff' : '#6b7280',
                    border: 'none',
                    borderRadius: 8,
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                    fontSize: 14,
                    fontWeight: 'bold',
                  }}
                >
                  {unlocked ? 'Enter' : 'Locked'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '24px 16px',
  minHeight: '100vh',
}

const backBtn: React.CSSProperties = {
  padding: '8px 14px',
  background: '#374151',
  color: '#9ca3af',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 13,
}
