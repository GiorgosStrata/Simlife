import { useGameStore } from '../store/gameStore'

export function GameOverModal() {
  const name = useGameStore((s) => s.name)
  const age = useGameStore((s) => s.age)
  const startNewLife = useGameStore((s) => s.startNewLife)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Game over"
    >
      <div className="animate-pop-up w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
        <p className="text-4xl" aria-hidden>
          🪦
        </p>
        <h3 className="mt-2 text-xl font-bold text-slate-800">Rest in Peace</h3>
        <p className="mt-1 text-sm text-slate-600">
          {name} lived to the age of {age}.
        </p>
        <button
          onClick={startNewLife}
          className="mt-5 w-full rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition-colors hover:bg-cyan-400"
        >
          Start a New Life
        </button>
      </div>
    </div>
  )
}
