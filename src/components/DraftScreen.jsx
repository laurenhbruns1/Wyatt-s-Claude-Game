import PlayerCard from './PlayerCard'
import SquadBoard from './SquadBoard'
import { getFitLevel } from '../utils/fit'

export default function DraftScreen({ squad, activeSlot, pool, format, mode, onDraft }) {
  const blind = mode === 'blind'
  const rotation = mode === 'rotation'

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <SquadBoard squad={squad} activeSlotId={activeSlot.id} />

      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-center">
        <div className="text-xs uppercase tracking-wider text-slate-500">Now Drafting</div>
        <div className="text-xl font-bold text-slate-50">{activeSlot.label}</div>
        <div className="text-sm text-slate-400">{activeSlot.blurb}</div>
        {rotation && (
          <div className="mt-1 text-xs font-medium text-amber-400">
            Rotation mode: natural fits for this slot are locked out.
          </div>
        )}
        {blind && (
          <div className="mt-1 text-xs font-medium text-slate-500">
            Blind Draft: stats hidden. Go with your gut.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pool.map((player) => {
          const disabled = rotation && getFitLevel(player, activeSlot.id) === 'green'
          return (
            <PlayerCard
              key={player.id}
              player={player}
              slot={activeSlot}
              format={format}
              blind={blind}
              disabled={disabled}
              onDraft={onDraft}
            />
          )
        })}
        {pool.length === 0 && (
          <p className="col-span-full text-center text-slate-500">
            No eligible players left in this pool.
          </p>
        )}
      </div>
    </div>
  )
}
