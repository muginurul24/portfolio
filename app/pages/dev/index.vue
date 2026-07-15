<script setup lang="ts">
import { canAccessDevConsole, type UserRole } from '~/utils/roles'

const { t } = useI18n()
const localePath = useLocalePath()
const { user } = useUserSession()

definePageMeta({
  middleware: ['auth', 'staff']
})

useSeoMeta({ title: () => t('dev.consoleTitle') })

const role = computed(() => (user.value as { role?: UserRole } | null)?.role)
const isFullConsole = computed(() => role.value && canAccessDevConsole(role.value))
</script>

<template>
  <UContainer class="py-10 md:py-16 max-w-3xl">
    <UBadge color="primary" variant="subtle" class="mb-3">
      {{ isFullConsole ? 'DEV' : 'STAFF' }}
    </UBadge>
    <h1 class="text-display text-3xl text-highlighted">
      {{ t('dev.consoleTitle') }}
    </h1>
    <p class="mt-2 text-muted">
      {{ t('dev.consolePlaceholder') }}
    </p>
    <p v-if="user" class="mt-6 text-sm text-muted">
      {{ (user as { email?: string }).email }} · {{ (user as { role?: string }).role }}
    </p>
    <div class="mt-8 flex flex-wrap gap-3">
      <UButton
        :to="localePath('/dev/orders')"
        color="primary"
        size="lg"
        icon="i-lucide-receipt"
      >
        {{ t('dev.ordersTitle') }}
      </UButton>
      <UButton
        :to="localePath('/panel')"
        color="neutral"
        variant="outline"
        size="lg"
        icon="i-lucide-layout-dashboard"
      >
        {{ t('auth.goPanel') }}
      </UButton>
    </div>
  </UContainer>
</template>
