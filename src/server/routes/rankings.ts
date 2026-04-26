import type { FastifyInstance } from 'fastify'
import { getCache, setCache, TTL_IDLE_SECONDS, TTL_LIVE_SECONDS, cacheAgeSeconds } from '../services/cache'
import { getPlayoffBracket, getStandingsNow } from '../services/nhlClient'
import { normalizeBracket } from '../services/normalize/normalizeBracket'
import { standingsToTeams } from '../services/normalize/normalizeStandings'
import { rankTeams } from '../services/rankingEngine'

const DEFAULT_YEAR = Number(process.env.DEFAULT_PLAYOFF_YEAR ?? 2026)
const DEFAULT_SEASON = String(process.env.DEFAULT_SEASON_ID ?? '20252026')

export async function rankingsRoutes(app: FastifyInstance) {
  app.get('/api/rankings', async (_req, reply) => {
    const year = DEFAULT_YEAR
    const season = DEFAULT_SEASON
    const key = `app:rankings:${year}:${season}`

    const cached = getCache<any>(key)

    try {
      const [bracketRes, standingsRes] = await Promise.all([
        getPlayoffBracket(year, { ifNoneMatch: cached?.etag }),
        getStandingsNow()
      ])
      if (bracketRes.notModified && cached) {
        return reply.send({ ...(cached.value as Record<string, unknown>), stale: false, cacheAgeSeconds: cacheAgeSeconds(cached) })
      }
      const bracket = normalizeBracket(bracketRes.data as any, year, season)
      const standingsTeams = standingsToTeams((standingsRes.data as any)?.standings ?? [])

      const playoffAbbrevs = new Set<string>()
      for (const s of bracket.series) {
        if (s.topSeedTeam.abbrev && s.topSeedTeam.id !== -1) playoffAbbrevs.add(s.topSeedTeam.abbrev)
        if (s.bottomSeedTeam.abbrev && s.bottomSeedTeam.id !== -1) playoffAbbrevs.add(s.bottomSeedTeam.abbrev)
      }

      const teams = [...playoffAbbrevs]
        .map((a) => standingsTeams.get(a) ?? null)
        .filter(Boolean)
        .map((t) => ({ ...t! }))

      // seed enrichment from bracket
      for (const s of bracket.series) {
        const top = teams.find((t) => t.abbrev === s.topSeedTeam.abbrev)
        if (top) {
          top.seed = s.topSeedRank
          top.seedAbbrev = s.topSeedRankAbbrev
        }
        const bot = teams.find((t) => t.abbrev === s.bottomSeedTeam.abbrev)
        if (bot) {
          bot.seed = s.bottomSeedRank
          bot.seedAbbrev = s.bottomSeedRankAbbrev
        }
      }

      const ranked = rankTeams(teams)
      const payload = { year, season, fetchedAt: new Date().toISOString(), rankings: ranked }
      const ttl = bracket.series.some((x) => x.status === 'active') ? TTL_LIVE_SECONDS : TTL_IDLE_SECONDS
      setCache(key, payload, ttl, bracketRes.etag)
      return reply.send({ ...payload, stale: false, cacheAgeSeconds: 0 })
    } catch (e: any) {
      if (cached) return reply.send({ ...(cached.value as Record<string, unknown>), stale: true, cacheAgeSeconds: cacheAgeSeconds(cached) })
      return reply.status(502).send({ error: 'upstream_error', message: e?.message ?? String(e) })
    }
  })
}
