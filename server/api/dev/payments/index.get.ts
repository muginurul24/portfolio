import { and, count, desc, eq, like, or, sql } from 'drizzle-orm'
import { orders, payments } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['cs', 'admin', 'dev'])
  const db = useDb()
  const query = getQuery(event)

  const q = typeof query.q === 'string' ? query.q.trim().toLowerCase() : ''
  const status = typeof query.status === 'string' ? query.status.trim() : ''
  const orderId = typeof query.orderId === 'string' ? query.orderId.trim() : ''
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50))
  const offset = Math.max(0, Number(query.offset) || 0)

  const filters = []
  if (orderId) filters.push(eq(payments.orderId, orderId))
  if (status) filters.push(eq(payments.status, status as 'pending'))
  if (q) {
    filters.push(
      or(
        like(sql`lower(${payments.providerRef})`, `%${q}%`),
        like(sql`lower(${payments.method})`, `%${q}%`),
        like(sql`lower(${orders.orderNumber})`, `%${q}%`)
      )
    )
  }

  const where = filters.length ? and(...filters) : undefined

  const base = db
    .select({
      id: payments.id,
      orderId: payments.orderId,
      orderNumber: orders.orderNumber,
      provider: payments.provider,
      providerRef: payments.providerRef,
      method: payments.method,
      amountIdr: payments.amountIdr,
      status: payments.status,
      paidAt: payments.paidAt,
      createdAt: payments.createdAt,
      updatedAt: payments.updatedAt
    })
    .from(payments)
    .leftJoin(orders, eq(payments.orderId, orders.id))

  const [totalRow] = await db
    .select({ value: count() })
    .from(payments)
    .leftJoin(orders, eq(payments.orderId, orders.id))
    .where(where)

  const rows = await base
    .where(where)
    .orderBy(desc(payments.createdAt))
    .limit(limit)
    .offset(offset)

  return { data: rows, meta: { total: totalRow?.value ?? 0, limit, offset } }
})
