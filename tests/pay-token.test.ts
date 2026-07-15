import { describe, it, expect, vi, afterEach } from 'vitest'
import { signPayToken, verifyPayToken } from '../server/utils/pay-token'

describe('pay-token', () => {
  const secret = 'x'.repeat(32)

  afterEach(() => {
    vi.useRealTimers()
  })

  it('roundtrips', () => {
    const t = signPayToken('ord_1', secret, 3600)
    expect(verifyPayToken(t, 'ord_1', secret)).toBe(true)
  })
  it('rejects wrong order', () => {
    const t = signPayToken('ord_1', secret, 3600)
    expect(verifyPayToken(t, 'ord_2', secret)).toBe(false)
  })
  it('rejects tampered', () => {
    const t = signPayToken('ord_1', secret, 3600)
    expect(verifyPayToken(t + 'x', 'ord_1', secret)).toBe(false)
  })
  it('rejects wrong secret', () => {
    const t = signPayToken('ord_1', secret, 3600)
    const other = 'y'.repeat(32)
    expect(verifyPayToken(t, 'ord_1', other)).toBe(false)
  })
  it('rejects expired token', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-15T00:00:00Z'))
    const t = signPayToken('ord_1', secret, 60)
    vi.setSystemTime(new Date('2026-07-15T00:02:00Z'))
    expect(verifyPayToken(t, 'ord_1', secret)).toBe(false)
  })
  it('accepts token still within ttl', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-15T00:00:00Z'))
    const t = signPayToken('ord_1', secret, 120)
    vi.setSystemTime(new Date('2026-07-15T00:01:00Z'))
    expect(verifyPayToken(t, 'ord_1', secret)).toBe(true)
  })
  it('rejects malformed token parts', () => {
    expect(verifyPayToken('not-a-token', 'ord_1', secret)).toBe(false)
    expect(verifyPayToken('a.b', 'ord_1', secret)).toBe(false)
    expect(verifyPayToken('', 'ord_1', secret)).toBe(false)
  })
})
