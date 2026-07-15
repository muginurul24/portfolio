<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

definePageMeta({
  layout: 'panel',
  middleware: 'auth'
})

useSeoMeta({ title: () => t('panel.orders') })

type OrderRow = {
  id: string
  orderNumber: string
  domainName: string | null
  domainTld: string | null
  status: string
  totalIdr: number
  createdAt: string | Date | null
}

const { data, status, error, refresh } = await useFetch('/api/orders', {
  key: 'panel-orders'
})

const orders = computed(() => (data.value?.data ?? []) as OrderRow[])

function domainLabel(row: OrderRow) {
  if (!row.domainName) return '-'
  const tld = row.domainTld ? `.${row.domainTld.replace(/^\./, '')}` : ''
  return `${row.domainName}${tld}`
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    draft: t('panel.statusDraft'),
    pending_payment: t('panel.statusPendingPayment'),
    paid: t('panel.statusPaid'),
    provisioning: t('panel.statusProvisioning'),
    active: t('panel.statusActive'),
    cancelled: t('panel.statusCancelled'),
    expired: t('panel.statusExpired')
  }
  return map[s] || s
}

function statusColor(s: string): 'neutral' | 'warning' | 'info' | 'success' | 'error' {
  switch (s) {
    case 'pending_payment':
      return 'warning'
    case 'paid':
    case 'provisioning':
      return 'info'
    case 'active':
      return 'success'
    case 'cancelled':
      return 'error'
    default:
      return 'neutral'
  }
}

function formatDate(value: string | Date | null) {
  if (!value) return '-'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(d)
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
        {{ t('panel.orders') }}
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

    <UCard
      v-else-if="orders.length"
      :ui="{ root: 'shadow-soft-sm overflow-hidden', body: 'p-0' }"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-muted/50 text-muted">
            <tr>
              <th class="px-4 py-3 font-medium">
                {{ t('panel.orderNumber') }}
              </th>
              <th class="px-4 py-3 font-medium">
                {{ t('panel.domain') }}
              </th>
              <th class="px-4 py-3 font-medium">
                {{ t('panel.status') }}
              </th>
              <th class="px-4 py-3 font-medium text-right">
                {{ t('panel.total') }}
              </th>
              <th class="px-4 py-3 font-medium">
                {{ t('panel.createdAt') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default">
            <tr
              v-for="row in orders"
              :key="row.id"
              class="hover:bg-muted/30"
            >
              <td class="px-4 py-3 font-mono text-xs md:text-sm">
                {{ row.orderNumber }}
              </td>
              <td class="px-4 py-3">
                {{ domainLabel(row) }}
              </td>
              <td class="px-4 py-3">
                <UBadge
                  :color="statusColor(row.status)"
                  variant="subtle"
                  size="sm"
                >
                  {{ statusLabel(row.status) }}
                </UBadge>
              </td>
              <td class="px-4 py-3 text-right tabular-nums font-medium">
                {{ formatIdr(row.totalIdr) }}
              </td>
              <td class="px-4 py-3 text-muted whitespace-nowrap">
                {{ formatDate(row.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <UCard
      v-else
      class="text-center py-4"
      :ui="{ root: 'shadow-soft-sm' }"
    >
      <div class="flex flex-col items-center gap-3 py-8 px-4">
        <div class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UIcon
            name="i-lucide-receipt"
            class="size-6"
          />
        </div>
        <h2 class="text-lg font-semibold text-highlighted">
          {{ t('panel.emptyOrdersTitle') }}
        </h2>
        <p class="text-muted max-w-md">
          {{ t('panel.emptyOrdersDesc') }}
        </p>
        <UButton
          :to="localePath('/order/choose-domain')"
          color="primary"
          icon="i-lucide-plus"
          class="mt-2"
        >
          {{ t('cta.buildNow') }}
        </UButton>
      </div>
    </UCard>
  </div>
</template>
