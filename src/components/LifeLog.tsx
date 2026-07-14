import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import type { LogEntry } from '../types'

const KIND_STYLES: Record<LogEntry['kind'], string> = {
  birthday: 'font-semibold text-slate-800',
  event: 'text-slate-600',
  info: 'text-indigo-700',
  death: 'font-semibold text-rose-700',
  career: 'text-sky-600',
  relationship: 'text-pink-600',
}

export function LifeLog() {
  const log = useGameStore((s) => s.log)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log.length])

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Life Story
      </h2>
      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1" data-testid="life-log">
        {log.map((entry) => (
          <p key={entry.id} className={`text-sm leading-snug ${KIND_STYLES[entry.kind]}`}>
            <span className="mr-1.5 text-xs tabular-nums text-slate-400">
              Age {entry.age}
            </span>
            {entry.text}
          </p>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
