import { eq, sql } from 'drizzle-orm'
import { orders, payments, sites, promoCodes, users } from '../../database/schema'
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

  // Ignore paid webhook on terminal order statuses
  if (order.status === 'cancelled' || order.status === 'expired') {
    console.warn('[xendit webhook] ignore PAID on terminal order', {
      orderId: order.id,
      status: order.status
    })
    return { ok: true, ignored: true, reason: 'terminal_status' }
  }

  // Guest claim: attach known user by customer email when order has no userId
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

  const paymentId = payment.id
  const orderId = order.id
  let siteConflict = false

  // better-sqlite3: payment + order + promo + site in one transaction
  db.transaction((tx) => {
    // Re-read payment inside tx - skip if already paid (concurrent webhook)
    const freshPayment = tx.select().from(payments).where(eq(payments.id, paymentId)).get()
    if (!freshPayment || freshPayment.status === 'paid') return

    const freshOrder = tx.select().from(orders).where(eq(orders.id, orderId)).get()
    if (!freshOrder) return
    if (freshOrder.status === 'cancelled' || freshOrder.status === 'expired') return

    tx.update(payments).set({
      status: 'paid',
      paidAt: now,
      method: body.payment_method || null,
      rawPayload: body,
      updatedAt: now
    }).where(eq(payments.id, paymentId)).run()

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
        orderPatch.notes = freshOrder.notes
          ? `${freshOrder.notes}\n${note}`
          : note
        orderPatch.status = 'paid'
        console.error('[xendit webhook] site domain conflict', {
          orderId,
          domain,
          existingSiteId: existing.id
        })
      } else {
        tx.insert(sites).values({
          id: createId('site'),
          userId,
          orderId,
          templateId: freshOrder.templateId,
          domain,
          status: 'provisioning',
          expiresAt: expires
        }).run()
      }
    } else if (!userId) {
      const note = 'Paid but no userId - guest order, site not provisioned until account linked'
      orderPatch.notes = freshOrder.notes
        ? `${freshOrder.notes}\n${note}`
        : note
    }

    tx.update(orders).set(orderPatch).where(eq(orders.id, orderId)).run()

    if (freshOrder.promoCode) {
      tx.update(promoCodes).set({
        usedCount: sql`${promoCodes.usedCount} + 1`
      }).where(eq(promoCodes.code, freshOrder.promoCode)).run()
    }
  })

  return { ok: true, siteConflict: siteConflict || undefined }
})
