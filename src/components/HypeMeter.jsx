export default function HypeMeter({ value }) {
  const pct = Math.max(0, Math.min(100, value))
  const color =
    pct > 70 ? 'bg-emerald-400' : pct > 40 ? 'bg-amber-400' : 'bg-rose-500'

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs uppercase tracking-wider text-slate-400 mb-1">
        <span>Hype</span>
        <span>{Math.round(pct)}</span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
