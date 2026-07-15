import { eq } from 'drizzle-orm'
import { orders, payments, sites } from '../../../database/schema'
import { createId } from '../../../utils/id'

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  const session = await getUserSession(event)
  if (!session.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })
  const db = useDb()
  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) })
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const now = new Date()
  await db.update(payments).set({ status: 'paid', paidAt: now, updatedAt: now }).where(eq(payments.orderId, id))
  await db.update(orders).set({ status: 'paid', paidAt: now, updatedAt: now }).where(eq(orders.id, id))

  const userId = order.userId || (session.user as { id: string }).id
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
    await db.update(orders).set({ status: 'provisioning', updatedAt: new Date() }).where(eq(orders.id, id))
  }
  return { ok: true }
})
