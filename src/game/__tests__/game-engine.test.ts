import { describe, it, expect, beforeEach } from 'vitest'
import { GameEngine } from '../game-engine'
import type { Attributes } from '../types'

const zeroPoints: Attributes = { attack: 0, defense: 0, heal: 0, speed: 0, evasiveness: 0, health: 0 }

function points(overrides: Partial<Attributes> = {}): Attributes {
  return { ...zeroPoints, ...overrides }
}

function createTestEngine(): GameEngine {
  localStorage.clear()
  return new GameEngine()
}

describe('GameEngine — FTUE / fairy creation', () => {
  beforeEach(() => localStorage.clear())

  it('starts with no fairy and ftueComplete=false', () => {
    const engine = createTestEngine()
    const state = engine.getState()
    expect(state.fairy).toBeNull()
    expect(state.ftueComplete).toBe(false)
  })

  it('createFairy sets fairy and marks ftueComplete', () => {
    const engine = createTestEngine()
    engine.createFairy('water', points({ health: 3 }), 'Coral')
    const state = engine.getState()
    expect(state.fairy).not.toBeNull()
    expect(state.ftueComplete).toBe(true)
    expect(state.fairy!.name).toBe('Coral')
  })

  it('createFairy persists to localStorage', () => {
    const engine = createTestEngine()
    engine.createFairy('water', points({ health: 3 }), 'Coral')
    // New engine should load saved state
    const engine2 = new GameEngine()
    expect(engine2.getState().fairy?.name).toBe('Coral')
  })
})

describe('GameEngine — dungeon flow', () => {
  let engine: GameEngine

  beforeEach(() => {
    localStorage.clear()
    engine = new GameEngine()
    engine.createFairy('water', points({ health: 3 }), 'Coral')
  })

  it('startDungeon creates an active dungeon', () => {
    engine.startDungeon('ember_caves')
    const dungeon = engine.getActiveDungeon()
    expect(dungeon).not.toBeNull()
    expect(dungeon!.status).toBe('active')
    expect(dungeon!.currentFloor).toBe(1)
  })

  it('throws when starting dungeon without fairy', () => {
    localStorage.clear()
    const freshEngine = new GameEngine()
    expect(() => freshEngine.startDungeon('ember_caves')).toThrow('No fairy')
  })

  it('movePlayer returns moved:false when no active dungeon', () => {
    // Engine with fairy but no dungeon started
    const freshEngine = new GameEngine()
    freshEngine.createFairy('water', points({ health: 3 }), 'Coral')
    const result = freshEngine.movePlayer('up')
    expect(result.moved).toBe(false)
    expect(result.combatStarted).toBe(false)
    expect(result.goldGained).toBe(0)
  })

  it('movePlayer returns moved:true when stepping onto walkable tile', () => {
    engine.startDungeon('ember_caves')
    // Player starts in room centre; all 4 adjacent tiles in the room are floor — one will succeed
    const dirs = ['up', 'down', 'left', 'right'] as const
    const anyMoved = dirs.some(dir => {
      engine.startDungeon('ember_caves')
      return engine.movePlayer(dir).moved
    })
    expect(anyMoved).toBe(true)
  })

  it('movePlayer returns moved:false when blocked by a wall', () => {
    engine.startDungeon('ember_caves')
    // Move left until blocked; the map boundary guarantees a wall within 30 steps
    let blocked = false
    for (let i = 0; i < 35; i++) {
      const r = engine.movePlayer('left')
      if (!r.moved) { blocked = true; break }
      if (r.combatStarted || r.floorAdvanced) break
    }
    expect(blocked).toBe(true)
  })
})

describe('GameEngine — upgrade flow', () => {
  let engine: GameEngine

  beforeEach(() => {
    localStorage.clear()
    engine = new GameEngine()
    engine.createFairy('water', points({ health: 3 }), 'Coral')
    // Give gold via internal state manipulation through fresh engine
    // We need gold to test upgrades — inject it by resetting
  })

  it('getAttributeUpgradeCost returns cost based on upgrade count', () => {
    const cost = engine.getAttributeUpgradeCost('attack')
    expect(cost).toBe(50) // first upgrade is always 50
  })

  it('getMoveUpgradeCost returns cost for level 1 move', () => {
    const cost = engine.getMoveUpgradeCost()
    expect(cost).toBe(80) // level 1 is in 1-5 range
  })

  it('canUpgradeAttribute returns false when no gold', () => {
    // Fresh engine has 0 gold
    expect(engine.canUpgradeAttribute('attack')).toBe(false)
  })

  it('upgradeAttribute throws InsufficientGoldError when no gold', () => {
    expect(() => engine.upgradeAttribute('attack')).toThrow()
  })

  it('upgradeAttribute works when player has enough gold', () => {
    // Export and re-import with gold added
    const stateJson = engine.exportSave()
    const withGold = JSON.stringify({ ...JSON.parse(stateJson), gold: 1000 })
    engine.importSave(withGold)

    const beforeAttack = engine.getState().fairy!.attributes.attack
    engine.upgradeAttribute('attack')
    const afterAttack = engine.getState().fairy!.attributes.attack
    expect(afterAttack).toBe(beforeAttack + 1)
    expect(engine.getState().gold).toBe(1000 - 50)
  })

  it('upgradeMove works when player has enough gold', () => {
    const stateJson = engine.exportSave()
    const withGold = JSON.stringify({ ...JSON.parse(stateJson), gold: 1000 })
    engine.importSave(withGold)

    const beforeLevel = engine.getState().fairy!.move.level
    engine.upgradeMove()
    expect(engine.getState().fairy!.move.level).toBe(beforeLevel + 1)
    expect(engine.getState().gold).toBe(1000 - 80)
  })
})

describe('GameEngine — export / import save', () => {
  beforeEach(() => localStorage.clear())

  it('exportSave returns valid JSON string', () => {
    const engine = createTestEngine()
    const json = engine.exportSave()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('importSave replaces current state', () => {
    const engine = createTestEngine()
    engine.createFairy('water', points({ health: 3 }), 'Coral')
    const exported = engine.exportSave()

    // Create new engine and import
    const engine2 = createTestEngine()
    engine2.importSave(exported)
    expect(engine2.getState().fairy?.name).toBe('Coral')
  })

  it('importSave clears active dungeon', () => {
    const engine = createTestEngine()
    engine.createFairy('water', points({ health: 3 }), 'Coral')
    engine.startDungeon('ember_caves')
    expect(engine.getActiveDungeon()).not.toBeNull()

    const exported = engine.exportSave()
    engine.importSave(exported)
    expect(engine.getActiveDungeon()).toBeNull()
  })
})

describe('GameEngine — timeout', () => {
  beforeEach(() => localStorage.clear())

  it('checkTimeout returns false for fresh dungeon', () => {
    const engine = createTestEngine()
    engine.createFairy('water', points({ health: 3 }), 'Coral')
    engine.startDungeon('ember_caves')
    expect(engine.checkTimeout()).toBe(false)
  })

  it('getTimeRemainingMs returns ~10 min for fresh dungeon', () => {
    const engine = createTestEngine()
    engine.createFairy('water', points({ health: 3 }), 'Coral')
    engine.startDungeon('ember_caves')
    const remaining = engine.getTimeRemainingMs()
    expect(remaining).toBeGreaterThan(590_000)
  })

  it('getTimeRemainingMs returns 0 without active dungeon', () => {
    const engine = createTestEngine()
    expect(engine.getTimeRemainingMs()).toBe(0)
  })
})
