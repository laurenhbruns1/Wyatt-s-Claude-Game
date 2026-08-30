import { useMemo, useState } from 'react'
import HomeScreen from './components/HomeScreen'
import SpinScreen from './components/SpinScreen'
import DraftScreen from './components/DraftScreen'
import FreeDraftScreen from './components/FreeDraftScreen'
import SimulationScreen from './components/SimulationScreen'
import ResultScreen from './components/ResultScreen'
import { MODES, PLAYSTYLES, REGIONS, SLOTS } from './data/constants'
import {
  AVAILABLE_CHAPTERS,
  dailyPool,
  excludeDrafted,
  poolFor,
  spinCombo,
  spinComboChapterLocked,
  spinComboForDaily,
  spinComboRegionLocked,
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

function remainingRoles(squadSoFar) {
  return SLOTS.filter((slot) => !squadSoFar[slot.id]).map((slot) => slot.id)
}

/** A spin only needs to let you make ONE more pick — not every remaining
 * role at once, since it re-spins again right after. Requiring full
 * coverage was heavily biasing every draft toward whichever region
 * happens to have all 4 roles (most don't — many regions/chapters are
 * missing a role entirely, e.g. no drafted Chapter 1 Oceania player locks
 * to Builder), since a small region almost never has all 4 by chance. */
function poolHasAnyNeededRole(pool, roleIds) {
  return pool.some((p) => roleIds.includes(p.role_tags[0]))
}

/** Every other mode: re-spins before every pick too, same as Rotation, but
 * shows everyone eligible from that spin at once (mixed roles) instead of
 * one role at a time — each pick locks into its own slot, and the next
 * spin only needs to offer at least one of whichever roles are still
 * open, not necessarily all of them. `locks` carries the user-chosen
 * region/chapter for Region Lock/Chapter Lock mode. */
function rollWholeDraft(mode, squadSoFar, locks = {}) {
  const pickIndex = Object.keys(squadSoFar).length
  const needed = remainingRoles(squadSoFar)
  let combo
  let pool
  for (let attempt = 0; attempt < MAX_SPIN_ATTEMPTS; attempt++) {
    if (mode === 'ultimate') {
      combo = { region: null, chapter: null }
      pool = poolFor({ ultimate: true })
    } else if (mode === 'daily') {
      const seedSlot = pickIndex + attempt * 100
      combo = spinComboForDaily(seedSlot)
      pool = dailyPool(combo, seedSlot)
    } else if (mode === 'region_lock') {
      combo = spinComboRegionLocked(locks.region)
      pool = poolFor(combo)
    } else if (mode === 'chapter_lock') {
      combo = spinComboChapterLocked(locks.chapter)
      pool = poolFor(combo)
    } else {
      combo = spinCombo()
      pool = poolFor(combo)
    }
    pool = excludeDrafted(pool, squadSoFar)
    if (poolHasAnyNeededRole(pool, needed)) break
  }
  return { combo, pool }
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [mode, setMode] = useState('classic')
  const [playstyle, setPlaystyle] = useState('balanced')
  // Region Lock / Chapter Lock only: the one thing the player picks up
  // front before the draft starts re-spinning everything else.
  const [lockedRegion, setLockedRegion] = useState(REGIONS[0])
  const [lockedChapter, setLockedChapter] = useState(AVAILABLE_CHAPTERS[0])

  const [combo, setCombo] = useState(null)
  const [pool, setPool] = useState([])
  const [squad, setSquad] = useState({})
  const [activeSlotIndex, setActiveSlotIndex] = useState(0)
  const [spinKey, setSpinKey] = useState(0)
  const [result, setResult] = useState(null)
  const [badges, setBadges] = useState([])
  // Blind Draft only: one entry per pick, capturing exactly the pool that
  // was on screen at that moment (before stats were ever shown) — lets the
  // result screen reveal what you picked vs. who was actually the best
  // available option for that slot, after the fact.
  const [blindLog, setBlindLog] = useState([])

  const [bestRecord, setBestRecord] = useLocalStorage('undefeated:bestRecord', null)
  const [dailyHistory, setDailyHistory] = useLocalStorage('undefeated:dailyHistory', {})

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const dailyDone = dailyHistory[todayKey] || null

  const rotation = mode === 'rotation'
  const activeSlot = SLOTS[activeSlotIndex]
  const playstyleDef = PLAYSTYLES.find((p) => p.id === playstyle)
  const locks = { region: lockedRegion, chapter: lockedChapter }

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
    setBlindLog([])
    setActiveSlotIndex(0)
    setSpinKey((k) => k + 1)
    if (rotation) {
      const { combo: nextCombo, pool: nextPool } = rollForRotationSlot(mode, 0, SLOTS[0], {})
      setCombo(nextCombo)
      setPool(nextPool)
    } else {
      const { combo: nextCombo, pool: nextPool } = rollWholeDraft(mode, {}, locks)
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
        setSpinKey((k) => k + 1)
        setScreen('spin')
        return
      }
      finishDraft(nextSquad)
      return
    }

    // Free-pick modes: the player locks into whichever slot their best
    // stat matches — the UI only lets you click one when that slot is open.
    // Every pick re-spins the region/chapter for whatever's left to draft —
    // except Ultimate, whose "spin" never actually changes (always every
    // region/chapter at once), so re-showing it would just be a pointless
    // extra click and would reset the region/position/chapter filters.
    const role = player.role_tags[0]
    if (squad[role]) return
    if (mode === 'blind') {
      setBlindLog((log) => [...log, { role, picked: player, pool }])
    }
    const nextSquad = { ...squad, [role]: player }
    if (Object.keys(nextSquad).length < SLOTS.length) {
      const { combo: nextCombo, pool: nextPool } = rollWholeDraft(mode, nextSquad, locks)
      setSquad(nextSquad)
      setCombo(nextCombo)
      setPool(nextPool)
      if (mode === 'ultimate') return
      setSpinKey((k) => k + 1)
      setScreen('spin')
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
          lockedRegion={lockedRegion}
          setLockedRegion={setLockedRegion}
          lockedChapter={lockedChapter}
          setLockedChapter={setLockedChapter}
          onStart={handleStart}
          bestRecord={bestRecord}
          dailyDone={dailyDone}
        />
      )}
      {screen === 'spin' && combo && (
        <SpinScreen
          key={spinKey}
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
        <ResultScreen
          squad={squad}
          result={result}
          badges={badges}
          mode={mode}
          blindLog={blindLog}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  )
}
