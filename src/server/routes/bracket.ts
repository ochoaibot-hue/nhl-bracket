import type { FastifyInstance } from 'fastify'
import { getPlayoffBracket, getStandingsNow } from '../services/nhlClient'
import { getCache, setCache, TTL_IDLE_SECONDS, TTL_LIVE_SECONDS, cacheAgeSeconds } from '../services/cache'
import { normalizeBracket } from '../services/normalize/normalizeBracket'
import { standingsToTeams } from '../services/normalize/normalizeStandings'

const DEFAULT_YEAR = Number(process.env.DEFAULT_PLAYOFF_YEAR ?? 2026)
const DEFAULT_SEASON = String(process.env.DEFAULT_SEASON_ID ?? '20252026')

export async function bracketRoutes(app: FastifyInstance) {
  app.get('/api/bracket', async (_req, reply) => {
    const year = DEFAULT_YEAR
    const season = DEFAULT_SEASON
    const key = `app:bracket:${year}:${season}`

    const cached = getCache<any>(key)

    try {
      const [bracketRes, standingsRes] = await Promise.all([
        getPlayoffBracket(year, { ifNoneMatch: cached?.etag }),
        getStandingsNow()
      ])
      if (bracketRes.notModified && cached) {
        return reply.send({ ...(cached.value as Record<string, unknown>), stale: false, cacheAgeSeconds: cacheAgeSeconds(cached) })
      }
      const standingsTeams = standingsToTeams((standingsRes.data as any)?.standings ?? [])
      const normalized = normalizeBracket(bracketRes.data as any, year, season)

      // enrich bracket team shells with standings where possible
      for (const s of normalized.series) {
        const top = standingsTeams.get(s.topSeedTeam.abbrev)
        if (top) s.topSeedTeam = { ...top, ...s.topSeedTeam, seed: s.topSeedRank, seedAbbrev: s.topSeedRankAbbrev }
        const bot = standingsTeams.get(s.bottomSeedTeam.abbrev)
        if (bot) s.bottomSeedTeam = { ...bot, ...s.bottomSeedTeam, seed: s.bottomSeedRank, seedAbbrev: s.bottomSeedRankAbbrev }
      }

      // crude live detection: if any incomplete series exists, use idle TTL; if you want live, wire score/now later.
      const ttl = normalized.series.some((x) => x.status === 'active') ? TTL_LIVE_SECONDS : TTL_IDLE_SECONDS
      setCache(key, normalized, ttl, bracketRes.etag)
      return reply.send({ ...normalized, stale: false, cacheAgeSeconds: 0 })
    } catch (e: any) {
      if (cached) {
        return reply.send({ ...(cached.value as Record<string, unknown>), stale: true, cacheAgeSeconds: cacheAgeSeconds(cached) })
      }
      return reply.status(502).send({ error: 'upstream_error', message: e?.message ?? String(e) })
    }
  })
}
