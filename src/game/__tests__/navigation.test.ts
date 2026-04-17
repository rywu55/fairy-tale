import { describe, it, expect } from 'vitest'
import { stepPlayer, revealAround, getRoomAt } from '../navigation'
import type { TileMap, Tile, RoomRect } from '../types'

// ─── Helpers ────────────────────────────────────────

function wall(): Tile   { return { type: 'wall',    explored: false, entity: null } }
function floor(): Tile  { return { type: 'floor',   explored: false, entity: null } }
function corr(): Tile   { return { type: 'corridor', explored: false, entity: null } }

function makeMap(tileGrid: Tile[][], rooms: RoomRect[] = []): TileMap {
  return {
    width: tileGrid[0].length,
    height: tileGrid.length,
    tiles: tileGrid,
    playerStart: { x: 0, y: 0 },
    rooms,
  }
}

// 3×3 map:  W=wall, F=floor, C=corridor
//   W W W
//   W F W
//   W W W
function singleFloorMap(): TileMap {
  return makeMap([
    [wall(), wall(), wall()],
    [wall(), floor(), wall()],
    [wall(), wall(), wall()],
  ])
}

// 5×3 map with a floor room and a corridor strip:
//   W W W W W
//   W F C F W
//   W W W W W
function corridorMap(): TileMap {
  return makeMap([
    [wall(),  wall(),  wall(), wall(),  wall()],
    [wall(),  floor(), corr(), floor(), wall()],
    [wall(),  wall(),  wall(), wall(),  wall()],
  ], [
    { x: 1, y: 1, w: 1, h: 1 },
    { x: 3, y: 1, w: 1, h: 1 },
  ])
}

// 7×5 map with a 3×3 room in the centre
function roomMap(): TileMap {
  const t: Tile[][] = Array.from({ length: 5 }, () =>
    Array.from({ length: 7 }, wall)
  )
  for (let y = 1; y <= 3; y++)
    for (let x = 2; x <= 4; x++)
      t[y][x] = floor()
  return makeMap(t, [{ x: 2, y: 1, w: 3, h: 3 }])
}

// ─── stepPlayer ─────────────────────────────────────

describe('stepPlayer', () => {
  it('moves onto a floor tile', () => {
    // Use corridorMap: move right from (1,1) is corridor at (2,1)
    const cm = corridorMap()
    const result = stepPlayer(cm, { x: 1, y: 1 }, 'right')
    expect(result.moved).toBe(true)
    expect(result.newPos).toEqual({ x: 2, y: 1 })
  })

  it('blocks movement into a wall tile', () => {
    const result = stepPlayer(singleFloorMap(), { x: 1, y: 1 }, 'up')
    expect(result.moved).toBe(false)
    expect(result.newPos).toEqual({ x: 1, y: 1 })
  })

  it('blocks movement out of bounds (left edge)', () => {
    const map = corridorMap()
    const result = stepPlayer(map, { x: 0, y: 1 }, 'left')
    expect(result.moved).toBe(false)
  })

  it('blocks movement out of bounds (top edge)', () => {
    const map = corridorMap()
    const result = stepPlayer(map, { x: 1, y: 0 }, 'up')
    expect(result.moved).toBe(false)
  })

  it('returns the same map reference when blocked', () => {
    const map = singleFloorMap()
    const result = stepPlayer(map, { x: 1, y: 1 }, 'up')
    expect(result.newMap).toBe(map)
  })

  it('returns a new map object when moved', () => {
    const map = corridorMap()
    const result = stepPlayer(map, { x: 1, y: 1 }, 'right')
    expect(result.newMap).not.toBe(map)
  })
})

// ─── revealAround ───────────────────────────────────

describe('revealAround', () => {
  it('stepping onto a floor tile reveals the whole room', () => {
    const map = roomMap()
    // Centre of the 3×3 room is (3,2)
    const newMap = revealAround(map, { x: 3, y: 2 })
    // All tiles in the room should be explored
    for (let y = 1; y <= 3; y++)
      for (let x = 2; x <= 4; x++)
        expect(newMap.tiles[y][x].explored).toBe(true)
  })

  it('stepping onto a corridor tile reveals only that tile', () => {
    const map = corridorMap()
    const newMap = revealAround(map, { x: 2, y: 1 })
    expect(newMap.tiles[1][2].explored).toBe(true)
    // Adjacent floor tiles should NOT be revealed
    expect(newMap.tiles[1][1].explored).toBe(false)
    expect(newMap.tiles[1][3].explored).toBe(false)
  })

  it('explored flag never reverts to false', () => {
    const map = roomMap()
    // Manually mark one tile as explored
    const premarked = {
      ...map,
      tiles: map.tiles.map((row, y) =>
        row.map((t, x) => (x === 3 && y === 2 ? { ...t, explored: true } : t))
      ),
    }
    const newMap = revealAround(premarked, { x: 3, y: 2 })
    expect(newMap.tiles[2][3].explored).toBe(true)
  })
})

// ─── getRoomAt ──────────────────────────────────────

describe('getRoomAt', () => {
  it('returns the room containing the given position', () => {
    const map = roomMap()
    const room = getRoomAt(map, { x: 3, y: 2 })
    expect(room).not.toBeNull()
    expect(room!.x).toBe(2)
    expect(room!.y).toBe(1)
  })

  it('returns null for a wall tile outside any room', () => {
    const map = roomMap()
    const room = getRoomAt(map, { x: 0, y: 0 })
    expect(room).toBeNull()
  })

  it('returns null for a corridor tile between rooms', () => {
    const map = corridorMap()
    const room = getRoomAt(map, { x: 2, y: 1 })
    expect(room).toBeNull()
  })
})
