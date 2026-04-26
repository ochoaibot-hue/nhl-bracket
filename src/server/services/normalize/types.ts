export type Team = {
  id: number
  abbrev: string
  name: string
  commonName: string
  placeName: string
  logo: string
  darkLogo?: string
  seed?: number
  seedAbbrev?: string
  conference?: string
  division?: string
  regularSeasonPoints?: number
  wins?: number
  losses?: number
  otLosses?: number
  regulationWins?: number
  regulationPlusOtWins?: number
  goalDifferential?: number
  goalFor?: number
  goalAgainst?: number
  conferenceSequence?: number
  divisionSequence?: number
  wildcardSequence?: number
  clinchIndicator?: string | null
}

export type Series = {
  seriesLetter: string
  playoffRound: number
  seriesTitle?: string
  seriesAbbrev?: string
  seriesUrl?: string
  topSeedRank?: number
  topSeedRankAbbrev?: string
  bottomSeedRank?: number
  bottomSeedRankAbbrev?: string
  topSeedWins: number
  bottomSeedWins: number
  neededToWin: number
  topSeedTeam: Team
  bottomSeedTeam: Team
  status: 'upcoming' | 'active' | 'complete'
  winner: Team | null
}

export type BracketResponse = {
  year: number
  season: string
  fetchedAt: string
  bracketLogo?: string
  series: Series[]
}

export type RankingItem = {
  team: Team
  rank: number
  score: number
  explanation: string
}

