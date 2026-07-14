import { useGameStore } from '../store/gameStore'
import { StatBar } from './StatBar'

export function StatsPanel() {
  const stats = useGameStore((s) => s.stats)
  const money = useGameStore((s) => s.money)

  return (
    <div className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Stats</h2>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold tabular-nums text-emerald-700">
          ${money.toLocaleString()}
        </span>
      </div>
      <StatBar label="Health" value={stats.health} color="bg-rose-500" icon="❤️" />
      <StatBar label="Happiness" value={stats.happiness} color="bg-amber-400" icon="😊" />
      <StatBar label="Smarts" value={stats.smarts} color="bg-sky-500" icon="🧠" />
      <StatBar label="Looks" value={stats.looks} color="bg-violet-500" icon="✨" />
    </div>
  )
}
