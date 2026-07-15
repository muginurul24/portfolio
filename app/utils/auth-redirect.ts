import type { UserRole } from './roles'
import { canAccessDevConsole, isDev } from './roles'

/** Same-origin relative path only (blocks open redirect). */
export function safeInternalPath(raw: unknown, fallback: string): string {
  const path = String(raw || '')
  if (path.startsWith('/') && !path.startsWith('//')) return path
  return fallback
}

export function homeForRole(role: UserRole | undefined | null, localePath: (p: string) => string): string {
  if (!role) return localePath('/panel')
  if (isDev(role)) return localePath('/dev')
  if (canAccessDevConsole(role)) return localePath('/dev')
  if (role === 'cs') return localePath('/dev')
  return localePath('/panel')
}
