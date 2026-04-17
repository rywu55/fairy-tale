import type { Fairy, DungeonFairyState, MoveInstance } from './types'
import { getMovePower as getMovePowerFromData, getMoveDefinition } from './data/moves'

export function getMovePower(move: MoveInstance): number {
  return getMovePowerFromData(move.definitionId, move.level)
}

export function canUseMove(fairyState: DungeonFairyState): boolean {
  return fairyState.moveUsesRemaining > 0
}

export function useMove(fairyState: DungeonFairyState): DungeonFairyState {
  return {
    ...fairyState,
    moveUsesRemaining: fairyState.moveUsesRemaining - 1,
  }
}

export function canUpgradeMove(move: MoveInstance): boolean {
  return move.level < 10
}

export function upgradeMove(fairy: Fairy): Fairy {
  return {
    ...fairy,
    move: { ...fairy.move, level: fairy.move.level + 1 },
  }
}

export function initMoveUses(move: MoveInstance): number {
  const def = getMoveDefinition(move.definitionId)
  return def.maxUsesPerDungeon
}

export function getMoveName(move: MoveInstance): string {
  const def = getMoveDefinition(move.definitionId)
  return def.name
}
