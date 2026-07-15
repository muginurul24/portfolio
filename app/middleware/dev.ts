import { canAccessDevConsole, type UserRole } from '~/utils/roles'

/** Admin/dev console routes (not CS-only). */
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, ready, user, fetch } = useUserSession()
  const localePath = useLocalePath()

  if (!ready.value) {
    await fetch()
  }

  if (!loggedIn.value) {
    return navigateTo({
      path: localePath('/login'),
      query: { redirect: to.fullPath }
    })
  }

  const role = (user.value as { role?: UserRole } | null)?.role
  if (!role || !canAccessDevConsole(role)) {
    return navigateTo(localePath('/403'))
  }
})
