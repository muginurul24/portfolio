import { describe, it, expect } from 'vitest'
import { homeForRole, safeInternalPath } from '../app/utils/auth-redirect'

const id = (p: string) => p

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

describe('homeForRole', () => {
  it('routes staff by role', () => {
    expect(homeForRole('dev', id)).toBe('/dev')
    expect(homeForRole('admin', id)).toBe('/dev')
    expect(homeForRole('cs', id)).toBe('/dev/orders')
    expect(homeForRole('customer', id)).toBe('/panel')
    expect(homeForRole(undefined, id)).toBe('/panel')
  })
})
