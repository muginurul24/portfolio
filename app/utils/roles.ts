export type UserRole = 'customer' | 'cs' | 'admin' | 'dev'

export function isStaff(role: UserRole): boolean {
  return role === 'cs' || role === 'admin' || role === 'dev'
}

export function isDev(role: UserRole): boolean {
  return role === 'dev'
}

/** Full /dev console (cs limited later via route meta). */
export function canAccessDevConsole(role: UserRole): boolean {
  return role === 'admin' || role === 'dev'
}

export function canManageCatalog(role: UserRole): boolean {
  return role === 'admin' || role === 'dev'
}

export function canManageUsers(role: UserRole): boolean {
  return role === 'admin' || role === 'dev'
}

export function canPromoteDev(role: UserRole): boolean {
  return role === 'dev'
}

export function canManageOrders(role: UserRole): boolean {
  return role === 'cs' || role === 'admin' || role === 'dev'
}

export function canManageInquiries(role: UserRole): boolean {
  return role === 'cs' || role === 'admin' || role === 'dev'
}

export function canManageSites(role: UserRole): boolean {
  return role === 'cs' || role === 'admin' || role === 'dev'
}

export function canManagePayments(role: UserRole): boolean {
  return role === 'cs' || role === 'admin' || role === 'dev'
}

export function canManageContent(role: UserRole): boolean {
  return role === 'admin' || role === 'dev'
}

export function canAccessSystem(role: UserRole): boolean {
  return role === 'admin' || role === 'dev'
}
