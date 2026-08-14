interface StatBarProps {
  label: string
  value: number
  color: string
  icon: string
}

export function StatBar({ label, value, color, icon }: StatBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-5 text-center text-sm" aria-hidden>
        {icon}
      </span>
      <span className="w-20 shrink-0 text-xs font-medium text-slate-600">{label}</span>
      <div
        className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs tabular-nums text-slate-500">{value}</span>
    </div>
  )
}
