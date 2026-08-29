import { useMemo, useState } from 'react'
import HomeScreen from './components/HomeScreen'
import SpinScreen from './components/SpinScreen'
import DraftScreen from './components/DraftScreen'
import SimulationScreen from './components/SimulationScreen'
import ResultScreen from './components/ResultScreen'
import { MODES, PLAYSTYLES, SLOTS } from './data/constants'
import {
  dailyPool,
  excludeDrafted,
  poolFor,
  spinCombo,
  spinComboForDaily,
  todaysSeed,
} from './utils/draftPool'
import { simulateSeason } from './utils/sim'
import { computeBadges } from './utils/badges'
import { useLocalStorage } from './hooks/useLocalStorage'

function isBetterRecord(next, prev) {
  if (!prev) return true
  if (next.losses !== prev.losses) return next.losses < prev.losses
  return next.wins > prev.wins
}

const MAX_SPIN_ATTEMPTS = 50

/** Rolls a fresh region/chapter/format spin + pool for one draft slot,
 * excluding anyone already drafted into an earlier slot. Data only covers
 * some region/chapter combos so far, so a spin can land on an empty pool —
 * retry (deterministically, for Daily) rather than dead-ending the draft.
 *
 * Outside Rotation mode, a player is locked to the one slot matching their
 * highest stat (see fit.js computeNaturalRole) — the pool is filtered down
 * to only that slot's eligible players. Rotation mode is the deliberate
 * off-role mode, so it keeps drafting from the full unfiltered pool. */
function rollForSlot(mode, slotIndex, slot, squadSoFar) {
  let combo
  let pool
  for (let attempt = 0; attempt < MAX_SPIN_ATTEMPTS; attempt++) {
    if (mode === 'ultimate') {
      combo = { region: null, chapter: null, format: spinCombo().format }
      pool = poolFor({ format: combo.format, ultimate: true })
    } else if (mode === 'daily') {
      const seedSlot = slotIndex + attempt * 100
      combo = spinComboForDaily(seedSlot)
      pool = dailyPool(combo, seedSlot)
    } else {
      combo = spinCombo()
      pool = poolFor(combo)
    }
    pool = excludeDrafted(pool, squadSoFar)
    if (mode !== 'rotation') {
      pool = pool.filter((p) => p.role_tags[0] === slot.id)
    }
    if (pool.length > 0) break
  }
  return { combo, pool }
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [mode, setMode] = useState('classic')
  const [playstyle, setPlaystyle] = useState('balanced')

  const [combo, setCombo] = useState(null)
  const [pool, setPool] = useState([])
  const [squad, setSquad] = useState({})
  const [activeSlotIndex, setActiveSlotIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [badges, setBadges] = useState([])

  const [bestRecord, setBestRecord] = useLocalStorage('undefeated:bestRecord', null)
  const [dailyHistory, setDailyHistory] = useLocalStorage('undefeated:dailyHistory', {})

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const dailyDone = dailyHistory[todayKey] || null

  const activeSlot = SLOTS[activeSlotIndex]
  const playstyleDef = PLAYSTYLES.find((p) => p.id === playstyle)

  function handleStart() {
    const { combo: nextCombo, pool: nextPool } = rollForSlot(mode, 0, SLOTS[0], {})
    setCombo(nextCombo)
    setPool(nextPool)
    setSquad({})
    setActiveSlotIndex(0)
    setResult(null)
    setBadges([])
    setScreen('spin')
  }

  function handleDraft(player) {
    const nextSquad = { ...squad, [activeSlot.id]: player }

    if (activeSlotIndex + 1 < SLOTS.length) {
      const nextIndex = activeSlotIndex + 1
      const { combo: nextCombo, pool: nextPool } = rollForSlot(mode, nextIndex, SLOTS[nextIndex], nextSquad)
      setSquad(nextSquad)
      setCombo(nextCombo)
      setPool(nextPool)
      setActiveSlotIndex(nextIndex)
      setScreen('spin')
      return
    }

    setSquad(nextSquad)
    const seasonResult = simulateSeason({
      squad: nextSquad,
      playstyle: playstyleDef,
      mode,
      seed: mode === 'daily' ? todaysSeed() + 100 : undefined,
    })
    const earnedBadges = computeBadges({ squad: nextSquad, result: seasonResult, mode })
    setResult(seasonResult)
    setBadges(earnedBadges)
    setScreen('sim')
  }

  function handleSimFinish() {
    const modeLabel = MODES.find((m) => m.id === mode)?.label ?? mode
    if (isBetterRecord(result.record, bestRecord)) {
      setBestRecord({ ...result.record, modeLabel })
    }
    if (mode === 'daily' && !dailyHistory[todayKey]) {
      setDailyHistory({ ...dailyHistory, [todayKey]: { record: result.record, badgeCount: badges.length } })
    }
    setScreen('result')
  }

  function handlePlayAgain() {
    setScreen('home')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {screen === 'home' && (
        <HomeScreen
          mode={mode}
          setMode={setMode}
          playstyle={playstyle}
          setPlaystyle={setPlaystyle}
          onStart={handleStart}
          bestRecord={bestRecord}
          dailyDone={dailyDone}
        />
      )}
      {screen === 'spin' && combo && (
        <SpinScreen
          key={activeSlotIndex}
          combo={combo}
          mode={mode}
          squad={squad}
          activeSlot={activeSlot}
          onContinue={() => setScreen('draft')}
        />
      )}
      {screen === 'draft' && (
        <DraftScreen
          squad={squad}
          activeSlot={activeSlot}
          pool={pool}
          format={combo.format}
          mode={mode}
          onDraft={handleDraft}
        />
      )}
      {screen === 'sim' && result && <SimulationScreen result={result} onFinish={handleSimFinish} />}
      {screen === 'result' && result && (
        <ResultScreen squad={squad} result={result} badges={badges} mode={mode} onPlayAgain={handlePlayAgain} />
      )}
    </div>
  )
}
