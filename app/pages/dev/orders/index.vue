<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

definePageMeta({
  layout: 'dev',
  middleware: ['auth', 'staff']
})

useSeoMeta({ title: () => t('dev.nav.orders') })

interface DevOrder {
  id: string
  orderNumber: string
  status: string
  customerName: string
  customerEmail: string
  domainName: string | null
  domainTld: string | null
  totalIdr: number
  notes: string | null
  createdAt: string | Date | null
}

const STATUSES = [
  'draft', 'pending_payment', 'paid', 'provisioning', 'active', 'cancelled', 'expired'
] as const

const q = ref('')
const statusFilter = ref('all')
const open = ref(false)
const editing = ref<DevOrder | null>(null)
const saving = ref(false)
const confirmOpen = ref(false)
const pendingMarkPaid = ref<DevOrder | null>(null)
const markingPaid = ref(false)

const form = reactive({
  status: 'pending_payment' as string,
  notes: ''
})

const statusItems = computed(() =>
  STATUSES.map(s => ({ label: s, value: s }))
)
const filterItems = computed(() => [
  { label: t('common.all'), value: 'all' },
  ...statusItems.value
])

const queryParams = computed(() => ({
  q: q.value.trim() || undefined,
  status: statusFilter.value === 'all' ? undefined : statusFilter.value
}))

const { data, status, error, refresh } = await useFetch<{
  data: DevOrder[]
  meta: { total: number }
}>('/api/dev/orders', {
  key: 'dev-orders',
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

function domainOf(row: DevOrder) {
  if (!row.domainName || !row.domainTld) return '-'
  return `${row.domainName}.${row.domainTld}`
}

function openEdit(row: DevOrder) {
  editing.value = row
  form.status = row.status
  form.notes = row.notes || ''
  open.value = true
}

async function save() {
  if (!editing.value) return
  saving.value = true
  try {
    await $fetch(`/api/dev/orders/${editing.value.id}`, {
      method: 'PATCH',
      body: {
        status: form.status,
        notes: form.notes.trim() || null
      }
    })
    toast.add({ title: t('dev.commerce.orderUpdated'), color: 'success' })
    open.value = false
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: err?.data?.message || err?.statusMessage || t('common.error'),
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

function askMarkPaid(row: DevOrder) {
  pendingMarkPaid.value = row
  confirmOpen.value = true
}

async function doMarkPaid() {
  if (!pendingMarkPaid.value) return
  markingPaid.value = true
  try {
    await $fetch(`/api/orders/${pendingMarkPaid.value.id}/mark-paid-dev`, { method: 'POST' })
    toast.add({ title: t('dev.commerce.markedPaid'), color: 'success' })
    confirmOpen.value = false
    pendingMarkPaid.value = null
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: err?.data?.message || err?.statusMessage || t('common.error'),
      color: 'error'
    })
  } finally {
    markingPaid.value = false
  }
}

function statusColor(s: string) {
  if (s === 'active' || s === 'paid') return 'success'
  if (s === 'cancelled' || s === 'expired') return 'error'
  if (s === 'provisioning') return 'warning'
  return 'neutral'
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
        {{ t('dev.nav.orders') }}
      </h1>
      <p class="text-sm text-muted mt-1">
        {{ t('dev.commerce.ordersSubtitle') }}
        <span v-if="data?.meta" class="tabular-nums"> · {{ data.meta.total }}</span>
      </p>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <UInput
        v-model="q"
        icon="i-lucide-search"
        :placeholder="t('dev.commerce.searchOrder')"
        class="sm:max-w-xs"
        size="lg"
      />
      <USelect v-model="statusFilter" :items="filterItems" size="lg" class="sm:w-52" />
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
              {{ t('auth.name') }}
            </th>
            <th class="px-4 py-3 font-medium">
              Domain
            </th>
            <th class="px-4 py-3 font-medium">
              Total
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('dev.catalog.status') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('panel.createdAt') }}
            </th>
            <th class="px-4 py-3 font-medium text-right">
              {{ t('common.actions') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" class="border-t border-default">
            <td class="px-4 py-3 font-mono text-xs text-highlighted">
              {{ row.orderNumber }}
            </td>
            <td class="px-4 py-3">
              <div class="font-medium text-highlighted">
                {{ row.customerName }}
              </div>
              <div class="text-xs text-muted">
                {{ row.customerEmail }}
              </div>
            </td>
            <td class="px-4 py-3 font-mono text-xs">
              {{ domainOf(row) }}
            </td>
            <td class="px-4 py-3 tabular-nums">
              {{ formatIdr(row.totalIdr) }}
            </td>
            <td class="px-4 py-3">
              <UBadge :color="statusColor(row.status)" variant="subtle">
                {{ row.status }}
              </UBadge>
            </td>
            <td class="px-4 py-3 text-xs text-muted tabular-nums">
              {{ formatDate(row.createdAt) }}
            </td>
            <td class="px-4 py-3 text-right space-x-1">
              <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-pencil" @click="openEdit(row)" />
              <UButton
                v-if="row.status === 'pending_payment' || row.status === 'draft'"
                size="xs"
                color="warning"
                variant="ghost"
                icon="i-lucide-banknote"
                :title="t('dev.commerce.markPaidDev')"
                @click="askMarkPaid(row)"
              />
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="7" class="px-4 py-10 text-center text-muted">
              {{ t('common.empty') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UModal v-model:open="open">
      <template #content>
        <UCard>
          <template #header>
            <h2 class="font-semibold text-highlighted">
              {{ t('dev.commerce.editOrder') }}
              <span v-if="editing" class="font-mono text-sm text-muted ml-2">{{ editing.orderNumber }}</span>
            </h2>
          
  <DevConfirmModal
    v-model:open="confirmOpen"
    :title="t('dev.commerce.confirmMarkPaid', { number: pendingMarkPaid?.orderNumber || '' })"
    color="warning"
    :loading="markingPaid"
    :confirm-label="t('dev.commerce.markPaidDev')"
    @confirm="doMarkPaid"
  />
</template>
          <form class="space-y-4" @submit.prevent="save">
            <UFormField :label="t('dev.catalog.status')" required>
              <USelect v-model="form.status" :items="statusItems" class="w-full" />
            </UFormField>
            <UFormField :label="t('dev.commerce.notes')">
              <UTextarea v-model="form.notes" class="w-full" :rows="4" />
            </UFormField>
            <div class="flex justify-end gap-2 pt-2">
              <UButton color="neutral" variant="ghost" type="button" @click="open = false">
                {{ t('common.cancel') }}
              </UButton>
              <UButton color="primary" type="submit" :loading="saving">
                {{ t('common.save') }}
              </UButton>
            </div>
          </form>
        </UCard>
      
  