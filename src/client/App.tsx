import { useEffect, useMemo, useState } from 'react'

type SeriesTeam = {
  id: number
  abbrev: string
  name: string
  commonName: string
  logo: string
  seed?: number
  seedAbbrev?: string
}

type Series = {
  seriesLetter: string
  playoffRound: number
  seriesTitle?: string
  topSeedWins: number
  bottomSeedWins: number
  neededToWin: number
  status: 'upcoming' | 'active' | 'complete'
  topSeedTeam: SeriesTeam
  bottomSeedTeam: SeriesTeam
}

type SeriesGame = {
  gameId: number
  gameNumber: number
  startTimeUTC: string
  state: string
  gameScheduleState?: string
  awayTeam?: { id: number; abbrev: string; score: number } | null
  homeTeam?: { id: number; abbrev: string; score: number } | null
}

type SeriesDrilldown = {
  fetchedAt: string
  series: Series & { games?: SeriesGame[] }
  stale?: boolean
}

type GameDrilldown = { gameId: number; fetchedAt: string; landing: any; boxscore: any; stale?: boolean }

type Bracket = {
  fetchedAt: string
  series: Series[]
  stale?: boolean
  cacheAgeSeconds?: number
}

function roundName(n: number) {
  if (n === 1) return 'First Round'
  if (n === 2) return 'Second Round'
  if (n === 3) return 'Conference Finals'
  if (n === 4) return 'Stanley Cup Final'
  return `Round ${n}`
}

export default function App() {
  const [data, setData] = useState<Bracket | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSeriesLetter, setSelectedSeriesLetter] = useState<string | null>(null)
  const [seriesData, setSeriesData] = useState<SeriesDrilldown | null>(null)
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null)
  const [gameData, setGameData] = useState<GameDrilldown | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/bracket')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as Bracket
      setData(json)
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 60_000)
    return () => clearInterval(t)
  }, [])

  const byRound = useMemo(() => {
    const map = new Map<number, Series[]>()
    for (const s of data?.series ?? []) {
      const arr = map.get(s.playoffRound) ?? []
      arr.push(s)
      map.set(s.playoffRound, arr)
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => a.seriesLetter.localeCompare(b.seriesLetter))
      map.set(k, arr)
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0])
  }, [data])

  useEffect(() => {
    if (!selectedSeriesLetter) return
    ;(async () => {
      try {
        const res = await fetch(`/api/series/${encodeURIComponent(selectedSeriesLetter)}`)
        if (!res.ok) throw new Error(`Series HTTP ${res.status}`)
        const json = (await res.json()) as SeriesDrilldown
        setSeriesData(json)
      } catch {
        setSeriesData(null)
      }
    })()
  }, [selectedSeriesLetter])

  useEffect(() => {
    if (!selectedGameId) return
    ;(async () => {
      try {
        const res = await fetch(`/api/game/${selectedGameId}`)
        if (!res.ok) throw new Error(`Game HTTP ${res.status}`)
        const json = (await res.json()) as GameDrilldown
        setGameData(json)
      } catch {
        setGameData(null)
      }
    })()
  }, [selectedGameId])

  const selectedSeriesGames = seriesData?.series?.games ?? []
  const gameHeadline =
    gameData?.landing?.awayTeam?.abbrev && gameData?.landing?.homeTeam?.abbrev
      ? `${gameData.landing.awayTeam.abbrev} @ ${gameData.landing.homeTeam.abbrev}`
      : null

  return (
    <div className="page">
      <header className="header">
        <h1>NHL Playoff Bracket</h1>
        <div className="meta">
          {data?.fetchedAt ? <span>Updated {new Date(data.fetchedAt).toLocaleString()}</span> : null}
          {data?.stale ? <span className="badge warn">STALE</span> : null}
          <button onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>
      </header>

      {loading ? <div className="card">Loading…</div> : null}
      {error ? <div className="card error">Error: {error}</div> : null}

      {byRound.map(([round, series]) => (
        <section key={round} className="round">
          <h2>{roundName(round)}</h2>
          <div className="grid">
            {series.map((s) => (
              <div key={s.seriesLetter} className="series">
                <div
                  className={`seriesTop clickable ${selectedSeriesLetter === s.seriesLetter ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedSeriesLetter(s.seriesLetter)
                    setSelectedGameId(null)
                    setGameData(null)
                  }}
                >
                  <div className="letter">{s.seriesLetter}</div>
                  <div className={`badge ${s.status}`}>{s.status.toUpperCase()}</div>
                </div>
                <TeamRow team={s.topSeedTeam} wins={s.topSeedWins} />
                <TeamRow team={s.bottomSeedTeam} wins={s.bottomSeedWins} />
                <div className="needed">First to {s.neededToWin}</div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {selectedSeriesLetter ? (
        <section className="card panel">
          <div className="panelHeader">
            <h3>Series {selectedSeriesLetter}</h3>
            <button
              onClick={() => {
                setSelectedSeriesLetter(null)
                setSeriesData(null)
                setSelectedGameId(null)
                setGameData(null)
              }}
            >
              Close
            </button>
          </div>

          {seriesData ? (
            <>
              <div className="panelMeta">
                {seriesData.fetchedAt ? <span>Updated {new Date(seriesData.fetchedAt).toLocaleString()}</span> : null}
                {seriesData.stale ? <span className="badge warn">STALE</span> : null}
              </div>

              <div className="games">
                {selectedSeriesGames.length ? (
                  selectedSeriesGames.map((g) => (
                    <button
                      key={g.gameId}
                      className={`gameBtn ${selectedGameId === g.gameId ? 'selected' : ''}`}
                      onClick={() => setSelectedGameId(g.gameId)}
                    >
                      <div className="gameLine">
                        <span className="gameNum">G{g.gameNumber || ''}</span>
                        <span className="gameTeams">
                          {(g.awayTeam?.abbrev || 'AWAY') + ' @ ' + (g.homeTeam?.abbrev || 'HOME')}
                        </span>
                        <span className="gameState">{g.state}</span>
                      </div>
                      <div className="gameSub">
                        <span>{g.startTimeUTC ? new Date(g.startTimeUTC).toLocaleString() : ''}</span>
                        <span>
                          {typeof g.awayTeam?.score === 'number' && typeof g.homeTeam?.score === 'number'
                            ? `${g.awayTeam.score}-${g.homeTeam.score}`
                            : ''}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="muted">No games found for this series yet.</div>
                )}
              </div>
            </>
          ) : (
            <div className="muted">Loading series…</div>
          )}

          {selectedGameId ? (
            <div className="card gamePanel">
              <div className="panelHeader">
                <h4>Game {selectedGameId}</h4>
              </div>
              {gameData ? (
                <>
                  <div className="panelMeta">
                    {gameHeadline ? <strong>{gameHeadline}</strong> : null}
                    {gameData.fetchedAt ? <span>Updated {new Date(gameData.fetchedAt).toLocaleString()}</span> : null}
                    {gameData.stale ? <span className="badge warn">STALE</span> : null}
                  </div>
                  <pre className="json">{JSON.stringify(gameData.landing, null, 2)}</pre>
                </>
              ) : (
                <div className="muted">Loading game…</div>
              )}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}

function TeamRow({ team, wins }: { team: SeriesTeam; wins: number }) {
  const seed = team.seedAbbrev || (team.seed ? `#${team.seed}` : '')
  return (
    <div className="teamRow">
      <img className="logo" src={team.logo} alt={team.abbrev} />
      <div className="teamName">
        <div className="line1">
          <span className="seed">{seed}</span>
          <span>{team.name || team.abbrev}</span>
        </div>
        <div className="abbr">{team.abbrev}</div>
      </div>
      <div className="wins">{wins}</div>
    </div>
  )
}
