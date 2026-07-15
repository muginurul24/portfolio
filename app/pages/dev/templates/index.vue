<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'dev',
  middleware: ['auth', 'staff']
})

useSeoMeta({ title: () => t('dev.nav.templates') })
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
      {{ t('dev.nav.templates') }}
    </h1>
    <p class="mt-2 text-muted">
      {{ t('dev.comingSoon') }}
    </p>
  </div>
</template>
