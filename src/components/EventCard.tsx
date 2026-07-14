import { useGameStore } from '../store/gameStore'

export function EventCard() {
  const currentEvent = useGameStore((s) => s.currentEvent)
  const chooseOption = useGameStore((s) => s.chooseOption)

  if (!currentEvent) return null

  return (
    <div className="rounded-2xl border-2 border-indigo-100 bg-white p-5 shadow-md">
      <h3 className="text-lg font-bold text-slate-800">{currentEvent.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{currentEvent.description}</p>
      <div className="mt-4 flex flex-col gap-2">
        {currentEvent.choices.map((choice, i) => (
          <button
            key={choice.label}
            onClick={() => chooseOption(i)}
            className="rounded-xl bg-indigo-50 px-4 py-2.5 text-left text-sm font-medium text-indigo-800 transition-colors hover:bg-indigo-100 active:bg-indigo-200"
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  )
}
