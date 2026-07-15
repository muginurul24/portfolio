import { describe, it, expect } from 'vitest'
import {
  isStaff,
  isDev,
  canAccessDevConsole,
  canManageCatalog,
  canManageUsers,
  canPromoteDev,
  type UserRole
} from '../app/utils/roles'

const roles: UserRole[] = ['customer', 'cs', 'admin', 'dev']

describe('role helpers matrix', () => {
  it('isStaff: cs|admin|dev only', () => {
    expect(isStaff('customer')).toBe(false)
    expect(isStaff('cs')).toBe(true)
    expect(isStaff('admin')).toBe(true)
    expect(isStaff('dev')).toBe(true)
  })

  it('isDev: dev only', () => {
    for (const role of roles) {
      expect(isDev(role)).toBe(role === 'dev')
    }
  })

  it('canAccessDevConsole: admin|dev', () => {
    expect(canAccessDevConsole('customer')).toBe(false)
    expect(canAccessDevConsole('cs')).toBe(false)
    expect(canAccessDevConsole('admin')).toBe(true)
    expect(canAccessDevConsole('dev')).toBe(true)
  })

  it('canManageCatalog: admin|dev', () => {
    expect(canManageCatalog('customer')).toBe(false)
    expect(canManageCatalog('cs')).toBe(false)
    expect(canManageCatalog('admin')).toBe(true)
    expect(canManageCatalog('dev')).toBe(true)
  })

  it('canManageUsers: admin|dev', () => {
    expect(canManageUsers('customer')).toBe(false)
    expect(canManageUsers('cs')).toBe(false)
    expect(canManageUsers('admin')).toBe(true)
    expect(canManageUsers('dev')).toBe(true)
  })

  it('canPromoteDev: dev only', () => {
    for (const role of roles) {
      expect(canPromoteDev(role)).toBe(role === 'dev')
    }
  })
})
