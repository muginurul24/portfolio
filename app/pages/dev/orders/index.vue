<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  middleware: ['auth', 'staff']
})

useSeoMeta({ title: () => t('dev.ordersTitle') })
</script>

<template>
  <UContainer class="py-10 md:py-16 max-w-3xl">
    <UBadge color="primary" variant="subtle" class="mb-3">
      STAFF
    </UBadge>
    <h1 class="text-display text-3xl text-highlighted">
      {{ t('dev.ordersTitle') }}
    </h1>
    <p class="mt-2 text-muted">
      {{ t('dev.ordersPlaceholder') }}
    </p>
  </UContainer>
</template>
