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
