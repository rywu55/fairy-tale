import type { AttributeKey } from './types'
import { InsufficientGoldError } from './types'

export function getAttributeUpgradeCost(upgradeCount: number): number {
  if (upgradeCount < 5) return 50
  return 150
}

export function getMoveUpgradeCost(moveLevel: number): number {
  if (moveLevel <= 5) return 80
  return 200
}

export function canAfford(gold: number, cost: number): boolean {
  return gold >= cost
}

export function deductGold(gold: number, cost: number): number {
  if (gold < cost) throw new InsufficientGoldError(cost, gold)
  return gold - cost
}

export function addGold(gold: number, amount: number): number {
  return gold + Math.max(0, amount)
}

export function randomGoldInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getAttributeUpgradeCostForFairy(
  upgradeCounts: Record<AttributeKey, number>,
  attribute: AttributeKey,
): number {
  return getAttributeUpgradeCost(upgradeCounts[attribute])
}
