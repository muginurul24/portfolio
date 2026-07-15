export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn } = useUserSession()
  const localePath = useLocalePath()

  if (!loggedIn.value) {
    return navigateTo(localePath('/login'))
  }
})
