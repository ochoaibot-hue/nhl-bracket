import type { BracketResponse, Series, Team } from './types'

function stripLogoQuery(url?: string): string {
  if (!url) return ''
  try {
    const u = new URL(url)
    u.search = ''
    return u.toString()
  } catch {
    return url
  }
}

function localizeName(obj: any): string {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  if (typeof obj === 'object' && typeof obj.default === 'string') return obj.default
  return ''
}

function teamFromBracket(t: any): Team {
  const abbrev = t?.abbrev ?? 'TBD'
  return {
    id: Number(t?.id ?? -1),
    abbrev,
    name: localizeName(t?.name) || abbrev,
    commonName: localizeName(t?.commonName) || abbrev,
    placeName: localizeName(t?.placeNameWithPreposition) || localizeName(t?.placeName) || '',
    logo: stripLogoQuery(t?.logo),
    darkLogo: stripLogoQuery(t?.darkLogo)
  }
}

export function normalizeBracket(raw: any, year: number, season: string): BracketResponse {
  const series: Series[] = Array.isArray(raw?.series)
    ? raw.series.map((s: any): Series => {
        const topSeedWins = Number(s?.topSeedWins ?? 0)
        const bottomSeedWins = Number(s?.bottomSeedWins ?? 0)
        const neededToWin = 4
        const topSeedTeam = teamFromBracket(s?.topSeedTeam)
        const bottomSeedTeam = teamFromBracket(s?.bottomSeedTeam)
        const winner = topSeedWins >= neededToWin ? topSeedTeam : bottomSeedWins >= neededToWin ? bottomSeedTeam : null
        const status: Series['status'] = winner ? 'complete' : topSeedTeam.id === -1 || bottomSeedTeam.id === -1 ? 'upcoming' : 'active'
        return {
          seriesLetter: String(s?.seriesLetter ?? ''),
          playoffRound: Number(s?.playoffRound ?? 0),
          seriesTitle: String(s?.seriesTitle ?? ''),
          seriesAbbrev: String(s?.seriesAbbrev ?? ''),
          seriesUrl: String(s?.seriesUrl ?? ''),
          topSeedRank: Number(s?.topSeedRank ?? 0),
          topSeedRankAbbrev: String(s?.topSeedRankAbbrev ?? ''),
          bottomSeedRank: Number(s?.bottomSeedRank ?? 0),
          bottomSeedRankAbbrev: String(s?.bottomSeedRankAbbrev ?? ''),
          topSeedWins,
          bottomSeedWins,
          neededToWin,
          topSeedTeam,
          bottomSeedTeam,
          status,
          winner
        }
      })
    : []

  return {
    year,
    season,
    fetchedAt: new Date().toISOString(),
    bracketLogo: raw?.bracketLogo,
    series
  }
}

