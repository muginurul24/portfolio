import { and, count, desc, like, or, sql } from 'drizzle-orm'
import { testimonials } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const db = useDb()
  const query = getQuery(event)
  const q = typeof query.q === 'string' ? query.q.trim().toLowerCase() : ''
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50))
  const offset = Math.max(0, Number(query.offset) || 0)

  const filters = []
  if (q) {
    filters.push(
      or(
        like(sql`lower(${testimonials.name})`, `%${q}%`),
        like(sql`lower(${testimonials.company})`, `%${q}%`),
        like(sql`lower(${testimonials.content})`, `%${q}%`)
      )
    )
  }
  const where = filters.length ? and(...filters) : undefined
  const [totalRow] = await db.select({ value: count() }).from(testimonials).where(where)
  const rows = await db
    .select()
    .from(testimonials)
    .where(where)
    .orderBy(desc(testimonials.sortOrder), desc(testimonials.isFeatured))
    .limit(limit)
    .offset(offset)

  return { data: rows, meta: { total: totalRow?.value ?? 0, limit, offset } }
})
