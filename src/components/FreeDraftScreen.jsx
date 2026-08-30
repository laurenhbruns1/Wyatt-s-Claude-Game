import { useMemo, useState } from 'react'
import { REGIONS, ROLE_LABELS, SLOTS } from '../data/constants'
import { AVAILABLE_CHAPTERS } from '../utils/draftPool'
import { shuffleWith } from '../utils/random'
import PlayerCard from './PlayerCard'
import SquadBoard from './SquadBoard'

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-400">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
      >
        <option value="all">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

/** Classic/Blind/Daily/Ultimate: every eligible player is visible at once.
 * Click anyone and they fill the one slot their best stat locks them to;
 * anyone else who locks to that same slot gets crossed off the board too,
 * since there's no room left for them. Keeps going until all 4 are filled. */
export default function FreeDraftScreen({ squad, pool, mode, onDraft }) {
  const blind = mode === 'blind'
  const ultimate = mode === 'ultimate'
  const filledCount = Object.keys(squad).length

  // Ultimate's pool spans every region/chapter/player, so it's worth being
  // able to narrow it down while browsing. Other modes are already scoped
  // to one region/chapter per spin, so these filters only apply here.
  const [regionFilter, setRegionFilter] = useState('all')
  const [chapterFilter, setChapterFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')

  // players.json rows trend strongest-to-weakest within a region, so in
  // Blind Draft (the whole point being "no stats, guess by name") showing
  // that raw order would silently leak skill through list position —
  // shuffle it. Memoized on the pool itself so it doesn't re-shuffle (and
  // visually jump) on every render, only when a fresh spin hands in a new pool.
  const shuffledPool = useMemo(() => (blind ? shuffleWith(pool, Math.random) : pool), [pool, blind])

  const displayPool = useMemo(() => {
    if (!ultimate) return shuffledPool
    return shuffledPool.filter(
      (p) =>
        (regionFilter === 'all' || p.region === regionFilter) &&
        (chapterFilter === 'all' || p.chapter === chapterFilter) &&
        (roleFilter === 'all' || p.role_tags[0] === roleFilter),
    )
  }, [shuffledPool, ultimate, regionFilter, chapterFilter, roleFilter])

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

      {ultimate && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FilterSelect
            label="Region"
            value={regionFilter}
            onChange={setRegionFilter}
            options={REGIONS.map((r) => ({ value: r, label: r }))}
          />
          <FilterSelect
            label="Position"
            value={roleFilter}
            onChange={setRoleFilter}
            options={SLOTS.map((s) => ({ value: s.id, label: s.label }))}
          />
          <FilterSelect
            label="Chapter"
            value={chapterFilter}
            onChange={setChapterFilter}
            options={AVAILABLE_CHAPTERS.map((c) => ({ value: c, label: c }))}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {displayPool
          .map((player) => {
            const role = player.role_tags[0]
            const holder = squad[role]
            const crossedOff = holder?.id === player.id
            const disabled = Boolean(holder) && !crossedOff
            return { player, role, crossedOff, disabled }
          })
          // Pickable cards first — anything crossed off or role-filled sinks
          // to the bottom so there's nothing to scroll past to keep drafting.
          .sort((a, b) => (a.disabled || a.crossedOff ? 1 : 0) - (b.disabled || b.crossedOff ? 1 : 0))
          .map(({ player, role, crossedOff, disabled }) => (
            <PlayerCard
              key={player.id}
              player={player}
              blind={blind}
              disabled={disabled}
              disabledLabel={`${ROLE_LABELS[role]} already filled`}
              crossedOff={crossedOff}
              onDraft={onDraft}
            />
          ))}
        {displayPool.length === 0 && (
          <p className="col-span-full text-center text-slate-500">
            {ultimate ? 'No players match these filters.' : 'No eligible players left in this pool.'}
          </p>
        )}
      </div>
    </div>
  )
}
