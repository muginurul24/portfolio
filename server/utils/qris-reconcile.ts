import { eq } from 'drizzle-orm'
import { orders, payments } from '../database/schema'
import { qrisvipCheckStatus, sanitizeCustomRef } from './qrisvip'
import { fulfillPaidOrder } from './order-fulfillment'

/** Official QrisVIP deposit callback fields (Postman "QRIS Payment Callback Sample"). */
export interface QrisDepositCallback {
  amount?: number
  terminal_id?: string
  merchant_id?: string
  trx_id?: string
  rrn?: string
  custom_ref?: string
  vendor?: string
  status?: string
  created_at?: string
  finish_at?: string
  // loose aliases
  trxId?: string
  merchantId?: string
  customRef?: string
}

export function isDisbursementCallback(body: Record<string, unknown>): boolean {
  const hasPartner = body.partner_ref_no != null || body.partnerRefNo != null
  const hasTrx = body.trx_id != null || body.trxId != null
  return Boolean(hasPartner && !hasTrx)
}

export function parseDepositCallback(body: Record<string, unknown>): {
  trxId: string | null
  customRef: string | null
  status: string
  amount: number | null
  merchantId: string | null
  rrn: string | null
  terminalId: string | null
  vendor: string | null
} {
  const data = (body.data && typeof body.data === 'object'
    ? body.data as Record<string, unknown>
    : body) as QrisDepositCallback & Record<string, unknown>

  const trxId = String(data.trx_id || data.trxId || '').trim() || null
  const customRef = String(data.custom_ref || data.customRef || '').trim() || null
  const status = String(data.status || '').trim().toLowerCase()
  const rawAmount = data.amount
  const amount = rawAmount != null && Number.isFinite(Number(rawAmount))
    ? Math.round(Number(rawAmount))
    : null
  const merchantId = String(data.merchant_id || data.merchantId || '').trim() || null
  const rrn = data.rrn != null ? String(data.rrn) : null
  const terminalId = data.terminal_id != null ? String(data.terminal_id) : null
  const vendor = data.vendor != null ? String(data.vendor) : null

  return { trxId, customRef, status, amount, merchantId, rrn, terminalId, vendor }
}

export async function findPaymentForQris(input: {
  trxId?: string | null
  customRef?: string | null
}) {
  const db = useDb()

  if (input.trxId) {
    const byTrx = await db.query.payments.findFirst({
      where: eq(payments.providerRef, input.trxId)
    })
    if (byTrx) return byTrx
  }

  // Fallback: custom_ref was sanitizeCustomRef(orderNumber) at generate time
  if (input.customRef) {
    const ref = sanitizeCustomRef(input.customRef)
    const allPending = await db.query.payments.findMany({
      where: eq(payments.status, 'pending')
    })
    for (const p of allPending) {
      const order = await db.query.orders.findFirst({ where: eq(orders.id, p.orderId) })
      if (!order) continue
      if (sanitizeCustomRef(order.orderNumber) === ref) return p
    }
  }

  return null
}

/**
 * Confirm paid via Check Status V2 when possible; optional webhook payload as secondary proof.
 * Always requires amount match against stored payment.amountIdr.
 */
export async function reconcileQrisPayment(input: {
  paymentId: string
  orderId: string
  trxId: string
  webhook?: ReturnType<typeof parseDepositCallback> | null
  rawWebhook?: unknown
}): Promise<
  | { ok: true, alreadyPaid?: boolean, siteConflict?: boolean, source: 'remote' | 'webhook' | 'already' }
  | { ok: false, reason: string }
> {
  const db = useDb()
  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, input.paymentId)
  })
  if (!payment) return { ok: false, reason: 'payment_not_found' }
  if (payment.status === 'paid') {
    return { ok: true, alreadyPaid: true, source: 'already' }
  }

  const expected = payment.amountIdr
  const config = useRuntimeConfig()
  const merchantUuid = String(config.qrisvipUuid || '')

  // 1) Prefer remote check (authoritative when credentials work)
  const check = await qrisvipCheckStatus(input.trxId)
  if (check.ok && check.status === 'success') {
    if (check.amount != null && check.amount !== expected) {
      console.error('[qris-reconcile] remote amount mismatch', {
        expected,
        remote: check.amount,
        trxId: input.trxId
      })
      return { ok: false, reason: 'amount_mismatch' }
    }
    const result = await fulfillPaidOrder({
      orderId: input.orderId,
      paymentId: input.paymentId,
      paidAmountIdr: expected,
      method: 'qris',
      providerRef: check.trxId || input.trxId,
      rawPayload: { source: 'remote_check', check: check.raw, webhook: input.rawWebhook }
    })
    if (!result.ok) return result
    return {
      ok: true,
      alreadyPaid: result.alreadyPaid,
      siteConflict: result.siteConflict,
      source: 'remote'
    }
  }

  // 2) Webhook fallback when remote check unavailable — strict field checks
  const wh = input.webhook
  if (wh && wh.status === 'success') {
    if (wh.amount == null || wh.amount !== expected) {
      return { ok: false, reason: 'amount_mismatch' }
    }
    // merchant_id must match configured uuid when both present
    if (merchantUuid && wh.merchantId && wh.merchantId !== merchantUuid) {
      console.error('[qris-reconcile] merchant_id mismatch', {
        expected: merchantUuid,
        got: wh.merchantId
      })
      return { ok: false, reason: 'merchant_mismatch' }
    }
    if (wh.trxId && wh.trxId !== input.trxId) {
      return { ok: false, reason: 'trx_mismatch' }
    }

    const result = await fulfillPaidOrder({
      orderId: input.orderId,
      paymentId: input.paymentId,
      paidAmountIdr: expected,
      method: 'qris',
      providerRef: input.trxId,
      rawPayload: {
        source: 'webhook_fallback',
        remoteError: check.ok ? check.status : check.error,
        webhook: input.rawWebhook
      }
    })
    if (!result.ok) return result
    return {
      ok: true,
      alreadyPaid: result.alreadyPaid,
      siteConflict: result.siteConflict,
      source: 'webhook'
    }
  }

  return {
    ok: false,
    reason: check.ok ? `remote_${check.status}` : (check.error || 'not_paid')
  }
}
