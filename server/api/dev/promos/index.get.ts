import { and, count, desc, like, sql } from 'drizzle-orm'
import { promoCodes } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const db = useDb()
  const query = getQuery(event)
  const q = typeof query.q === 'string' ? query.q.trim().toUpperCase() : ''
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50))
  const offset = Math.max(0, Number(query.offset) || 0)

  const filters = []
  if (q) filters.push(like(sql`upper(${promoCodes.code})`, `%${q}%`))
  const where = filters.length ? and(...filters) : undefined

  const [totalRow] = await db.select({ value: count() }).from(promoCodes).where(where)
  const rows = await db
    .select()
    .from(promoCodes)
    .where(where)
    .orderBy(desc(promoCodes.isActive), promoCodes.code)
    .limit(limit)
    .offset(offset)

  return { data: rows, meta: { total: totalRow?.value ?? 0, limit, offset } }
})
