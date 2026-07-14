import { useGameStore } from './store/gameStore'
import { StatsPanel } from './components/StatsPanel'
import { EventCard } from './components/EventCard'
import { LifeLog } from './components/LifeLog'

export default function App() {
  const name = useGameStore((s) => s.name)
  const age = useGameStore((s) => s.age)
  const year = useGameStore((s) => s.year)
  const alive = useGameStore((s) => s.alive)
  const currentEvent = useGameStore((s) => s.currentEvent)
  const ageUp = useGameStore((s) => s.ageUp)
  const startNewLife = useGameStore((s) => s.startNewLife)

  return (
    <div className="flex h-dvh flex-col bg-slate-100">
      <div className="mx-auto flex h-full w-full max-w-xl flex-col gap-3 p-4">
        {/* Header: name, age, year */}
        <header className="flex items-center justify-between rounded-2xl bg-indigo-600 px-5 py-3 text-white shadow-sm">
          <div>
            <h1 className="text-lg font-bold leading-tight">{name}</h1>
            <p className="text-xs text-indigo-200">Simlife</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums leading-tight">Age {age}</p>
            <p className="text-xs tabular-nums text-indigo-200">Year {year}</p>
          </div>
        </header>

        <StatsPanel />

        {alive ? (
          currentEvent ? (
            <EventCard />
          ) : (
            <button
              onClick={ageUp}
              className="rounded-2xl bg-indigo-600 py-3.5 text-base font-bold text-white shadow-md transition-colors hover:bg-indigo-500 active:bg-indigo-700"
            >
              Age Up +
            </button>
          )
        ) : (
          <div className="rounded-2xl border-2 border-rose-100 bg-white p-5 text-center shadow-md">
            <h3 className="text-lg font-bold text-rose-700">Rest in Peace</h3>
            <p className="mt-1 text-sm text-slate-600">
              {name} lived to the age of {age}.
            </p>
            <button
              onClick={startNewLife}
              className="mt-4 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
            >
              Start a New Life
            </button>
          </div>
        )}

        <LifeLog />
      </div>
    </div>
  )
}
