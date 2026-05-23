import type { H3Event } from 'h3'

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

export function rateLimit(event: H3Event, options: { max: number; windowMs: number }): void {
  const forwarded = getRequestHeader(event, 'x-forwarded-for')
  const ip = (forwarded ? forwarded.split(',')[0] : event.node.req.socket?.remoteAddress) ?? 'unknown'
  const key = `${event.path}:${ip}`
  const now = Date.now()

  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs })
    return
  }

  entry.count++
  store.set(key, entry)

  if (entry.count > options.max) {
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }
}
