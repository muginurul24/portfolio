<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

definePageMeta({
  layout: 'panel',
  middleware: 'auth'
})

useSeoMeta({ title: () => t('panel.dashboard') })

const { data, status, error, refresh } = await useFetch('/api/panel/stats', {
  key: 'panel-stats'
})

const stats = computed(() => {
  const d = data.value?.data
  return [
    {
      label: t('panel.statActiveSites'),
      value: d?.activeSites ?? '—',
      icon: 'i-lucide-globe',
      to: localePath('/panel/sites')
    },
    {
      label: t('panel.statOrders'),
      value: d?.orders ?? '—',
      icon: 'i-lucide-receipt',
      to: localePath('/panel/orders')
    },
    {
      label: t('panel.statNewInquiries'),
      value: d?.newInquiries ?? '—',
      icon: 'i-lucide-inbox',
      to: localePath('/panel/inquiries')
    },
    {
      label: t('panel.statAcademy'),
      value: d?.academyCompleted ?? '—',
      icon: 'i-lucide-graduation-cap',
      to: localePath('/panel/academy')
    }
  ]
})
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
        {{ t('panel.dashboard') }}
      </h1>
      <UButton
        :to="localePath('/order/choose-domain')"
        color="primary"
        icon="i-lucide-plus"
      >
        {{ t('panel.orderNew') }}
      </UButton>
    </div>

    <div
      v-if="status === 'pending'"
      class="py-12 text-center text-muted"
    >
      {{ t('common.loading') }}
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      :title="t('common.error')"
      :description="error.statusMessage || error.message"
      icon="i-lucide-circle-alert"
      class="mb-6"
    >
      <template #actions>
        <UButton
          size="sm"
          color="neutral"
          variant="outline"
          @click="refresh()"
        >
          {{ t('common.retry') }}
        </UButton>
      </template>
    </UAlert>

    <div
      v-else
      class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <NuxtLink
        v-for="s in stats"
        :key="s.label"
        :to="s.to"
        class="block"
      >
        <UCard
          class="card-lift h-full"
          :ui="{ root: 'shadow-soft-sm ring-1 ring-default/50' }"
        >
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UIcon
                :name="s.icon"
                class="size-5"
              />
            </div>
            <div>
              <p class="text-sm text-muted">
                {{ s.label }}
              </p>
              <p class="text-xl font-semibold tabular-nums text-highlighted">
                {{ s.value }}
              </p>
            </div>
          </div>
        </UCard>
      </NuxtLink>
    </div>

    <section class="mt-8">
      <h2 class="text-sm font-medium text-muted mb-3">
        {{ t('panel.quickActions') }}
      </h2>
      <div class="flex flex-wrap gap-2">
        <UButton
          :to="localePath('/panel/orders')"
          color="neutral"
          variant="outline"
          icon="i-lucide-receipt"
        >
          {{ t('panel.viewOrders') }}
        </UButton>
        <UButton
          :to="localePath('/panel/sites')"
          color="neutral"
          variant="outline"
          icon="i-lucide-globe"
        >
          {{ t('panel.viewSites') }}
        </UButton>
        <UButton
          :to="localePath('/academy')"
          color="neutral"
          variant="outline"
          icon="i-lucide-graduation-cap"
        >
          {{ t('panel.goAcademyPublic') }}
        </UButton>
      </div>
    </section>
  </div>
</template>
