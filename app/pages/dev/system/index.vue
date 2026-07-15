<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'dev',
  middleware: ['auth', 'staff']
})

useSeoMeta({ title: () => t('dev.nav.system') })

const { data, status, error, refresh } = await useFetch('/api/health', {
  key: 'dev-system-health'
})

const health = computed(() => data.value as { ok?: boolean, service?: string, ts?: string } | null)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
          {{ t('dev.nav.system') }}
        </h1>
        <p class="text-sm text-muted mt-1">
          {{ t('dev.system.subtitle') }}
        </p>
      </div>
      <UButton color="neutral" variant="soft" icon="i-lucide-refresh-cw" @click="refresh()">
        {{ t('common.retry') }}
      </UButton>
    </div>

    <DevSkeletonTable v-if="status === 'pending'" />
    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      :title="t('common.error')"
      :description="error.statusMessage || error.message"
    />
    <div v-else class="grid gap-4 sm:grid-cols-2 max-w-2xl">
      <UCard :ui="{ root: 'shadow-soft-sm' }">
        <p class="text-sm text-muted">
          {{ t('dev.system.health') }}
        </p>
        <p class="mt-2 text-2xl font-semibold tabular-nums">
          <UBadge :color="health?.ok ? 'success' : 'error'" variant="subtle" size="lg">
            {{ health?.ok ? 'OK' : 'DOWN' }}
          </UBadge>
        </p>
      </UCard>
      <UCard :ui="{ root: 'shadow-soft-sm' }">
        <p class="text-sm text-muted">
          Service
        </p>
        <p class="mt-2 font-mono text-highlighted">
          {{ health?.service || '-' }}
        </p>
        <p class="mt-1 text-xs text-muted tabular-nums">
          {{ health?.ts || '-' }}
        </p>
      </UCard>
    </div>
  </div>
</template>
