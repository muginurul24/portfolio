import { describe, it, expect } from 'vitest'
import { evaluateDomainStub } from '../server/utils/domain-availability'

describe('evaluateDomainStub', () => {
  it('blocks reserved names hard', () => {
    const r = evaluateDomainStub('admin', 'com')
    expect(r.available).toBe(false)
    expect(r.confidence).toBe('hard_unavailable')
  })
  it('soft-available for normal names', () => {
    const r = evaluateDomainStub('tokobunga', 'com')
    expect(r.available).toBe(true)
    expect(r.confidence).toBe('soft')
    expect(r.stub).toBe(true)
  })
  it('blocks names shorter than 3 chars', () => {
    const r = evaluateDomainStub('ab', 'id')
    expect(r.available).toBe(false)
    expect(r.confidence).toBe('hard_unavailable')
    expect(r.domain).toBe('ab.id')
  })
  it('blocks brand reserved mugiewdev', () => {
    const r = evaluateDomainStub('mugiewdev', 'com')
    expect(r.available).toBe(false)
    expect(r.confidence).toBe('hard_unavailable')
  })
  it('normalizes case and leading-dot TLD', () => {
    const r = evaluateDomainStub('TokoBunga', '.COM')
    expect(r.domain).toBe('tokobunga.com')
    expect(r.available).toBe(true)
    expect(r.stub).toBe(true)
  })
  it('strips invalid chars from name', () => {
    const r = evaluateDomainStub('toko_bunga!', 'com')
    expect(r.domain).toBe('tokobunga.com')
    expect(r.available).toBe(true)
  })
})
