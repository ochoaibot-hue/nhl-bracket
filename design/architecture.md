# nhl-bracket — Architecture (v1)

Date: 2026-04-25
Owner: Ocho

## Goals
- Serve a **live Stanley Cup playoff bracket** with series status, rankings, and game details from NHL’s public API.
- Be **fast, resilient, and defensive** against missing/shape-shifting fields.
- Keep the stack **simple to run locally** (`npm i`, `npm run dev`) and easy to deploy.

## Chosen stack
- **Node.js + TypeScript**
- **Fastify** (backend HTTP server)
  - Why: great TS ergonomics, built-in schema hooks if needed later, fast, simple.
- **Vite + React + TypeScript** (frontend)
  - Why: rapid dev, component-driven bracket UI, straightforward fetch to backend `/api/*`.
- **Tailwind CSS** (styling)
- **In-memory cache** (no DB for v1)
  - Why: meets requirements; avoids snapshot complexity until we need history.

If we decide to avoid React, we can swap to server-rendered HTML later, but v1 proceeds with React.

## Runtime architecture

### Data flow
Client (React) → `GET /api/*` → Server (Fastify) → NHL API (`api-web.nhle.com/v1`) → Normalize → Cache → Response

### Server modules (proposed)
```
src/
  server/
    index.ts
    routes/
      bracket.ts
      series.ts
      rankings.ts
      games.ts
      game.ts
    services/
      nhlClient.ts
      cache.ts
      normalize/
        normalizeBracket.ts
        normalizeStandings.ts
        normalizeGames.ts
      rankingEngine.ts
      insightsEngine.ts
  client/
    ... Vite/React app ...
```

## External NHL endpoints (source of truth)
- `GET /v1/playoff-bracket/{year}` (e.g. `2026`)
- `GET /v1/playoff-series/carousel/{season}` (e.g. `20252026`)
- `GET /v1/standings/now`
- `GET /v1/score/now`
- `GET /v1/schedule/now`
- (optional on demand) `GET /v1/gamecenter/{gameId}/landing` and `/boxscore`

Key quirk: `standings.teamAbbrev` is an object `{ default: "COL" }`.

## Normalized domain model
Use Siete’s interfaces as canonical (Team, Series, Game, BracketRound, StandingsSnapshot, MatchupInsight).

### Normalization rules (must-haves)
- Convert `standings.teamAbbrev.default` → `Team.abbrev` (string).
- Handle TBD teams: `id === -1` and `abbrev === "TBD"`.
- Infer `Series.status` and `Series.winner` from `topSeedWins/bottomSeedWins` (no explicit winner field).
- Treat `gameState === "CRIT"` as **LIVE** for UI.
- Join data across endpoints:
  - Bracket provides series structure + seeds + wins.
  - Standings provides names/records/points.
  - Score/Schedule provide game list + start times + live/final states.

## API surface (internal)
Backend exposes stable app endpoints:
- `GET /api/bracket` → bracket rounds + normalized series + teams + lastUpdated
- `GET /api/series/:letter` → series + games (from score/schedule) + nextGame + lastGame
- `GET /api/rankings` → playoff teams ranked + explanation
- `GET /api/games/today` → today’s playoff games (gameType=3) + status
- `GET /api/game/:id` → (optional) gamecenter landing/boxscore (best-effort)

## Caching & polling

### Server-side caching (authoritative)
Cache NHL fetches and normalized outputs.

Suggested TTLs:
- If any playoff game is `LIVE` or `CRIT`: **60s**
- Otherwise (no live games): **300s**

Cache keys:
- raw: `nhl:playoff-bracket:{year}`
- raw: `nhl:carousel:{season}`
- raw: `nhl:standings:now`
- raw: `nhl:score:now`
- raw: `nhl:schedule:now`
- derived: `app:bracket:{year}:{season}`
- derived: `app:rankings:{year}:{season}`

If NHL fails:
- Serve **stale cached** data if present, with `stale: true` + `staleAgeSeconds`.
- If nothing cached, return 502 with a friendly error payload.

### Client polling
- Default refresh interval: **60s**
- If backend reports `hasLiveGames=true`: poll every **30s**
- Manual “Refresh now” button always available.

## Reliability & defensive parsing
- NHL responses are treated as **untrusted**: parse with guards (or zod later).
- Never assume optional fields exist (broadcasts, venue, sog, etc.).
- Strict time handling: store `startTimeUTC` and display localized with browser Intl.

## Env/config
- `NHL_API_BASE=https://api-web.nhle.com/v1`
- `DEFAULT_PLAYOFF_YEAR=2026` (derived from current date later)
- `DEFAULT_SEASON_ID=20252026` (derived from current date later)

## Observability
- `/api/health` returns `{ ok: true, version, lastFetchTimes }`
- Server logs: request, NHL fetch duration, cache hit/miss.

## Acceptance criteria mapping
This architecture supports:
- Bracket loads from NHL API with resilience.
- Series cards + rankings + today’s games via normalized model.
- Game detail best-effort via gamecenter endpoints.
- Season/year switch without code edits (config + query params).
