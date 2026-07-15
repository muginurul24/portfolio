import { z } from 'zod'

const querySchema = z.object({
  name: z.string().min(3).max(63).regex(/^[a-z0-9-]+$/i),
  tld: z.string().min(2).max(20)
})

export default defineEventHandler(async (event) => {
  const raw = getQuery(event)
  const parsed = querySchema.safeParse({ name: raw.name, tld: raw.tld })
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Nama domain tidak valid' })
  }
  const name = parsed.data.name.toLowerCase()
  const tld = parsed.data.tld.toLowerCase().replace(/^\./, '')
  const domain = `${name}.${tld}`
  // v1 stub: reserved words unavailable
  const reserved = new Set(['www', 'mail', 'admin', 'root', 'api', 'mugiewdev', 'webekspor'])
  const available = !reserved.has(name) && name.length >= 3
  return { domain, available, stub: true }
})
