import { useMemo, useState } from 'react'
import HomeScreen from './components/HomeScreen'
import SpinScreen from './components/SpinScreen'
import DraftScreen from './components/DraftScreen'
import SimulationScreen from './components/SimulationScreen'
import ResultScreen from './components/ResultScreen'
import { MODES, PLAYSTYLES, SLOTS } from './data/constants'
import { dailyPool, poolFor, spinCombo, spinComboForDaily, todaysSeed } from './utils/draftPool'
import { simulateSeason } from './utils/sim'
import { computeBadges } from './utils/badges'
import { useLocalStorage } from './hooks/useLocalStorage'

function isBetterRecord(next, prev) {
  if (!prev) return true
  if (next.losses !== prev.losses) return next.losses < prev.losses
  return next.wins > prev.wins
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
    let nextCombo
    let nextPool
    if (mode === 'ultimate') {
      nextCombo = { region: null, chapter: null, format: spinCombo().format }
      nextPool = poolFor({ format: nextCombo.format, ultimate: true })
    } else if (mode === 'daily') {
      nextCombo = spinComboForDaily()
      nextPool = dailyPool(nextCombo)
    } else {
      nextCombo = spinCombo()
      nextPool = poolFor(nextCombo)
    }
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
    const nextPool = pool.filter((p) => p.id !== player.id)
    setSquad(nextSquad)
    setPool(nextPool)

    if (activeSlotIndex + 1 < SLOTS.length) {
      setActiveSlotIndex(activeSlotIndex + 1)
      return
    }

    const seasonResult = simulateSeason({
      squad: nextSquad,
      format: combo.format,
      playstyle: playstyleDef,
      region: combo.region,
      mode,
      seed: mode === 'daily' ? todaysSeed() + 2 : undefined,
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
        <SpinScreen combo={combo} mode={mode} onContinue={() => setScreen('draft')} />
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
