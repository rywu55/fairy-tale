import type { TileMap, Direction, RoomRect } from './types'

const DELTAS: Record<Direction, { dx: number; dy: number }> = {
  up:    { dx:  0, dy: -1 },
  down:  { dx:  0, dy:  1 },
  left:  { dx: -1, dy:  0 },
  right: { dx:  1, dy:  0 },
}

export function getRoomAt(map: TileMap, pos: { x: number; y: number }): RoomRect | null {
  return (
    map.rooms.find(
      r => pos.x >= r.x && pos.x < r.x + r.w && pos.y >= r.y && pos.y < r.y + r.h
    ) ?? null
  )
}

export function revealAround(map: TileMap, pos: { x: number; y: number }): TileMap {
  const tile = map.tiles[pos.y][pos.x]

  if (tile.type === 'floor') {
    const room = getRoomAt(map, pos)
    if (!room) {
      // Fallback: reveal single tile
      return revealSingle(map, pos)
    }
    const newTiles = map.tiles.map((row, y) =>
      row.map((t, x) =>
        x >= room.x && x < room.x + room.w && y >= room.y && y < room.y + room.h
          ? { ...t, explored: true }
          : t
      )
    )
    return { ...map, tiles: newTiles }
  }

  // Corridor or wall: reveal only this tile
  return revealSingle(map, pos)
}

function revealSingle(map: TileMap, pos: { x: number; y: number }): TileMap {
  const newTiles = map.tiles.map((row, y) =>
    row.map((t, x) => (x === pos.x && y === pos.y ? { ...t, explored: true } : t))
  )
  return { ...map, tiles: newTiles }
}

export function stepPlayer(
  map: TileMap,
  pos: { x: number; y: number },
  dir: Direction,
): {
  newPos: { x: number; y: number }
  newMap: TileMap
  moved: boolean
} {
  const { dx, dy } = DELTAS[dir]
  const nx = pos.x + dx
  const ny = pos.y + dy

  if (nx < 0 || nx >= map.width || ny < 0 || ny >= map.height) {
    return { newPos: pos, newMap: map, moved: false }
  }
  if (map.tiles[ny][nx].type === 'wall') {
    return { newPos: pos, newMap: map, moved: false }
  }

  const newPos = { x: nx, y: ny }
  const newMap = revealAround(map, newPos)
  return { newPos, newMap, moved: true }
}
