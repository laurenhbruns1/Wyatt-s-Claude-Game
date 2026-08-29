import { useMemo, useState } from 'react'
import HomeScreen from './components/HomeScreen'
import SpinScreen from './components/SpinScreen'
import DraftScreen from './components/DraftScreen'
import FreeDraftScreen from './components/FreeDraftScreen'
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

/** Rotation mode only: re-spins before every one of the 4 slots (walked in
 * a fixed order) and needs an off-role pick each time — a spin landing on
 * an empty pool retries (deterministically, for Daily) instead of
 * dead-ending the draft. */
function rollForRotationSlot(mode, slotIndex, slot, squadSoFar) {
  let combo
  let pool
  for (let attempt = 0; attempt < MAX_SPIN_ATTEMPTS; attempt++) {
    if (mode === 'daily') {
      const seedSlot = slotIndex + attempt * 100
      combo = spinComboForDaily(seedSlot)
      pool = dailyPool(combo, seedSlot)
    } else {
      combo = spinCombo()
      pool = poolFor(combo)
    }
    pool = excludeDrafted(pool, squadSoFar)
    if (pool.length > 0) break
  }
  return { combo, pool }
}

function hasAllRoles(pool) {
  const roles = new Set(pool.map((p) => p.role_tags[0]))
  return SLOTS.every((slot) => roles.has(slot.id))
}

/** Every other mode: one spin covers the whole draft. Everyone eligible is
 * shown at once and each pick locks into its own slot, so the spin must
 * land on a pool that has at least one player for every one of the 4
 * roles — retry (deterministically, for Daily) otherwise. */
function rollWholeDraft(mode) {
  let combo
  let pool
  for (let attempt = 0; attempt < MAX_SPIN_ATTEMPTS; attempt++) {
    if (mode === 'ultimate') {
      combo = { region: null, chapter: null }
      pool = poolFor({ ultimate: true })
    } else if (mode === 'daily') {
      combo = spinComboForDaily(attempt)
      pool = dailyPool(combo, attempt)
    } else {
      combo = spinCombo()
      pool = poolFor(combo)
    }
    if (hasAllRoles(pool)) break
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

  const rotation = mode === 'rotation'
  const activeSlot = SLOTS[activeSlotIndex]
  const playstyleDef = PLAYSTYLES.find((p) => p.id === playstyle)

  function finishDraft(nextSquad) {
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

  function handleStart() {
    setSquad({})
    setResult(null)
    setBadges([])
    setActiveSlotIndex(0)
    if (rotation) {
      const { combo: nextCombo, pool: nextPool } = rollForRotationSlot(mode, 0, SLOTS[0], {})
      setCombo(nextCombo)
      setPool(nextPool)
    } else {
      const { combo: nextCombo, pool: nextPool } = rollWholeDraft(mode)
      setCombo(nextCombo)
      setPool(nextPool)
    }
    setScreen('spin')
  }

  function handleDraft(player) {
    if (rotation) {
      const nextSquad = { ...squad, [activeSlot.id]: player }
      if (activeSlotIndex + 1 < SLOTS.length) {
        const nextIndex = activeSlotIndex + 1
        const { combo: nextCombo, pool: nextPool } = rollForRotationSlot(mode, nextIndex, SLOTS[nextIndex], nextSquad)
        setSquad(nextSquad)
        setCombo(nextCombo)
        setPool(nextPool)
        setActiveSlotIndex(nextIndex)
        setScreen('spin')
        return
      }
      finishDraft(nextSquad)
      return
    }

    // Free-pick modes: the player locks into whichever slot their best
    // stat matches — the UI only lets you click one when that slot is open.
    const role = player.role_tags[0]
    if (squad[role]) return
    const nextSquad = { ...squad, [role]: player }
    if (Object.keys(nextSquad).length < SLOTS.length) {
      setSquad(nextSquad)
      return
    }
    finishDraft(nextSquad)
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
          activeSlot={rotation ? activeSlot : null}
          onContinue={() => setScreen('draft')}
        />
      )}
      {screen === 'draft' && rotation && (
        <DraftScreen squad={squad} activeSlot={activeSlot} pool={pool} onDraft={handleDraft} />
      )}
      {screen === 'draft' && !rotation && (
        <FreeDraftScreen squad={squad} pool={pool} mode={mode} onDraft={handleDraft} />
      )}
      {screen === 'sim' && result && <SimulationScreen result={result} onFinish={handleSimFinish} />}
      {screen === 'result' && result && (
        <ResultScreen squad={squad} result={result} badges={badges} mode={mode} onPlayAgain={handlePlayAgain} />
      )}
    </div>
  )
}
