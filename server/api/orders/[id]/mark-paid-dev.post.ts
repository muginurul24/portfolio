import { eq } from 'drizzle-orm'
import { orders, payments } from '../../../database/schema'
import { fulfillPaidOrder } from '../../../utils/order-fulfillment'

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  // Dev-only role when auth helpers present
  let user: { id: string, role?: string, email?: string }
  try {
    const session = await requireRole(event, ['dev'])
    user = sessionUser(session)
  } catch (e: unknown) {
    const err = e as { statusCode?: number }
    if (err?.statusCode === 403) throw e
    const session = await getUserSession(event)
    if (!session.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    user = session.user as { id: string, role?: string, email?: string }
  }

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const db = useDb()
  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) })
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  if (order.status === 'cancelled' || order.status === 'expired') {
    throw createError({ statusCode: 400, statusMessage: 'Order terminal - tidak bisa mark paid' })
  }

  const isStaff = user.role === 'admin' || user.role === 'cs' || user.role === 'dev'
  const email = user.email?.toLowerCase().trim()
  if (!isStaff && order.userId !== user.id && order.customerEmail !== email) {
    throw createError({ statusCode: 403, statusMessage: 'Akses ditolak' })
  }

  const payment = await db.query.payments.findFirst({
    where: eq(payments.orderId, id)
  })
  if (!payment) throw createError({ statusCode: 404, statusMessage: 'Payment not found' })

  const result = await fulfillPaidOrder({
    orderId: order.id,
    paymentId: payment.id,
    paidAmountIdr: payment.amountIdr,
    method: payment.method || 'qris',
    rawPayload: { source: 'mark-paid-dev' }
  })

  if (!result.ok) {
    throw createError({ statusCode: 400, statusMessage: result.reason })
  }

  return { ok: true, alreadyPaid: result.alreadyPaid, siteConflict: result.siteConflict }
})
