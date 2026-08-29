import { useState } from 'react'
import { ROLE_LABELS, SLOTS } from '../data/constants'
import { BADGE_DEFS } from '../utils/badges'
import { buildShareText, copyToClipboard } from '../utils/share'

export default function ResultScreen({ squad, result, badges, mode, onPlayAgain }) {
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
