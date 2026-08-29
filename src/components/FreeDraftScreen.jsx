import { ROLE_LABELS } from '../data/constants'
import PlayerCard from './PlayerCard'
import SquadBoard from './SquadBoard'

/** Classic/Blind/Daily/Ultimate: every eligible player is visible at once.
 * Click anyone and they fill the one slot their best stat locks them to;
 * anyone else who locks to that same slot gets crossed off the board too,
 * since there's no room left for them. Keeps going until all 4 are filled. */
export default function FreeDraftScreen({ squad, pool, mode, onDraft }) {
  const blind = mode === 'blind'
  const filledCount = Object.keys(squad).length

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <SquadBoard squad={squad} />

      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-center">
        <div className="text-xs uppercase tracking-wider text-slate-500">Draft Your Squad</div>
        <div className="text-xl font-bold text-slate-50">{filledCount} / 4 picked</div>
        <div className="text-sm text-slate-400">
          Pick anyone — they lock into the one slot their best stat fits.
        </div>
        {blind && (
          <div className="mt-1 text-xs font-medium text-slate-500">
            Blind Draft: stats hidden. Go with your gut.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pool.map((player) => {
          const role = player.role_tags[0]
          const holder = squad[role]
          const crossedOff = holder?.id === player.id
          const disabled = Boolean(holder) && !crossedOff
          return (
            <PlayerCard
              key={player.id}
              player={player}
              blind={blind}
              disabled={disabled}
              disabledLabel={`${ROLE_LABELS[role]} already filled`}
              crossedOff={crossedOff}
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
