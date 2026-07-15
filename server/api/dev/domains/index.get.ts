import { and, count, desc, eq, like, sql } from 'drizzle-orm'
import { domainTlds } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const db = useDb()
  const query = getQuery(event)

  const q = typeof query.q === 'string' ? query.q.trim().toLowerCase() : ''
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50))
  const offset = Math.max(0, Number(query.offset) || 0)

  const filters = []
  if (q) {
    filters.push(like(sql`lower(${domainTlds.tld})`, `%${q}%`))
  }
  if (query.active === 'true') filters.push(eq(domainTlds.isActive, true))
  if (query.active === 'false') filters.push(eq(domainTlds.isActive, false))

  const where = filters.length ? and(...filters) : undefined
  const [totalRow] = await db.select({ value: count() }).from(domainTlds).where(where)
  const rows = await db
    .select()
    .from(domainTlds)
    .where(where)
    .orderBy(desc(domainTlds.isActive), domainTlds.tld)
    .limit(limit)
    .offset(offset)

  return {
    data: rows,
    meta: { total: totalRow?.value ?? 0, limit, offset }
  }
})
