import type { TileMap, Tile, TileType, RoomRect } from './types'
import { getRandomMonster, createEliteMonster } from './data/monsters'
import { randomGoldInRange } from './economy'

export class MapGenerationError extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = 'MapGenerationError'
  }
}

export const MAP_WIDTH = 30
export const MAP_HEIGHT = 20
const MIN_ROOMS = 4
const MAX_ROOMS = 8
const MAX_PLACE_ATTEMPTS = 200

// ─── Grid helpers ────────────────────────────────────

function blankGrid(w: number, h: number): Tile[][] {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, (): Tile => ({
      type: 'wall' as TileType,
      explored: false,
      entity: null,
    }))
  )
}

function roomsOverlap(a: RoomRect, b: RoomRect, margin: number): boolean {
  return (
    a.x - margin < b.x + b.w &&
    a.x + a.w + margin > b.x &&
    a.y - margin < b.y + b.h &&
    a.y + a.h + margin > b.y
  )
}

function roomCenter(room: RoomRect): { x: number; y: number } {
  return {
    x: Math.floor(room.x + room.w / 2),
    y: Math.floor(room.y + room.h / 2),
  }
}

function roomTilePositions(room: RoomRect): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = []
  for (let y = room.y; y < room.y + room.h; y++)
    for (let x = room.x; x < room.x + room.w; x++)
      positions.push({ x, y })
  return positions
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Room placement ──────────────────────────────────

function placeRooms(count: number): RoomRect[] {
  const rooms: RoomRect[] = []
  let attempts = 0

  while (rooms.length < count && attempts < MAX_PLACE_ATTEMPTS) {
    attempts++
    const w = Math.floor(Math.random() * 5) + 4   // 4–8
    const h = Math.floor(Math.random() * 4) + 3   // 3–6
    const x = Math.floor(Math.random() * (MAP_WIDTH  - w - 2)) + 1
    const y = Math.floor(Math.random() * (MAP_HEIGHT - h - 2)) + 1
    const candidate: RoomRect = { x, y, w, h }

    if (!rooms.some(r => roomsOverlap(r, candidate, 1))) {
      rooms.push(candidate)
    }
  }

  if (rooms.length < MIN_ROOMS) {
    throw new MapGenerationError(
      `Map generation failed: only placed ${rooms.length} of ${MIN_ROOMS} required rooms`
    )
  }

  return rooms
}

// ─── Carving ─────────────────────────────────────────

function carveRoom(tiles: Tile[][], room: RoomRect): void {
  for (let row = room.y; row < room.y + room.h; row++) {
    for (let col = room.x; col < room.x + room.w; col++) {
      tiles[row][col] = { ...tiles[row][col], type: 'floor' }
    }
  }
}

function carveCorridor(
  tiles: Tile[][],
  x1: number, y1: number,
  x2: number, y2: number,
): void {
  const horizFirst = Math.random() < 0.5

  if (horizFirst) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      if (tiles[y1][x].type === 'wall') tiles[y1][x] = { ...tiles[y1][x], type: 'corridor' }
    }
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      if (tiles[y][x2].type === 'wall') tiles[y][x2] = { ...tiles[y][x2], type: 'corridor' }
    }
  } else {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      if (tiles[y][x1].type === 'wall') tiles[y][x1] = { ...tiles[y][x1], type: 'corridor' }
    }
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      if (tiles[y2][x].type === 'wall') tiles[y2][x] = { ...tiles[y2][x], type: 'corridor' }
    }
  }
}

// ─── Entity placement ────────────────────────────────

function placeEntities(tiles: Tile[][], rooms: RoomRect[], startIdx: number, floorNumber: number, multiplier = 1): void {
  const nonStart = shuffle(rooms.filter((_, i) => i !== startIdx))

  if (nonStart.length === 0) return

  // Last shuffled room → chest (floors 1–4) or stairs (floor 5)
  const specialRoom = nonStart[nonStart.length - 1]
  const sc = roomCenter(specialRoom)
  tiles[sc.y][sc.x] = {
    ...tiles[sc.y][sc.x],
    entity: floorNumber === 5
      ? { kind: 'stairs' }
      : { kind: 'chest', goldReward: randomGoldInRange(100, 200) },
  }

  // Second-to-last → loot (if enough rooms)
  let lootOffset = 1
  if (nonStart.length >= 2) {
    const lootRoom = nonStart[nonStart.length - 2]
    const lc = roomCenter(lootRoom)
    tiles[lc.y][lc.x] = {
      ...tiles[lc.y][lc.x],
      entity: { kind: 'loot', goldReward: randomGoldInRange(30, 80) },
    }
    lootOffset = 2
  }

  // All remaining → monsters, 1 per tile spread across room
  const monsterRooms = nonStart.slice(0, nonStart.length - lootOffset)
  for (const room of monsterRooms) {
    const count = Math.floor(Math.random() * 3) + 1
    const positions = shuffle(roomTilePositions(room)).slice(0, count)
    for (const pos of positions) {
      tiles[pos.y][pos.x] = {
        ...tiles[pos.y][pos.x],
        entity: { kind: 'monster', monsters: [getRandomMonster(multiplier)] },
      }
    }
  }

  // On floor 5, replace one random monster room's first tile with the elite
  if (floorNumber === 5 && monsterRooms.length > 0) {
    const eliteRoom = monsterRooms[Math.floor(Math.random() * monsterRooms.length)]
    const ec = roomCenter(eliteRoom)
    tiles[ec.y][ec.x] = {
      ...tiles[ec.y][ec.x],
      entity: { kind: 'monster', monsters: [createEliteMonster(multiplier)] },
    }
  }
}

// ─── Public API ──────────────────────────────────────

export function generateTileMap(floorNumber: number, multiplier = 1): TileMap {
  const tiles = blankGrid(MAP_WIDTH, MAP_HEIGHT)

  const count = Math.floor(Math.random() * (MAX_ROOMS - MIN_ROOMS + 1)) + MIN_ROOMS
  const rooms = placeRooms(count)

  // Carve rooms
  for (const room of rooms) carveRoom(tiles, room)

  // Carve L-shaped corridors between consecutive rooms
  for (let i = 1; i < rooms.length; i++) {
    const from = roomCenter(rooms[i - 1])
    const to   = roomCenter(rooms[i])
    carveCorridor(tiles, from.x, from.y, to.x, to.y)
  }

  const startIdx = 0
  const playerStart = roomCenter(rooms[startIdx])

  // Place entities in non-start rooms
  placeEntities(tiles, rooms, startIdx, floorNumber, multiplier)

  // Reveal start room immediately
  const sr = rooms[startIdx]
  for (let row = sr.y; row < sr.y + sr.h; row++) {
    for (let col = sr.x; col < sr.x + sr.w; col++) {
      tiles[row][col] = { ...tiles[row][col], explored: true }
    }
  }

  return { width: MAP_WIDTH, height: MAP_HEIGHT, tiles, playerStart, rooms }
}
