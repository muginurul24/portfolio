import { z } from 'zod'
import { inquiries } from '../../database/schema'
import { createId } from '../../utils/id'

const bodySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(8).max(20).optional(),
  message: z.string().min(10).max(2000),
  source: z.string().max(80).default('website'),
  service: z.string().max(40).optional()
})

/** Soft in-memory rate limit: 5 posts / IP / 15 min (SQLite v1). */
const rateHits = new Map<string, { count: number, resetAt: number }>()
const RATE_WINDOW_MS = 15 * 60 * 1000
const RATE_MAX = 5

function assertRateLimit(ip: string) {
  const now = Date.now()
  const entry = rateHits.get(ip)
  if (!entry || entry.resetAt <= now) {
    rateHits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return
  }
  if (entry.count >= RATE_MAX) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Terlalu banyak kiriman. Tunggu beberapa menit, lalu coba lagi.'
    })
  }
  entry.count += 1
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  assertRateLimit(ip)

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const id = createId('inq')

  await db.insert(inquiries).values({
    id,
    siteId: null,
    name: body.name.trim(),
    email: body.email.toLowerCase().trim(),
    phone: body.phone?.trim() || null,
    company: null,
    message: body.message.trim(),
    productInterest: body.service?.trim() || null,
    source: (body.source || 'website').trim() || 'website',
    status: 'new'
  })

  // Soft abuse log (no PII dump beyond id + source)
  console.info('[inquiry]', { id, ip, source: body.source || 'website', service: body.service || null })

  return { ok: true, id }
})
