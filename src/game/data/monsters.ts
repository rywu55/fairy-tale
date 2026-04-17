import type { MonsterDefinition, MonsterInstance } from '../types'

const MONSTER_DEFINITIONS: MonsterDefinition[] = [
  { id: 'goblin', name: 'Goblin', element: 'earth', baseHp: 20, baseAttack: 8, baseSpeed: 10 },
  { id: 'slime', name: 'Slime', element: 'water', baseHp: 30, baseAttack: 5, baseSpeed: 6 },
  { id: 'imp', name: 'Imp', element: 'fire', baseHp: 15, baseAttack: 10, baseSpeed: 14 },
  { id: 'wisp', name: 'Wisp', element: 'light', baseHp: 12, baseAttack: 6, baseSpeed: 18 },
  { id: 'bat', name: 'Bat', element: 'wind', baseHp: 18, baseAttack: 7, baseSpeed: 16 },
]

const ELITE_DEFINITION: MonsterDefinition = {
  id: 'floor5_elite',
  name: 'Dungeon Warden',
  element: 'earth',
  baseHp: 60,
  baseAttack: 15,
  baseSpeed: 12,
}

function instantiate(def: MonsterDefinition): MonsterInstance {
  return {
    definitionId: def.id,
    name: def.name,
    currentHp: def.baseHp,
    maxHp: def.baseHp,
    attack: def.baseAttack,
    speed: def.baseSpeed,
  }
}

export function getRandomMonsters(count: number): MonsterInstance[] {
  const result: MonsterInstance[] = []
  for (let i = 0; i < count; i++) {
    const def = MONSTER_DEFINITIONS[Math.floor(Math.random() * MONSTER_DEFINITIONS.length)]
    result.push(instantiate(def))
  }
  return result
}

export function createEliteMonster(): MonsterInstance {
  return instantiate(ELITE_DEFINITION)
}

export function getAverageMonsterSpeed(): number {
  const total = MONSTER_DEFINITIONS.reduce((sum, m) => sum + m.baseSpeed, 0)
  return total / MONSTER_DEFINITIONS.length
}
