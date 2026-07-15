import { describe, it, expect } from 'vitest'
import {
  isDisbursementCallback,
  parseDepositCallback
} from '../server/utils/qris-reconcile'
import { sanitizeCustomRef, sanitizeQrisUsername, QRIS_MAX_IDR } from '../server/utils/qrisvip'

describe('qris webhook parse', () => {
  it('parses official deposit callback sample fields', () => {
    const parsed = parseDepositCallback({
      amount: 1247000,
      terminal_id: 'qris-test',
      merchant_id: '29678b4b-ae06-4124-8793-beb1593dbe01',
      trx_id: '16e35a4232024030aa6fff608b08538e',
      rrn: '112233445566',
      custom_ref: 'MD2026071584C5',
      vendor: 'NOBU',
      status: 'success',
      created_at: '2023-07-31T10:49:37',
      finish_at: '2023-07-31T08:49:56'
    })
    expect(parsed.trxId).toBe('16e35a4232024030aa6fff608b08538e')
    expect(parsed.amount).toBe(1247000)
    expect(parsed.status).toBe('success')
    expect(parsed.merchantId).toContain('29678b4b')
    expect(parsed.rrn).toBe('112233445566')
    expect(parsed.customRef).toBe('MD2026071584C5')
    expect(parsed.terminalId).toBe('qris-test')
    expect(parsed.vendor).toBe('NOBU')
  })

  it('parses null amount when field missing', () => {
    const parsed = parseDepositCallback({
      trx_id: 'abc',
      status: 'success'
    })
    expect(parsed.amount).toBeNull()
    expect(parsed.status).toBe('success')
  })

  it('detects disbursement callbacks', () => {
    expect(isDisbursementCallback({
      amount: 25000,
      partner_ref_no: 'abc',
      status: 'success'
    })).toBe(true)
    expect(isDisbursementCallback({
      amount: 10000,
      trx_id: 'x',
      status: 'success'
    })).toBe(false)
  })

  it('custom_ref aligns with sanitizeCustomRef(orderNumber)', () => {
    expect(sanitizeCustomRef('MD-20260715-84C5')).toBe('MD2026071584C5')
  })

  it('username sanitize matches generate path', () => {
    expect(sanitizeQrisUsername('buyer@mail.com')).toBe('buyer')
  })

  it('QRIS_MAX_IDR is 10M', () => {
    expect(QRIS_MAX_IDR).toBe(10_000_000)
  })
})
