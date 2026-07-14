import { useGameStore } from '../store/gameStore'

/**
 * BitLife-style popup: overlays the whole screen when an event is pending,
 * so the layout underneath (including the Age Up button) never moves.
 */
export function EventModal() {
  const currentEvent = useGameStore((s) => s.currentEvent)
  const chooseOption = useGameStore((s) => s.chooseOption)

  if (!currentEvent) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-4 pb-6 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={currentEvent.title}
    >
      <div className="animate-pop-up w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-slate-800">{currentEvent.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{currentEvent.description}</p>
        <div className="mt-5 flex flex-col gap-2.5">
          {currentEvent.choices.map((choice, i) => (
            <button
              key={choice.label}
              onClick={() => chooseOption(i)}
              className="rounded-xl bg-cyan-50 px-4 py-3 text-left text-sm font-semibold text-cyan-900 transition-colors hover:bg-cyan-100 active:bg-cyan-200"
            >
              {choice.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
