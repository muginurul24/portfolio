<script setup lang="ts">
import type { UserRole } from '~/utils/roles'
import { canAccessDevConsole, isStaff } from '~/utils/roles'

const { t } = useI18n()
const localePath = useLocalePath()

definePageMeta({
  layout: 'panel',
  middleware: 'auth'
})

useSeoMeta({ title: () => t('panel.settings') })

const { user } = useUserSession()

const profile = computed(() => {
  const u = user.value as {
    id?: string
    email?: string
    name?: string
    phone?: string | null
    role?: UserRole
  } | null

  let roleLabel = u?.role || '-'
  if (u?.role === 'admin') roleLabel = t('panel.roleAdmin')
  else if (u?.role === 'customer') roleLabel = t('panel.roleCustomer')
  else if (u?.role === 'cs') roleLabel = t('dev.roleCs')
  else if (u?.role === 'dev') roleLabel = t('dev.roleDev')

  return {
    name: u?.name || '-',
    email: u?.email || '-',
    phone: u?.phone || '-',
    role: roleLabel,
    rawRole: u?.role
  }
})

const staffLink = computed(() => {
  const r = profile.value.rawRole
  if (!r) return null
  if (canAccessDevConsole(r)) {
    return { to: localePath('/dev'), label: t('dev.consoleTitle') }
  }
  if (isStaff(r)) {
    return { to: localePath('/dev/orders'), label: t('dev.ordersTitle') }
  }
  return null
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-highlighted tracking-tight mb-6">
      {{ t('panel.settings') }}
    </h1>

    <UCard :ui="{ root: 'shadow-soft-sm max-w-xl' }">
      <h2 class="text-lg font-semibold text-highlighted mb-1">
        {{ t('panel.profile') }}
      </h2>
      <p class="text-sm text-muted mb-6">
        {{ t('panel.profileReadonly') }}
      </p>

      <dl class="space-y-4 text-sm">
        <div>
          <dt class="text-muted">
            {{ t('auth.name') }}
          </dt>
          <dd class="mt-1 font-medium">
            {{ profile.name }}
          </dd>
        </div>
        <div>
          <dt class="text-muted">
            {{ t('auth.email') }}
          </dt>
          <dd class="mt-1 font-medium break-all">
            {{ profile.email }}
          </dd>
        </div>
        <div>
          <dt class="text-muted">
            {{ t('auth.phone') }}
          </dt>
          <dd class="mt-1 font-medium">
            {{ profile.phone }}
          </dd>
        </div>
        <div>
          <dt class="text-muted">
            {{ t('panel.role') }}
          </dt>
          <dd class="mt-1">
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
            >
              {{ profile.role }}
            </UBadge>
            <p class="text-xs text-muted mt-2">
              {{ t('panel.roleReadonlyHint') }}
            </p>
          </dd>
        </div>
      </dl>

      <div v-if="staffLink" class="mt-6 pt-4 border-t border-default">
        <UButton
          :to="staffLink.to"
          color="primary"
          variant="soft"
          icon="i-lucide-terminal"
        >
          {{ staffLink.label }}
        </UButton>
      </div>
    </UCard>
  </div>
</template>
