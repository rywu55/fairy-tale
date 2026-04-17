import type { Floor, DungeonRun, Fairy, DungeonFairyState } from './types'
import { generateTileMap } from './mapgen'
import { initMoveUses } from './moves'

export function generateFloor(floorNumber: number): Floor {
  const map = generateTileMap(floorNumber)
  return {
    number: floorNumber,
    map,
    playerPos: { ...map.playerStart },
  }
}

export function startDungeonRun(dungeonId: string, fairy: Fairy): DungeonRun {
  const floor1 = generateFloor(1)
  const fairyState: DungeonFairyState = {
    currentHp: fairy.attributes.health,
    maxHp: fairy.attributes.health,
    attributes: { ...fairy.attributes },
    move: { ...fairy.move },
    moveUsesRemaining: initMoveUses(fairy.move),
  }

  return {
    dungeonId,
    currentFloor: 1,
    floors: [floor1],
    fairy: fairyState,
    goldCollected: 0,
    startTime: Date.now(),
    timeLimitMs: 600_000,
    status: 'active',
  }
}

export function isTimedOut(run: DungeonRun): boolean {
  return Date.now() - run.startTime >= run.timeLimitMs
}

export function getTimeRemainingMs(run: DungeonRun): number {
  return Math.max(0, run.timeLimitMs - (Date.now() - run.startTime))
}
