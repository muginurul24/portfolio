import { and, eq, lt } from 'drizzle-orm'
import { orders, payments } from '../database/schema'

/** Unpaid orders older than this are auto-expired. */
export const UNPAID_TTL_MS = 48 * 60 * 60 * 1000

export function shouldExpireOrder(
  order: { status: string, createdAt: Date | string | number | null | undefined },
  now = new Date()
): boolean {
  if (order.status !== 'pending_payment') return false
  if (order.createdAt == null) return false
  const created = order.createdAt instanceof Date
    ? order.createdAt
    : new Date(order.createdAt)
  if (Number.isNaN(created.getTime())) return false
  return now.getTime() - created.getTime() >= UNPAID_TTL_MS
}

/**
 * Mark stale pending_payment orders (and their payments) as expired.
 * Safe to call from cron or opportunistic paths.
 */
export async function expireStaleOrders(now = new Date()) {
  const db = useDb()
  const cutoff = new Date(now.getTime() - UNPAID_TTL_MS)
  const stale = await db.query.orders.findMany({
    where: and(
      eq(orders.status, 'pending_payment'),
      lt(orders.createdAt, cutoff)
    )
  })

  const expiredOrderIds: string[] = []
  for (const o of stale) {
    await db.update(orders)
      .set({ status: 'expired', updatedAt: now })
      .where(eq(orders.id, o.id))
    await db.update(payments)
      .set({ status: 'expired', updatedAt: now })
      .where(and(
        eq(payments.orderId, o.id),
        eq(payments.status, 'pending')
      ))
    expiredOrderIds.push(o.id)
  }

  return { expiredOrderIds }
}

/**
 * Expire a single order + pending payments if past unpaid TTL.
 * Returns true when status was flipped to expired.
 */
export async function expireOrderIfStale(
  order: { id: string, status: string, createdAt: Date | string | number | null | undefined },
  now = new Date()
): Promise<boolean> {
  if (!shouldExpireOrder(order, now)) return false
  const db = useDb()
  await db.update(orders)
    .set({ status: 'expired', updatedAt: now })
    .where(eq(orders.id, order.id))
  await db.update(payments)
    .set({ status: 'expired', updatedAt: now })
    .where(and(
      eq(payments.orderId, order.id),
      eq(payments.status, 'pending')
    ))
  return true
}
