import { and, count, desc, eq, like, or, sql } from 'drizzle-orm'
import { sites } from '../../../database/schema'

const STATUSES = ['provisioning', 'active', 'suspended', 'expired'] as const

export default defineEventHandler(async (event) => {
  await requireRole(event, ['cs', 'admin', 'dev'])
  const db = useDb()
  const query = getQuery(event)

  const q = typeof query.q === 'string' ? query.q.trim().toLowerCase() : ''
  const status = typeof query.status === 'string' ? query.status.trim() : ''
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50))
  const offset = Math.max(0, Number(query.offset) || 0)

  const filters = []
  if (q) {
    filters.push(
      or(
        like(sql`lower(${sites.domain})`, `%${q}%`),
        like(sql`lower(${sites.adminUrl})`, `%${q}%`)
      )
    )
  }
  if (status && (STATUSES as readonly string[]).includes(status)) {
    filters.push(eq(sites.status, status as typeof STATUSES[number]))
  }

  const where = filters.length ? and(...filters) : undefined
  const [totalRow] = await db.select({ value: count() }).from(sites).where(where)
  const rows = await db
    .select()
    .from(sites)
    .where(where)
    .orderBy(desc(sites.createdAt))
    .limit(limit)
    .offset(offset)

  return { data: rows, meta: { total: totalRow?.value ?? 0, limit, offset } }
})
