import { STAT_LABELS } from '../data/constants'
import FitDot from './FitDot'
import StatBar from './StatBar'

export default function PlayerCard({
  player,
  blind,
  disabled,
  disabledLabel,
  crossedOff,
  fitLevel,
  onDraft,
}) {
  const stats = player.stats

  return (
    <button
      type="button"
      disabled={disabled || crossedOff}
      onClick={() => onDraft(player)}
      className={`group relative flex flex-col gap-2 rounded-xl border p-4 text-left transition
        ${disabled || crossedOff
          ? 'cursor-not-allowed border-slate-800 bg-slate-900/40 opacity-40'
          : 'border-slate-700 bg-slate-900 hover:border-fuchsia-400 hover:bg-slate-800/80'}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className={`font-semibold text-slate-100 ${crossedOff ? 'line-through' : ''}`}>
            {player.name}
          </div>
          <div className="text-xs text-slate-400">
            {player.org ? `${player.org} · ` : ''}
            {player.region}
          </div>
        </div>
        {!blind && fitLevel && <FitDot level={fitLevel} />}
      </div>

      {!blind && (
        <div className="flex flex-wrap items-center gap-1">
          {player.role_tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400"
            >
              {tag}
            </span>
          ))}
          {player.role_assigned && (
            <span
              className="text-[10px] italic text-slate-500"
              title="Assigned by hand to cover a role gap in this region, not derived from their own stats"
            >
              (assigned)
            </span>
          )}
        </div>
      )}

      {!blind && (
        <div className="mt-1 flex flex-col gap-1">
          {Object.keys(STAT_LABELS).map((key) => (
            <StatBar key={key} label={STAT_LABELS[key]} value={stats[key]} />
          ))}
        </div>
      )}

      {blind && <p className="text-xs italic text-slate-500">{player.chapter} debut</p>}

      {crossedOff && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-950/70 text-xs font-medium text-emerald-300">
          Drafted
        </div>
      )}
      {disabled && !crossedOff && disabledLabel && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-950/70 px-4 text-center text-xs font-medium text-rose-300">
          {disabledLabel}
        </div>
      )}
    </button>
  )
}
