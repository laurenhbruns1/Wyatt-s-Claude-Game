const COLORS = {
  green: 'bg-emerald-400',
  yellow: 'bg-amber-400',
  red: 'bg-rose-500',
}

const LABELS = {
  green: 'Natural fit',
  yellow: 'Adjacent fit (-25%)',
  red: 'Poor fit (-40%)',
}

export default function FitDot({ level, showLabel = false }) {
  return (
    <span className="inline-flex items-center gap-1.5" title={LABELS[level]}>
      <span className={`h-2.5 w-2.5 rounded-full ${COLORS[level]}`} />
      {showLabel && <span className="text-xs text-slate-400">{LABELS[level]}</span>}
    </span>
  )
}
