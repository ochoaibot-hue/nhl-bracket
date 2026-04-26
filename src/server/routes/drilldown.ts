import type { FastifyInstance } from 'fastify'
import { getCache, setCache, TTL_IDLE_SECONDS, TTL_LIVE_SECONDS, cacheAgeSeconds } from '../services/cache'
import { getGamecenterBoxscore, getGamecenterLanding, getPlayoffBracket, getSchedulePlayoffSeries } from '../services/nhlClient'
import { normalizeBracket } from '../services/normalize/normalizeBracket'

const DEFAULT_YEAR = Number(process.env.DEFAULT_PLAYOFF_YEAR ?? 2026)
const DEFAULT_SEASON = String(process.env.DEFAULT_SEASON_ID ?? '20252026')

function isLiveFromLanding(landing: any): boolean {
  const state = String(landing?.gameState ?? landing?.gameScheduleState ?? '').toUpperCase()
  return ['LIVE', 'CRIT'].includes(state)
}

function gameStateFromSchedule(g: any): string {
  const state = String(g?.gameState ?? g?.gameScheduleState ?? '').toUpperCase()
  if (state === 'CRIT') return 'LIVE'
  return state || 'UNKNOWN'
}

function scoreFromSchedule(team: any) {
  if (!team) return null
  return {
    id: Number(team?.id ?? -1),
    abbrev: String(team?.abbrev ?? ''),
    score: Number(team?.score ?? 0)
  }
}

function normalizeSeriesGames(rawSeriesSchedule: any) {
  const games = Array.isArray(rawSeriesSchedule?.games) ? rawSeriesSchedule.games : []
  return games
    .map((g: any) => ({
      gameId: Number(g?.id ?? 0),
      gameNumber: Number(g?.gameNumber ?? 0),
      startTimeUTC: String(g?.startTimeUTC ?? ''),
      state: gameStateFromSchedule(g),
      gameScheduleState: String(g?.gameScheduleState ?? ''),
      ifNecessary: Boolean(g?.ifNecessary ?? false),
      venue: String(g?.venue?.default ?? ''),
      awayTeam: scoreFromSchedule(g?.awayTeam),
      homeTeam: scoreFromSchedule(g?.homeTeam)
    }))
    .filter((g: any) => Number.isFinite(g.gameId) && g.gameId > 0)
    .sort((a: any, b: any) => {
      if (a.gameNumber && b.gameNumber) return a.gameNumber - b.gameNumber
      return a.startTimeUTC.localeCompare(b.startTimeUTC)
    })
}

export async function drilldownRoutes(app: FastifyInstance) {
  app.get('/api/series/:seriesLetter', async (req, reply) => {
    const year = DEFAULT_YEAR
    const season = DEFAULT_SEASON
    const seriesLetter = String((req.params as any)?.seriesLetter ?? '')
      .trim()
      .toUpperCase()

    const key = `app:series:${year}:${season}:${seriesLetter}`
    const cached = getCache<any>(key)
    if (cached) return reply.send({ ...(cached.value as Record<string, unknown>), stale: false, cacheAgeSeconds: cacheAgeSeconds(cached) })

    try {
      // Use bracket for canonical series metadata and schedule endpoint for game IDs.
      const bracketRes = await getPlayoffBracket(year)
      const bracket = normalizeBracket(bracketRes.data as any, year, season)
      const series = (bracket.series ?? []).find((s: any) => String(s?.seriesLetter ?? '').toUpperCase() === seriesLetter)

      if (!series) return reply.status(404).send({ error: 'not_found', message: `series ${seriesLetter} not found` })

      const scheduleRes = await getSchedulePlayoffSeries(season, seriesLetter)
      const payload: any = {
        year,
        season,
        fetchedAt: new Date().toISOString(),
        series: {
          ...series,
          games: normalizeSeriesGames(scheduleRes.data)
        }
      }
      const isSeriesLive = (payload.series.games ?? []).some((g: any) => ['LIVE', 'CRIT'].includes(String(g?.state ?? '').toUpperCase()))
      if (isSeriesLive) payload.series.status = 'active'

      const ttl = payload.series.status === 'active' ? TTL_LIVE_SECONDS : TTL_IDLE_SECONDS
      setCache(key, payload, ttl)
      return reply.send({ ...payload, stale: false, cacheAgeSeconds: 0 })
    } catch (e: any) {
      const fallback = getCache<any>(key)
      if (fallback) return reply.send({ ...(fallback.value as Record<string, unknown>), stale: true, cacheAgeSeconds: cacheAgeSeconds(fallback) })
      return reply.status(502).send({ error: 'upstream_error', message: e?.message ?? String(e) })
    }
  })

  app.get('/api/game/:gameId', async (req, reply) => {
    const gameId = Number((req.params as any)?.gameId)
    if (!Number.isFinite(gameId) || gameId <= 0) return reply.status(400).send({ error: 'bad_request', message: 'gameId must be a positive integer' })

    const key = `app:game:${gameId}`
    const cached = getCache<any>(key)
    if (cached) return reply.send({ ...(cached.value as Record<string, unknown>), stale: false, cacheAgeSeconds: cacheAgeSeconds(cached) })

    try {
      const [landingRes, boxscoreRes] = await Promise.all([getGamecenterLanding(gameId), getGamecenterBoxscore(gameId)])
      const landing = landingRes.data
      const boxscore = boxscoreRes.data

      const payload = {
        gameId,
        fetchedAt: new Date().toISOString(),
        landing,
        boxscore
      }

      const ttl = isLiveFromLanding(landing) ? TTL_LIVE_SECONDS : TTL_IDLE_SECONDS
      setCache(key, payload, ttl)
      return reply.send({ ...payload, stale: false, cacheAgeSeconds: 0 })
    } catch (e: any) {
      const fallback = getCache<any>(key)
      if (fallback) return reply.send({ ...(fallback.value as Record<string, unknown>), stale: true, cacheAgeSeconds: cacheAgeSeconds(fallback) })
      return reply.status(502).send({ error: 'upstream_error', message: e?.message ?? String(e) })
    }
  })
}
