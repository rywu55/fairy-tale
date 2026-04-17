import { useRef, useState, useCallback } from 'react'
import { GameEngine } from '../game/game-engine'
import type { GameState } from '../game/types'

let engineInstance: GameEngine | null = null

function getEngine(): GameEngine {
  if (!engineInstance) engineInstance = new GameEngine()
  return engineInstance
}

export function useGameEngine() {
  const engineRef = useRef<GameEngine>(getEngine())
  const [, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion(v => v + 1), [])

  const engine = engineRef.current

  function wrap<T>(fn: () => T): T {
    const result = fn()
    refresh()
    return result
  }

  return {
    engine,
    state: engine.getState() as GameState,
    dungeon: engine.getActiveDungeon(),
    combat: engine.getActiveCombat(),
    refresh,
    wrap,
  }
}
