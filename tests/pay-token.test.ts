import { describe, it, expect } from 'vitest'
import { signPayToken, verifyPayToken } from '../server/utils/pay-token'

describe('pay-token', () => {
  const secret = 'x'.repeat(32)
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
})
