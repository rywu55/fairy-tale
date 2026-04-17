import { describe, it, expect } from 'vitest'
import { getMovePower, canUseMove, useMove, canUpgradeMove, upgradeMove, initMoveUses } from '../moves'
import type { DungeonFairyState, MoveInstance, Fairy } from '../types'

const baseFairyState: DungeonFairyState = {
  currentHp: 30,
  maxHp: 30,
  attributes: { attack: 20, defense: 15, heal: 15, evasiveness: 15, health: 30 },
  move: { definitionId: 'pixie_splash', level: 1 },
  moveUsesRemaining: 3,
}

const baseFairy: Fairy = {
  definitionId: 'water',
  name: 'Coral',
  attributes: { attack: 20, defense: 15, heal: 15, evasiveness: 15, health: 30 },
  attributeUpgradeCounts: { attack: 0, defense: 0, heal: 0, evasiveness: 0, health: 0 },
  move: { definitionId: 'pixie_splash', level: 1 },
}

describe('getMovePower', () => {
  it('returns correct power for level 1', () => {
    const move: MoveInstance = { definitionId: 'pixie_splash', level: 1 }
    const power = getMovePower(move)
    expect(power).toBeGreaterThan(0)
  })

  it('increases power with level', () => {
    const move1: MoveInstance = { definitionId: 'pixie_splash', level: 1 }
    const move5: MoveInstance = { definitionId: 'pixie_splash', level: 5 }
    expect(getMovePower(move5)).toBeGreaterThan(getMovePower(move1))
  })
})

describe('canUseMove', () => {
  it('returns true when uses > 0', () => {
    expect(canUseMove(baseFairyState)).toBe(true)
  })

  it('returns false when uses = 0', () => {
    const state = { ...baseFairyState, moveUsesRemaining: 0 }
    expect(canUseMove(state)).toBe(false)
  })
})

describe('useMove', () => {
  it('decrements moveUsesRemaining by 1', () => {
    const result = useMove(baseFairyState)
    expect(result.moveUsesRemaining).toBe(2)
  })

  it('does not mutate original state', () => {
    useMove(baseFairyState)
    expect(baseFairyState.moveUsesRemaining).toBe(3)
  })
})

describe('canUpgradeMove', () => {
  it('returns true when level < 10', () => {
    expect(canUpgradeMove({ definitionId: 'pixie_splash', level: 9 })).toBe(true)
  })

  it('returns false when level = 10', () => {
    expect(canUpgradeMove({ definitionId: 'pixie_splash', level: 10 })).toBe(false)
  })
})

describe('upgradeMove', () => {
  it('increments move level by 1', () => {
    const upgraded = upgradeMove(baseFairy)
    expect(upgraded.move.level).toBe(2)
  })

  it('does not mutate original fairy', () => {
    upgradeMove(baseFairy)
    expect(baseFairy.move.level).toBe(1)
  })
})

describe('initMoveUses', () => {
  it('returns maxUsesPerDungeon from move definition', () => {
    const move: MoveInstance = { definitionId: 'pixie_splash', level: 1 }
    const uses = initMoveUses(move)
    expect(uses).toBeGreaterThan(0)
  })
})
