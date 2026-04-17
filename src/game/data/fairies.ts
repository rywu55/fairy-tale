import type { FairyDefinition } from '../types'

const FAIRY_DEFINITIONS: Record<string, FairyDefinition> = {
  fire: {
    element: 'fire',
    name: 'Embera',
    description: 'Aggressive glass cannon. Hits hard, burns fast.',
    playstyle: 'Aggressive / Glass cannon',
    ceilings: {
      attack: 'S',
      defense: 'C',
      heal: 'D',

      evasiveness: 'C',
      health: 'B',
    },
    starterMoveId: 'pixie_burn',
    defaultName: 'Embera',
  },
  water: {
    element: 'water',
    name: 'Coraline',
    description: 'Balanced and resilient. No dominant strength, no critical weakness.',
    playstyle: 'Balanced all-rounder',
    ceilings: {
      attack: 'B',
      defense: 'B',
      heal: 'A',

      evasiveness: 'B',
      health: 'A',
    },
    starterMoveId: 'pixie_splash',
    defaultName: 'Coraline',
  },
  earth: {
    element: 'earth',
    name: 'Moswick',
    description: 'Immovable tank. Absorbs massive damage but is slow and hard to heal.',
    playstyle: 'Immovable tank',
    ceilings: {
      attack: 'C',
      defense: 'S',
      heal: 'C',

      evasiveness: 'D',
      health: 'S',
    },
    starterMoveId: 'pixie_toss',
    defaultName: 'Moswick',
  },
  wind: {
    element: 'wind',
    name: 'Zephyria',
    description: 'Untouchable dodger. Evades attacks constantly, but fragile when hit.',
    playstyle: 'Evasion / Glass cannon',
    ceilings: {
      attack: 'B',
      defense: 'C',
      heal: 'B',

      evasiveness: 'S',
      health: 'D',
    },
    starterMoveId: 'pixie_gust',
    defaultName: 'Zephyria',
  },
  light: {
    element: 'light',
    name: 'Lumis',
    description: 'Pure support healer. Sustains through any fight but lacks raw offensive power.',
    playstyle: 'Support / Healer',
    ceilings: {
      attack: 'C',
      defense: 'B',
      heal: 'S',

      evasiveness: 'B',
      health: 'B',
    },
    starterMoveId: 'pixie_gleam',
    defaultName: 'Lumis',
  },
}

export function getFairyDefinition(element: string): FairyDefinition {
  const def = FAIRY_DEFINITIONS[element]
  if (!def) throw new Error(`Unknown fairy element: ${element}`)
  return def
}

export function getAllFairyDefinitions(): FairyDefinition[] {
  return Object.values(FAIRY_DEFINITIONS)
}
