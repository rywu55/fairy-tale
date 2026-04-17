import { describe, it, expect } from 'vitest'
import { generateFloor, startDungeonRun, isTimedOut, getTimeRemainingMs } from '../dungeon'
import { MAP_WIDTH, MAP_HEIGHT } from '../mapgen'
import type { Fairy } from '../types'

const testFairy: Fairy = {
  definitionId: 'water',
  name: 'Coral',
  attributes: { attack: 15, defense: 15, heal: 15, evasiveness: 15, health: 30 },
  attributeUpgradeCounts: { attack: 0, defense: 0, heal: 0, evasiveness: 0, health: 0 },
  move: { definitionId: 'pixie_splash', level: 1 },
}

describe('generateFloor', () => {
  it('returns a 30×20 tile map', () => {
    const floor = generateFloor(1)
    expect(floor.map.width).toBe(MAP_WIDTH)
    expect(floor.map.height).toBe(MAP_HEIGHT)
    expect(floor.map.tiles).toHaveLength(MAP_HEIGHT)
    expect(floor.map.tiles[0]).toHaveLength(MAP_WIDTH)
  })

  it('playerPos matches map.playerStart', () => {
    const floor = generateFloor(1)
    expect(floor.playerPos).toEqual(floor.map.playerStart)
  })

  it('start tile is explored', () => {
    const floor = generateFloor(1)
    const { x, y } = floor.playerPos
    expect(floor.map.tiles[y][x].explored).toBe(true)
  })

  it('generates 4–8 rooms', () => {
    for (let i = 0; i < 5; i++) {
      const floor = generateFloor(1)
      expect(floor.map.rooms.length).toBeGreaterThanOrEqual(4)
      expect(floor.map.rooms.length).toBeLessThanOrEqual(8)
    }
  })

  it('floor number is set correctly', () => {
    expect(generateFloor(3).number).toBe(3)
  })
})

describe('startDungeonRun', () => {
  it('creates a dungeon run with status active', () => {
    const run = startDungeonRun('meadow_cave', testFairy, 180_000)
    expect(run.status).toBe('active')
  })

  it('sets currentFloor to 1', () => {
    const run = startDungeonRun('meadow_cave', testFairy, 180_000)
    expect(run.currentFloor).toBe(1)
  })

  it('initializes fairy HP equal to health attribute', () => {
    const run = startDungeonRun('meadow_cave', testFairy, 180_000)
    expect(run.fairy.currentHp).toBe(testFairy.attributes.health)
    expect(run.fairy.maxHp).toBe(testFairy.attributes.health)
  })

  it('initializes move uses from definition', () => {
    const run = startDungeonRun('meadow_cave', testFairy, 180_000)
    expect(run.fairy.moveUsesRemaining).toBeGreaterThan(0)
  })

  it('stores the provided time limit', () => {
    const run = startDungeonRun('meadow_cave', testFairy, 180_000)
    expect(run.timeLimitMs).toBe(180_000)
  })

  it('sets startTime to approximately now', () => {
    const before = Date.now()
    const run = startDungeonRun('meadow_cave', testFairy, 180_000)
    const after = Date.now()
    expect(run.startTime).toBeGreaterThanOrEqual(before)
    expect(run.startTime).toBeLessThanOrEqual(after)
  })

  it('floor 1 has a tile map with correct dimensions', () => {
    const run = startDungeonRun('meadow_cave', testFairy, 180_000)
    const floor = run.floors[0]
    expect(floor.map.width).toBe(MAP_WIDTH)
    expect(floor.map.height).toBe(MAP_HEIGHT)
  })
})

describe('isTimedOut / getTimeRemainingMs', () => {
  it('isTimedOut returns false for fresh run', () => {
    const run = startDungeonRun('meadow_cave', testFairy, 180_000)
    expect(isTimedOut(run)).toBe(false)
  })

  it('isTimedOut returns true when startTime is old', () => {
    const run = startDungeonRun('meadow_cave', testFairy, 180_000)
    const expiredRun = { ...run, startTime: Date.now() - 700_000 }
    expect(isTimedOut(expiredRun)).toBe(true)
  })

  it('getTimeRemainingMs returns ~3 minutes for fresh run with 180s limit', () => {
    const run = startDungeonRun('meadow_cave', testFairy, 180_000)
    const remaining = getTimeRemainingMs(run)
    expect(remaining).toBeGreaterThan(170_000)
    expect(remaining).toBeLessThanOrEqual(180_000)
  })

  it('getTimeRemainingMs returns 0 for expired run', () => {
    const run = startDungeonRun('meadow_cave', testFairy, 180_000)
    const expiredRun = { ...run, startTime: Date.now() - 700_000 }
    expect(getTimeRemainingMs(expiredRun)).toBe(0)
  })
})
