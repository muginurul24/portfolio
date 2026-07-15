import { and, count, desc, eq, like, or, sql } from 'drizzle-orm'
import { packages } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const db = useDb()
  const query = getQuery(event)

  const q = typeof query.q === 'string' ? query.q.trim().toLowerCase() : ''
  const serviceType = typeof query.serviceType === 'string' ? query.serviceType.trim() : ''
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50))
  const offset = Math.max(0, Number(query.offset) || 0)

  const filters = []
  if (q) {
    filters.push(
      or(
        like(sql`lower(${packages.name})`, `%${q}%`),
        like(sql`lower(${packages.slug})`, `%${q}%`)
      )
    )
  }
  if (serviceType) {
    filters.push(eq(packages.serviceType, serviceType as 'export'))
  }

  const where = filters.length ? and(...filters) : undefined
  const [totalRow] = await db.select({ value: count() }).from(packages).where(where)
  const rows = await db
    .select()
    .from(packages)
    .where(where)
    .orderBy(desc(packages.sortOrder), desc(packages.createdAt))
    .limit(limit)
    .offset(offset)

  return {
    data: rows,
    meta: { total: totalRow?.value ?? 0, limit, offset }
  }
})
