export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, ready, fetch } = useUserSession()
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
})
