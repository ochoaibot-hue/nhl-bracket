# NHL Bracket App — Data Schemas
> Based on live api-web.nhle.com/v1 response fields (2026-04-25)

---

## TypeScript Interfaces

```typescript
// Normalized team — merges fields from standings + bracket + game responses
interface Team {
  id: number                    // NHL team ID (e.g., 7 = BUF, 6 = BOS)
  abbrev: string                // e.g., "BUF" — plain string everywhere except standings.teamAbbrev
  name: string                  // Full name: "Buffalo Sabres"
  commonName: string            // Short name: "Sabres"
  placeName: string             // City: "Buffalo"
  logo: string                  // https://assets.nhle.com/logos/nhl/svg/BUF_light.svg
  darkLogo: string              // https://assets.nhle.com/logos/nhl/svg/BUF_dark.svg
  // Playoff context
  seed: number                  // topSeedRank or bottomSeedRank from bracket
  seedAbbrev: string            // "D1", "WC1", etc.
  conference: string            // "Eastern" | "Western"
  division: string              // "Atlantic", "Metropolitan", "Central", "Pacific"
  // Standings (from /standings/now)
  regularSeasonPoints: number
  wins: number
  losses: number
  otLosses: number
  regulationWins: number
  regulationPlusOtWins: number
  goalDifferential: number
  goalFor: number
  goalAgainst: number
  conferenceSequence: number    // rank within conference
  divisionSequence: number      // rank within division
  wildcardSequence: number      // 0 = not wildcard; 1 or 2 = wildcard spot
  clinchIndicator: string | null // "x", "y", "z", or null
}

// A single playoff series (from /playoff-bracket/{year})
interface Series {
  seriesLetter: string          // "A"–"O"
  seriesTitle: string           // "1st Round", "2nd Round", "Eastern Final", "Stanley Cup Final"
  seriesAbbrev: string          // "R1", "R2", "CF", "SCF"
  seriesUrl: string             // relative: "/schedule/playoff-series/2026/series-a/..."
  playoffRound: number          // 1, 2, 3, 4
  topSeedTeam: Team
  bottomSeedTeam: Team
  topSeedRank: number
  topSeedRankAbbrev: string     // "D1", "D2", "D3", "WC1", "WC2"
  bottomSeedRank: number
  bottomSeedRankAbbrev: string
  topSeedWins: number
  bottomSeedWins: number
  neededToWin: 4
  status: 'upcoming' | 'active' | 'complete'
  winner: Team | null           // inferred: topSeedTeam if topSeedWins==4, else bottomSeedTeam if bottomSeedWins==4
  games: Game[]
}

// A single playoff game (from /score/now or /schedule/now)
interface Game {
  id: number                    // e.g., 2025030134 = season 2025, type 03, game 0134
  season: number                // 20252026
  gameType: 3                   // always 3 for playoffs
  gameDate: string              // "2026-04-25"
  startTimeUTC: string          // "2026-04-25T19:00:00Z"
  easternUTCOffset: string      // "-04:00"
  venueTimezone: string         // "America/New_York"
  venue: string                 // "Canadian Tire Centre"
  homeTeam: GameTeam
  awayTeam: GameTeam
  gameState: 'FUT' | 'PRE' | 'LIVE' | 'CRIT' | 'FINAL' | 'OFF'
  gameScheduleState: string
  period: number | null
  periodDescriptor: PeriodDescriptor | null
  clock: GameClock | null
  gameOutcome: { lastPeriodType: 'REG' | 'OT' | 'SO' } | null
  tvBroadcasts: Broadcast[]
  seriesStatus: SeriesStatus | null
  gameCenterLink: string
  seriesUrl: string
  seriesGameNumber: number      // from seriesStatus.gameNumberOfSeries
}

// Team context within a game (lighter than full Team)
interface GameTeam {
  id: number
  abbrev: string
  name: { default: string; fr?: string }
  score: number
  sog: number                   // shots on goal (score endpoint only)
  logo: string
}

interface PeriodDescriptor {
  number: number
  periodType: 'REG' | 'OT' | 'SO'
  maxRegulationPeriods: 3
}

interface GameClock {
  timeRemaining: string         // "14:32"
  secondsRemaining: number
  running: boolean
  inIntermission: boolean
}

interface Broadcast {
  id: number
  market: 'N' | 'H' | 'A'      // National / Home / Away
  countryCode: string
  network: string               // "TBS", "ESPN", "Sportsnet"
  sequenceNumber: number
}

interface SeriesStatus {
  round: number
  seriesAbbrev: string
  seriesTitle: string
  seriesLetter: string
  neededToWin: 4
  topSeedTeamAbbrev: string
  topSeedWins: number
  bottomSeedTeamAbbrev: string
  bottomSeedWins: number
  gameNumberOfSeries: number
}

// Full bracket organized by round
interface BracketRound {
  roundNumber: number           // 1–4
  roundName: string             // "1st Round", "2nd Round", "Conference Finals", "Stanley Cup Final"
  series: Series[]
}

// Snapshot of standings at poll time (from /standings/now)
interface StandingsSnapshot {
  fetchedAt: string             // ISO timestamp
  standingsDateTimeUtc: string  // from API
  teams: StandingsEntry[]
}

interface StandingsEntry {
  teamId: number
  teamAbbrev: string            // normalized from {default: "COL"}
  teamName: string
  teamCommonName: string
  teamLogo: string
  conferenceName: string
  divisionName: string
  points: number
  wins: number
  losses: number
  otLosses: number
  regulationWins: number
  regulationPlusOtWins: number
  goalDifferential: number
  goalFor: number
  goalAgainst: number
  gamesPlayed: number
  conferenceSequence: number
  divisionSequence: number
  wildcardSequence: number
  leagueSequence: number
  clinchIndicator: string | null
  streakCode: string            // "W" | "L" | "OT"
  streakCount: number
}

// Matchup analysis / contender ranking
interface MatchupInsight {
  teamId: number
  teamAbbrev: string
  rank: number
  score: number                 // composite 0–100
  factors: RankingFactors
  explanation: string
  currentRound: number
  seriesLetter: string | null
}

interface RankingFactors {
  seed: number                  // lower is better; playoff seed 1–8
  points: number                // regular season points
  regulationWins: number
  goalDifferential: number
  seriesWins: number            // wins in current series (0–3)
  currentRound: number          // 1=R1, 2=R2, 3=CF, 4=SCF
  recentResult: 1 | 0 | -1     // 1=won last game, -1=lost last game, 0=unknown
}
```

---

## Ranking Formula

Composite score out of 100 for each active playoff team.

```
score = (
  (8 - seed + 1) / 8        * 0.25   // seed: lower seed = higher weight
  + (points / 130)           * 0.25   // reg season points, cap at 130
  + (regulationWins / 55)    * 0.15   // reg wins, cap at 55
  + clamp(goalDiff, -50, 100) / 100  * 0.10   // goal diff contribution
  + (seriesWins / 3)         * 0.15   // series momentum
  + (currentRound - 1) / 3   * 0.05   // survival bonus
  + recentResult             * 0.05   // last game result momentum
) * 100
```

**Weights**:
| Factor | Weight | Rationale |
|--------|--------|-----------|
| Playoff seed (inverted) | 25% | Best predictor of regular season dominance |
| Regular season points | 25% | Overall quality |
| Regulation wins | 15% | Winning without needing extra time |
| Goal differential | 10% | Scoring depth and defensive strength |
| Current series wins | 15% | Live playoff momentum |
| Round survival bonus | 5% | Being further along matters |
| Recent result | 5% | Hot/cold streak momentum |

---

## Current Contender Rankings (as of 2026-04-25, R1)

Based on live bracket data:

| Rank | Team | Notes |
|------|------|-------|
| 1 | **CAR** | Swept OTT 4-0; highest momentum, already in R2 |
| 2 | **COL** | 3-0 vs LAK; top seed in Western conference |
| 3 | **PHI** | 3-0 vs PIT; massive upset of PIT, huge momentum |
| 4 | **MTL** | 2-1 vs TBL; strong underdog performance |
| 5 | **ANA** | 2-1 vs EDM; another upset in progress |
| 6 | **UTA** | 2-1 vs VGK |
| 7 | **BUF** | 2-1 vs BOS |
| 8 | **DAL** | 2-1 vs MIN |

---

## QA Checklist

- `teamAbbrev` from standings endpoint is `{default: "COL"}` — always extract `.default`
- TBD teams: `id === -1` — must be handled in rendering (show "TBD" placeholder)
- Series winner: no explicit field — infer from `topSeedWins === 4` or `bottomSeedWins === 4`
- `gameState === "CRIT"` means closing minutes of a final period — treat as LIVE for UI
- `gameType === 3` filter required on all game lists to exclude pre/reg season games
- Logo URLs may include `?season=20252026` query string — strip before caching
- `score` field on `GameTeam` is `0` for future games, not `null` — check `gameState` for FUT
- Standings `teamAbbrev.default` — always parse as object, never assume string
- `clinchIndicator: null` is valid (unclinched) — do not display indicator badge
- `periodType: "OT"` can repeat for multiple OT periods — `number` field differentiates them
- `seriesStatus.gameNumberOfSeries` starts at 1 (Game 1, Game 2, etc.)
- `wildcardSequence > 0` means the team entered as a wildcard — relevant for bracket display
