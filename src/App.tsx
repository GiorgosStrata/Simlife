import { useGameStore } from './store/gameStore'
import { StatsPanel } from './components/StatsPanel'
import { EventModal } from './components/EventModal'
import { GameOverModal } from './components/GameOverModal'
import { CharacterCreation } from './components/CharacterCreation'
import { LifeLog } from './components/LifeLog'

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const name = useGameStore((s) => s.name)
  const age = useGameStore((s) => s.age)
  const year = useGameStore((s) => s.year)
  const alive = useGameStore((s) => s.alive)
  const currentEvent = useGameStore((s) => s.currentEvent)
  const ageUp = useGameStore((s) => s.ageUp)

  if (screen === 'creation') {
    return <CharacterCreation />
  }

  return (
    <div className="flex h-dvh flex-col bg-slate-100">
      <div className="mx-auto flex h-full w-full max-w-xl flex-col gap-3 p-4 pb-24">
        {/* Header: name, age, year */}
        <header className="flex items-center justify-between rounded-2xl bg-cyan-600 px-5 py-3 text-white shadow-sm">
          <div>
            <h1 className="text-lg font-bold leading-tight">{name}</h1>
            <p className="text-xs text-cyan-100">Simlife</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums leading-tight">Age {age}</p>
            <p className="text-xs tabular-nums text-cyan-100">Year {year}</p>
          </div>
        </header>

        <StatsPanel />

        <LifeLog />
      </div>

      {/* Fixed Age Up button: never moves, like BitLife's age button. */}
      <button
        onClick={ageUp}
        disabled={!alive || currentEvent !== null}
        className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full bg-cyan-500 px-10 py-4 text-base font-bold text-white shadow-xl shadow-cyan-500/40 transition-colors hover:bg-cyan-400 active:bg-cyan-600 disabled:opacity-60"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        Age Up +
      </button>

      <EventModal />
      {!alive && <GameOverModal />}
    </div>
  )
}
