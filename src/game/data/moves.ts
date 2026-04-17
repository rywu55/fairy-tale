import type { MoveDefinition } from '../types'

const MOVE_DEFINITIONS: Record<string, MoveDefinition> = {
  pixie_burn: {
    id: 'pixie_burn',
    name: 'Pixie Burn',
    element: 'fire',
    basePower: 50,
    perLevelIncrease: 5,
    maxUsesPerDungeon: 5,
  },
  pixie_splash: {
    id: 'pixie_splash',
    name: 'Pixie Splash',
    element: 'water',
    basePower: 50,
    perLevelIncrease: 5,
    maxUsesPerDungeon: 5,
  },
  pixie_toss: {
    id: 'pixie_toss',
    name: 'Pixie Toss',
    element: 'earth',
    basePower: 50,
    perLevelIncrease: 5,
    maxUsesPerDungeon: 5,
  },
  pixie_gust: {
    id: 'pixie_gust',
    name: 'Pixie Gust',
    element: 'wind',
    basePower: 50,
    perLevelIncrease: 5,
    maxUsesPerDungeon: 5,
  },
  pixie_gleam: {
    id: 'pixie_gleam',
    name: 'Pixie Gleam',
    element: 'light',
    basePower: 50,
    perLevelIncrease: 5,
    maxUsesPerDungeon: 5,
  },
}

export function getMoveDefinition(id: string): MoveDefinition {
  const def = MOVE_DEFINITIONS[id]
  if (!def) throw new Error(`Unknown move: ${id}`)
  return def
}

export function getMovePower(moveId: string, level: number): number {
  const def = getMoveDefinition(moveId)
  return def.basePower + (level - 1) * def.perLevelIncrease
}

export function getAllMoveDefinitions(): MoveDefinition[] {
  return Object.values(MOVE_DEFINITIONS)
}
