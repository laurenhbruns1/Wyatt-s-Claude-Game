import PlayerCard from './PlayerCard'
import SquadBoard from './SquadBoard'
import { getFitLevel } from '../utils/fit'

/** Rotation mode only: walks the 4 slots in order, one spin per slot, and
 * requires an off-role (non-green-fit) pick for each one. */
export default function DraftScreen({ squad, activeSlot, pool, onDraft }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <SquadBoard squad={squad} activeSlotId={activeSlot.id} />

      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-center">
        <div className="text-xs uppercase tracking-wider text-slate-500">Now Drafting</div>
        <div className="text-xl font-bold text-slate-50">{activeSlot.label}</div>
        <div className="text-sm text-slate-400">{activeSlot.blurb}</div>
        <div className="mt-1 text-xs font-medium text-amber-400">
          Rotation mode: natural fits for this slot are locked out.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pool
          .map((player) => {
            const fitLevel = getFitLevel(player, activeSlot.id)
            return { player, fitLevel, disabled: fitLevel === 'green' }
          })
          // Pickable cards first — natural fits locked out this slot sink
          // to the bottom so there's nothing to scroll past to keep drafting.
          .sort((a, b) => (a.disabled ? 1 : 0) - (b.disabled ? 1 : 0))
          .map(({ player, fitLevel, disabled }) => (
            <PlayerCard
              key={player.id}
              player={player}
              fitLevel={fitLevel}
              disabled={disabled}
              disabledLabel="Not allowed in Rotation mode"
              onDraft={onDraft}
            />
          ))}
        {pool.length === 0 && (
          <p className="col-span-full text-center text-slate-500">
            No eligible players left in this pool.
          </p>
        )}
      </div>
    </div>
  )
}
