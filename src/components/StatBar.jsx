export default function StatBar({ label, value }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 shrink-0 text-slate-400">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-fuchsia-400"
          style={{ width: `${Math.max(2, value)}%` }}
        />
      </div>
      <span className="w-6 text-right text-slate-300">{value}</span>
    </div>
  )
}
