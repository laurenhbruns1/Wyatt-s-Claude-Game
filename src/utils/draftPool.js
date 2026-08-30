import players from '../data/players.json'
import { CHAPTERS, REGIONS } from '../data/constants'
import { pickWith } from './random'

/** Only spin for chapters that actually have real players loaded — keeps
 * this in sync with players.json automatically as more chapters are
 * imported, no manual toggling needed. Falls back to the full list if
 * somehow nothing has data yet, rather than leaving the game unplayable. */
export const AVAILABLE_CHAPTERS = CHAPTERS.filter((c) => players.some((p) => p.chapter === c))
const CHAPTER_POOL = AVAILABLE_CHAPTERS.length ? AVAILABLE_CHAPTERS : CHAPTERS

/** A spin result: region + chapter, drawn randomly (or seeded). */
export function spinCombo(rng = Math.random) {
  const roll = (arr) => arr[Math.floor(rng() * arr.length)]
  return {
    region: roll(REGIONS),
    chapter: roll(CHAPTER_POOL),
  }
}

/** Region Lock mode: the region is fixed by the player up front, only the
 * chapter re-spins every pick. */
export function spinComboRegionLocked(region, rng = Math.random) {
  return {
    region,
    chapter: CHAPTER_POOL[Math.floor(rng() * CHAPTER_POOL.length)],
  }
}

/** Chapter Lock mode: the chapter is fixed by the player up front, only the
 * region re-spins every pick. */
export function spinComboChapterLocked(chapter, rng = Math.random) {
  return {
    region: REGIONS[Math.floor(rng() * REGIONS.length)],
    chapter,
  }
}

/** Players eligible for a given region/chapter combo. */
export function poolFor({ region, chapter, ultimate = false }) {
  return ultimate ? dedupeByPlayerId(players) : players.filter((p) => p.region === region && p.chapter === chapter)
}

/** Ultimate mode pools every region AND chapter together. Collapse a player
 * who's eligible in multiple regions in the SAME chapter (same player_id +
 * chapter) down to one card — but keep different chapters of the same
 * player as separate cards, since their stats genuinely differ by era
 * (e.g. Chapter 1 Bugha vs. Chapter 2 Bugha are different draftable
 * versions, not duplicates). */
function dedupeByPlayerId(pool) {
  const seen = new Set()
  const out = []
  for (const p of pool) {
    const key = `${p.player_id ?? p.id}__${p.chapter}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(p)
  }
  return out
}

export function pickRandomPlayer(pool, rng = Math.random) {
  return pickWith(pool, rng)
}

/** Keeps a player from showing up twice across re-rolled slots. */
export function excludeDrafted(pool, squad) {
  const draftedIds = new Set(Object.values(squad).filter(Boolean).map((p) => p.player_id))
  return pool.filter((p) => !draftedIds.has(p.player_id))
}
