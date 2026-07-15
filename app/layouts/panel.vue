<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { loggedIn, user, clear } = useUserSession()

const items = computed(() => [
  {
    label: t('panel.dashboard'),
    to: localePath('/panel'),
    icon: 'i-lucide-layout-dashboard',
    exact: true
  },
  { label: t('panel.sites'), to: localePath('/panel/sites'), icon: 'i-lucide-globe' },
  { label: t('panel.orders'), to: localePath('/panel/orders'), icon: 'i-lucide-receipt' },
  { label: t('panel.academy'), to: localePath('/panel/academy'), icon: 'i-lucide-graduation-cap' },
  { label: t('panel.inquiries'), to: localePath('/panel/inquiries'), icon: 'i-lucide-inbox' },
  { label: t('panel.settings'), to: localePath('/panel/settings'), icon: 'i-lucide-settings' }
])

async function logout() {
  await clear()
  await navigateTo(localePath('/login'))
}

// Auth guard — redirect if not logged in
watchEffect(() => {
  if (import.meta.client && !loggedIn.value) {
    navigateTo(localePath('/login'))
  }
})
</script>

<template>
  <div class="min-h-dvh flex bg-muted/40">
    <aside class="hidden md:flex w-64 flex-col border-r border-default bg-default shadow-soft-sm">
      <div class="p-4 border-b border-default">
        <NuxtLink :to="localePath('/')" class="inline-flex items-center cursor-pointer" :aria-label="t('brand.name')">
          <AppLogo class="h-6 w-auto" />
        </NuxtLink>
      </div>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        highlight
        highlight-color="primary"
        class="flex-1 p-3"
        :ui="{
          link: 'rounded-lg',
          linkLeadingIcon: 'size-4'
        }"
      />
      <div class="p-3 border-t border-default space-y-2">
        <p v-if="user" class="text-sm text-muted truncate px-2">
          {{ (user as { email?: string }).email }}
        </p>
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-log-out"
          block
          @click="logout"
        >
          {{ t('auth.logout') }}
        </UButton>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      <header class="md:hidden flex items-center justify-between p-4 border-b border-default glass-panel">
        <NuxtLink :to="localePath('/')" class="inline-flex items-center cursor-pointer" :aria-label="t('brand.name')">
          <AppLogo class="h-6 w-auto" />
        </NuxtLink>
        <UButton icon="i-lucide-menu" color="neutral" variant="ghost" aria-label="Menu" />
      </header>
      <main id="main" class="flex-1 p-4 md:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
