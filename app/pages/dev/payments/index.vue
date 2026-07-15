<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'dev',
  middleware: ['auth', 'staff']
})

useSeoMeta({ title: () => t('dev.nav.payments') })

interface DevPayment {
  id: string
  orderId: string
  orderNumber: string | null
  provider: string
  providerRef: string | null
  method: string | null
  amountIdr: number
  status: string
  paidAt: string | Date | null
  createdAt: string | Date | null
}

const q = ref('')
const statusFilter = ref('all')

const statusItems = [
  { label: 'all', value: 'all' },
  { label: 'pending', value: 'pending' },
  { label: 'paid', value: 'paid' },
  { label: 'failed', value: 'failed' },
  { label: 'expired', value: 'expired' },
  { label: 'refunded', value: 'refunded' }
]

const filterItems = computed(() =>
  statusItems.map(s => ({
    label: s.value === 'all' ? t('common.all') : s.label,
    value: s.value
  }))
)

const queryParams = computed(() => ({
  q: q.value.trim() || undefined,
  status: statusFilter.value === 'all' ? undefined : statusFilter.value
}))

const { data, status, error } = await useFetch<{
  data: DevPayment[]
  meta: { total: number }
}>('/api/dev/payments', {
  key: 'dev-payments',
  query: queryParams,
  watch: [q, statusFilter]
})

const rows = computed(() => data.value?.data ?? [])

function formatIdr(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(n)
}

function formatDate(value: string | Date | null) {
  if (!value) return '-'
  try {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value))
  } catch {
    return String(value)
  }
}

function statusColor(s: string) {
  if (s === 'paid') return 'success'
  if (s === 'failed' || s === 'expired') return 'error'
  if (s === 'refunded') return 'warning'
  return 'neutral'
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
        {{ t('dev.nav.payments') }}
      </h1>
      <p class="text-sm text-muted mt-1">
        {{ t('dev.commerce.paymentsSubtitle') }}
        <span v-if="data?.meta" class="tabular-nums"> · {{ data.meta.total }}</span>
      </p>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <UInput
        v-model="q"
        icon="i-lucide-search"
        :placeholder="t('dev.commerce.searchPayment')"
        class="sm:max-w-xs"
        size="lg"
      />
      <USelect v-model="statusFilter" :items="filterItems" size="lg" class="sm:w-48" />
    </div>

    <DevSkeletonTable v-if="status === 'pending'" />
    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      :title="t('common.error')"
      :description="error.statusMessage || error.message"
      class="mb-4"
    />

    <div v-else class="overflow-x-auto rounded-xl ring-1 ring-default bg-default shadow-soft-sm">
      <table class="min-w-full text-sm">
        <thead class="bg-muted/40 text-left text-muted">
          <tr>
            <th class="px-4 py-3 font-medium">
              {{ t('dev.commerce.orderNumber') }}
            </th>
            <th class="px-4 py-3 font-medium">
              Provider
            </th>
            <th class="px-4 py-3 font-medium">
              Method
            </th>
            <th class="px-4 py-3 font-medium">
              Amount
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('dev.catalog.status') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('panel.createdAt') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" class="border-t border-default">
            <td class="px-4 py-3 font-mono text-xs">
              {{ row.orderNumber || row.orderId }}
            </td>
            <td class="px-4 py-3 text-muted">
              {{ row.provider }}
              <div v-if="row.providerRef" class="text-xs font-mono truncate max-w-[12rem]">
                {{ row.providerRef }}
              </div>
            </td>
            <td class="px-4 py-3 text-muted">
              {{ row.method || '-' }}
            </td>
            <td class="px-4 py-3 tabular-nums">
              {{ formatIdr(row.amountIdr) }}
            </td>
            <td class="px-4 py-3">
              <UBadge :color="statusColor(row.status)" variant="subtle">
                {{ row.status }}
              </UBadge>
            </td>
            <td class="px-4 py-3 text-xs text-muted tabular-nums">
              {{ formatDate(row.createdAt) }}
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="6" class="px-4 py-10 text-center text-muted">
              {{ t('common.empty') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
