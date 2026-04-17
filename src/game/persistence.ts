import type { GameState } from './types'
import { CorruptedSaveError, InvalidSaveError } from './types'

const STORAGE_KEY = 'fairytale_save'

export function createFreshState(): GameState {
  return {
    version: 1,
    fairy: null,
    gold: 0,
    stats: { dungeonsCompleted: 0, floorsCleared: 0, totalGoldEarned: 0 },
    ftueComplete: false,
  }
}

export function saveGame(state: GameState): { success: boolean; error?: string } {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return { success: true }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export function loadGame(): GameState | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as GameState
    if (typeof parsed !== 'object' || parsed === null) throw new CorruptedSaveError()
    if (parsed.version !== 1) throw new CorruptedSaveError()
    return parsed
  } catch (e) {
    if (e instanceof CorruptedSaveError) throw e
    throw new CorruptedSaveError()
  }
}

export function exportSave(state: GameState): string {
  return JSON.stringify(state, null, 2)
}

export function importSave(json: string): GameState {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new InvalidSaveError('file is not valid JSON')
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new InvalidSaveError('root value must be an object')
  }

  const obj = parsed as Record<string, unknown>

  if (obj['version'] !== 1) {
    throw new InvalidSaveError('missing or invalid version field')
  }
  if (typeof obj['gold'] !== 'number') {
    throw new InvalidSaveError('missing or invalid gold field')
  }
  if (typeof obj['ftueComplete'] !== 'boolean') {
    throw new InvalidSaveError('missing or invalid ftueComplete field')
  }
  if (typeof obj['stats'] !== 'object' || obj['stats'] === null) {
    throw new InvalidSaveError('missing or invalid stats field')
  }

  return parsed as GameState
}

export function clearSave(): void {
  localStorage.removeItem(STORAGE_KEY)
}
