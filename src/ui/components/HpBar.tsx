interface Props {
  current: number
  max: number
  color?: string
  label?: string
}

export function HpBar({ current, max, color = '#4ade80', label }: Props) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0
  const barColor = pct > 50 ? color : pct > 25 ? '#facc15' : '#ef4444'

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
          <span>{label}</span>
          <span>{current}/{max}</span>
        </div>
      )}
      <div style={{ background: '#333', borderRadius: 4, height: 10, overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: barColor,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  )
}
