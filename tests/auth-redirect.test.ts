import { describe, it, expect } from 'vitest'
import { safeInternalPath } from '../app/utils/auth-redirect'

describe('safeInternalPath', () => {
  it('allows relative internal path', () => {
    expect(safeInternalPath('/panel/orders', '/panel')).toBe('/panel/orders')
  })
  it('blocks protocol-relative and external', () => {
    expect(safeInternalPath('//evil.com', '/panel')).toBe('/panel')
    expect(safeInternalPath('https://evil.com', '/panel')).toBe('/panel')
  })
  it('falls back on empty', () => {
    expect(safeInternalPath('', '/panel')).toBe('/panel')
  })
})
