<script setup lang="ts">
const { t } = useI18n()
const { user } = useUserSession()

definePageMeta({
  middleware: ['auth', 'dev']
})

useSeoMeta({ title: () => t('dev.consoleTitle') })
</script>

<template>
  <UContainer class="py-10 md:py-16 max-w-3xl">
    <UBadge color="primary" variant="subtle" class="mb-3">
      DEV
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
  </UContainer>
</template>
