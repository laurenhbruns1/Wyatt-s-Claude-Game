import players from '../data/players.json'
import { CHAPTERS, REGIONS } from '../data/constants'
import { pickWith, weightedPickWith } from './random'

/** Only spin for chapters that actually have real players loaded — keeps
 * this in sync with players.json automatically as more chapters are
 * imported, no manual toggling needed. Falls back to the full list if
 * somehow nothing has data yet, rather than leaving the game unplayable. */
export const AVAILABLE_CHAPTERS = CHAPTERS.filter((c) => players.some((p) => p.chapter === c))
const CHAPTER_POOL = AVAILABLE_CHAPTERS.length ? AVAILABLE_CHAPTERS : CHAPTERS

/** How many players actually exist for one region+chapter combo — every
 * spin is weighted by this, so a stacked region/chapter (e.g. Chapter 7
 * NA Central/Europe, 30 players each) comes up roughly twice as often as
 * one with half the roster, instead of every combo being equally likely
 * regardless of how thin it is. */
function comboSize(region, chapter) {
  return players.filter((p) => p.region === region && p.chapter === chapter).length
}

/** A spin result: region + chapter, drawn randomly (or seeded), weighted by
 * how many players are actually in that exact region+chapter combo. */
export function spinCombo(rng = Math.random) {
  const combos = []
  for (const region of REGIONS) {
    for (const chapter of CHAPTER_POOL) {
      combos.push({ region, chapter })
    }
  }
  return weightedPickWith(combos, (c) => comboSize(c.region, c.chapter), rng)
}

/** Region Lock mode: the region is fixed by the player up front, only the
 * chapter re-spins every pick — weighted by how many players that chapter
 * actually has in this region (a chapter with zero players in this region
 * can never come up, instead of being picked and then discarded). */
export function spinComboRegionLocked(region, rng = Math.random) {
  return {
    region,
    chapter: weightedPickWith(CHAPTER_POOL, (chapter) => comboSize(region, chapter), rng),
  }
}

/** Chapter Lock mode: the chapter is fixed by the player up front, only the
 * region re-spins every pick — weighted by how many players that region
 * actually has in this chapter. */
export function spinComboChapterLocked(chapter, rng = Math.random) {
  return {
    region: weightedPickWith(REGIONS, (region) => comboSize(region, chapter), rng),
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
