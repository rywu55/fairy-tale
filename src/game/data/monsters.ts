import type { MonsterDefinition, MonsterInstance } from '../types'

const MONSTER_DEFINITIONS: MonsterDefinition[] = [
  { id: 'goblin', name: 'Goblin', element: 'earth', baseHp: 20, baseAttack: 8,  icon: '👺' },
  { id: 'slime',  name: 'Slime',  element: 'water', baseHp: 30, baseAttack: 5,  icon: '🫧' },
  { id: 'imp',    name: 'Imp',    element: 'fire',  baseHp: 15, baseAttack: 10, icon: '😈' },
  { id: 'wisp',   name: 'Wisp',   element: 'light', baseHp: 12, baseAttack: 6,  icon: '🌟' },
  { id: 'bat',    name: 'Bat',    element: 'wind',  baseHp: 18, baseAttack: 7,  icon: '🦇' },
]

const ELITE_DEFINITION: MonsterDefinition = {
  id: 'floor5_elite',
  name: 'Dungeon Warden',
  element: 'earth',
  baseHp: 60,
  baseAttack: 15,
  icon: '💀',
}

const ALL_DEFINITIONS = [...MONSTER_DEFINITIONS, ELITE_DEFINITION]

function instantiate(def: MonsterDefinition, multiplier = 1): MonsterInstance {
  return {
    definitionId: def.id,
    name: def.name,
    currentHp: Math.max(1, Math.round(def.baseHp * multiplier)),
    maxHp: Math.max(1, Math.round(def.baseHp * multiplier)),
    attack: Math.max(1, Math.round(def.baseAttack * multiplier)),
  }
}

export function getRandomMonster(multiplier = 1): MonsterInstance {
  const def = MONSTER_DEFINITIONS[Math.floor(Math.random() * MONSTER_DEFINITIONS.length)]
  return instantiate(def, multiplier)
}

export function getRandomMonsters(count: number, multiplier = 1): MonsterInstance[] {
  return Array.from({ length: count }, () => getRandomMonster(multiplier))
}

export function createEliteMonster(multiplier = 1): MonsterInstance {
  return instantiate(ELITE_DEFINITION, multiplier)
}

export function getMonsterIcon(definitionId: string): string {
  return ALL_DEFINITIONS.find(d => d.id === definitionId)?.icon ?? '⚔️'
}
