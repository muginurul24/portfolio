<script setup lang="ts">
import type { UserRole } from '~/utils/roles'
import { canAccessDevConsole, isStaff } from '~/utils/roles'

const { t } = useI18n()
const localePath = useLocalePath()
const { user, clear } = useUserSession()
const mobileOpen = ref(false)

const role = computed(() => (user.value as { role?: UserRole } | null)?.role)
const email = computed(() => (user.value as { email?: string } | null)?.email ?? '')
const name = computed(() => (user.value as { name?: string } | null)?.name ?? '')

const items = computed(() => {
  const base = [
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
  ]
  if (role.value && canAccessDevConsole(role.value)) {
    base.push({
      label: t('dev.consoleTitle'),
      to: localePath('/dev'),
      icon: 'i-lucide-terminal'
    })
  } else if (role.value && isStaff(role.value)) {
    base.push({
      label: t('dev.ordersTitle'),
      to: localePath('/dev/orders'),
      icon: 'i-lucide-headset'
    })
  }
  return base
})

function roleLabel(r?: UserRole) {
  if (!r) return '-'
  if (r === 'customer') return t('panel.roleCustomer')
  if (r === 'admin') return t('panel.roleAdmin')
  if (r === 'cs') return t('dev.roleCs')
  if (r === 'dev') return t('dev.roleDev')
  return r
}

async function logout() {
  await clear()
  await navigateTo(localePath('/login'))
}
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
        <div v-if="user" class="px-2">
          <p class="text-sm font-medium text-highlighted truncate">
            {{ name || email }}
          </p>
          <p class="text-xs text-muted truncate">
            {{ email }}
          </p>
          <UBadge color="neutral" variant="subtle" size="sm" class="mt-1">
            {{ roleLabel(role) }}
          </UBadge>
        </div>
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
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          aria-label="Menu"
          @click="mobileOpen = !mobileOpen"
        />
      </header>

      <div
        v-if="mobileOpen"
        class="md:hidden border-b border-default bg-default p-3 space-y-1"
      >
        <UButton
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          :icon="item.icon"
          color="neutral"
          variant="ghost"
          block
          class="justify-start"
          @click="mobileOpen = false"
        >
          {{ item.label }}
        </UButton>
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-log-out"
          block
          class="justify-start"
          @click="logout"
        >
          {{ t('auth.logout') }}
        </UButton>
      </div>

      <main id="main" class="flex-1 p-4 md:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
