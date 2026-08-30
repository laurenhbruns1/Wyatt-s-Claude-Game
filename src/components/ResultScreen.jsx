import { useState } from 'react'
import { ROLE_LABELS, SLOTS, STAT_LABELS } from '../data/constants'
import { BADGE_DEFS } from '../utils/badges'
import { buildShareText, copyToClipboard } from '../utils/share'
import StatBar from './StatBar'

function statAverage(stats) {
  return (stats.fighting + stats.aim + stats.mechanics + stats.smarts + stats.clutch) / 5
}

/** For one blind-draft pick: the best-stat player who was actually locked
 * to that same role in that exact pool, so the comparison is apples-to-
 * apples (never someone who wasn't even a legal pick for the slot). */
function bestAvailableFor(role, pool) {
  const candidates = pool.filter((p) => p.role_tags[0] === role)
  return candidates.reduce((best, p) => (statAverage(p.stats) > statAverage(best.stats) ? p : best), candidates[0])
}

function PlayerStatCard({ label, player }) {
  return (
    <div className="flex-1 rounded-lg border border-slate-800 bg-slate-900 p-3">
      <div className="text-[11px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-slate-100">{player.name}</div>
      <div className="text-xs text-slate-500">{player.org ? `${player.org} · ` : ''}{player.region}</div>
      <div className="mt-2 flex flex-col gap-1">
        {Object.keys(STAT_LABELS).map((key) => (
          <StatBar key={key} label={STAT_LABELS[key]} value={player.stats[key]} />
        ))}
      </div>
    </div>
  )
}

/** Blind Draft only: after the fact, reveals the stats you never saw —
 * both what you actually picked, and who was the best-stat player locked
 * to that same slot in that exact pool. */
function BlindReveal({ blindLog }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className="w-full rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500"
      >
        {revealed ? 'Hide Reveal' : 'Reveal Best Picks'}
      </button>

      {revealed && (
        <div className="mt-3 flex flex-col gap-4">
          {SLOTS.map((slot) => {
            const entry = blindLog.find((e) => e.role === slot.id)
            if (!entry) return null
            const best = bestAvailableFor(slot.id, entry.pool)
            const nailedIt = best?.id === entry.picked.id
            return (
              <div key={slot.id}>
                <div className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
                  <span>{ROLE_LABELS[slot.id]}</span>
                  {nailedIt && (
                    <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-emerald-300">
                      Best pick!
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <PlayerStatCard label="You Picked" player={entry.picked} />
                  {!nailedIt && best && <PlayerStatCard label="Best Available" player={best} />}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ResultScreen({ squad, result, badges, mode, blindLog, onPlayAgain }) {
  const [copied, setCopied] = useState(false)
  const perfect = result.record.losses === 0

  const handleShare = async () => {
    const ok = await copyToClipboard(buildShareText({ squad, result, badges, mode }))
    setCopied(ok)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="text-center">
        <div className="text-xs uppercase tracking-wider text-slate-500">Season Result</div>
        <div className={`text-5xl font-extrabold ${perfect ? 'text-emerald-400' : 'text-slate-50'}`}>
          {result.record.wins}-{result.record.losses}
        </div>
        <p className="mt-2 text-slate-400">
          {perfect
            ? 'Undefeated. Not a single tournament dropped all season.'
            : `The streak broke at ${result.firstLoss.tourneyName}.`}
        </p>
      </div>

      {!perfect && result.firstLoss && (
        <div className="rounded-xl border border-rose-900 bg-rose-950/30 p-4 text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-400">
            How it fell apart
          </div>
          <p className="mt-1 text-slate-200">{result.firstLoss.note}</p>
        </div>
      )}

      <div className="rounded-xl border border-fuchsia-800 bg-fuchsia-950/20 p-4 text-center">
        <div className="text-xs font-semibold uppercase tracking-wider text-fuchsia-400">
          Season MVP
        </div>
        <p className="mt-1 text-lg font-semibold text-slate-100">{result.mvp.name}</p>
      </div>

      {badges.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Badges Earned
          </h3>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b}
                title={BADGE_DEFS[b].blurb}
                className="rounded-full bg-amber-400/10 px-3 py-1 text-sm font-medium text-amber-300"
              >
                {BADGE_DEFS[b].label}
              </span>
            ))}
          </div>
        </div>
      )}

      {(result.synergyNotes.length > 0 || result.rivalryNotes.length > 0) && (
        <div className="space-y-1 text-sm text-slate-400">
          {result.synergyNotes.map((n) => (
            <p key={n}>🤝 {n}</p>
          ))}
          {result.rivalryNotes.map((n) => (
            <p key={n}>⚡ {n}</p>
          ))}
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Roster
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SLOTS.map((slot) => {
            const p = squad[slot.id]
            return (
              <div key={slot.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-center">
                <div className="text-[11px] uppercase tracking-wider text-slate-500">
                  {ROLE_LABELS[slot.id]}
                </div>
                <div className="mt-1 text-sm font-medium text-slate-100">{p?.name}</div>
                <div className="text-xs text-slate-500">{p?.org ? `${p.org} · ` : ''}{p?.region}</div>
              </div>
            )
          })}
        </div>
      </div>

      {mode === 'blind' && blindLog.length > 0 && <BlindReveal blindLog={blindLog} />}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500"
        >
          {copied ? 'Copied!' : 'Copy Share Card'}
        </button>
        <button
          type="button"
          onClick={onPlayAgain}
          className="flex-1 rounded-xl bg-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:bg-fuchsia-400"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}
