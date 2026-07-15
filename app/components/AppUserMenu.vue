<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { UserRole } from '~/utils/roles'
import { canAccessDevConsole, isStaff } from '~/utils/roles'

withDefaults(defineProps<{
  /** Full-width stacked actions (mobile drawer). */
  mobile?: boolean
}>(), {
  mobile: false
})

const { t } = useI18n()
const localePath = useLocalePath()
const { user, clear } = useUserSession()

const role = computed(() => (user.value as { role?: UserRole } | null)?.role)

const displayName = computed(() => {
  const u = user.value as { name?: string, email?: string } | null
  if (!u) return ''
  const name = u.name?.trim()
  const raw = name || u.email || ''
  if (raw.length <= 20) return raw
  return `${raw.slice(0, 18)}…`
})

const showDevConsole = computed(() => {
  const r = role.value
  if (!r) return false
  return canAccessDevConsole(r) || isStaff(r)
})

const isCustomer = computed(() => !role.value || role.value === 'customer')

const devConsolePath = computed(() => {
  if (role.value === 'cs') return localePath('/dev/orders')
  return localePath('/dev')
})

const roleBadgeLabel = computed(() => {
  if (role.value === 'dev') return t('auth.roleBadgeDev')
  if (role.value === 'admin') return t('auth.roleBadgeAdmin')
  if (role.value === 'cs') return t('auth.roleBadgeCs')
  return ''
})

const roleBadgeColor = computed(() => {
  if (role.value === 'dev') return 'primary' as const
  if (role.value === 'admin') return 'warning' as const
  if (role.value === 'cs') return 'neutral' as const
  return 'neutral' as const
})

async function logout() {
  await clear()
  await navigateTo(localePath('/login'))
}

const menuItems = computed((): DropdownMenuItem[][] => {
  const main: DropdownMenuItem[] = []

  if (showDevConsole.value) {
    main.push({
      label: t('auth.devConsole'),
      icon: 'i-lucide-terminal',
      to: devConsolePath.value
    })
  }

  main.push({
    label: t('auth.myPanel'),
    icon: 'i-lucide-layout-dashboard',
    to: localePath('/panel')
  })

  if (isCustomer.value) {
    main.push(
      {
        label: t('panel.orders'),
        icon: 'i-lucide-receipt',
        to: localePath('/panel/orders')
      },
      {
        label: t('panel.sites'),
        icon: 'i-lucide-globe',
        to: localePath('/panel/sites')
      }
    )
  }

  main.push({
    label: t('panel.settings'),
    icon: 'i-lucide-settings',
    to: localePath('/panel/settings')
  })

  const labelRow: DropdownMenuItem[] = [
    {
      label: displayName.value,
      type: 'label' as const,
      icon: 'i-lucide-user'
    }
  ]

  return [
    labelRow,
    main,
    [
      {
        label: t('auth.logout'),
        icon: 'i-lucide-log-out',
        color: 'error' as const,
        onSelect: () => {
          void logout()
        }
      }
    ]
  ]
})

const mobileLinks = computed(() => {
  const links: Array<{ label: string, to: string, icon: string }> = []

  if (showDevConsole.value) {
    links.push({
      label: t('auth.devConsole'),
      to: devConsolePath.value,
      icon: 'i-lucide-terminal'
    })
  }

  links.push({
    label: t('auth.myPanel'),
    to: localePath('/panel'),
    icon: 'i-lucide-layout-dashboard'
  })

  if (isCustomer.value) {
    links.push(
      {
        label: t('panel.orders'),
        to: localePath('/panel/orders'),
        icon: 'i-lucide-receipt'
      },
      {
        label: t('panel.sites'),
        to: localePath('/panel/sites'),
        icon: 'i-lucide-globe'
      }
    )
  }

  links.push({
    label: t('panel.settings'),
    to: localePath('/panel/settings'),
    icon: 'i-lucide-settings'
  })

  return links
})
</script>

<template>
  <div
    v-if="mobile"
    class="flex flex-col gap-2"
  >
    <div class="px-1 flex flex-wrap items-center gap-2">
      <p class="text-sm font-medium text-highlighted truncate">
        {{ displayName }}
      </p>
      <UBadge
        v-if="roleBadgeLabel"
        :color="roleBadgeColor"
        variant="subtle"
        size="sm"
      >
        {{ roleBadgeLabel }}
      </UBadge>
    </div>
    <UButton
      v-for="link in mobileLinks"
      :key="link.to"
      :to="link.to"
      :icon="link.icon"
      color="neutral"
      variant="outline"
      block
      class="min-h-11 justify-start"
    >
      {{ link.label }}
    </UButton>
    <UButton
      color="error"
      variant="soft"
      icon="i-lucide-log-out"
      block
      class="min-h-11 justify-start"
      @click="logout"
    >
      {{ t('auth.logout') }}
    </UButton>
  </div>

  <UDropdownMenu
    v-else
    :items="menuItems"
    :content="{ align: 'end' }"
    :ui="{ content: 'min-w-48 shadow-soft-lg' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      trailing-icon="i-lucide-chevron-down"
      class="hidden sm:inline-flex max-w-[14rem] min-h-11"
      :aria-label="displayName"
    >
      <span class="truncate">{{ displayName }}</span>
      <UBadge
        v-if="roleBadgeLabel"
        :color="roleBadgeColor"
        variant="subtle"
        size="sm"
        class="ms-1 shrink-0"
      >
        {{ roleBadgeLabel }}
      </UBadge>
    </UButton>
  </UDropdownMenu>
</template>
