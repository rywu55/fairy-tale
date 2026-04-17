import { describe, it, expect, beforeEach } from 'vitest'
import { createFreshState, saveGame, loadGame, exportSave, importSave } from '../persistence'
import { CorruptedSaveError, InvalidSaveError } from '../types'

describe('createFreshState', () => {
  it('returns a valid default state', () => {
    const state = createFreshState()
    expect(state.version).toBe(1)
    expect(state.fairy).toBeNull()
    expect(state.gold).toBe(0)
    expect(state.ftueComplete).toBe(false)
    expect(state.stats.dungeonsCompleted).toBe(0)
  })
})

describe('saveGame / loadGame', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and loads state correctly', () => {
    const state = createFreshState()
    state.gold = 100
    state.ftueComplete = true
    saveGame(state)
    const loaded = loadGame()
    expect(loaded).not.toBeNull()
    expect(loaded!.gold).toBe(100)
    expect(loaded!.ftueComplete).toBe(true)
  })

  it('loadGame returns null when no save exists', () => {
    expect(loadGame()).toBeNull()
  })

  it('loadGame throws CorruptedSaveError on invalid JSON', () => {
    localStorage.setItem('fairytale_save', 'not-json')
    expect(() => loadGame()).toThrow(CorruptedSaveError)
  })

  it('loadGame throws CorruptedSaveError when version is wrong', () => {
    localStorage.setItem('fairytale_save', JSON.stringify({ version: 99, gold: 0, ftueComplete: false, stats: {}, fairy: null }))
    expect(() => loadGame()).toThrow(CorruptedSaveError)
  })
})

describe('exportSave / importSave', () => {
  it('exports state as pretty JSON string', () => {
    const state = createFreshState()
    const exported = exportSave(state)
    expect(() => JSON.parse(exported)).not.toThrow()
    const parsed = JSON.parse(exported)
    expect(parsed.version).toBe(1)
  })

  it('importSave round-trips with exportSave', () => {
    const state = createFreshState()
    state.gold = 500
    const json = exportSave(state)
    const imported = importSave(json)
    expect(imported.gold).toBe(500)
  })

  it('importSave throws InvalidSaveError for non-JSON', () => {
    expect(() => importSave('not json')).toThrow(InvalidSaveError)
  })

  it('importSave throws InvalidSaveError for wrong version', () => {
    const bad = JSON.stringify({ version: 2, gold: 0, ftueComplete: false, stats: {} })
    expect(() => importSave(bad)).toThrow(InvalidSaveError)
  })

  it('importSave throws InvalidSaveError when missing gold', () => {
    const bad = JSON.stringify({ version: 1, ftueComplete: false, stats: {} })
    expect(() => importSave(bad)).toThrow(InvalidSaveError)
  })

  it('importSave throws InvalidSaveError when ftueComplete is not boolean', () => {
    const bad = JSON.stringify({ version: 1, gold: 0, ftueComplete: 'yes', stats: {} })
    expect(() => importSave(bad)).toThrow(InvalidSaveError)
  })
})
