import { eq } from 'drizzle-orm'
import { orders, payments } from '../../../database/schema'
import { assertPayAccess } from '../../../utils/pay-token'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const db = useDb()
  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) })
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pesanan tidak ditemukan' })

  const access = await assertPayAccess(event, {
    id: order.id,
    userId: order.userId,
    customerEmail: order.customerEmail
  })

  const payment = await db.query.payments.findFirst({
    where: eq(payments.orderId, id)
  })
  if (!payment) throw createError({ statusCode: 404, statusMessage: 'Pembayaran tidak ditemukan' })

  const domainLabel = order.domainName && order.domainTld
    ? `${order.domainName}.${order.domainTld}`
    : null

  return {
    data: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      totalIdr: order.totalIdr,
      domainLabel,
      paymentId: payment.id,
      paymentStatus: payment.status,
      provider: payment.provider,
      method: payment.method,
      qrisPayload: payment.qrisPayload,
      // providerRef only for staff (internal reconciliation); never leak to customers
      ...(access.via === 'staff' ? { providerRef: payment.providerRef } : {}),
      expiresAt: payment.expiresAt,
      paidAt: payment.paidAt
    }
  }
})
