import { eq } from 'drizzle-orm'
import { payments } from '../../database/schema'
import { qrisvipCheckStatus } from '../../utils/qrisvip'
import { fulfillPaidOrder } from '../../utils/order-fulfillment'

/**
 * Optional inbound notify from QrisVIP.
 * Never trusts body amount alone — always re-checks via Check Status V2.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secret = String(config.qrisvipWebhookSecret || '')
  if (secret) {
    const header
      = getHeader(event, 'x-qrisvip-secret')
      || getHeader(event, 'x-callback-token')
      || getHeader(event, 'authorization')?.replace(/^Bearer\s+/i, '')
    if (!header || header !== secret) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid webhook secret' })
    }
  }

  const body = await readBody(event) as Record<string, unknown>
  const trxId = String(
    body.trx_id
    || body.trxId
    || (body.data as { trx_id?: string } | undefined)?.trx_id
    || ''
  ).trim()

  if (!trxId) {
    throw createError({ statusCode: 400, statusMessage: 'trx_id wajib' })
  }

  const db = useDb()
  const payment = await db.query.payments.findFirst({
    where: eq(payments.providerRef, trxId)
  })
  if (!payment) {
    throw createError({ statusCode: 404, statusMessage: 'Payment not found' })
  }
  if (payment.status === 'paid') {
    return { ok: true, duplicate: true }
  }

  const check = await qrisvipCheckStatus(trxId)
  if (!check.ok) {
    return { ok: true, ignored: true, reason: check.error }
  }
  if (check.status !== 'success') {
    return { ok: true, ignored: true, reason: 'not_success' }
  }

  const amount = check.amount ?? payment.amountIdr
  const result = await fulfillPaidOrder({
    orderId: payment.orderId,
    paymentId: payment.id,
    paidAmountIdr: amount,
    method: 'qris',
    providerRef: check.trxId,
    rawPayload: { webhook: body, check: check.raw }
  })

  if (!result.ok) {
    throw createError({
      statusCode: result.reason === 'amount_mismatch' ? 400 : 409,
      statusMessage: result.reason
    })
  }

  return { ok: true, alreadyPaid: result.alreadyPaid, siteConflict: result.siteConflict }
})
