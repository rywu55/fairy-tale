import { useState } from 'react'
import { useGameEngine } from './ui/useGameEngine'
import { FtueScreen } from './ui/screens/FtueScreen'
import { HomeScreen } from './ui/screens/HomeScreen'
import { DungeonScreen } from './ui/screens/DungeonScreen'
import { UpgradeScreen } from './ui/screens/UpgradeScreen'

type Screen = 'home' | 'dungeon' | 'upgrades'

export default function App() {
  const { state, engine, wrap, refresh } = useGameEngine()
  const [screen, setScreen] = useState<Screen>('home')

  if (!state.ftueComplete) {
    return <FtueScreen />
  }

  function handleEnterDungeon() {
    try {
      wrap(() => engine.startDungeon('ember_caves'))
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
          onEnterDungeon={handleEnterDungeon}
          onUpgrades={() => setScreen('upgrades')}
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
