import { and, count, desc, eq, like, or, sql } from 'drizzle-orm'
import { users } from '../../../database/schema'
import type { UserRole } from '../../../../app/utils/roles'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const db = useDb()
  const query = getQuery(event)

  const q = typeof query.q === 'string' ? query.q.trim().toLowerCase() : ''
  const role = typeof query.role === 'string' ? query.role.trim() : ''
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50))
  const offset = Math.max(0, Number(query.offset) || 0)

  const filters = []
  if (q) {
    filters.push(
      or(
        like(sql`lower(${users.email})`, `%${q}%`),
        like(sql`lower(${users.name})`, `%${q}%`)
      )
    )
  }
  if (role && ['customer', 'cs', 'admin', 'dev'].includes(role)) {
    filters.push(eq(users.role, role as UserRole))
  }

  const where = filters.length ? and(...filters) : undefined

  const [totalRow] = await db.select({ value: count() }).from(users).where(where)
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset)

  return {
    data: rows,
    meta: {
      total: totalRow?.value ?? 0,
      limit,
      offset
    }
  }
})
