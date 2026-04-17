import type { Floor } from '../../game/types'

const VIEWPORT_W = 15
const VIEWPORT_H = 11
const TILE_SIZE = 32

interface Props {
  floor: Floor
}

export function FloorMap({ floor }: Props) {
  const { map, playerPos } = floor

  // Clamp camera so player is centred in viewport when possible
  const camX = Math.max(0, Math.min(map.width - VIEWPORT_W, playerPos.x - Math.floor(VIEWPORT_W / 2)))
  const camY = Math.max(0, Math.min(map.height - VIEWPORT_H, playerPos.y - Math.floor(VIEWPORT_H / 2)))

  const cells = []
  for (let vy = 0; vy < VIEWPORT_H; vy++) {
    for (let vx = 0; vx < VIEWPORT_W; vx++) {
      const mx = camX + vx
      const my = camY + vy
      const tile = map.tiles[my]?.[mx]
      if (!tile) {
        cells.push(<div key={`${vx}-${vy}`} style={{ width: TILE_SIZE, height: TILE_SIZE, background: '#0f1117' }} />)
        continue
      }

      const isPlayer = mx === playerPos.x && my === playerPos.y

      let bg = '#0f1117'
      if (tile.explored) {
        if (tile.type === 'floor') bg = '#2d3748'
        else if (tile.type === 'corridor') bg = '#1a2332'
      }

      let icon: string | null = null
      if (isPlayer) {
        icon = '🧚'
      } else if (tile.explored && tile.entity) {
        const e = tile.entity
        if (e.kind === 'monster')  icon = '⚔️'
        else if (e.kind === 'loot')    icon = '💰'
        else if (e.kind === 'chest')   icon = '📦'
        else if (e.kind === 'stairs')  icon = '🪜'
      }

      cells.push(
        <div
          key={`${vx}-${vy}`}
          style={{
            width: TILE_SIZE,
            height: TILE_SIZE,
            background: bg,
            border: tile.type !== 'wall' ? '1px solid #1a202c' : 'none',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: isPlayer ? '2px solid #60a5fa' : 'none',
            outlineOffset: '-2px',
            fontSize: isPlayer ? 18 : 14,
            lineHeight: 1,
          }}
        >
          {icon}
        </div>
      )
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${VIEWPORT_W}, ${TILE_SIZE}px)`,
        gridTemplateRows: `repeat(${VIEWPORT_H}, ${TILE_SIZE}px)`,
        border: '2px solid #374151',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      {cells}
    </div>
  )
}
