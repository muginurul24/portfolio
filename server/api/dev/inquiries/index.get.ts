import { and, count, desc, eq, like, or, sql } from 'drizzle-orm'
import { inquiries } from '../../../database/schema'

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const

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
        like(sql`lower(${inquiries.name})`, `%${q}%`),
        like(sql`lower(${inquiries.email})`, `%${q}%`),
        like(sql`lower(${inquiries.company})`, `%${q}%`),
        like(sql`lower(${inquiries.phone})`, `%${q}%`)
      )
    )
  }
  if (status && (STATUSES as readonly string[]).includes(status)) {
    filters.push(eq(inquiries.status, status as typeof STATUSES[number]))
  }

  const where = filters.length ? and(...filters) : undefined
  const [totalRow] = await db.select({ value: count() }).from(inquiries).where(where)
  const rows = await db
    .select()
    .from(inquiries)
    .where(where)
    .orderBy(desc(inquiries.createdAt))
    .limit(limit)
    .offset(offset)

  return { data: rows, meta: { total: totalRow?.value ?? 0, limit, offset } }
})
