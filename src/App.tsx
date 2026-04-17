import { useState } from 'react'
import { useGameEngine } from './ui/useGameEngine'
import { FtueScreen } from './ui/screens/FtueScreen'
import { HomeScreen } from './ui/screens/HomeScreen'
import { DungeonSelectScreen } from './ui/screens/DungeonSelectScreen'
import { DungeonScreen } from './ui/screens/DungeonScreen'
import { UpgradeScreen } from './ui/screens/UpgradeScreen'

type Screen = 'home' | 'dungeon-select' | 'dungeon' | 'upgrades'

export default function App() {
  const { state, engine, wrap, refresh } = useGameEngine()
  const [screen, setScreen] = useState<Screen>('home')

  if (!state.ftueComplete) {
    return <FtueScreen />
  }

  function handleSelectDungeon(dungeonId: string) {
    try {
      wrap(() => engine.startDungeon(dungeonId))
      setScreen('dungeon')
    } catch (e) {
      console.error(e)
    }
  }

  function handleExitDungeon() {
    refresh()
    setScreen('home')
  }

  return (
    <>
      {screen === 'home' && (
        <HomeScreen
          onEnterDungeon={() => setScreen('dungeon-select')}
          onUpgrades={() => setScreen('upgrades')}
        />
      )}
      {screen === 'dungeon-select' && (
        <DungeonSelectScreen
          onSelect={handleSelectDungeon}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'dungeon' && (
        <DungeonScreen onExit={handleExitDungeon} />
      )}
      {screen === 'upgrades' && (
        <UpgradeScreen onBack={() => setScreen('home')} />
      )}
    </>
  )
}
