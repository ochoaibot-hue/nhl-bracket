# NHL API Research Findings
> Fetched live from api-web.nhle.com/v1 on 2026-04-25

## Season ID Format

- **Year format**: `2026` (used in bracket URL: `/v1/playoff-bracket/2026`)
- **Season format**: `20252026` (used in carousel URL: `/v1/playoff-series/carousel/20252026`)
- Both formats confirmed working. The carousel uses the joined season string; bracket uses just the year.

---

## Endpoint 1: GET /v1/playoff-bracket/2026

**URL**: `https://api-web.nhle.com/v1/playoff-bracket/2026`

**Top-level keys**:
- `bracketLogo` — `https://assets.nhle.com/logos/playoffs/png/scp-20252026-horizontal-banner-en.png`
- `bracketLogoFr`
- `bracketTitle` / `bracketSubTitle` — localized `{default, fr}` objects
- `series` — array of all series across all rounds (15 total: 8 R1 + 4 R2 + 2 CF + 1 SCF)

**Series object keys**:
```
seriesUrl       seriesTitle      seriesAbbrev     seriesLetter
playoffRound    topSeedRank      topSeedRankAbbrev  topSeedWins
bottomSeedRank  bottomSeedRankAbbrev  bottomSeedWins
topSeedTeam     bottomSeedTeam
```

**Team object inside series**:
```json
{
  "id": 7,
  "abbrev": "BUF",
  "name": { "default": "Buffalo Sabres", "fr": "Sabres de Buffalo" },
  "commonName": { "default": "Sabres" },
  "placeNameWithPreposition": { "default": "Buffalo", "fr": "de Buffalo" },
  "logo": "https://assets.nhle.com/logos/nhl/svg/BUF_light.svg",
  "darkLogo": "https://assets.nhle.com/logos/nhl/svg/BUF_dark.svg"
}
```

**Notes**:
- No `winner` field on series — winner is inferred when `topSeedWins == 4` or `bottomSeedWins == 4`
- `topSeedRankAbbrev` values: `D1` (div 1st), `D2`, `D3`, `WC1`, `WC2`
- `seriesLetter` runs A–H in round 1, I–L in round 2, M–N in conf finals, O for SCF
- Logo URLs: `https://assets.nhle.com/logos/nhl/svg/{ABBREV}_light.svg` (some have `?season=20252026`)
- Future/TBD teams use `id: -1`, `abbrev: "TBD"`, logo `team-tbd-light.svg`

**Sample R1 series** (Series A):
```
seriesLetter: "A", playoffRound: 1
topSeedTeam: BUF (id:7), topSeedWins: 2
bottomSeedTeam: BOS (id:6), bottomSeedWins: 1
```

---

## Endpoint 2: GET /v1/playoff-series/carousel/20252026

**URL**: `https://api-web.nhle.com/v1/playoff-series/carousel/20252026`

**Top-level keys**: `seasonId`, `currentRound`, `rounds`

**Round object**:
```json
{
  "roundNumber": 1,
  "series": [...]
}
```

**Series object** (lighter than bracket endpoint):
```json
{
  "seriesLetter": "A",
  "roundNumber": 1,
  "seriesLabel": "1st-round",
  "seriesLink": "/schedule/playoff-series/2026/series-a/bruins-vs-sabres",
  "topSeed": {
    "id": 7,
    "abbrev": "BUF",
    "wins": 2,
    "logo": "https://assets.nhle.com/logos/nhl/svg/BUF_light.svg",
    "darkLogo": "..."
  },
  "bottomSeed": {
    "id": 6,
    "abbrev": "BOS",
    "wins": 1,
    "logo": "...",
    "darkLogo": "..."
  },
  "neededToWin": 4
}
```

**Notes**:
- Round 2 has series with `id: -1` / `abbrev: "TBD"` for teams not yet through
- No team names here — only `abbrev` and `id`. Join with standings for full names.
- `seriesLink` can be used to build the `/v1/schedule/playoff-series/{year}/{letter}/` endpoint

---

## Endpoint 3: GET /v1/standings/now

**URL**: `https://api-web.nhle.com/v1/standings/now`

**Top-level keys**: `wildCardIndicator`, `standingsDateTimeUtc`, `standings`

**Team object keys** (exhaustive):
```
clinchIndicator, conferenceAbbrev, conferenceName, conferenceSequence
divisionAbbrev, divisionName, divisionSequence
teamAbbrev, teamName, teamCommonName, teamLogo, placeName
points, wins, losses, otLosses, regulationWins, regulationPlusOtWins
goalDifferential, goalFor, goalAgainst
wildcardSequence, leagueSequence
gamesPlayed, winPctg, pointPctg, streakCode, streakCount
homeWins, homeLosses, homeOtLosses, roadWins, roadLosses, roadOtLosses
l10Wins, l10Losses, l10OtLosses (last 10 games)
shootoutWins, shootoutLosses
```

**Key field formats**:
```json
"teamAbbrev": { "default": "COL" },
"teamName": { "default": "Colorado Avalanche", "fr": "Avalanche du Colorado" },
"teamCommonName": { "default": "Avalanche" },
"teamLogo": "https://assets.nhle.com/logos/nhl/svg/COL_light.svg",
"placeName": { "default": "Colorado" }
```

**Note**: `teamAbbrev` is an **object** `{default: "COL"}` — not a plain string!

**Sample top team** (Colorado Avalanche):
```
conferenceName: "Western", divisionName: "Central"
points: 121, wins: 55, losses: 16, otLosses: 11
regulationWins: 48, goalDifferential: +99
conferenceSequence: 1, divisionSequence: 1, wildcardSequence: 0
```

**Logo URL pattern**: `https://assets.nhle.com/logos/nhl/svg/{ABBREV}_light.svg`

---

## Endpoint 4: GET /v1/score/now

**URL**: `https://api-web.nhle.com/v1/score/now`

**Top-level keys**: `prevDate`, `currentDate`, `nextDate`, `gameWeek`, `oddsPartners`, `games`

**Game object keys**:
```
id, season, gameType (3=playoffs), gameDate, startTimeUTC
easternUTCOffset, venueUTCOffset, venueTimezone
gameState (FUT|LIVE|FINAL|OFF|CRIT), gameScheduleState
awayTeam, homeTeam, seriesStatus
gameCenterLink, seriesUrl
tvBroadcasts, clock, neutralSite
period, periodDescriptor, gameOutcome, goals
```

**Team inside game** (score endpoint):
```json
{
  "id": 9,
  "name": { "default": "Senators", "fr": "Sénateurs" },
  "abbrev": "OTT",
  "score": 2,
  "sog": 27,
  "logo": "https://assets.nhle.com/logos/nhl/svg/OTT_light.svg"
}
```

**tvBroadcasts** (per game):
```json
[
  { "id": 403, "market": "N", "countryCode": "US", "network": "TBS", "sequenceNumber": 13 },
  { "id": 501, "market": "N", "countryCode": "US", "network": "truTV", "sequenceNumber": 14 }
]
```

**seriesStatus** (inside game):
```json
{
  "round": 1,
  "seriesAbbrev": "R1",
  "seriesTitle": "1st Round",
  "seriesLetter": "C",
  "neededToWin": 4,
  "topSeedTeamAbbrev": "CAR",
  "topSeedWins": 4,
  "bottomSeedTeamAbbrev": "OTT",
  "bottomSeedWins": 0,
  "gameNumberOfSeries": 4
}
```

**periodDescriptor**:
```json
{ "number": 3, "periodType": "REG", "maxRegulationPeriods": 3 }
```

**gameOutcome**: `{ "lastPeriodType": "REG" }` (REG | OT | SO)

**gameType values**: `2` = regular season, `3` = playoffs

---

## Endpoint 5: GET /v1/schedule/now

**URL**: `https://api-web.nhle.com/v1/schedule/now`

**Top-level keys**: `nextStartDate`, `previousStartDate`, `gameWeek`, `oddsPartners`, `preSeasonStartDate`, `regularSeasonStartDate`, `regularSeasonEndDate`, `playoffEndDate`, `numberOfGames`

**gameWeek**: array of days, each day has `date`, `dayAbbrev`, `numberOfGames`, `datePromo`, `games`

**Game object keys** (schedule differs slightly from score):
```
id, season, gameType, venue, neutralSite
startTimeUTC, easternUTCOffset, venueUTCOffset, venueTimezone
gameState, gameScheduleState, tvBroadcasts
awayTeam, homeTeam, periodDescriptor, gameOutcome
winningGoalie, winningGoalScorer
seriesStatus, seriesUrl, gameCenterLink
```

**homeTeam in schedule** (richer than score endpoint):
```json
{
  "id": 7,
  "commonName": { "default": "Sabres" },
  "placeName": { "default": "Buffalo" },
  "placeNameWithPreposition": { "default": "in Buffalo" },
  "abbrev": "BUF",
  "logo": "https://assets.nhle.com/logos/nhl/svg/BUF_light.svg",
  "darkLogo": "https://assets.nhle.com/logos/nhl/svg/BUF_dark.svg",
  "homeSplitSquad": false,
  "score": 3
}
```

---

## API Quirks & Notes

1. **`teamAbbrev` in standings is an object** `{default: "COL"}`, not a string. Everywhere else, `abbrev` is a plain string.
2. **Dark logos**: both `logo` (light) and `darkLogo` are available on most team objects.
3. **TBD teams**: future matchups use `id: -1`, `abbrev: "TBD"`.
4. **Score vs Schedule**: `score/now` game's `homeTeam` has `score` and `sog` but not `commonName` or `darkLogo`. `schedule/now` has names but not `sog`. Use both for a complete game card.
5. **`gameState` values**: `FUT` (future), `PRE` (pregame), `LIVE`, `CRIT` (critical/final minutes), `FINAL`, `OFF` (finished, scores official).
6. **Logo URL pattern**: `https://assets.nhle.com/logos/nhl/svg/{ABBREV}_light.svg` — reliable for all teams. Some have `?season=20252026` query string; strip it if caching.
7. **Playoff game IDs**: format `2025030134` = `{season:2025}{gameType:03}{game:0134}`.
8. **Series URL** on bracket: `/schedule/playoff-series/2026/series-a/bruins-vs-sabres` — relative path.
9. **No winner field**: series winner must be inferred from `topSeedWins == 4` or `bottomSeedWins == 4`.
10. **Standings `clinchIndicator`**: values like `"x"` (clinched), `"y"` (division), `"z"` (presidents), `null` for unclinchedteams.

---

## Current Series Status (2026-04-25, Round 1)

From live bracket data:
| Letter | Top Seed | Bottom Seed | Top Wins | Bottom Wins | Status |
|--------|----------|-------------|----------|-------------|--------|
| A | BUF | BOS | 2 | 1 | BUF leads |
| B | TBL | MTL | 1 | 2 | MTL leads |
| C | CAR | OTT | 4 | 0 | **CAR wins series** |
| D | PIT | PHI | 0 | 3 | PHI leads |
| E | COL | LAK | 3 | 0 | COL leads |
| F | DAL | MIN | 2 | 1 | DAL leads |
| G | VGK | UTA | 1 | 2 | UTA leads |
| H | EDM | ANA | 1 | 2 | ANA leads |

CAR swept OTT (4-0); Series C is complete. Round 2 matchups are TBD.
