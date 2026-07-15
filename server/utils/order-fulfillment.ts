import { eq, sql } from 'drizzle-orm'
import { orders, payments, sites, promoCodes, users } from '../database/schema'
import { createId } from './id'

/**
 * Mark payment+order paid and provision site when possible.
 * Idempotent if already paid. Amount must match stored payment.
 */
export async function fulfillPaidOrder(input: {
  orderId: string
  paymentId: string
  paidAmountIdr: number
  method?: string | null
  providerRef?: string | null
  rawPayload?: unknown
}): Promise<{ ok: true, alreadyPaid?: boolean, siteConflict?: boolean } | { ok: false, reason: string }> {
  const db = useDb()

  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, input.paymentId)
  })
  if (!payment) return { ok: false, reason: 'payment_not_found' }
  if (payment.orderId !== input.orderId) return { ok: false, reason: 'payment_order_mismatch' }
  if (payment.status === 'paid') return { ok: true, alreadyPaid: true }

  if (!Number.isFinite(input.paidAmountIdr) || Math.round(input.paidAmountIdr) !== payment.amountIdr) {
    return { ok: false, reason: 'amount_mismatch' }
  }

  const order = await db.query.orders.findFirst({ where: eq(orders.id, input.orderId) })
  if (!order) return { ok: false, reason: 'order_not_found' }
  if (order.status === 'cancelled' || order.status === 'expired') {
    return { ok: false, reason: 'terminal_status' }
  }

  let userId = order.userId
  if (!userId && order.customerEmail) {
    const email = order.customerEmail.toLowerCase().trim()
    const owner = await db.query.users.findFirst({ where: eq(users.email, email) })
    if (owner) userId = owner.id
  }

  const now = new Date()
  const domain = order.domainName && order.domainTld
    ? `${order.domainName}.${order.domainTld}`
    : null
  const canProvision = Boolean(userId && domain)
  const expires = canProvision
    ? (() => {
        const d = new Date(now)
        d.setFullYear(d.getFullYear() + (order.termYears || 1))
        return d
      })()
    : null

  let siteConflict = false

  db.transaction((tx) => {
    const freshPayment = tx.select().from(payments).where(eq(payments.id, input.paymentId)).get()
    if (!freshPayment || freshPayment.status === 'paid') return

    const freshOrder = tx.select().from(orders).where(eq(orders.id, input.orderId)).get()
    if (!freshOrder) return
    if (freshOrder.status === 'cancelled' || freshOrder.status === 'expired') return

    tx.update(payments).set({
      status: 'paid',
      paidAt: now,
      method: input.method ?? freshPayment.method ?? 'qris',
      ...(input.providerRef ? { providerRef: input.providerRef } : {}),
      ...(input.rawPayload !== undefined ? { rawPayload: input.rawPayload } : {}),
      updatedAt: now
    }).where(eq(payments.id, input.paymentId)).run()

    const orderPatch: {
      status: 'paid' | 'provisioning'
      paidAt: Date
      updatedAt: Date
      userId?: string
      notes?: string | null
    } = {
      status: canProvision ? 'provisioning' : 'paid',
      paidAt: now,
      updatedAt: now
    }
    if (userId && !freshOrder.userId) {
      orderPatch.userId = userId
    }

    if (canProvision && userId && domain && expires) {
      const existing = tx.select().from(sites).where(eq(sites.domain, domain)).get()
      if (existing) {
        siteConflict = true
        const note = `Domain conflict: ${domain} already provisioned (site ${existing.id})`
        orderPatch.notes = freshOrder.notes ? `${freshOrder.notes}\n${note}` : note
        orderPatch.status = 'paid'
      } else {
        tx.insert(sites).values({
          id: createId('site'),
          userId,
          orderId: input.orderId,
          templateId: freshOrder.templateId,
          domain,
          status: 'provisioning',
          expiresAt: expires
        }).run()
      }
    } else if (!userId) {
      const note = 'Paid but no userId — guest order, site not provisioned until account linked'
      orderPatch.notes = freshOrder.notes ? `${freshOrder.notes}\n${note}` : note
    }

    tx.update(orders).set(orderPatch).where(eq(orders.id, input.orderId)).run()

    if (freshOrder.promoCode) {
      tx.update(promoCodes).set({
        usedCount: sql`${promoCodes.usedCount} + 1`
      }).where(eq(promoCodes.code, freshOrder.promoCode)).run()
    }
  })

  return { ok: true, siteConflict: siteConflict || undefined }
}
