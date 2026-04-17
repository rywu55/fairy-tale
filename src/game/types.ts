// ─── Elements ───────────────────────────────────────

export type Element = 'fire' | 'water' | 'earth' | 'wind' | 'light'

// ─── Attributes ─────────────────────────────────────

export interface Attributes {
  attack: number
  defense: number
  heal: number
  evasiveness: number
  health: number
}

export type AttributeKey = keyof Attributes

// ─── Ceiling Tiers ──────────────────────────────────

export type CeilingTier = 'S' | 'A' | 'B' | 'C' | 'D'

export const CEILING_VALUES: Record<CeilingTier, number> = {
  S: 200,
  A: 160,
  B: 120,
  C: 80,
  D: 50,
}

export const SPRITE_STAGE_FRACTION = 0.2

export type AttributeCeilings = Record<AttributeKey, CeilingTier>

// ─── Move Definition (static) ───────────────────────

export interface MoveDefinition {
  id: string
  name: string
  element: Element
  basePower: number
  perLevelIncrease: number
  maxUsesPerDungeon: number
}

// ─── Fairy Definition (static, per-element) ─────────

export interface FairyDefinition {
  element: Element
  name: string
  description: string
  playstyle: string
  ceilings: AttributeCeilings
  starterMoveId: string
  defaultName: string
}

// ─── Fairy Instance (player's fairy, mutable) ───────

export interface Fairy {
  definitionId: Element
  name: string
  attributes: Attributes
  attributeUpgradeCounts: Attributes
  move: MoveInstance
}

// ─── Move Instance ───────────────────────────────────

export interface MoveInstance {
  definitionId: string
  level: number
}

// ─── Monsters ───────────────────────────────────────

export interface MonsterDefinition {
  id: string
  name: string
  element: Element
  baseHp: number
  baseAttack: number
  icon: string   // emoji shown on tile
}

export interface MonsterInstance {
  definitionId: string
  name: string
  currentHp: number
  maxHp: number
  attack: number
}

// ─── Tile Map ────────────────────────────────────────

export type TileType = 'wall' | 'floor' | 'corridor'

export type TileEntity =
  | { kind: 'monster'; monsters: MonsterInstance[] }
  | { kind: 'loot';    goldReward: number }
  | { kind: 'chest';   goldReward: number }
  | { kind: 'stairs' }

export interface Tile {
  type: TileType
  explored: boolean
  entity: TileEntity | null
}

export interface RoomRect {
  x: number   // top-left column
  y: number   // top-left row
  w: number   // width in tiles
  h: number   // height in tiles
}

export interface TileMap {
  width: number
  height: number
  tiles: Tile[][]         // indexed [y][x]
  playerStart: { x: number; y: number }
  rooms: RoomRect[]
}

// ─── Direction / Move Result ─────────────────────────

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface MoveResult {
  moved: boolean
  combatStarted: boolean
  goldGained: number
  floorAdvanced: boolean
  newFogRevealed: boolean
}

// ─── Dungeon / Floor ────────────────────────────────

export interface Floor {
  number: number
  map: TileMap
  playerPos: { x: number; y: number }
}

export interface DungeonRun {
  dungeonId: string
  currentFloor: number
  floors: Floor[]
  fairy: DungeonFairyState
  goldCollected: number
  startTime: number
  timeLimitMs: number
  status: 'active' | 'victory' | 'defeat' | 'timeout'
}

export interface DungeonFairyState {
  currentHp: number
  maxHp: number
  attributes: Attributes
  move: MoveInstance
  moveUsesRemaining: number
}

// ─── Combat ─────────────────────────────────────────

export type CombatActionType = 'basic_attack' | 'special_move'

export interface CombatAction {
  type: CombatActionType
  targetIndex?: number
}

export interface CombatState {
  fairy: DungeonFairyState
  monsters: MonsterInstance[]
  turnLog: TurnLogEntry[]
  status: 'player_turn' | 'monster_turn' | 'victory' | 'defeat'
}

export interface TurnLogEntry {
  actor: string
  action: string
  target: string
  damage: number
  missed: boolean
  healed: number
}

// ─── Dungeon Definition ──────────────────────────────

export interface DungeonDefinition {
  id: string
  name: string
  description: string
  timeLimitMs: number
  difficultyMultiplier: number   // scales monster HP and attack
  unlockAfterClears: number      // clears of previousDungeonId required; 0 = always unlocked
  previousDungeonId: string | null
}

// ─── Persistence ────────────────────────────────────

export interface GameState {
  version: 1
  fairy: Fairy | null
  gold: number
  stats: PlayerStats
  ftueComplete: boolean
}

export interface PlayerStats {
  dungeonsCompleted: number
  floorsCleared: number
  totalGoldEarned: number
  clearsPerDungeon: Record<string, number>
}

// ─── Errors ─────────────────────────────────────────

export class InsufficientGoldError extends Error {
  constructor(required: number, available: number) {
    super(`Insufficient gold: need ${required}, have ${available}`)
    this.name = 'InsufficientGoldError'
  }
}

export class CeilingExceededError extends Error {
  constructor(attribute: string, ceiling: number) {
    super(`Attribute ${attribute} is already at Sprite ceiling of ${ceiling}`)
    this.name = 'CeilingExceededError'
  }
}

export class CorruptedSaveError extends Error {
  constructor() {
    super('Save data is corrupted or unreadable')
    this.name = 'CorruptedSaveError'
  }
}

export class InvalidSaveError extends Error {
  constructor(reason: string) {
    super(`Invalid save file: ${reason}`)
    this.name = 'InvalidSaveError'
  }
}

export const ATTRIBUTE_KEYS: AttributeKey[] = [
  'attack', 'defense', 'heal', 'evasiveness', 'health',
]

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  attack: 'Attack',
  defense: 'Defense',
  heal: 'Heal',
  evasiveness: 'Evasiveness',
  health: 'Health',
}
