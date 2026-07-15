import { isDev, type UserRole } from '~/utils/roles'

/** Dev-only routes. Admin uses staff routes / canAccessDevConsole on login home. */
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
  if (!role || !isDev(role)) {
    return navigateTo(localePath('/403'))
  }
})
