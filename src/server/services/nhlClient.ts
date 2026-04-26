import { z } from 'zod'

const NHL_API_BASE = process.env.NHL_API_BASE ?? 'https://api-web.nhle.com/v1'

export type NhlFetchOptions = {
  timeoutMs?: number
  ifNoneMatch?: string
}

export type NhlFetchResult<T> = {
  status: number
  data: T | null
  etag?: string
  notModified: boolean
}

async function fetchJson<T>(path: string, { timeoutMs = 10_000, ifNoneMatch }: NhlFetchOptions = {}): Promise<NhlFetchResult<T>> {
  const url = `${NHL_API_BASE}${path}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      headers: {
        accept: 'application/json',
        ...(ifNoneMatch ? { 'If-None-Match': ifNoneMatch } : {})
      },
      signal: controller.signal
    })
    const etag = res.headers.get('etag') ?? undefined
    if (res.status === 304) {
      return { status: 304, data: null, etag, notModified: true }
    }
    if (!res.ok) throw new Error(`NHL API ${res.status} ${res.statusText} for ${url}`)
    return { status: res.status, data: (await res.json()) as T, etag, notModified: false }
  } finally {
    clearTimeout(timer)
  }
}

// Minimal schemas to keep parsing defensive without overfitting.
export const StandingsNowSchema = z.object({
  standingsDateTimeUtc: z.string().optional(),
  standings: z.array(z.any()).optional()
})

export type StandingsNow = z.infer<typeof StandingsNowSchema>

export async function getPlayoffBracket(year: number, opts?: NhlFetchOptions) {
  return fetchJson<unknown>(`/playoff-bracket/${year}`, opts)
}

export async function getPlayoffCarousel(season: string, opts?: NhlFetchOptions) {
  return fetchJson<unknown>(`/playoff-series/carousel/${season}`, opts)
}

export async function getStandingsNow(opts?: NhlFetchOptions): Promise<NhlFetchResult<StandingsNow>> {
  // /standings/now returns a 307 redirect to /standings/YYYY-MM-DD
  // Node fetch follows redirects by default, but some environments/proxies can be picky.
  // Keep this note here because it’s a common "works in browser, not in server" footgun.
  const raw = await fetchJson<unknown>(`/standings/now`, opts)
  if (raw.notModified || raw.data == null) return { ...raw, data: null as any }
  return { ...raw, data: StandingsNowSchema.parse(raw.data) }
}

export async function getScoreNow(opts?: NhlFetchOptions) {
  return fetchJson<unknown>(`/score/now`, opts)
}

export async function getScheduleNow(opts?: NhlFetchOptions) {
  return fetchJson<unknown>(`/schedule/now`, opts)
}

export async function getSchedulePlayoffSeries(season: string, seriesLetter: string, opts?: NhlFetchOptions) {
  return fetchJson<unknown>(`/schedule/playoff-series/${season}/${seriesLetter}`, opts)
}

export async function getGamecenterLanding(gameId: number, opts?: NhlFetchOptions) {
  return fetchJson<unknown>(`/gamecenter/${gameId}/landing`, opts)
}

export async function getGamecenterBoxscore(gameId: number, opts?: NhlFetchOptions) {
  return fetchJson<unknown>(`/gamecenter/${gameId}/boxscore`, opts)
}
