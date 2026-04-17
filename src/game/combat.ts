import type { CombatState, DungeonFairyState, MonsterInstance, TurnLogEntry } from './types'
import { getMovePower, useMove } from './moves'
import { randomGoldInRange } from './economy'
import { getAverageMonsterSpeed } from './data/monsters'
import { getMoveName } from './moves'

export function startCombat(fairy: DungeonFairyState, monsters: MonsterInstance[]): CombatState {
  const actionsPerTurn = calculateFairyActions(fairy, monsters)
  return {
    fairy: { ...fairy },
    monsters: monsters.map(m => ({ ...m })),
    turnLog: [],
    status: 'player_turn',
    actionsThisTurn: 0,
    actionsPerTurn,
  }
}

export function calculateFairyActions(
  fairy: DungeonFairyState,
  monsters: MonsterInstance[],
): number {
  const avgSpeed = monsters.length > 0
    ? monsters.reduce((sum, m) => sum + m.speed, 0) / monsters.length
    : getAverageMonsterSpeed()
  return Math.max(1, Math.floor(fairy.attributes.speed / avgSpeed))
}

export function executeBasicAttack(state: CombatState, targetIndex: number): CombatState {
  const monsters = state.monsters.map(m => ({ ...m }))
  const target = monsters[targetIndex]
  if (!target || target.currentHp <= 0) return state

  const damage = state.fairy.attributes.attack
  target.currentHp = Math.max(0, target.currentHp - damage)

  const entry: TurnLogEntry = {
    actor: 'Your Fairy',
    action: 'Basic Attack',
    target: target.name,
    damage,
    missed: false,
    healed: 0,
  }

  const newState = { ...state, monsters, turnLog: [...state.turnLog, entry] }
  return advanceFairyAction(checkCombatEnd(newState))
}

export function executeSpecialMove(state: CombatState, targetIndex: number): CombatState {
  if (!state.fairy.moveUsesRemaining || state.fairy.moveUsesRemaining <= 0) {
    throw new Error('No special move uses remaining')
  }

  const monsters = state.monsters.map(m => ({ ...m }))
  const target = monsters[targetIndex]
  if (!target || target.currentHp <= 0) return state

  const damage = getMovePower(state.fairy.move)
  target.currentHp = Math.max(0, target.currentHp - damage)

  const moveName = getMoveName(state.fairy.move)
  const entry: TurnLogEntry = {
    actor: 'Your Fairy',
    action: moveName,
    target: target.name,
    damage,
    missed: false,
    healed: 0,
  }

  const newFairy = useMove(state.fairy)
  const newState = { ...state, fairy: newFairy, monsters, turnLog: [...state.turnLog, entry] }
  return advanceFairyAction(checkCombatEnd(newState))
}

function advanceFairyAction(state: CombatState): CombatState {
  if (state.status !== 'player_turn') return state

  const newActionsThisTurn = state.actionsThisTurn + 1
  if (newActionsThisTurn >= state.actionsPerTurn) {
    return { ...state, actionsThisTurn: 0, status: 'monster_turn' }
  }
  return { ...state, actionsThisTurn: newActionsThisTurn }
}

export function executeMonsterPhase(state: CombatState): CombatState {
  let fairy = { ...state.fairy }
  const log: TurnLogEntry[] = [...state.turnLog]
  let totalDamageTaken = 0

  for (const monster of state.monsters) {
    if (monster.currentHp <= 0) continue

    const evasionCap = Math.min(fairy.attributes.evasiveness, 80)
    const roll = Math.floor(Math.random() * 100)
    const missed = roll < evasionCap

    if (missed) {
      log.push({
        actor: monster.name,
        action: 'Attack',
        target: 'Your Fairy',
        damage: 0,
        missed: true,
        healed: 0,
      })
    } else {
      const damage = Math.max(1, monster.attack - fairy.attributes.defense)
      fairy = { ...fairy, currentHp: Math.max(0, fairy.currentHp - damage) }
      totalDamageTaken += damage
      log.push({
        actor: monster.name,
        action: 'Attack',
        target: 'Your Fairy',
        damage,
        missed: false,
        healed: 0,
      })
    }
  }

  let newState = { ...state, fairy, turnLog: log }

  // Heal phase: only if 0 damage taken this monster phase
  if (totalDamageTaken === 0 && fairy.currentHp > 0) {
    const healed = Math.min(fairy.attributes.heal, fairy.maxHp - fairy.currentHp)
    if (healed > 0) {
      const healedFairy = { ...fairy, currentHp: fairy.currentHp + healed }
      const healEntry: TurnLogEntry = {
        actor: 'Your Fairy',
        action: 'Resting Heal',
        target: 'Your Fairy',
        damage: 0,
        missed: false,
        healed,
      }
      newState = { ...newState, fairy: healedFairy, turnLog: [...log, healEntry] }
    }
  }

  newState = checkCombatEnd(newState)
  if (newState.status === 'monster_turn') {
    newState = { ...newState, status: 'player_turn', actionsThisTurn: 0 }
  }
  return newState
}

export function checkCombatEnd(state: CombatState): CombatState {
  const allDead = state.monsters.every(m => m.currentHp <= 0)
  if (allDead) return { ...state, status: 'victory' }
  if (state.fairy.currentHp <= 0) return { ...state, status: 'defeat' }
  return state
}

export function getMonsterGoldDrop(): number {
  return randomGoldInRange(10, 30)
}
