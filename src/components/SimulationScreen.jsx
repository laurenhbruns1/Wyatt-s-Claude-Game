import { useEffect, useRef, useState } from 'react'
import HypeMeter from './HypeMeter'

export default function SimulationScreen({ result, onFinish }) {
  const [revealed, setRevealed] = useState(0)
  const total = result.events.length
  const scrollRef = useRef(null)

  useEffect(() => {
    if (revealed >= total) return
    const t = setTimeout(() => setRevealed((r) => r + 1), 550)
    return () => clearTimeout(t)
  }, [revealed, total])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [revealed])

  const shown = result.events.slice(0, revealed)
  const wins = shown.filter((e) => e.win).length
  const losses = shown.length - wins
  const currentHype = shown.length ? shown[shown.length - 1].hype : 50
  const done = revealed >= total

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="text-center">
        <div className="text-xs uppercase tracking-wider text-slate-500">Season in Progress</div>
        <div className="text-3xl font-bold text-slate-50">
          {wins}-{losses}
        </div>
      </div>

      <HypeMeter value={currentHype} />

      <div
        ref={scrollRef}
        className="flex max-h-96 flex-col gap-2 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/50 p-4"
      >
        {shown.map((e) => (
          <div
            key={e.index}
            className={`rounded-lg border px-3 py-2 text-sm ${
              e.win ? 'border-emerald-800 bg-emerald-950/40' : 'border-rose-900 bg-rose-950/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-200">{e.name}</span>
              <span className={e.win ? 'text-emerald-400' : 'text-rose-400'}>
                {e.win ? (e.clutchSave ? 'CLUTCH WIN' : 'WIN') : 'LOSS'}
              </span>
            </div>
            {e.note && <p className="mt-1 text-xs italic text-slate-400">{e.note}</p>}
          </div>
        ))}
      </div>

      {done ? (
        <button
          type="button"
          onClick={onFinish}
          className="rounded-xl bg-fuchsia-500 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:bg-fuchsia-400"
        >
          See Season Result →
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(total)}
          className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500"
        >
          Skip to end
        </button>
      )}
    </div>
  )
}
