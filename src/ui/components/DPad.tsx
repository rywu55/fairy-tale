import type { Direction } from '../../game/types'

interface Props {
  onDirection: (dir: Direction) => void
  disabled?: boolean
}

const BTN_SIZE = 48

export function DPad({ onDirection, disabled = false }: Props) {
  function btn(dir: Direction, label: string) {
    return (
      <button
        onClick={() => onDirection(dir)}
        disabled={disabled}
        style={{
          width: BTN_SIZE,
          height: BTN_SIZE,
          background: '#4b5563',
          border: '2px solid #6b7280',
          borderRadius: 8,
          color: '#f9fafb',
          fontSize: 18,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : 1,
          userSelect: 'none',
        }}
      >
        {label}
      </button>
    )
  }

  const center = (
    <div style={{ width: BTN_SIZE, height: BTN_SIZE, background: '#1f2937', borderRadius: 8 }} />
  )
  const empty = <div style={{ width: BTN_SIZE, height: BTN_SIZE }} />

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(3, ${BTN_SIZE}px)`,
        gridTemplateRows: `repeat(3, ${BTN_SIZE}px)`,
        gap: 4,
      }}
    >
      {empty}
      {btn('up', '▲')}
      {empty}
      {btn('left', '◄')}
      {center}
      {btn('right', '►')}
      {empty}
      {btn('down', '▼')}
      {empty}
    </div>
  )
}
