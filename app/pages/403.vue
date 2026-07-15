<script setup lang="ts">
import { canAccessDevConsole, type UserRole } from '~/utils/roles'

const { t } = useI18n()
const localePath = useLocalePath()
const { loggedIn, user } = useUserSession()

useSeoMeta({ title: () => t('auth.forbiddenTitle') })

const role = computed(() => (user.value as { role?: UserRole } | null)?.role)

const primaryTo = computed(() => {
  if (!loggedIn.value) return localePath('/login')
  if (role.value && canAccessDevConsole(role.value)) return localePath('/dev')
  return localePath('/panel')
})

const primaryLabel = computed(() => {
  if (!loggedIn.value) return t('auth.login')
  if (role.value && canAccessDevConsole(role.value)) return t('auth.goDevConsole')
  return t('auth.goPanel')
})
</script>

<template>
  <UContainer class="py-16 md:py-24 max-w-lg text-center">
    <div class="inline-flex size-16 items-center justify-center rounded-2xl bg-error/10 text-error mb-6">
      <UIcon name="i-lucide-shield-off" class="size-8" />
    </div>
    <p class="text-sm font-semibold text-error tracking-wide uppercase mb-2">
      403
    </p>
    <h1 class="text-display text-3xl text-highlighted">
      {{ t('auth.forbiddenTitle') }}
    </h1>
    <p class="mt-3 text-muted leading-relaxed">
      {{ t('auth.forbiddenDesc') }}
    </p>
    <div class="mt-8 flex flex-wrap justify-center gap-3">
      <UButton
        :to="primaryTo"
        color="primary"
        size="lg"
      >
        {{ primaryLabel }}
      </UButton>
      <UButton
        :to="localePath('/')"
        color="neutral"
        variant="outline"
        size="lg"
      >
        {{ t('auth.goHome') }}
      </UButton>
    </div>
  </UContainer>
</template>
