<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'panel',
  middleware: 'auth'
})

useSeoMeta({ title: () => t('panel.dashboard') })

const stats = [
  { label: 'Website aktif', value: '—', icon: 'i-lucide-globe' },
  { label: 'Pesanan', value: '—', icon: 'i-lucide-receipt' },
  { label: 'Inquiry baru', value: '—', icon: 'i-lucide-inbox' },
  { label: 'Progress akademi', value: '—', icon: 'i-lucide-graduation-cap' }
]
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-highlighted mb-6">
      {{ t('panel.dashboard') }}
    </h1>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <UCard v-for="s in stats" :key="s.label" :ui="{ root: 'shadow-soft-sm' }">
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UIcon :name="s.icon" class="size-5" />
          </div>
          <div>
            <p class="text-sm text-muted">
              {{ s.label }}
            </p>
            <p class="text-xl font-semibold tabular-nums">
              {{ s.value }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <UAlert
      class="mt-8"
      color="info"
      variant="subtle"
      title="Panel siap dikembangkan"
      description="Hubungkan API orders, sites, academy progress, dan inquiries ke schema Drizzle di server/database."
      icon="i-lucide-info"
    />
  </div>
</template>
