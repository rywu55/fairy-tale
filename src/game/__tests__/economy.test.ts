import { describe, it, expect } from 'vitest'
import {
  getAttributeUpgradeCost,
  getMoveUpgradeCost,
  canAfford,
  deductGold,
  addGold,
} from '../economy'
import { InsufficientGoldError } from '../types'

describe('getAttributeUpgradeCost', () => {
  it('returns 50 for first 5 upgrades (0-4)', () => {
    for (let i = 0; i < 5; i++) {
      expect(getAttributeUpgradeCost(i)).toBe(50)
    }
  })

  it('returns 150 for upgrades 5+', () => {
    for (let i = 5; i <= 10; i++) {
      expect(getAttributeUpgradeCost(i)).toBe(150)
    }
  })
})

describe('getMoveUpgradeCost', () => {
  it('returns 80 for levels 1-5', () => {
    for (let level = 1; level <= 5; level++) {
      expect(getMoveUpgradeCost(level)).toBe(80)
    }
  })

  it('returns 200 for levels 6+', () => {
    for (let level = 6; level <= 10; level++) {
      expect(getMoveUpgradeCost(level)).toBe(200)
    }
  })
})

describe('canAfford', () => {
  it('returns true when gold >= cost', () => {
    expect(canAfford(100, 100)).toBe(true)
    expect(canAfford(200, 100)).toBe(true)
  })

  it('returns false when gold < cost', () => {
    expect(canAfford(50, 100)).toBe(false)
    expect(canAfford(0, 1)).toBe(false)
  })
})

describe('deductGold', () => {
  it('deducts cost from gold', () => {
    expect(deductGold(100, 50)).toBe(50)
    expect(deductGold(100, 100)).toBe(0)
  })

  it('throws InsufficientGoldError when not enough gold', () => {
    expect(() => deductGold(50, 100)).toThrow(InsufficientGoldError)
  })
})

describe('addGold', () => {
  it('adds positive amounts', () => {
    expect(addGold(100, 50)).toBe(150)
  })

  it('ignores negative amounts (clamps to 0)', () => {
    expect(addGold(100, -50)).toBe(100)
  })
})
