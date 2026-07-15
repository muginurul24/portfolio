import type { H3Event } from 'h3'
import type { UserRole } from '../../app/utils/roles'
import { isStaff as roleIsStaff } from '../../app/utils/roles'

/**
 * Require authenticated session whose role is in `roles`.
 * 401 via requireUserSession; 403 if role not allowed.
 */
export async function requireRole(event: H3Event, roles: UserRole[]) {
  const session = await requireUserSession(event)
  const role = session.user.role as UserRole
  if (!roles.includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Akses ditolak' })
  }
  return session
}

export function sessionUser(session: { user: { id: string, role: string, email?: string, name?: string } }) {
  return session.user as { id: string, role: UserRole, email?: string, name?: string }
}

export function isStaffRole(role: string): boolean {
  return roleIsStaff(role as UserRole)
}
