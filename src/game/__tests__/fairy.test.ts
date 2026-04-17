import { describe, it, expect } from 'vitest'
import { createFairy, getSpriteCeiling, canUpgradeAttribute, upgradeAttribute } from '../fairy'
import type { Attributes } from '../types'
import { CeilingExceededError } from '../types'

const zeroPoints: Attributes = { attack: 0, defense: 0, heal: 0, evasiveness: 0, health: 0 }

function points(overrides: Partial<Attributes> = {}): Attributes {
  return { ...zeroPoints, ...overrides }
}

// water: heal=A(32), health=A(32), others=B(24)
// Base is 15. Safe starter points: health:3 gives 30 < 32 ✓
// defense stays at 15 < 24 ✓
function waterFairy(name = 'Coral') {
  return createFairy('water', points({ health: 3 }), name)
}

describe('createFairy', () => {
  it('creates a fairy with base attributes + starter points', () => {
    const fairy = waterFairy()
    expect(fairy.attributes.health).toBe(15 + 3 * 5) // 30
    expect(fairy.attributes.defense).toBe(15)
    expect(fairy.name).toBe('Coral')
    expect(fairy.definitionId).toBe('water')
  })

  it('trims whitespace from name', () => {
    const fairy = createFairy('water', points({ health: 3 }), '  Coral  ')
    expect(fairy.name).toBe('Coral')
  })

  it('throws if name is empty', () => {
    expect(() => createFairy('water', points({ health: 3 }), '')).toThrow()
    expect(() => createFairy('water', points({ health: 3 }), '   ')).toThrow()
  })

  it('throws if name exceeds 16 characters', () => {
    expect(() => createFairy('water', points({ health: 3 }), 'A'.repeat(17))).toThrow()
  })

  it('throws if starter points do not sum to 3', () => {
    expect(() => createFairy('water', points({ health: 2 }), 'Coral')).toThrow('3')
    expect(() => createFairy('water', points({ health: 4 }), 'Coral')).toThrow('3')
  })

  it('throws if any starter points are negative', () => {
    expect(() => createFairy('water', points({ health: 4, defense: -1 }), 'Coral')).toThrow()
  })

  it('initializes attributeUpgradeCounts to all zeros', () => {
    const fairy = waterFairy()
    for (const key of Object.keys(fairy.attributeUpgradeCounts)) {
      expect(fairy.attributeUpgradeCounts[key as keyof Attributes]).toBe(0)
    }
  })

  it('sets starter move to element definition move', () => {
    const fairy = waterFairy()
    expect(fairy.move.definitionId).toBe('pixie_splash')
    expect(fairy.move.level).toBe(1)
  })

  it('throws CeilingExceededError if allocated starter points exceed Sprite ceiling', () => {
    // water attack is B-tier, ceiling = floor(120*0.2) = 24
    // 3 points to attack = 15 + 15 = 30 > 24 → throws
    expect(() => createFairy('water', points({ attack: 3 }), 'Coral')).toThrow(CeilingExceededError)
  })

  it('allows creating fire/earth/wind fairies (D-tier base exceeds ceiling but no points allocated)', () => {
    // fire heal is D-tier — base 15 > ceiling 10 but no points allocated to it → allowed
    expect(() => createFairy('fire', points({ attack: 3 }), 'Ember')).not.toThrow()
  })
})

describe('getSpriteCeiling', () => {
  it('returns 20% of ceiling value for S-tier (fire attack = 200)', () => {
    expect(getSpriteCeiling('fire', 'attack')).toBe(40)
  })

  it('returns 20% of ceiling value for B-tier (water attack = 120)', () => {
    expect(getSpriteCeiling('water', 'attack')).toBe(24)
  })

  it('returns 20% of ceiling value for A-tier (water health = 160)', () => {
    expect(getSpriteCeiling('water', 'health')).toBe(32)
  })

  it('returns 20% of ceiling value for D-tier (fire heal = 50)', () => {
    expect(getSpriteCeiling('fire', 'heal')).toBe(10)
  })
})

describe('canUpgradeAttribute', () => {
  it('returns true when attribute is below ceiling', () => {
    const fairy = waterFairy()
    // defense = 15, B-tier ceiling = 24 → can upgrade
    expect(canUpgradeAttribute(fairy, 'defense')).toBe(true)
  })

  it('returns false when attribute equals ceiling', () => {
    let fairy = waterFairy()
    const ceiling = getSpriteCeiling('water', 'defense') // 24
    while (fairy.attributes.defense < ceiling) {
      fairy = upgradeAttribute(fairy, 'defense')
    }
    expect(canUpgradeAttribute(fairy, 'defense')).toBe(false)
  })
})

describe('upgradeAttribute', () => {
  it('increments attribute by 1', () => {
    const fairy = waterFairy()
    const upgraded = upgradeAttribute(fairy, 'defense')
    expect(upgraded.attributes.defense).toBe(fairy.attributes.defense + 1)
  })

  it('increments upgrade count by 1', () => {
    const fairy = waterFairy()
    const upgraded = upgradeAttribute(fairy, 'defense')
    expect(upgraded.attributeUpgradeCounts.defense).toBe(1)
  })

  it('does not mutate original fairy', () => {
    const fairy = waterFairy()
    const original = fairy.attributes.defense
    upgradeAttribute(fairy, 'defense')
    expect(fairy.attributes.defense).toBe(original)
  })

  it('throws CeilingExceededError when at ceiling', () => {
    let fairy = waterFairy()
    const ceiling = getSpriteCeiling('water', 'defense')
    while (fairy.attributes.defense < ceiling) {
      fairy = upgradeAttribute(fairy, 'defense')
    }
    expect(() => upgradeAttribute(fairy, 'defense')).toThrow(CeilingExceededError)
  })
})
