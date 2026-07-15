import { eq } from 'drizzle-orm'
import { orders, payments, sites, users } from '../../../database/schema'
import { createId } from '../../../utils/id'

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  const session = await getUserSession(event)
  if (!session.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const user = session.user as { id: string, role?: string, email?: string }
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })
  const db = useDb()
  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) })
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  if (order.status === 'cancelled' || order.status === 'expired') {
    throw createError({ statusCode: 400, statusMessage: 'Order terminal - tidak bisa mark paid' })
  }

  const isStaff = user.role === 'admin' || user.role === 'cs'
  const email = user.email?.toLowerCase().trim()
  if (!isStaff && order.userId !== user.id && order.customerEmail !== email) {
    throw createError({ statusCode: 403, statusMessage: 'Akses ditolak' })
  }

  const now = new Date()
  let userId = order.userId || user.id
  if (!order.userId && order.customerEmail) {
    const owner = await db.query.users.findFirst({
      where: eq(users.email, order.customerEmail.toLowerCase().trim())
    })
    if (owner) userId = owner.id
  }

  await db.update(payments).set({ status: 'paid', paidAt: now, updatedAt: now }).where(eq(payments.orderId, id))
  await db.update(orders).set({
    status: 'paid',
    paidAt: now,
    updatedAt: now,
    ...(userId && !order.userId ? { userId } : {})
  }).where(eq(orders.id, id))

  if (userId && order.domainName && order.domainTld) {
    const domain = `${order.domainName}.${order.domainTld}`
    const expires = new Date(now)
    expires.setFullYear(expires.getFullYear() + (order.termYears || 1))
    const existing = await db.query.sites.findFirst({ where: eq(sites.domain, domain) })
    if (existing) {
      const note = `Domain conflict: ${domain} already provisioned (site ${existing.id})`
      await db.update(orders).set({
        notes: order.notes ? `${order.notes}\n${note}` : note,
        updatedAt: new Date()
      }).where(eq(orders.id, id))
    } else {
      await db.insert(sites).values({
        id: createId('site'),
        userId,
        orderId: order.id,
        templateId: order.templateId,
        domain,
        status: 'provisioning',
        expiresAt: expires
      })
      await db.update(orders).set({ status: 'provisioning', updatedAt: new Date() }).where(eq(orders.id, id))
    }
  }
  return { ok: true }
})
