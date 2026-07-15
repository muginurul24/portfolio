import { describe, it, expect } from 'vitest'
import { computeOrderTotals } from '../server/utils/pricing'
import { createOrderNumber, createId } from '../server/utils/id'

describe('computeOrderTotals', () => {
  it('multiplies package by term years', () => {
    const r = computeOrderTotals({
      packagePriceYearlyIdr: 1_247_000,
      termYears: 2,
      domainPriceYearlyIdr: 0
    })
    expect(r.subtotalIdr).toBe(2_494_000)
    expect(r.discountIdr).toBe(0)
    expect(r.totalIdr).toBe(2_494_000)
  })

  it('applies fixed promo discount IDR', () => {
    const r = computeOrderTotals({
      packagePriceYearlyIdr: 1_247_000,
      termYears: 1,
      domainPriceYearlyIdr: 0,
      promo: { discountIdr: 500_000 }
    })
    expect(r.discountIdr).toBe(500_000)
    expect(r.totalIdr).toBe(747_000)
  })

  it('never returns negative total', () => {
    const r = computeOrderTotals({
      packagePriceYearlyIdr: 100_000,
      termYears: 1,
      domainPriceYearlyIdr: 0,
      promo: { discountIdr: 500_000 }
    })
    expect(r.totalIdr).toBe(0)
  })

  it('applies percent promo on subtotal', () => {
    const r = computeOrderTotals({
      packagePriceYearlyIdr: 1_000_000,
      termYears: 1,
      domainPriceYearlyIdr: 0,
      promo: { discountPercent: 10 }
    })
    expect(r.discountIdr).toBe(100_000)
    expect(r.totalIdr).toBe(900_000)
  })

  it('prefers fixed discountIdr over percent when both set', () => {
    const r = computeOrderTotals({
      packagePriceYearlyIdr: 1_000_000,
      termYears: 1,
      domainPriceYearlyIdr: 0,
      promo: { discountIdr: 50_000, discountPercent: 50 }
    })
    expect(r.discountIdr).toBe(50_000)
    expect(r.totalIdr).toBe(950_000)
  })
})

describe('createId', () => {
  it('returns prefix_ plus id', () => {
    const id = createId('ord')
    expect(id.startsWith('ord_')).toBe(true)
    expect(id.length).toBeGreaterThan(8)
  })
})

describe('createOrderNumber', () => {
  it('matches MD-YYYYMMDD-XXXX', () => {
    const n = createOrderNumber(new Date('2026-07-15T00:00:00Z'))
    expect(n).toMatch(/^MD-20260715-[A-Z0-9]{4}$/)
  })
})
