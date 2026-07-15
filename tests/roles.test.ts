import { describe, it, expect } from 'vitest'
import {
  isStaff,
  isDev,
  canAccessDevConsole,
  canManageCatalog,
  canManageUsers,
  canPromoteDev,
  canManageOrders,
  canManageInquiries,
  canManageSites,
  canManagePayments,
  canManageContent,
  canAccessSystem,
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

  it('canManageOrders: cs|admin|dev', () => {
    expect(canManageOrders('customer')).toBe(false)
    expect(canManageOrders('cs')).toBe(true)
    expect(canManageOrders('admin')).toBe(true)
    expect(canManageOrders('dev')).toBe(true)
  })

  it('canManageInquiries: cs|admin|dev', () => {
    expect(canManageInquiries('customer')).toBe(false)
    expect(canManageInquiries('cs')).toBe(true)
    expect(canManageInquiries('admin')).toBe(true)
    expect(canManageInquiries('dev')).toBe(true)
  })

  it('canManageSites: cs|admin|dev', () => {
    expect(canManageSites('customer')).toBe(false)
    expect(canManageSites('cs')).toBe(true)
    expect(canManageSites('admin')).toBe(true)
    expect(canManageSites('dev')).toBe(true)
  })

  it('canManagePayments: cs|admin|dev', () => {
    expect(canManagePayments('customer')).toBe(false)
    expect(canManagePayments('cs')).toBe(true)
    expect(canManagePayments('admin')).toBe(true)
    expect(canManagePayments('dev')).toBe(true)
  })

  it('canManageContent: admin|dev only', () => {
    expect(canManageContent('customer')).toBe(false)
    expect(canManageContent('cs')).toBe(false)
    expect(canManageContent('admin')).toBe(true)
    expect(canManageContent('dev')).toBe(true)
  })

  it('canAccessSystem: admin|dev', () => {
    expect(canAccessSystem('customer')).toBe(false)
    expect(canAccessSystem('cs')).toBe(false)
    expect(canAccessSystem('admin')).toBe(true)
    expect(canAccessSystem('dev')).toBe(true)
  })
})
