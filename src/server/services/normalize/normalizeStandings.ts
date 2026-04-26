import type { Team } from './types'

function pickDefault(v: any): string {
  if (!v) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'object' && typeof v.default === 'string') return v.default
  return ''
}

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

export function standingsToTeams(standings: any[]): Map<string, Team> {
  const map = new Map<string, Team>()
  for (const s of standings ?? []) {
    const abbrev = pickDefault(s.teamAbbrev)
    if (!abbrev) continue
    const team: Team = {
      // standings objects don't include numeric team id; keep -1 and join by abbrev.
      id: -1,
      abbrev,
      name: pickDefault(s.teamName),
      commonName: pickDefault(s.teamCommonName),
      placeName: pickDefault(s.placeName),
      logo: stripLogoQuery(s.teamLogo),
      conference: s.conferenceName,
      division: s.divisionName,
      regularSeasonPoints: s.points,
      wins: s.wins,
      losses: s.losses,
      otLosses: s.otLosses,
      regulationWins: s.regulationWins,
      regulationPlusOtWins: s.regulationPlusOtWins,
      goalDifferential: s.goalDifferential,
      goalFor: s.goalFor,
      goalAgainst: s.goalAgainst,
      conferenceSequence: s.conferenceSequence,
      divisionSequence: s.divisionSequence,
      wildcardSequence: s.wildcardSequence,
      clinchIndicator: s.clinchIndicator ?? null
    }
    map.set(abbrev, team)
  }
  return map
}
