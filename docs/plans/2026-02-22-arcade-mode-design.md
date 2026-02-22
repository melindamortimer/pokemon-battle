# Arcade Mode Design

## Overview

A second game mode unlocked when the first player reaches 100 wins. Arcade mode adds a multiplier-based scoring system on top of base stat totals, rewarding type synergies, Pokemon relationships, strategic team building, and cross-team matchups.

Includes a "season stashing" system to archive completed battle runs and start fresh.

## Unlock & Toggle

- **Unlock trigger**: First player reaches 100 wins (century milestone). The Arcade toggle appears permanently after unlock.
- **Toggle location**: Top-right corner, retro arcade aesthetic. Persisted to `localStorage` key `arcadeMode`.
- **Scope**: Global toggle — when on, both teams use Arcade scoring.
- **Visual indicator**: Neon-accented border glow on teams container, "ARCADE" badge next to title.

## Scoring Formula

```
arcadeScore = sum(pokemon.baseStats * pokemon.individualMultiplier * pokemon.matchupMultiplier) * teamMultiplier
```

Four multiplier layers, calculated at different phases:

| Layer | When Calculated | Visibility |
|-------|----------------|------------|
| Individual bonuses | As each Pokemon is added | Live display |
| Team-wide bonuses | When team reaches 6 | Live display |
| Cross-team matchups | Both teams full | Revealed at battle conclusion |
| Stat duels | Both teams full | Revealed at battle conclusion |

All multipliers stack multiplicatively starting from 1.0x.

## Layer 1: Individual Pokemon Multipliers

Applied to a specific Pokemon's base stats as it's added to the team.

| Bonus | Multiplier | Condition |
|-------|-----------|-----------|
| STAB Specialist | 1.10x | Pokemon's highest stat aligns with its type theme (Fire + high ATK, Water + high SP.ATK, etc.) |
| Underdog Spirit | 1.20x | Base stat total < 300 |
| Stat Spike | 1.10x | Any single stat > 150 |
| Evolved Form | 1.05x | Final evolution of a 3-stage line |
| Baby Pokemon | 1.15x | Baby/first-stage Pokemon (Pichu, Togepi, etc.) |
| Powerhouse | 1.05x | Base stat total > 580 |
| Type Chain | 1.05x-1.15x | Shares a type with the previously added Pokemon. Consecutive chains increase: 2nd=1.05x, 3rd=1.08x, 4th=1.10x, 5th=1.12x, 6th=1.15x |

## Layer 2: Team-Wide Multipliers

Applied to the entire team's combined stats once all 6 Pokemon are added.

### Type Synergy

| Bonus | Multiplier | Condition |
|-------|-----------|-----------|
| Mono-Type Master | 1.30x | All 6 Pokemon share a type |
| Type Harmony | 1.15x | 4-5 Pokemon share a type |
| Dual Threat | 1.10x | Team has exactly 2 types represented |
| Rainbow Team | 1.15x | 6+ unique types across the team |
| Perfect Coverage | 1.20x | Team types cover all 18 types for super-effective hits |

### Pokemon Relationships

| Bonus | Multiplier | Condition |
|-------|-----------|-----------|
| Evolution Chain | 1.10x | A complete 3-stage evolution line on the team |
| Sibling Bond | 1.05x | A 2-stage evolution pair on the team |
| Rival Pair | 1.10x | Classic rival Pokemon together (Hitmonlee+Hitmonchan, Zangoose+Seviper, etc.) |
| Generation Pure | 1.15x | All 6 Pokemon from the same generation |
| Legendary Assembly | 1.10x | 3+ legendaries |

### Strategic Bonuses

| Bonus | Multiplier | Condition |
|-------|-----------|-----------|
| Glass Cannon | 1.15x | Team avg Attack > 120, avg Defense < 70 |
| Iron Wall | 1.15x | Team avg Defense > 120, avg Attack < 70 |
| Speed Demons | 1.10x | All 6 Pokemon have Speed > 80 |
| Underdog Army | 1.25x | All 6 Pokemon have base stat total < 400 |
| Heavyweight Division | 1.10x | All 6 Pokemon have base stat total > 500 |
| Stat Harmony | 1.10x | No stat category average differs by more than 20 |

## Layer 3: Cross-Team Matchup Bonuses

Calculated when both teams are full. Applied to individual Pokemon based on the opposing team.

### Type Effectiveness

| Bonus | Multiplier | Condition |
|-------|-----------|-----------|
| Type Slayer | 1.15x | Super-effective against 2+ opposing Pokemon |
| Hard Counter | 1.20x | Super-effective against 3+ opposing Pokemon |
| Type Wall | 1.10x | Resists 3+ opposing Pokemon's types |
| Lone Weakness | 1.10x | No opposing Pokemon has a super-effective type against this one |
| Shutdown | 1.15x | Completely walls an opponent (resist both their types, they can't hit super-effectively) |

### Rival Matchups

Bonus triggered when specific rival pairs face each other across teams:

| Rival Pair | Bonus |
|-----------|-------|
| Zangoose vs Seviper | 1.15x to both |
| Heatmor vs Durant | 1.15x to both |
| Pinsir vs Heracross | 1.10x to both |
| Throh vs Sawk | 1.10x to both |
| Hitmonlee vs Hitmonchan | 1.10x to both |
| Groudon vs Kyogre | 1.15x to both |
| Dialga vs Palkia | 1.15x to both |
| Reshiram vs Zekrom | 1.15x to both |
| Lugia vs Ho-Oh | 1.10x to both |
| Latias vs Latios | 1.10x to both |

### Evolution Dominance

| Bonus | Multiplier | Condition |
|-------|-----------|-----------|
| Evolution Flex | 1.10x | Your Pokemon is the evolved form of an opposing Pokemon (Charizard vs their Charmeleon) |
| Underdog Triumph | 1.25x | Your pre-evolution beats a higher stage from the same line on the other team |

## Layer 4: Stat Duels

Head-to-head stat comparisons across all 12 Pokemon.

| Bonus | Multiplier | Condition |
|-------|-----------|-----------|
| Stat Champion | 1.10x | Has the highest value for a specific stat (HP/ATK/DEF/SP.ATK/SP.DEF/SPE) across all 12 Pokemon |
| Stat Sweep | 1.15x | Beats its slot-matched opponent in 4+ of 6 individual stats |
| Ultimate Stat | 1.20x | Has the highest stat in 2+ categories across all 12 Pokemon |

## UI Design

### Live Bonus Display (During Team Building)

Below each Pokemon card, small tags show individual multipliers:

```
[Charizard - 534]
  +10% STAB Specialist  +5% Evolved Form
  Individual: 1.155x -> 617
```

Below team score, running "Arcade Bonuses" section:

```
Team Score: 2847
Arcade Bonuses:
  Type Harmony (4 Fire) - 1.15x
  Speed Demons - 1.10x
  Team Multiplier: 1.265x
```

### Battle Reveal (Both Teams Full)

1. Show base stat comparison (as today)
2. Animate cross-team matchup bonuses flashing in one by one
3. Team multipliers cascade in
4. Final Arcade score counter ticks up
5. Winner declared on Arcade score
6. "CRITICAL HIT!" effect if margin > 20%
7. "PERFECT!" if every Pokemon earned at least one bonus

### History Display

Arcade battles show an "ARCADE" badge in history. Expanded view shows multiplier breakdown. Saved data includes mode flag, all multipliers, and both base and arcade scores.

## Data Model Changes

### Pokemon Types Persisted

`getTeamData()` must capture types alongside name/score/sprite:

```js
pokemon: [
    { name: "Charizard", score: 534, sprite: "...", types: ["fire", "flying"] }
]
```

### Arcade Battle Data

Arcade battles add to the existing history entry:

```js
{
    // ...existing fields...
    arcadeMode: true,
    arcadeScores: {
        team1: {
            baseTotal: 2847,
            teamMultiplier: 1.265,
            arcadeTotal: 3601,
            bonuses: [
                { name: "Type Harmony", multiplier: 1.15, scope: "team" },
                { name: "Speed Demons", multiplier: 1.10, scope: "team" }
            ],
            pokemonBonuses: [
                { pokemon: "Charizard", bonuses: [...], individualMultiplier: 1.155 }
            ]
        },
        team2: { /* same structure */ }
    }
}
```

## Season Stashing System

### Stash Action

"Stash Season" button in history section (near Import/Export). Prompts for season name (default: "Season 1", "Season 2", etc.).

### What Gets Stashed

The entire `battleHistory` array moves to `archivedSeasons` in localStorage. Active `battleHistory` resets to empty. Win tally, GOAT/WOAT, graph — all reset.

### Storage Structure

```js
// localStorage key: 'archivedSeasons'
[
    {
        id: 1,
        name: "Season 1",
        summary: "100-88",
        endDate: "2026-02-22",
        history: [ ...all battle entries... ]
    }
]
```

### Loading a Season

Dropdown/list shows archived seasons as collapsed cards with name, summary, date range. "Load" button swaps it back into active `battleHistory` (stashes current if non-empty).

### No Cross-Season Rankings

Each season's GOAT/WOAT is self-contained. No all-time cross-season stats.

## Technical Approach

- **Architecture**: All Arcade logic in `script.js` (matches existing single-file pattern)
- **Core function**: `calculateArcadeMultipliers(team, opposingTeam)` returns full breakdown
- **Type chart**: Hardcoded 18x18 effectiveness matrix for matchup calculations
- **Stat access**: Individual stats (HP/ATK/DEF/SP.ATK/SP.DEF/SPE) already fetched by `fetchPokemon()` — need to pass them through to Arcade engine
- **Toggle state**: `localStorage.getItem('arcadeMode')` checked at battle time
- **Season storage**: Separate `localStorage` key `archivedSeasons`
