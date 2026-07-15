<script setup lang="ts">
import type { UserRole } from '~/utils/roles'
import { canAccessDevConsole, canManageCatalog, canManageUsers, isDev } from '~/utils/roles'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { loggedIn, user, clear } = useUserSession()

const mobileOpen = ref(false)

const role = computed(() => (user.value as { role?: UserRole } | null)?.role)

const email = computed(() => (user.value as { email?: string } | null)?.email ?? '')

type NavItem = {
  label: string
  to: string
  icon: string
  exact?: boolean
  show: boolean
}

const items = computed((): NavItem[] => {
  const r = role.value
  if (!r) return []

  const full = canAccessDevConsole(r)
  const catalog = canManageCatalog(r)
  const users = canManageUsers(r)
  const staffOps = true // layout only reached via staff middleware

  return [
    {
      label: t('dev.nav.overview'),
      to: localePath('/dev'),
      icon: 'i-lucide-layout-dashboard',
      exact: true,
      show: staffOps
    },
    {
      label: t('dev.nav.users'),
      to: localePath('/dev/users'),
      icon: 'i-lucide-users',
      show: users
    },
    {
      label: t('dev.nav.templates'),
      to: localePath('/dev/templates'),
      icon: 'i-lucide-layout-template',
      show: catalog
    },
    {
      label: t('dev.nav.packages'),
      to: localePath('/dev/packages'),
      icon: 'i-lucide-package',
      show: catalog
    },
    {
      label: t('dev.nav.domains'),
      to: localePath('/dev/domains'),
      icon: 'i-lucide-globe-2',
      show: catalog
    },
    {
      label: t('dev.nav.promos'),
      to: localePath('/dev/promos'),
      icon: 'i-lucide-ticket-percent',
      show: catalog
    },
    {
      label: t('dev.nav.orders'),
      to: localePath('/dev/orders'),
      icon: 'i-lucide-receipt',
      show: staffOps
    },
    {
      label: t('dev.nav.payments'),
      to: localePath('/dev/payments'),
      icon: 'i-lucide-credit-card',
      show: staffOps
    },
    {
      label: t('dev.nav.sites'),
      to: localePath('/dev/sites'),
      icon: 'i-lucide-globe',
      show: staffOps
    },
    {
      label: t('dev.nav.inquiries'),
      to: localePath('/dev/inquiries'),
      icon: 'i-lucide-inbox',
      show: staffOps
    },
    {
      label: t('dev.nav.academy'),
      to: localePath('/dev/academy'),
      icon: 'i-lucide-graduation-cap',
      show: full
    },
    {
      label: t('dev.nav.testimonials'),
      to: localePath('/dev/testimonials'),
      icon: 'i-lucide-quote',
      show: full
    },
    {
      label: t('dev.nav.system'),
      to: localePath('/dev/system'),
      icon: 'i-lucide-activity',
      show: full || isDev(r)
    }
  ].filter(item => item.show)
})

const navMenuItems = computed(() =>
  items.value.map(({ label, to, icon, exact }) => ({
    label,
    to,
    icon,
    exact
  }))
)

function isActive(item: { to: string, exact?: boolean }) {
  const path = route.path
  if (item.exact) {
    return path === item.to || path === `${item.to}/`
  }
  return path === item.to || path.startsWith(`${item.to}/`)
}

async function logout() {
  mobileOpen.value = false
  await clear()
  await navigateTo(localePath('/login'))
}

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  }
)

watchEffect(() => {
  if (import.meta.client && !loggedIn.value) {
    navigateTo(localePath('/login'))
  }
})
</script>

<template>
  <div class="min-h-dvh flex bg-muted/40">
    <aside class="hidden md:flex w-64 flex-col border-r border-default glass-panel shadow-soft-sm">
      <div class="p-4 border-b border-default flex items-center justify-between gap-2">
        <NuxtLink
          :to="localePath('/')"
          class="inline-flex items-center cursor-pointer"
          :aria-label="t('brand.name')"
        >
          <AppLogo class="h-6 w-auto" />
        </NuxtLink>
        <UBadge
          color="primary"
          variant="subtle"
          size="sm"
        >
          {{ role === 'dev' ? 'DEV' : role === 'admin' ? 'ADMIN' : 'STAFF' }}
        </UBadge>
      </div>

      <div class="px-3 pt-3 pb-1">
        <p class="text-xs font-medium uppercase tracking-wide text-muted px-2">
          {{ t('dev.consoleTitle') }}
        </p>
      </div>

      <UNavigationMenu
        :items="navMenuItems"
        orientation="vertical"
        highlight
        highlight-color="primary"
        class="flex-1 p-3 overflow-y-auto"
        :ui="{
          link: 'rounded-lg',
          linkLeadingIcon: 'size-4'
        }"
      />

      <div class="p-3 border-t border-default space-y-2">
        <div
          v-if="user"
          class="px-2"
        >
          <p class="text-sm text-highlighted truncate">
            {{ email }}
          </p>
          <p class="text-xs text-muted capitalize">
            {{ role }}
          </p>
        </div>
        <UButton
          :to="localePath('/panel')"
          color="neutral"
          variant="ghost"
          icon="i-lucide-layout-dashboard"
          block
        >
          {{ t('auth.goPanel') }}
        </UButton>
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
      <header class="md:hidden flex items-center justify-between gap-3 p-4 border-b border-default glass-panel">
        <NuxtLink
          :to="localePath('/')"
          class="inline-flex items-center cursor-pointer"
          :aria-label="t('brand.name')"
        >
          <AppLogo class="h-6 w-auto" />
        </NuxtLink>
        <div class="flex items-center gap-2">
          <UBadge
            color="primary"
            variant="subtle"
            size="sm"
          >
            {{ role === 'dev' ? 'DEV' : role === 'admin' ? 'ADMIN' : 'STAFF' }}
          </UBadge>
          <UButton
            icon="i-lucide-menu"
            color="neutral"
            variant="ghost"
            :aria-label="t('dev.openMenu')"
            @click="mobileOpen = true"
          />
        </div>
      </header>

      <USlideover
        v-model:open="mobileOpen"
        side="left"
        :ui="{ content: 'w-72 max-w-[85vw]' }"
      >
        <template #content>
          <div class="flex h-full flex-col">
            <div class="flex items-center justify-between gap-2 p-4 border-b border-default">
              <NuxtLink
                :to="localePath('/')"
                class="inline-flex items-center cursor-pointer"
                :aria-label="t('brand.name')"
                @click="mobileOpen = false"
              >
                <AppLogo class="h-6 w-auto" />
              </NuxtLink>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                :aria-label="t('common.cancel')"
                @click="mobileOpen = false"
              />
            </div>

            <nav class="flex-1 overflow-y-auto p-3 space-y-1">
              <UButton
                v-for="item in items"
                :key="item.to"
                :to="item.to"
                :icon="item.icon"
                color="neutral"
                :variant="isActive(item) ? 'soft' : 'ghost'"
                block
                class="justify-start"
                @click="mobileOpen = false"
              >
                {{ item.label }}
              </UButton>
            </nav>

            <div class="p-3 border-t border-default space-y-2">
              <div
                v-if="user"
                class="px-1 pb-1"
              >
                <p class="text-sm text-highlighted truncate">
                  {{ email }}
                </p>
                <p class="text-xs text-muted capitalize">
                  {{ role }}
                </p>
              </div>
              <UButton
                :to="localePath('/panel')"
                color="neutral"
                variant="outline"
                icon="i-lucide-layout-dashboard"
                block
                @click="mobileOpen = false"
              >
                {{ t('auth.goPanel') }}
              </UButton>
              <UButton
                color="error"
                variant="soft"
                icon="i-lucide-log-out"
                block
                @click="logout"
              >
                {{ t('auth.logout') }}
              </UButton>
            </div>
          </div>
        </template>
      </USlideover>

      <main
        id="main"
        class="flex-1 p-4 md:p-8"
      >
        <slot />
      </main>
    </div>
  </div>
</template>
