import NodeCache from 'node-cache'

// If any playoff games are live/crit: 60s. Otherwise: 300s.
export const TTL_LIVE_SECONDS = 60
export const TTL_IDLE_SECONDS = 300

export type CacheValue<T> = {
  fetchedAt: number
  ttlSeconds: number
  value: T
  etag?: string
}

const cache = new NodeCache({ useClones: false })

export function getCache<T>(key: string): CacheValue<T> | undefined {
  return cache.get<CacheValue<T>>(key)
}

export function setCache<T>(key: string, value: T, ttlSeconds: number, etag?: string): CacheValue<T> {
  const entry: CacheValue<T> = { fetchedAt: Date.now(), ttlSeconds, value, etag }
  cache.set(key, entry, ttlSeconds)
  return entry
}

export function cacheAgeSeconds(entry: CacheValue<unknown>): number {
  return Math.floor((Date.now() - entry.fetchedAt) / 1000)
}
