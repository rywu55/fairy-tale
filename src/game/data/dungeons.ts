import type { DungeonDefinition } from '../types'

export const DUNGEON_DEFINITIONS: DungeonDefinition[] = [
  {
    id: 'meadow_cave',
    name: 'Meadow Cave',
    description: 'A gentle cave at the edge of the fairy meadow. Good for learning the ropes.',
    timeLimitMs: 3 * 60_000,
    difficultyMultiplier: 0.5,
    unlockAfterClears: 0,
    previousDungeonId: null,
  },
  {
    id: 'stone_cavern',
    name: 'Stone Cavern',
    description: 'Dark tunnels carved through ancient rock. Monsters grow bolder here.',
    timeLimitMs: 3 * 60_000,
    difficultyMultiplier: 1.0,
    unlockAfterClears: 2,
    previousDungeonId: 'meadow_cave',
  },
  {
    id: 'ember_depths',
    name: 'Ember Depths',
    description: 'Scorched passages deep beneath the earth. Only seasoned fairies survive.',
    timeLimitMs: 2.5 * 60_000,
    difficultyMultiplier: 2.0,
    unlockAfterClears: 2,
    previousDungeonId: 'stone_cavern',
  },
  {
    id: 'void_sanctum',
    name: 'Void Sanctum',
    description: 'A realm between worlds where the strongest creatures dwell.',
    timeLimitMs: 2 * 60_000,
    difficultyMultiplier: 3.5,
    unlockAfterClears: 3,
    previousDungeonId: 'ember_depths',
  },
]

export function getDungeonDefinition(id: string): DungeonDefinition {
  const def = DUNGEON_DEFINITIONS.find(d => d.id === id)
  if (!def) throw new Error(`Unknown dungeon: ${id}`)
  return def
}
