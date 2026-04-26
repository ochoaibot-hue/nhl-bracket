import type { RankingItem, Team } from './normalize/types'

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

// v1: implement the formula from design/schemas.md as best-effort.
export function rankTeams(teams: Team[]): RankingItem[] {
  const scored = teams
    .map((t) => {
      const seed = t.seed ?? 8
      const points = t.regularSeasonPoints ?? 0
      const regulationWins = t.regulationWins ?? 0
      const goalDiff = t.goalDifferential ?? 0

      const score =
        (
          ((8 - seed + 1) / 8) * 0.25 +
          (clamp(points, 0, 130) / 130) * 0.25 +
          (clamp(regulationWins, 0, 55) / 55) * 0.15 +
          (clamp(goalDiff, -50, 100) / 100) * 0.1
        ) *
        100

      const explanation = `seed ${seed}, pts ${points}, RW ${regulationWins}, GD ${goalDiff}`
      return { team: t, score, explanation }
    })
    .sort((a, b) => b.score - a.score)

  return scored.map((s, idx) => ({ ...s, rank: idx + 1 }))
}
