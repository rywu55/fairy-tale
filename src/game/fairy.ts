import type { Fairy, Attributes, AttributeKey, Element } from './types'
import { CEILING_VALUES, SPRITE_STAGE_FRACTION, ATTRIBUTE_KEYS, CeilingExceededError } from './types'
import { getFairyDefinition } from './data/fairies'

const BASE_ATTRIBUTE_VALUE = 15
const STARTER_POINT_VALUE = 5

export function getSpriteCeiling(element: Element, attribute: AttributeKey): number {
  const def = getFairyDefinition(element)
  const tier = def.ceilings[attribute]
  return Math.floor(CEILING_VALUES[tier] * SPRITE_STAGE_FRACTION)
}

export function createFairy(
  element: Element,
  starterPoints: Attributes,
  name: string,
): Fairy {
  const trimmed = name.trim()
  if (!trimmed || trimmed.length > 16) {
    throw new Error('Fairy name must be 1–16 characters')
  }

  const pointSum = ATTRIBUTE_KEYS.reduce((sum, k) => sum + starterPoints[k], 0)
  if (pointSum !== 3) {
    throw new Error(`Starter points must sum to 3, got ${pointSum}`)
  }

  const attributes = {} as Attributes
  const attributeUpgradeCounts = {} as Attributes

  for (const key of ATTRIBUTE_KEYS) {
    const points = starterPoints[key]
    if (points < 0) throw new Error(`Points for ${key} cannot be negative`)
    const value = BASE_ATTRIBUTE_VALUE + points * STARTER_POINT_VALUE
    // Only reject if allocated starter points push value over ceiling.
    // Base value (15) may exceed D-tier ceiling (10) by design — those attrs cannot be upgraded.
    if (points > 0) {
      const ceiling = getSpriteCeiling(element, key)
      if (value > ceiling) {
        throw new CeilingExceededError(key, ceiling)
      }
    }
    attributes[key] = value
    attributeUpgradeCounts[key] = 0
  }

  const def = getFairyDefinition(element)

  return {
    definitionId: element,
    name: trimmed,
    attributes,
    attributeUpgradeCounts,
    move: { definitionId: def.starterMoveId, level: 1 },
  }
}

export function canUpgradeAttribute(fairy: Fairy, attribute: AttributeKey): boolean {
  const ceiling = getSpriteCeiling(fairy.definitionId, attribute)
  return fairy.attributes[attribute] < ceiling
}

export function upgradeAttribute(fairy: Fairy, attribute: AttributeKey): Fairy {
  if (!canUpgradeAttribute(fairy, attribute)) {
    throw new CeilingExceededError(attribute, getSpriteCeiling(fairy.definitionId, attribute))
  }
  return {
    ...fairy,
    attributes: {
      ...fairy.attributes,
      [attribute]: fairy.attributes[attribute] + 1,
    },
    attributeUpgradeCounts: {
      ...fairy.attributeUpgradeCounts,
      [attribute]: fairy.attributeUpgradeCounts[attribute] + 1,
    },
  }
}

export function validateName(name: string): boolean {
  const trimmed = name.trim()
  return trimmed.length >= 1 && trimmed.length <= 16
}
