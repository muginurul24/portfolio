import { describe, it, expect } from 'vitest'
import { formatIdr, formatIdrCompact, slugify, isSafeHttpHost } from '../app/utils/format'

describe('formatIdr', () => {
  it('formats integer IDR', () => {
    expect(formatIdr(1_000_000)).toMatch(/1\.000\.000/)
  })
})

describe('formatIdrCompact', () => {
  it('compacts millions', () => {
    expect(formatIdrCompact(1_500_000)).toBe('Rp1,5jt')
  })
})

describe('slugify', () => {
  it('slugifies text', () => {
    expect(slugify('Coconut Briquettes Export!')).toBe('coconut-briquettes-export')
  })
})

describe('isSafeHttpHost', () => {
  it('accepts normal hostnames', () => {
    expect(isSafeHttpHost('toko-saya.com')).toBe(true)
    expect(isSafeHttpHost('sub.example.co.id')).toBe(true)
  })

  it('rejects credentials, paths, schemes, junk', () => {
    expect(isSafeHttpHost('evil.com@phish.tld')).toBe(false)
    expect(isSafeHttpHost('example.com/path')).toBe(false)
    expect(isSafeHttpHost('https://example.com')).toBe(false)
    expect(isSafeHttpHost('user:pass@host.com')).toBe(false)
    expect(isSafeHttpHost('')).toBe(false)
    expect(isSafeHttpHost('-bad.com')).toBe(false)
  })
})
