import { and, count, desc, eq, like, or, sql } from 'drizzle-orm'
import { templates } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const db = useDb()
  const query = getQuery(event)

  const q = typeof query.q === 'string' ? query.q.trim().toLowerCase() : ''
  const category = typeof query.category === 'string' ? query.category.trim() : ''
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50))
  const offset = Math.max(0, Number(query.offset) || 0)

  const filters = []
  if (q) {
    filters.push(
      or(
        like(sql`lower(${templates.name})`, `%${q}%`),
        like(sql`lower(${templates.slug})`, `%${q}%`)
      )
    )
  }
  if (category) {
    filters.push(eq(templates.category, category as 'export'))
  }

  const where = filters.length ? and(...filters) : undefined

  const [totalRow] = await db.select({ value: count() }).from(templates).where(where)
  const rows = await db
    .select()
    .from(templates)
    .where(where)
    .orderBy(desc(templates.sortOrder), desc(templates.createdAt))
    .limit(limit)
    .offset(offset)

  return {
    data: rows,
    meta: { total: totalRow?.value ?? 0, limit, offset }
  }
})
