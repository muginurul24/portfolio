import { eq } from 'drizzle-orm'
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

  const now = new Date()
  await db.update(payments).set({
    status: 'paid',
    paidAt: now,
    method: body.payment_method || null,
    rawPayload: body,
    updatedAt: now
  }).where(eq(payments.id, payment.id))

  const order = await db.query.orders.findFirst({ where: eq(orders.id, payment.orderId) })
  if (!order) return { ok: true }

  await db.update(orders).set({
    status: 'paid',
    paidAt: now,
    updatedAt: now
  }).where(eq(orders.id, order.id))

  if (order.promoCode) {
    const promo = await db.query.promoCodes.findFirst({ where: eq(promoCodes.code, order.promoCode) })
    if (promo) {
      await db.update(promoCodes).set({
        usedCount: (promo.usedCount || 0) + 1
      }).where(eq(promoCodes.id, promo.id))
    }
  }

  const userId = order.userId
  if (userId && order.domainName && order.domainTld) {
    const domain = `${order.domainName}.${order.domainTld}`
    const expires = new Date(now)
    expires.setFullYear(expires.getFullYear() + (order.termYears || 1))
    await db.insert(sites).values({
      id: createId('site'),
      userId,
      orderId: order.id,
      templateId: order.templateId,
      domain,
      status: 'provisioning',
      expiresAt: expires
    }).onConflictDoNothing()

    await db.update(orders).set({
      status: 'provisioning',
      updatedAt: new Date()
    }).where(eq(orders.id, order.id))
  }

  return { ok: true }
})
