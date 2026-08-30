import { MODES, PLAYSTYLES, REGIONS } from '../data/constants'
import { AVAILABLE_CHAPTERS } from '../utils/draftPool'

export default function HomeScreen({
  mode,
  setMode,
  playstyle,
  setPlaystyle,
  lockedRegion,
  setLockedRegion,
  lockedChapter,
  setLockedChapter,
  onStart,
  bestRecord,
  dailyDone,
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
          UNDEFEATED
        </h1>
        <p className="mt-2 text-slate-400">
          Spin a region &amp; era before every pick, draft a four-slot competitive Fortnite squad, and see if
          they run the season without dropping a single tournament.
        </p>
        {bestRecord && (
          <p className="mt-3 inline-block rounded-full bg-slate-900 px-4 py-1 text-sm text-slate-300">
            Best run: <span className="font-semibold text-emerald-400">{bestRecord.wins}-{bestRecord.losses}</span>
            {' '}({bestRecord.modeLabel})
          </p>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Mode
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`rounded-xl border p-4 text-left transition
                ${mode === m.id
                  ? 'border-fuchsia-400 bg-fuchsia-400/10'
                  : 'border-slate-700 bg-slate-900 hover:border-slate-500'}`}
            >
              <div className="font-semibold text-slate-100">{m.label}</div>
              <div className="text-sm text-slate-400">{m.blurb}</div>
              {m.id === 'daily' && dailyDone && (
                <div className="mt-2 text-xs font-medium text-emerald-400">
                  Completed today: {dailyDone.record.wins}-{dailyDone.record.losses}
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {mode === 'region_lock' && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Region
          </h2>
          <select
            value={lockedRegion}
            onChange={(e) => setLockedRegion(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </section>
      )}

      {mode === 'chapter_lock' && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Chapter
          </h2>
          <select
            value={lockedChapter}
            onChange={(e) => setLockedChapter(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100"
          >
            {AVAILABLE_CHAPTERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Playstyle
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PLAYSTYLES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlaystyle(p.id)}
              className={`rounded-xl border p-4 text-left transition
                ${playstyle === p.id
                  ? 'border-fuchsia-400 bg-fuchsia-400/10'
                  : 'border-slate-700 bg-slate-900 hover:border-slate-500'}`}
            >
              <div className="font-semibold text-slate-100">{p.label}</div>
              <div className="text-sm text-slate-400">{p.blurb}</div>
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={onStart}
        className="rounded-xl bg-fuchsia-500 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:bg-fuchsia-400"
      >
        Spin &amp; Draft →
      </button>
    </div>
  )
}
