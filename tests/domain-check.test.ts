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
})
