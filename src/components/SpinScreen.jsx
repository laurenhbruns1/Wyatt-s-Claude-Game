import { useEffect, useState } from 'react'
import { CHAPTERS, REGIONS } from '../data/constants'
import SquadBoard from './SquadBoard'

function SpinColumn({ label, finalValue, spinning, delay }) {
  const [display, setDisplay] = useState(finalValue)
  const options = label === 'Region' ? REGIONS : CHAPTERS

  useEffect(() => {
    if (!spinning) {
      setDisplay(finalValue)
      return
    }
    const interval = setInterval(() => {
      setDisplay(options[Math.floor(Math.random() * options.length)])
    }, 70)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      setDisplay(finalValue)
    }, 900 + delay)
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, finalValue, delay])

  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-6 py-5">
      <span className="text-xs uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-2xl font-bold text-slate-50">{display}</span>
    </div>
  )
}

export default function SpinScreen({ combo, mode, squad, activeSlot, onContinue }) {
  const [spinning, setSpinning] = useState(mode !== 'ultimate')

  useEffect(() => {
    if (mode === 'ultimate') return
    const t = setTimeout(() => setSpinning(false), 1100)
    return () => clearTimeout(t)
    // Runs once per mounted instance — App.jsx keys this component by slot
    // index so a fresh spin always re-mounts (and re-animates) it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const region = mode === 'ultimate' ? 'All-Time' : combo.region
  const chapter = mode === 'ultimate' ? 'Every Chapter' : combo.chapter

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-10 text-center">
      {squad && activeSlot && <SquadBoard squad={squad} activeSlotId={activeSlot.id} />}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          {mode === 'daily' ? "Today's Seed" : 'The Spin'}
        </h2>
        <p className="mt-1 text-slate-400">
          {activeSlot ? (
            <>
              Spinning up your <span className="font-semibold text-slate-200">{activeSlot.label}</span> pool
            </>
          ) : (
            'Spinning up your draft pool'
          )}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SpinColumn label="Region" finalValue={region} spinning={spinning} delay={0} />
        <SpinColumn label="Chapter" finalValue={chapter} spinning={spinning} delay={200} />
      </div>
      <button
        type="button"
        disabled={spinning}
        onClick={onContinue}
        className="rounded-xl bg-fuchsia-500 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none"
      >
        {spinning ? 'Spinning…' : 'Start Draft →'}
      </button>
    </div>
  )
}
