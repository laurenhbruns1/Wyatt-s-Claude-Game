# Undefeated — Fortnite Roster Builder

Spin a region + chapter, draft a four-slot competitive Fortnite squad from
everyone eligible, and simulate a season to see if it runs the table.

Inspired by the "82-0" NBA roster-builder concept, reskinned for competitive
Fortnite (regions, chapters/eras).

## Data

Players in `src/data/players.json` are **real competitive Fortnite players**,
supplied chapter-by-chapter (Chapters 1-7 so far, 664 players) with real
stats for five categories: Fighting, Aim, Mechanics, Smarts, Clutch.

A few things about this data that are worth knowing:

- **Region names are normalized** to the game's 7-region list (`NA Central`,
  `NA West`, `Europe`, `Oceania`, `Brazil`, `Middle East`, `Asia`) — e.g. the
  source data's `NAE/NAC` becomes `NA Central`.
- **Org/team affiliation isn't included** in the source data, so `org` is
  blank for every player — the org-synergy bonus simply won't trigger until
  orgs are added.
- **Each player is locked to exactly one slot**, whichever of their stats
  is highest: Fighting → Fragger, Aim → Rotator, Mechanics → Builder/Editor,
  Smarts → IGL (see `computeNaturalRole` in `src/utils/fit.js`). This is a
  hard lock, not a soft preference. **Clutch does not drive role
  assignment** — it's purely a tournament-sim stat (comeback mechanic), not
  a route into Fragger. **An "elite overall" tier overrides this**: a
  player whose average of Fighting/Aim/Mechanics/Smarts is 86.5+ locks to
  Fragger outright, regardless of which single stat is technically highest
  (e.g. Chapter 1 Bugha, whose Smarts barely edges Fighting but who's
  clearly an elite fight-winner at that level) — currently 14 players clear
  this bar.
- A **handful of players carry a manual role override** (`role_assigned:
  true`, shown as "(assigned)" on their card) instead of their stat-derived
  role — some regions had zero players whose own stats locked to a given
  slot (e.g. Chapter 1 Brazil had no Builder at all), so a real player
  already in that region was hand-picked (favoring lower/mid stats, so it
  isn't a free power boost) to fill the gap. See
  `scripts/assign-role-overrides.mjs` to add more.
- A player can be **eligible in more than one region within the same
  chapter** under the same `player_id` (e.g. a Chapter 1 player who
  competed in both NA Central and Europe) — Ultimate mode de-dupes these
  down to one card. A player who reappears in a **later chapter** is kept
  as a separate card, though (e.g. Chapter 1 Bugha and Chapter 2 Bugha are
  two different draftable versions with different stats, not a duplicate)
  — de-dupe keys on `player_id` + `chapter` together, never `player_id`
  alone. Each row's `id` is `player_id__region__chapter`, so the same real
  person can safely reappear across chapters without colliding.
- **The squad has no Coach slot** — just Fragger, IGL, Builder/Editor,
  Rotator. There's no Build/Zero Build split either — one stat profile per
  player.

**Every mode re-spins the region/chapter before every single pick** — a
squad can (and usually will) end up drawn from several different regions.
The two draft flows differ in what "showing the pool" means, though.
In Classic, Blind, Daily, and Ultimate: each spin's pool shows everyone
eligible at once, mixed roles and all — click anyone and they lock into
whichever slot their best stat fits, crossing them off (and greying out
anyone else who locked to that now-filled slot); once you pick, it re-spins
fresh for whatever's still open, until all 4 slots are filled, regardless
of pick order. **In every mode where stats are visible** (Classic, Daily,
Ultimate), the still-pickable cards are also sorted best-first (by average
of the 5 stats) — Blind Draft keeps its shuffled order instead, since
revealing skill through list position would defeat the whole "no stats"
premise. **Rotation mode works differently on purpose**: it walks
the 4 slots in a fixed order (still re-spinning before each one) and keeps
the older flexible fit system (any player, any slot, but a natural-fit pick
is locked out and an off-role pick takes a stat penalty), since its whole
premise is drafting off-role — the hard lock elsewhere would make that
impossible.

**Every draft screen, in every mode, has a name-search box** above the pool
(`PlayerSearchInput`) so you can jump straight to a player by typing instead
of scanning the whole grid — it's a plain substring match against the
player's name and works fine in Blind Draft too, since Blind only hides
stats, not names. In Ultimate it stacks with the Region/Position/Chapter
dropdowns rather than replacing them.

**The spin only offers chapters that actually have players loaded** (see
`AVAILABLE_CHAPTERS` in `src/utils/draftPool.js`) — Chapters 1-7 right now.
This opens up automatically as more chapters are imported; no need to
toggle anything by hand.

To add another chapter's players, save a CSV with columns
`Player ID,Player,Chapter,Region,Fighting,Aim,Mechanics,Smarts,Clutch` and run:

```
node scripts/import-real-players.mjs path/to/chapterN.csv
```

It's additive and safe to re-run — existing player IDs are left untouched,
only new rows get appended.

## Modes

- **Classic** — full stats visible while drafting
- **Blind Draft** — only names shown, no stats; the result screen has a
  "Reveal Best Picks" button afterward, showing each pick's full stats
  next to whoever was actually the best-stat player locked to that same
  slot in the exact pool you saw at the time
- **Rotation** — every slot must be filled by an off-role player
- **Daily Challenge** — same seeded spin/pool (or 4 seeded spins, in Rotation) for everyone that day
- **Ultimate/All-Time** — draft across every region and chapter; Region/Position/Chapter
  dropdown filters narrow the pool while browsing (the only mode that has them,
  since it's the only one with a pool big enough to need it). Since the same
  player can show up multiple times here (a different card per chapter, e.g.
  Chapter 1 Bugha vs. Chapter 5 Bugha), each card's subtitle also shows which
  chapter it's from — the only mode where that's shown, since every other
  mode is already scoped to one chapter per spin

## Tech

React + Tailwind CSS (v4, via `@tailwindcss/vite`), Vite, client-side only
(localStorage for best-record + Daily Challenge history — no backend).

## Development

```
npm install
npm run dev      # start dev server
npm run build    # production build
npm run lint     # oxlint
```
