const cache = new Map<string, { data: any; timestamp: number }>()

const DEFAULT_TTL = 60_000

export function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() - entry.timestamp > DEFAULT_TTL) {
    cache.delete(key)
    return undefined
  }
  return entry.data as T
}

export function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

export function clearCache(pattern?: string) {
  if (!pattern) {
    cache.clear()
    return
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}
