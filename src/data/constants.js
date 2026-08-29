export const REGIONS = [
  'NA West',
  'NA Central',
  'Europe',
  'Oceania',
  'Brazil',
  'Middle East',
  'Asia',
]

export const CHAPTERS = [
  'Chapter 1',
  'Chapter 2',
  'Chapter 3',
  'Chapter 4',
  'Chapter 5',
  'Chapter 6',
  'Chapter 7',
]

export const FORMATS = [
  { id: 'build', label: 'Build' },
  { id: 'zero_build', label: 'Zero Build' },
]

// Fixed squad slots, in draft order. `statKey` = which format_stats block key
// matters most for the slot; used by the fit-penalty + sim weighting.
export const SLOTS = [
  {
    id: 'fragger',
    label: 'Fragger',
    blurb: 'Primary elims / fight-winning',
    primaryStats: ['fighting', 'aim'],
  },
  {
    id: 'igl',
    label: 'IGL',
    blurb: 'Shotcalling / decision-making',
    primaryStats: ['smarts', 'clutch'],
  },
  {
    id: 'builder',
    label: 'Builder/Editor',
    blurb: 'Mechanical building & editing',
    primaryStats: ['mechanics', 'aim'],
  },
  {
    id: 'rotator',
    label: 'Rotator',
    blurb: 'Positioning & survival',
    primaryStats: ['smarts', 'mechanics'],
  },
]

export const ROLE_LABELS = {
  fragger: 'Fragger',
  igl: 'IGL',
  builder: 'Builder/Editor',
  rotator: 'Rotator',
}

export const PLAYSTYLES = [
  {
    id: 'aggro',
    label: 'Aggro',
    blurb: 'Rewards elims/fights, punishes low placement consistency',
    weights: { fighting: 1.4, aim: 1.2, clutch: 1.15, mechanics: 0.9, smarts: 0.7 },
  },
  {
    id: 'placement',
    label: 'Placement/Rotation',
    blurb: 'Rewards survival & positioning, punishes low fight stats',
    weights: { smarts: 1.35, clutch: 1.0, mechanics: 1.0, aim: 0.75, fighting: 0.65 },
  },
  {
    id: 'build_battle',
    label: 'Build Battle',
    blurb: 'Rewards mechanical/editing skill, punishes low material efficiency',
    weights: { mechanics: 1.45, aim: 1.15, clutch: 1.0, smarts: 0.85, fighting: 0.85 },
  },
  {
    id: 'balanced',
    label: 'Balanced',
    blurb: 'Even weighting across the board',
    weights: { fighting: 1.0, aim: 1.0, mechanics: 1.0, smarts: 1.0, clutch: 1.0 },
  },
]

export const MODES = [
  {
    id: 'classic',
    label: 'Classic',
    blurb: 'Full stats visible while drafting',
  },
  {
    id: 'blind',
    label: 'Blind Draft',
    blurb: 'Only player names shown — no stats, pure knowledge/gut test',
  },
  {
    id: 'rotation',
    label: 'Rotation',
    blurb: 'Every slot must be filled by an off-role player — hardest mode',
  },
  {
    id: 'daily',
    label: 'Daily Challenge',
    blurb: 'Same seeded region/chapter/format/players for everyone today',
  },
  {
    id: 'ultimate',
    label: 'Ultimate/All-Time',
    blurb: 'No region/chapter restriction — draft across everything',
  },
]

export const STAT_LABELS = {
  fighting: 'Fighting',
  aim: 'Aim',
  mechanics: 'Mechanics',
  smarts: 'Smarts',
  clutch: 'Clutch',
}

export const RIVAL_ORG_PAIRS = [
  ['Voidbound', 'Ironclad Union'],
  ['Nightfall Six', 'Solstice Prime'],
  ['Rustline', 'Aurelia Rift'],
]

export const TOURNAMENTS_PER_SEASON = 16

// Flavor-only "competitiveness" modifier per region (higher = tougher
// opposition, harder to stay undefeated). Not modeling anything real.
export const REGION_STRENGTH = {
  Europe: 1.0,
  'NA Central': 0.9,
  Asia: 0.7,
  'NA West': 0.6,
  Brazil: 0.4,
  Oceania: 0.2,
  'Middle East': 0.1,
}

// Role adjacency used for the yellow-tier fit indicator (a role "close to"
// the open slot takes a smaller penalty than a totally unrelated one).
export const ROLE_ADJACENCY = {
  fragger: ['builder', 'igl'],
  igl: ['rotator', 'fragger'],
  builder: ['fragger', 'rotator'],
  rotator: ['igl', 'builder'],
}

export const TOURNAMENT_NAMES = [
  'Open Qualifier', 'Cash Cup', 'Regional Clash', 'Community Cup', 'Duo Trials',
  'Winter Invitational', 'Champion Series — Heat', 'Champion Series — Semis',
  'Champion Series — Finals', 'Elite Series', 'Blitz Cash Cup', 'All-Star Showdown',
  'Circuit Finals', 'Proving Grounds', 'Title Series', 'Grand Royale',
]

export const FIT_LEVELS = {
  green: { penalty: 1, label: 'Natural Fit' },
  yellow: { penalty: 0.75, label: 'Adjacent Fit' },
  red: { penalty: 0.6, label: 'Poor Fit' },
}
