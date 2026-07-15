import { and, count, desc, like, or, sql } from 'drizzle-orm'
import { courses } from '../../../database/schema'

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
        like(sql`lower(${courses.title})`, `%${q}%`),
        like(sql`lower(${courses.slug})`, `%${q}%`)
      )
    )
  }
  const where = filters.length ? and(...filters) : undefined
  const [totalRow] = await db.select({ value: count() }).from(courses).where(where)
  const rows = await db
    .select()
    .from(courses)
    .where(where)
    .orderBy(desc(courses.sortOrder), desc(courses.createdAt))
    .limit(limit)
    .offset(offset)

  return { data: rows, meta: { total: totalRow?.value ?? 0, limit, offset } }
})
