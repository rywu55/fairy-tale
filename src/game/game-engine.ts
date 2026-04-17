import type {
  GameState, Fairy, Attributes, AttributeKey, Element,
  DungeonRun, Floor, CombatState, CombatAction, FairyDefinition,
  Direction, MoveResult,
} from './types'
import { ATTRIBUTE_KEYS } from './types'
import { getAllFairyDefinitions, getFairyDefinition } from './data/fairies'
import { createFairy, canUpgradeAttribute, upgradeAttribute } from './fairy'
import { canAfford, deductGold, addGold, getAttributeUpgradeCostForFairy, getMoveUpgradeCost } from './economy'
import { canUpgradeMove, upgradeMove as upgradeMoveOnFairy } from './moves'
import { startDungeonRun, generateFloor, isTimedOut, getTimeRemainingMs } from './dungeon'
import { stepPlayer } from './navigation'
import { startCombat, executeBasicAttack, executeSpecialMove, executeMonsterPhase, getMonsterGoldDrop } from './combat'
import { saveGame, loadGame, createFreshState, exportSave, importSave, clearSave } from './persistence'

export class GameEngine {
  private state: GameState
  private activeDungeon: DungeonRun | null = null
  private activeCombat: CombatState | null = null
  private pendingMovePos: { x: number; y: number } | null = null

  constructor() {
    try {
      this.state = loadGame() ?? createFreshState()
    } catch {
      this.state = createFreshState()
    }
  }

  getState(): Readonly<GameState> {
    return this.state
  }

  getActiveDungeon(): Readonly<DungeonRun> | null {
    return this.activeDungeon
  }

  getActiveCombat(): Readonly<CombatState> | null {
    return this.activeCombat
  }

  // ─── FTUE ───────────────────────────────────────────

  getFairyDefinitions(): FairyDefinition[] {
    return getAllFairyDefinitions()
  }

  getFairyDefinition(element: Element): FairyDefinition {
    return getFairyDefinition(element)
  }

  createFairy(element: Element, starterPoints: Attributes, name: string): Fairy {
    const fairy = createFairy(element, starterPoints, name)
    this.state = {
      ...this.state,
      fairy,
      ftueComplete: true,
    }
    this.save()
    return fairy
  }

  // ─── Dungeon ────────────────────────────────────────

  startDungeon(dungeonId: string): DungeonRun {
    if (!this.state.fairy) throw new Error('No fairy created')
    this.activeDungeon = startDungeonRun(dungeonId, this.state.fairy)
    this.activeCombat = null
    return this.activeDungeon
  }

  movePlayer(dir: Direction): MoveResult {
    const none: MoveResult = { moved: false, combatStarted: false, goldGained: 0, floorAdvanced: false, newFogRevealed: false }
    if (!this.activeDungeon || this.activeDungeon.status !== 'active') return none
    // Block movement while combat is in progress
    if (this.activeCombat &&
        (this.activeCombat.status === 'player_turn' || this.activeCombat.status === 'monster_turn')) {
      return none
    }
    if (this.isTimedOut()) {
      this.endDungeon('timeout')
      return none
    }

    const floorIndex = this.activeDungeon.currentFloor - 1
    const floor = this.activeDungeon.floors[floorIndex]
    const { newPos, newMap, moved } = stepPlayer(floor.map, floor.playerPos, dir)

    if (!moved) return none

    const newFogRevealed = !floor.map.tiles[newPos.y][newPos.x].explored

    // Commit movement
    const updatedFloor: Floor = { ...floor, map: newMap, playerPos: newPos }
    let floors = [...this.activeDungeon.floors]
    floors[floorIndex] = updatedFloor
    this.activeDungeon = { ...this.activeDungeon, floors }

    const entity = newMap.tiles[newPos.y][newPos.x].entity
    let combatStarted = false
    let goldGained = 0
    let floorAdvanced = false

    if (entity) {
      if (entity.kind === 'monster') {
        this.pendingMovePos = newPos
        this.activeCombat = startCombat(this.activeDungeon.fairy, entity.monsters)
        combatStarted = true
      } else if (entity.kind === 'loot') {
        goldGained = entity.goldReward
        this.collectGold(goldGained)
        this.clearEntityAt(floorIndex, newPos)
      } else if (entity.kind === 'chest') {
        goldGained = entity.goldReward
        this.collectGold(goldGained)
        this.clearEntityAt(floorIndex, newPos)
        this.advanceFloor()
        floorAdvanced = true
      } else if (entity.kind === 'stairs') {
        this.advanceFloor()
        floorAdvanced = true
      }
    }

    return { moved: true, combatStarted, goldGained, floorAdvanced, newFogRevealed }
  }

  private clearEntityAt(floorIndex: number, pos: { x: number; y: number }): void {
    if (!this.activeDungeon) return
    const floor = this.activeDungeon.floors[floorIndex]
    const newTiles = floor.map.tiles.map((row, y) =>
      row.map((t, x) => (x === pos.x && y === pos.y ? { ...t, entity: null } : t))
    )
    const updatedFloor: Floor = { ...floor, map: { ...floor.map, tiles: newTiles } }
    const floors = [...this.activeDungeon.floors]
    floors[floorIndex] = updatedFloor
    this.activeDungeon = { ...this.activeDungeon, floors }
  }

  advanceFloor(): void {
    if (!this.activeDungeon) return
    const nextFloor = this.activeDungeon.currentFloor + 1
    if (nextFloor > 5) {
      this.endDungeon('victory')
      return
    }
    const newFloor = generateFloor(nextFloor)
    this.activeDungeon = {
      ...this.activeDungeon,
      currentFloor: nextFloor,
      floors: [...this.activeDungeon.floors, newFloor],
    }
  }

  private endDungeon(status: 'victory' | 'defeat' | 'timeout'): void {
    if (!this.activeDungeon) return
    this.activeDungeon = { ...this.activeDungeon, status }
    const floorsCleared = this.activeDungeon.currentFloor - (status === 'victory' ? 0 : 1)
    this.state = {
      ...this.state,
      stats: {
        ...this.state.stats,
        dungeonsCompleted: status === 'victory'
          ? this.state.stats.dungeonsCompleted + 1
          : this.state.stats.dungeonsCompleted,
        floorsCleared: this.state.stats.floorsCleared + Math.max(0, floorsCleared),
      },
    }
    this.activeCombat = null
    this.save()
  }

  private collectGold(amount: number): void {
    if (amount <= 0) return
    this.state = {
      ...this.state,
      gold: addGold(this.state.gold, amount),
      stats: {
        ...this.state.stats,
        totalGoldEarned: this.state.stats.totalGoldEarned + amount,
      },
    }
    if (this.activeDungeon) {
      this.activeDungeon = {
        ...this.activeDungeon,
        goldCollected: this.activeDungeon.goldCollected + amount,
      }
    }
  }

  // ─── Combat ─────────────────────────────────────────

  executeTurn(action: CombatAction): CombatState {
    if (!this.activeCombat || !this.activeDungeon) throw new Error('No active combat')

    let combat = this.activeCombat
    const targetIndex = action.targetIndex ?? 0

    if (action.type === 'basic_attack') {
      combat = executeBasicAttack(combat, targetIndex)
    } else if (action.type === 'special_move') {
      combat = executeSpecialMove(combat, targetIndex)
    }

    // If monster turn triggered, resolve it
    if (combat.status === 'monster_turn') {
      combat = executeMonsterPhase(combat)
    }

    // Sync fairy state back to dungeon
    if (this.activeDungeon) {
      this.activeDungeon = { ...this.activeDungeon, fairy: combat.fairy }
    }

    // Handle end states
    if (combat.status === 'victory') {
      const goldDrop = getMonsterGoldDrop()
      this.collectGold(goldDrop)
      // Clear the entity on the tile where combat was triggered
      if (this.pendingMovePos) {
        const floorIndex = this.activeDungeon.currentFloor - 1
        this.clearEntityAt(floorIndex, this.pendingMovePos)
        this.pendingMovePos = null
      }
      // Keep activeCombat with victory status so the UI can show the result.
      // It will be overwritten when the next combat starts.
      this.activeCombat = combat
    } else if (combat.status === 'defeat') {
      this.endDungeon('defeat')
      // Keep activeCombat with defeat status so the UI can show the result.
      this.activeCombat = combat
    } else {
      this.activeCombat = combat
    }

    return combat
  }

  isTimedOut(): boolean {
    if (!this.activeDungeon) return false
    return isTimedOut(this.activeDungeon)
  }

  getTimeRemainingMs(): number {
    if (!this.activeDungeon) return 0
    return getTimeRemainingMs(this.activeDungeon)
  }

  checkTimeout(): boolean {
    if (this.isTimedOut() && this.activeDungeon?.status === 'active') {
      this.endDungeon('timeout')
      return true
    }
    return false
  }

  // ─── Upgrades ────────────────────────────────────────

  getAttributeUpgradeCost(attribute: AttributeKey): number {
    if (!this.state.fairy) throw new Error('No fairy')
    return getAttributeUpgradeCostForFairy(this.state.fairy.attributeUpgradeCounts, attribute)
  }

  canUpgradeAttribute(attribute: AttributeKey): boolean {
    if (!this.state.fairy) return false
    const cost = this.getAttributeUpgradeCost(attribute)
    return canAfford(this.state.gold, cost) && canUpgradeAttribute(this.state.fairy, attribute)
  }

  upgradeAttribute(attribute: AttributeKey): Fairy {
    if (!this.state.fairy) throw new Error('No fairy')
    const cost = this.getAttributeUpgradeCost(attribute)
    const newGold = deductGold(this.state.gold, cost)
    const newFairy = upgradeAttribute(this.state.fairy, attribute)
    this.state = { ...this.state, fairy: newFairy, gold: newGold }
    this.save()
    return newFairy
  }

  getMoveUpgradeCost(): number {
    if (!this.state.fairy) throw new Error('No fairy')
    return getMoveUpgradeCost(this.state.fairy.move.level)
  }

  canUpgradeMove(): boolean {
    if (!this.state.fairy) return false
    const cost = this.getMoveUpgradeCost()
    return canAfford(this.state.gold, cost) && canUpgradeMove(this.state.fairy.move)
  }

  upgradeMove(): Fairy {
    if (!this.state.fairy) throw new Error('No fairy')
    const cost = this.getMoveUpgradeCost()
    const newGold = deductGold(this.state.gold, cost)
    const newFairy = upgradeMoveOnFairy(this.state.fairy)
    this.state = { ...this.state, fairy: newFairy, gold: newGold }
    this.save()
    return newFairy
  }

  // ─── Persistence ────────────────────────────────────

  save(): void {
    const result = saveGame(this.state)
    if (!result.success) {
      console.warn('Save failed:', result.error)
    }
  }

  exportSave(): string {
    return exportSave(this.state)
  }

  importSave(json: string): GameState {
    const newState = importSave(json)
    this.state = newState
    this.activeDungeon = null
    this.activeCombat = null
    this.save()
    return newState
  }

  resetGame(): void {
    clearSave()
    this.state = createFreshState()
    this.activeDungeon = null
    this.activeCombat = null
  }

  // ─── Attribute helpers ──────────────────────────────

  getAllUpgradeCosts(): Record<AttributeKey, number> {
    const result = {} as Record<AttributeKey, number>
    for (const key of ATTRIBUTE_KEYS) {
      result[key] = this.getAttributeUpgradeCost(key)
    }
    return result
  }

  canAffordUpgrade(attribute: AttributeKey): boolean {
    if (!this.state.fairy) return false
    return canAfford(this.state.gold, this.getAttributeUpgradeCost(attribute))
  }
}
