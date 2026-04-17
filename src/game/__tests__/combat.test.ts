import { describe, it, expect, vi } from 'vitest'
import {
  startCombat,
  executeBasicAttack,
  executeSpecialMove,
  executeMonsterPhase,
  checkCombatEnd,
} from '../combat'
import type { DungeonFairyState, MonsterInstance } from '../types'

const baseFairy: DungeonFairyState = {
  currentHp: 50,
  maxHp: 50,
  attributes: { attack: 20, defense: 10, heal: 5, evasiveness: 0, health: 50 },
  move: { definitionId: 'pixie_splash', level: 1 },
  moveUsesRemaining: 3,
}

const weakMonster: MonsterInstance = {
  definitionId: 'slime',
  name: 'Slime',
  currentHp: 15,
  maxHp: 15,
  attack: 5,
}

const strongMonster: MonsterInstance = {
  definitionId: 'golem',
  name: 'Golem',
  currentHp: 100,
  maxHp: 100,
  attack: 30,
}

describe('startCombat', () => {
  it('sets status to player_turn', () => {
    const state = startCombat(baseFairy, [weakMonster])
    expect(state.status).toBe('player_turn')
  })

  it('copies fairy and monsters (no mutation)', () => {
    const state = startCombat(baseFairy, [weakMonster])
    state.fairy.currentHp = 0
    expect(baseFairy.currentHp).toBe(50)
  })
})

describe('executeBasicAttack', () => {
  it('deals damage equal to fairy attack stat', () => {
    const state = startCombat(baseFairy, [weakMonster])
    const result = executeBasicAttack(state, 0)
    const expectedHp = Math.max(0, weakMonster.currentHp - baseFairy.attributes.attack)
    expect(result.monsters[0].currentHp).toBe(expectedHp)
  })

  it('adds a turn log entry', () => {
    const state = startCombat(baseFairy, [weakMonster])
    const result = executeBasicAttack(state, 0)
    expect(result.turnLog.length).toBe(1)
    expect(result.turnLog[0].action).toBe('Basic Attack')
  })

  it('sets victory when monster is killed', () => {
    const state = startCombat(baseFairy, [weakMonster]) // fairy attack=20, monster hp=15
    const result = executeBasicAttack(state, 0)
    expect(result.status).toBe('victory')
  })

  it('transitions to monster_turn when monster survives', () => {
    const state = startCombat(baseFairy, [strongMonster])
    const result = executeBasicAttack(state, 0)
    expect(result.status).toBe('monster_turn')
  })

  it('does not affect dead monsters', () => {
    const deadMonster = { ...weakMonster, currentHp: 0 }
    const state = startCombat(baseFairy, [deadMonster])
    const result = executeBasicAttack(state, 0)
    expect(result.monsters[0].currentHp).toBe(0)
  })
})

describe('executeSpecialMove', () => {
  it('throws when no uses remaining', () => {
    const noUsesFairy = { ...baseFairy, moveUsesRemaining: 0 }
    const state = startCombat(noUsesFairy, [strongMonster])
    expect(() => executeSpecialMove(state, 0)).toThrow('No special move uses remaining')
  })

  it('decrements moveUsesRemaining', () => {
    const state = startCombat(baseFairy, [strongMonster])
    const result = executeSpecialMove(state, 0)
    expect(result.fairy.moveUsesRemaining).toBe(baseFairy.moveUsesRemaining - 1)
  })

  it('deals damage based on move power (not attack)', () => {
    const state = startCombat(baseFairy, [strongMonster])
    const result = executeSpecialMove(state, 0)
    const hpLost = strongMonster.currentHp - result.monsters[0].currentHp
    expect(hpLost).toBeGreaterThan(0)
    expect(hpLost).not.toBe(baseFairy.attributes.attack)
  })
})

describe('executeMonsterPhase', () => {
  it('deals damage to fairy (with 0 evasion, always hits)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5) // roll=50, won't evade with 0 evasion
    const state = startCombat(baseFairy, [weakMonster])
    const monsterTurnState = { ...state, status: 'monster_turn' as const }
    const result = executeMonsterPhase(monsterTurnState)
    const expectedDamage = Math.max(1, weakMonster.attack - baseFairy.attributes.defense)
    expect(result.fairy.currentHp).toBe(baseFairy.currentHp - expectedDamage)
    vi.restoreAllMocks()
  })

  it('transitions back to player_turn after monster phase', () => {
    const state = startCombat(baseFairy, [weakMonster])
    const monsterTurnState = { ...state, status: 'monster_turn' as const }
    const result = executeMonsterPhase(monsterTurnState)
    if (result.status !== 'defeat') {
      expect(result.status).toBe('player_turn')
    }
  })

  it('sets defeat when fairy hp reaches 0', () => {
    const lowHpFairy = { ...baseFairy, currentHp: 1 }
    const state = startCombat(lowHpFairy, [strongMonster])
    const monsterTurnState = { ...state, status: 'monster_turn' as const }
    vi.spyOn(Math, 'random').mockReturnValue(0.99) // never evade
    const result = executeMonsterPhase(monsterTurnState)
    expect(result.status).toBe('defeat')
    vi.restoreAllMocks()
  })
})

describe('checkCombatEnd', () => {
  it('returns victory when all monsters dead', () => {
    const state = startCombat(baseFairy, [{ ...weakMonster, currentHp: 0 }])
    const result = checkCombatEnd(state)
    expect(result.status).toBe('victory')
  })

  it('returns defeat when fairy hp = 0', () => {
    const state = startCombat({ ...baseFairy, currentHp: 0 }, [weakMonster])
    const result = checkCombatEnd(state)
    expect(result.status).toBe('defeat')
  })

  it('keeps player_turn when both sides alive', () => {
    const state = startCombat(baseFairy, [weakMonster])
    const result = checkCombatEnd(state)
    expect(result.status).toBe('player_turn')
  })
})
