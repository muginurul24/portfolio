import { describe, it, expect } from 'vitest'
import { formatIdr, formatIdrCompact, slugify } from '../app/utils/format'

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
