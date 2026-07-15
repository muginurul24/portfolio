import {
  findPaymentForQris,
  isDisbursementCallback,
  parseDepositCallback,
  reconcileQrisPayment
} from '../../utils/qris-reconcile'

/**
 * QrisVIP → MugiewDev webhook.
 *
 * Deposit callback (official sample):
 * {
 *   amount, terminal_id, merchant_id, trx_id, rrn, custom_ref,
 *   vendor, status: "success", created_at, finish_at
 * }
 *
 * Disbursement callbacks (partner_ref_no) are ignored (out of scope).
 *
 * Security:
 * - Fail-closed when secret empty in production or qrisvipRequireWebhookSecret
 * - Shared secret header when NUXT_QRISVIP_WEBHOOK_SECRET set
 * - Always prefer Check Status V2 re-verify
 * - Fallback webhook proof only if amount + merchant_id match
 * - Remote success with null amount requires webhook amount (amount_missing)
 * - Idempotent on already-paid
 *
 * Always returns 2xx for known payload shapes so provider does not retry forever
 * on business rejects (logged server-side). Auth failures still 401/500.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secret = String(config.qrisvipWebhookSecret || '')
  const requireSecret = process.env.NODE_ENV === 'production' || Boolean(config.qrisvipRequireWebhookSecret)
  if (requireSecret && !secret) {
    throw createError({ statusCode: 500, statusMessage: 'Webhook secret not configured' })
  }
  if (secret) {
    const header
      = getHeader(event, 'x-qrisvip-secret')
      || getHeader(event, 'x-callback-token')
      || getHeader(event, 'x-webhook-secret')
      || getHeader(event, 'authorization')?.replace(/^Bearer\s+/i, '')
    if (!header || header !== secret) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid webhook secret' })
    }
  }

  let body: Record<string, unknown>
  try {
    body = (await readBody(event)) as Record<string, unknown>
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON body' })
  }
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Body wajib object JSON' })
  }

  // Ignore transfer/disbursement callbacks (not deposit QRIS)
  if (isDisbursementCallback(body)) {
    console.info('[qrisvip webhook] ignore disbursement callback')
    return { ok: true, ignored: true, reason: 'disbursement_out_of_scope', message: 'received' }
  }

  const parsed = parseDepositCallback(body)

  // Non-success deposit notify (should not happen per docs; ack anyway)
  if (parsed.status && parsed.status !== 'success') {
    console.info('[qrisvip webhook] non-success status', { status: parsed.status, trxId: parsed.trxId })
    return { ok: true, ignored: true, reason: 'not_success', message: 'received' }
  }

  if (!parsed.trxId && !parsed.customRef) {
    throw createError({ statusCode: 400, statusMessage: 'trx_id atau custom_ref wajib' })
  }

  const payment = await findPaymentForQris({
    trxId: parsed.trxId,
    customRef: parsed.customRef
  })

  if (!payment) {
    // 200 so provider stops retrying unknown old txs; log for ops
    console.warn('[qrisvip webhook] payment not found', {
      trxId: parsed.trxId,
      customRef: parsed.customRef
    })
    return { ok: true, ignored: true, reason: 'payment_not_found', message: 'received' }
  }

  if (payment.provider !== 'qrisvip') {
    return { ok: true, ignored: true, reason: 'wrong_provider', message: 'received' }
  }

  const trxId = parsed.trxId || payment.providerRef
  if (!trxId) {
    return { ok: true, ignored: true, reason: 'missing_trx', message: 'received' }
  }

  // Persist trx_id if we only matched via custom_ref
  if (!payment.providerRef && parsed.trxId) {
    const db = useDb()
    const { eq } = await import('drizzle-orm')
    const { payments: paymentsTable } = await import('../../database/schema')
    await db.update(paymentsTable).set({
      providerRef: parsed.trxId,
      updatedAt: new Date()
    }).where(eq(paymentsTable.id, payment.id))
  }

  const result = await reconcileQrisPayment({
    paymentId: payment.id,
    orderId: payment.orderId,
    trxId,
    webhook: parsed,
    rawWebhook: body
  })

  if (!result.ok) {
    console.error('[qrisvip webhook] reconcile failed', {
      reason: result.reason,
      paymentId: payment.id,
      orderId: payment.orderId,
      trxId
    })
    // Business reject: still 200 + message so QrisVIP does not hammer retries;
    // amount mismatch is serious — return 422 so it surfaces in provider logs.
    if (
      result.reason === 'amount_mismatch'
      || result.reason === 'amount_missing'
      || result.reason === 'merchant_mismatch'
    ) {
      throw createError({ statusCode: 422, statusMessage: result.reason })
    }
    return { ok: true, ignored: true, reason: result.reason, message: 'received' }
  }

  return {
    ok: true,
    message: 'received',
    alreadyPaid: result.alreadyPaid,
    siteConflict: result.siteConflict,
    source: result.source
  }
})
