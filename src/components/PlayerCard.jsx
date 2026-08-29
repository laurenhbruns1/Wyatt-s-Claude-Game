import { STAT_LABELS } from '../data/constants'
import { getFitLevel } from '../utils/fit'
import FitDot from './FitDot'
import StatBar from './StatBar'

export default function PlayerCard({ player, slot, format, blind, disabled, onDraft }) {
  const fitLevel = getFitLevel(player, slot.id)
  const stats = player.format_stats[format] || player.stats

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onDraft(player)}
      className={`group relative flex flex-col gap-2 rounded-xl border p-4 text-left transition
        ${disabled
          ? 'cursor-not-allowed border-slate-800 bg-slate-900/40 opacity-40'
          : 'border-slate-700 bg-slate-900 hover:border-fuchsia-400 hover:bg-slate-800/80'}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-slate-100">{player.name}</div>
          <div className="text-xs text-slate-400">
            {player.org ? `${player.org} · ` : ''}
            {player.region}
          </div>
        </div>
        {!blind && <FitDot level={fitLevel} />}
      </div>

      {!blind && (
        <div className="flex flex-wrap gap-1">
          {player.role_tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400"
            >
              {tag}
            </span>
          ))}
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

      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-950/70 text-xs font-medium text-rose-300">
          Not allowed in Rotation mode
        </div>
      )}
    </button>
  )
}
