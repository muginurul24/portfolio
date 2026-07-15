import { describe, it, expect } from 'vitest'
import { shouldExpireOrder, UNPAID_TTL_MS } from '../server/utils/order-expiry'

describe('shouldExpireOrder', () => {
  it('expires pending older than 48h', () => {
    const created = new Date('2026-07-01T00:00:00Z')
    const now = new Date('2026-07-04T00:00:00Z')
    expect(shouldExpireOrder({ status: 'pending_payment', createdAt: created }, now)).toBe(true)
  })

  it('keeps fresh pending', () => {
    const created = new Date('2026-07-14T12:00:00Z')
    const now = new Date('2026-07-15T12:00:00Z')
    expect(shouldExpireOrder({ status: 'pending_payment', createdAt: created }, now)).toBe(false)
  })

  it('never expires paid', () => {
    expect(shouldExpireOrder({ status: 'paid', createdAt: new Date('2020-01-01') }, new Date())).toBe(false)
  })

  it('expires at exact 48h boundary', () => {
    const created = new Date('2026-07-01T00:00:00Z')
    const now = new Date(created.getTime() + UNPAID_TTL_MS)
    expect(shouldExpireOrder({ status: 'pending_payment', createdAt: created }, now)).toBe(true)
  })

  it('accepts string createdAt', () => {
    const created = '2026-07-01T00:00:00.000Z'
    const now = new Date('2026-07-04T00:00:00Z')
    expect(shouldExpireOrder({ status: 'pending_payment', createdAt: created }, now)).toBe(true)
  })

  it('never expires cancelled or draft', () => {
    const old = new Date('2020-01-01')
    const now = new Date()
    expect(shouldExpireOrder({ status: 'cancelled', createdAt: old }, now)).toBe(false)
    expect(shouldExpireOrder({ status: 'draft', createdAt: old }, now)).toBe(false)
    expect(shouldExpireOrder({ status: 'expired', createdAt: old }, now)).toBe(false)
  })
})
