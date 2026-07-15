import { eq } from 'drizzle-orm'
import { orders, payments } from '../../../database/schema'
import { qrisvipCheckStatus } from '../../../utils/qrisvip'
import { fulfillPaidOrder } from '../../../utils/order-fulfillment'
import { assertPayAccess } from '../../../utils/pay-token'
import { expireOrderIfStale } from '../../../utils/order-expiry'

/**
 * Poll endpoint for pay page.
 * Only marks paid when Check Status V2 returns status "success"
 * and amount matches (or remote omits amount — then use stored amount).
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const db = useDb()
  let order = await db.query.orders.findFirst({ where: eq(orders.id, id) })
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pesanan tidak ditemukan' })

  await assertPayAccess(event, {
    id: order.id,
    userId: order.userId,
    customerEmail: order.customerEmail
  })

  let payment = await db.query.payments.findFirst({
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

  // Opportunistic: expire unpaid order past 48h before remote poll
  if (await expireOrderIfStale(order)) {
    order = await db.query.orders.findFirst({ where: eq(orders.id, id) }) || order
    payment = await db.query.payments.findFirst({ where: eq(payments.orderId, id) }) || payment
    return {
      data: {
        orderStatus: order.status,
        paymentStatus: payment.status,
        paid: false,
        expired: true
      }
    }
  }

  if (order.status === 'expired' || payment.status === 'expired') {
    return {
      data: {
        orderStatus: order.status,
        paymentStatus: payment.status,
        paid: false,
        expired: true
      }
    }
  }

  // Expired QR: soft flag (do not auto-cancel order here)
  const expired = payment.expiresAt
    ? new Date(payment.expiresAt).getTime() < Date.now()
    : false

  if (!payment.providerRef || payment.provider !== 'qrisvip') {
    return {
      data: {
        orderStatus: order.status,
        paymentStatus: payment.status,
        paid: false,
        expired
      }
    }
  }

  const check = await qrisvipCheckStatus(payment.providerRef)

  if (check.ok && check.status === 'success') {
    if (check.amount != null && check.amount !== payment.amountIdr) {
      console.error('[payment-status] amount mismatch', {
        orderId: id,
        expected: payment.amountIdr,
        remote: check.amount
      })
      return {
        data: {
          orderStatus: order.status,
          paymentStatus: payment.status,
          paid: false,
          remote: 'success',
          remoteError: 'amount_mismatch',
          expired
        }
      }
    }

    const result = await fulfillPaidOrder({
      orderId: order.id,
      paymentId: payment.id,
      paidAmountIdr: payment.amountIdr,
      method: 'qris',
      providerRef: check.trxId || payment.providerRef,
      rawPayload: { source: 'payment_status_poll', check: check.raw }
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

    return {
      data: {
        orderStatus: order.status,
        paymentStatus: payment.status,
        paid: false,
        remote: 'success',
        remoteError: result.reason,
        expired
      }
    }
  }

  return {
    data: {
      orderStatus: order.status,
      paymentStatus: payment.status,
      paid: false,
      remote: check.ok ? check.status : undefined,
      remoteError: check.ok ? undefined : check.error,
      expired
    }
  }
})
