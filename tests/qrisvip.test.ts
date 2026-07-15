import { describe, it, expect } from 'vitest'
import {
  sanitizeCustomRef,
  sanitizeQrisUsername,
  isQrisPayload,
  assertPayableAmountIdr,
  QRIS_MIN_IDR,
  QRIS_MAX_IDR
} from '../server/utils/qrisvip'

describe('qrisvip helpers', () => {
  it('sanitizeCustomRef strips non-alphanumeric and uppercases', () => {
    expect(sanitizeCustomRef('MD-2026/07-15_ab')).toBe('MD20260715AB')
  })

  it('sanitizeCustomRef max 36 chars', () => {
    const long = 'A'.repeat(50)
    expect(sanitizeCustomRef(long).length).toBe(36)
  })

  it('isQrisPayload detects EMV QRIS', () => {
    expect(isQrisPayload('00020101021226670016COM.NOBUBANK')).toBe(true)
    expect(isQrisPayload('8999816711687135')).toBe(false)
    expect(isQrisPayload('')).toBe(false)
  })

  it('assertPayableAmountIdr accepts bounds', () => {
    expect(() => assertPayableAmountIdr(QRIS_MIN_IDR)).not.toThrow()
    expect(() => assertPayableAmountIdr(QRIS_MAX_IDR)).not.toThrow()
    expect(() => assertPayableAmountIdr(25_000)).not.toThrow()
  })

  it('assertPayableAmountIdr rejects out of range', () => {
    expect(() => assertPayableAmountIdr(9999)).toThrow(/10\.000/)
    expect(() => assertPayableAmountIdr(10_000_001)).toThrow(/10\.000\.000/)
  })

  it('assertPayableAmountIdr rejects non-finite and below min', () => {
    expect(() => assertPayableAmountIdr(NaN)).toThrow(/10\.000/)
    expect(() => assertPayableAmountIdr(Number.POSITIVE_INFINITY)).toThrow(/10\.000/)
    expect(() => assertPayableAmountIdr(0)).toThrow(/10\.000/)
    expect(() => assertPayableAmountIdr(-1)).toThrow(/10\.000/)
  })

  it('assertPayableAmountIdr bounds match QRIS_MIN/MAX constants', () => {
    expect(QRIS_MIN_IDR).toBe(10_000)
    expect(QRIS_MAX_IDR).toBe(10_000_000)
    expect(() => assertPayableAmountIdr(QRIS_MIN_IDR - 1)).toThrow()
    expect(() => assertPayableAmountIdr(QRIS_MAX_IDR + 1)).toThrow()
  })

  it('sanitizeQrisUsername strips email to local-part', () => {
    expect(sanitizeQrisUsername('qris.test@mugiewdev.com')).toBe('qris-test')
    expect(sanitizeQrisUsername('Dewi_Fork')).toBe('dewi_fork')
    expect(sanitizeQrisUsername('@@@')).toBe('guest')
  })
})
