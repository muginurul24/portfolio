import { eq } from 'drizzle-orm'
import { orders, payments } from '../../../database/schema'
import { qrisvipCheckStatus } from '../../../utils/qrisvip'
import { fulfillPaidOrder } from '../../../utils/order-fulfillment'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const db = useDb()
  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) })
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pesanan tidak ditemukan' })

  const payment = await db.query.payments.findFirst({
    where: eq(payments.orderId, id)
  })
  if (!payment) throw createError({ statusCode: 404, statusMessage: 'Pembayaran tidak ditemukan' })

  if (
    payment.status === 'paid'
    || order.status === 'paid'
    || order.status === 'provisioning'
    || order.status === 'active'
  ) {
    return {
      data: {
        orderStatus: order.status,
        paymentStatus: payment.status === 'paid' ? 'paid' : payment.status,
        paid: true
      }
    }
  }

  if (!payment.providerRef || payment.provider !== 'qrisvip') {
    return {
      data: {
        orderStatus: order.status,
        paymentStatus: payment.status,
        paid: false
      }
    }
  }

  const check = await qrisvipCheckStatus(payment.providerRef)
  if (check.ok && check.status === 'success') {
    const amount = check.amount ?? payment.amountIdr
    const result = await fulfillPaidOrder({
      orderId: order.id,
      paymentId: payment.id,
      paidAmountIdr: amount,
      method: 'qris',
      providerRef: check.trxId,
      rawPayload: check.raw
    })
    if (result.ok) {
      const fresh = await db.query.orders.findFirst({ where: eq(orders.id, id) })
      return {
        data: {
          orderStatus: fresh?.status || 'paid',
          paymentStatus: 'paid',
          paid: true
        }
      }
    }
  }

  return {
    data: {
      orderStatus: order.status,
      paymentStatus: payment.status,
      paid: false,
      remote: check.ok ? check.status : undefined,
      remoteError: check.ok ? undefined : check.error
    }
  }
})
