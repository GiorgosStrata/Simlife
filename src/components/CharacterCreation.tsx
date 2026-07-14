import { useState } from 'react'
import { randomNameParts, useGameStore } from '../store/gameStore'
import { StatBar } from './StatBar'

export function CharacterCreation() {
  const stats = useGameStore((s) => s.stats)
  const year = useGameStore((s) => s.year)
  const rerollStats = useGameStore((s) => s.rerollStats)
  const startLife = useGameStore((s) => s.startLife)

  const [{ first, last }, setName] = useState(randomNameParts)

  return (
    <div className="flex min-h-dvh flex-col bg-slate-100">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-4">
        <header className="rounded-2xl bg-cyan-600 px-5 py-4 text-white shadow-sm">
          <h1 className="text-xl font-bold">New Life</h1>
          <p className="text-sm text-cyan-100">Who will you be? Born in {year}.</p>
        </header>

        <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Name</h2>
            <button
              onClick={() => setName(randomNameParts())}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
            >
              🎲 Randomize
            </button>
          </div>
          <div className="flex gap-2">
            <label className="flex-1">
              <span className="mb-1 block text-xs font-medium text-slate-500">First name</span>
              <input
                value={first}
                onChange={(e) => setName((n) => ({ ...n, first: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </label>
            <label className="flex-1">
              <span className="mb-1 block text-xs font-medium text-slate-500">Last name</span>
              <input
                value={last}
                onChange={(e) => setName((n) => ({ ...n, last: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </label>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Birth Stats
            </h2>
            <button
              onClick={rerollStats}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
            >
              🎲 Reroll
            </button>
          </div>
          <StatBar label="Health" value={stats.health} color="bg-rose-500" icon="❤️" />
          <StatBar label="Happiness" value={stats.happiness} color="bg-amber-400" icon="😊" />
          <StatBar label="Smarts" value={stats.smarts} color="bg-sky-500" icon="🧠" />
          <StatBar label="Looks" value={stats.looks} color="bg-violet-500" icon="✨" />
        </div>

        <button
          onClick={() => startLife(first, last)}
          className="mt-auto rounded-2xl bg-cyan-500 py-4 text-base font-bold text-white shadow-lg shadow-cyan-500/30 transition-colors hover:bg-cyan-400 active:bg-cyan-600"
        >
          Start Life 🍼
        </button>
      </div>
    </div>
  )
}
