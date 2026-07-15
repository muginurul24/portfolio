<script setup lang="ts">
import { formatIdr } from '~/utils/format'
import { canAccessDevConsole, type UserRole } from '~/utils/roles'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { user } = useUserSession()

definePageMeta({
  layout: 'dev',
  middleware: ['auth', 'staff']
})

useSeoMeta({ title: () => t('dev.overviewTitle') })

const role = computed(() => (user.value as { role?: UserRole } | null)?.role)
const isFullConsole = computed(() => role.value && canAccessDevConsole(role.value))

const { data, status, error, refresh } = await useFetch('/api/dev/overview', {
  key: 'dev-overview'
})

const overview = computed(() => data.value?.data)

const orderStatusEntries = computed(() => {
  const map = overview.value?.ordersByStatus ?? {}
  return Object.entries(map).map(([statusKey, count]) => ({
    status: statusKey,
    count: Number(count) || 0,
    label: statusLabel(statusKey)
  }))
})

function statusLabel(statusKey: string): string {
  const key = `panel.status${statusKey
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')}` as const
  const translated = t(key)
  return translated === key ? statusKey : translated
}

const metricCards = computed(() => {
  const d = overview.value
  return [
    {
      key: 'users',
      label: t('dev.statUsers'),
      value: d?.users ?? 0,
      icon: 'i-lucide-users',
      to: localePath('/dev/users')
    },
    {
      key: 'revenue',
      label: t('dev.statRevenue'),
      value: formatIdr(d?.paidRevenueIdr ?? 0, locale.value === 'en' ? 'en-US' : 'id-ID'),
      icon: 'i-lucide-wallet',
      to: localePath('/dev/orders')
    },
    {
      key: 'sites',
      label: t('dev.statSitesProvisioning'),
      value: d?.sitesProvisioning ?? 0,
      icon: 'i-lucide-loader',
      to: localePath('/dev/sites')
    },
    {
      key: 'inquiries',
      label: t('dev.statOpenInquiries'),
      value: d?.openInquiries ?? 0,
      icon: 'i-lucide-inbox',
      to: localePath('/dev/inquiries')
    },
    {
      key: 'promos',
      label: t('dev.statActivePromos'),
      value: d?.activePromos ?? 0,
      icon: 'i-lucide-ticket-percent',
      to: localePath('/dev/promos')
    }
  ]
})

const isForbidden = computed(() => error.value?.statusCode === 403)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <UBadge
            color="primary"
            variant="subtle"
          >
            {{ isFullConsole ? 'DEV' : 'STAFF' }}
          </UBadge>
        </div>
        <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
          {{ t('dev.overviewTitle') }}
        </h1>
        <p class="mt-1 text-sm text-muted">
          {{ t('dev.overviewDesc') }}
        </p>
      </div>
      <UButton
        v-if="!isForbidden"
        color="neutral"
        variant="outline"
        icon="i-lucide-refresh-cw"
        :loading="status === 'pending'"
        @click="refresh()"
      >
        {{ t('common.retry') }}
      </UButton>
    </div>

    <div
      v-if="status === 'pending' && !data"
      class="py-12 text-center text-muted"
    >
      {{ t('common.loading') }}
    </div>

    <UAlert
      v-else-if="isForbidden"
      color="warning"
      variant="subtle"
      :title="t('dev.limitedTitle')"
      :description="t('dev.limitedDesc')"
      icon="i-lucide-shield-alert"
      class="mb-6"
    >
      <template #actions>
        <div class="flex flex-wrap gap-2">
          <UButton
            :to="localePath('/dev/orders')"
            size="sm"
            color="primary"
            icon="i-lucide-receipt"
          >
            {{ t('dev.nav.orders') }}
          </UButton>
          <UButton
            :to="localePath('/dev/inquiries')"
            size="sm"
            color="neutral"
            variant="outline"
            icon="i-lucide-inbox"
          >
            {{ t('dev.nav.inquiries') }}
          </UButton>
          <UButton
            :to="localePath('/dev/sites')"
            size="sm"
            color="neutral"
            variant="outline"
            icon="i-lucide-globe"
          >
            {{ t('dev.nav.sites') }}
          </UButton>
        </div>
      </template>
    </UAlert>

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

    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="card in metricCards"
          :key="card.key"
          :to="card.to"
          class="block"
        >
          <UCard
            class="card-lift h-full"
            :ui="{ root: 'shadow-soft-sm ring-1 ring-default/50' }"
          >
            <div class="flex items-center gap-3">
              <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UIcon
                  :name="card.icon"
                  class="size-5"
                />
              </div>
              <div class="min-w-0">
                <p class="text-sm text-muted">
                  {{ card.label }}
                </p>
                <p class="text-xl font-semibold tabular-nums text-highlighted truncate">
                  {{ card.value }}
                </p>
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>

      <section class="mt-8">
        <h2 class="text-sm font-medium text-muted mb-3">
          {{ t('dev.ordersByStatus') }}
        </h2>
        <div
          v-if="orderStatusEntries.length"
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <UCard
            v-for="row in orderStatusEntries"
            :key="row.status"
            :ui="{ root: 'shadow-soft-sm ring-1 ring-default/50' }"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm text-muted">
                {{ row.label }}
              </p>
              <p class="text-lg font-semibold tabular-nums text-highlighted">
                {{ row.count }}
              </p>
            </div>
          </UCard>
        </div>
        <p
          v-else
          class="text-sm text-muted"
        >
          {{ t('common.empty') }}
        </p>
      </section>
    </template>
  </div>
</template>
