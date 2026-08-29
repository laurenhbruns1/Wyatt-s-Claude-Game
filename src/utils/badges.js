export const BADGE_DEFS = {
  perfect_season: { label: 'Perfect Season', blurb: 'Finished the season with zero losses.' },
  closest_call: { label: 'Closest Call', blurb: 'Lost a tournament by the slimmest of margins.' },
  region_sweep: { label: 'Region Sweep', blurb: 'All four picks came from the same region.' },
  chapter_purist: { label: 'Chapter Purist', blurb: 'All four picks debuted the same chapter.' },
  rotation_survivor: {
    label: 'Rotation Survivor',
    blurb: 'Finished Rotation mode — an all-off-role squad — without a loss.',
  },
}

export function computeBadges({ squad, result, mode }) {
  const players = Object.values(squad).filter(Boolean)
  const badges = []

  if (result.record.losses === 0) badges.push('perfect_season')
  if (result.closestLoss && Math.abs(result.closestLoss.margin) < 2) badges.push('closest_call')
  if (players.length === 4 && players.every((p) => p.region === players[0].region)) {
    badges.push('region_sweep')
  }
  if (players.length === 4 && players.every((p) => p.chapter === players[0].chapter)) {
    badges.push('chapter_purist')
  }
  if (mode === 'rotation' && result.record.losses === 0) badges.push('rotation_survivor')

  return badges
}
