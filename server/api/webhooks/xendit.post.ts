import { eq, sql } from 'drizzle-orm'
import { orders, payments, sites, promoCodes } from '../../database/schema'
import { createId } from '../../utils/id'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getHeader(event, 'x-callback-token')
  if (!config.xenditWebhookToken || token !== config.xenditWebhookToken) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook token' })
  }

  const body = await readBody(event) as {
    id?: string
    external_id?: string
    status?: string
    payment_method?: string
    amount?: number
    paid_amount?: number
  }

  const status = (body.status || '').toUpperCase()
  if (status !== 'PAID' && status !== 'SETTLED') {
    return { ok: true, ignored: true }
  }

  const db = useDb()
  const providerRef = body.id || null
  const externalId = body.external_id || null

  let payment = providerRef
    ? await db.query.payments.findFirst({ where: eq(payments.providerRef, providerRef) })
    : null

  if (!payment && externalId) {
    const order = await db.query.orders.findFirst({ where: eq(orders.orderNumber, externalId) })
    if (order) {
      payment = await db.query.payments.findFirst({ where: eq(payments.orderId, order.id) })
    }
  }

  if (!payment) {
    throw createError({ statusCode: 404, statusMessage: 'Payment not found' })
  }
  if (payment.status === 'paid') return { ok: true, duplicate: true }

  // Fail closed: PAID/SETTLED must carry amount matching stored payment.
  const rawAmount = body.paid_amount ?? body.amount
  if (rawAmount == null || !Number.isFinite(Number(rawAmount))) {
    throw createError({ statusCode: 400, statusMessage: 'Missing payment amount' })
  }
  const paidAmount = Math.round(Number(rawAmount))
  if (paidAmount !== payment.amountIdr) {
    throw createError({ statusCode: 400, statusMessage: 'Amount mismatch' })
  }

  const order = await db.query.orders.findFirst({ where: eq(orders.id, payment.orderId) })
  if (!order) return { ok: true }

  const now = new Date()
  const userId = order.userId
  const canProvision = Boolean(userId && order.domainName && order.domainTld)
  const domain = canProvision ? `${order.domainName}.${order.domainTld}` : null
  const expires = canProvision
    ? (() => {
        const d = new Date(now)
        d.setFullYear(d.getFullYear() + (order.termYears || 1))
        return d
      })()
    : null

  const paymentId = payment.id
  const orderId = order.id

  // better-sqlite3: payment + order + promo + site in one transaction
  db.transaction((tx) => {
    tx.update(payments).set({
      status: 'paid',
      paidAt: now,
      method: body.payment_method || null,
      rawPayload: body,
      updatedAt: now
    }).where(eq(payments.id, paymentId)).run()

    tx.update(orders).set({
      status: canProvision ? 'provisioning' : 'paid',
      paidAt: now,
      updatedAt: now
    }).where(eq(orders.id, orderId)).run()

    if (order.promoCode) {
      tx.update(promoCodes).set({
        usedCount: sql`${promoCodes.usedCount} + 1`
      }).where(eq(promoCodes.code, order.promoCode)).run()
    }

    if (canProvision && userId && domain && expires) {
      tx.insert(sites).values({
        id: createId('site'),
        userId,
        orderId,
        templateId: order.templateId,
        domain,
        status: 'provisioning',
        expiresAt: expires
      }).onConflictDoNothing().run()
    }
  })

  return { ok: true }
})
