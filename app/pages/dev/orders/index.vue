<script setup lang="ts">
import { canAccessDevConsole, type UserRole } from '~/utils/roles'

const { t } = useI18n()
const toast = useToast()
const { user } = useUserSession()

definePageMeta({
  layout: 'dev',
  middleware: ['auth', 'staff']
})

useSeoMeta({ title: () => t('dev.nav.orders') })

const role = computed(() => (user.value as { role?: UserRole } | null)?.role)
const canQueue = computed(() => !!role.value && canAccessDevConsole(role.value))

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

interface QueueOrder {
  id: string
  orderNumber: string
  status: string
  customerName: string
  customerEmail: string
  domainName: string | null
  domainTld: string | null
  totalIdr: number
  notes: string | null
  paidAt: string | Date | null
  createdAt: string | Date | null
  siteId: string | null
  siteStatus: string | null
  siteDomain: string | null
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
const queueActionId = ref<string | null>(null)

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

const {
  data: queueData,
  status: queueStatus,
  error: queueError,
  refresh: refreshQueue
} = await useFetch<{ data: QueueOrder[] }>('/api/dev/orders/queue', {
  key: 'dev-orders-queue',
  immediate: canQueue.value,
  watch: false
})

const rows = computed(() => data.value?.data ?? [])
const queueRows = computed(() => queueData.value?.data ?? [])

async function refreshAll() {
  const tasks = [refresh()]
  if (canQueue.value) tasks.push(refreshQueue())
  await Promise.all(tasks)
}

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

function domainOf(row: Pick<DevOrder, 'domainName' | 'domainTld'> & { siteDomain?: string | null }) {
  if (row.siteDomain) return row.siteDomain
  if (!row.domainName || !row.domainTld) return '-'
  return `${row.domainName}.${row.domainTld}`
}

function openEdit(row: DevOrder | QueueOrder) {
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
    await refreshAll()
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
    await refreshAll()
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

async function setQueueStatus(row: QueueOrder, next: 'provisioning' | 'active') {
  queueActionId.value = `${row.id}:${next}`
  try {
    await $fetch(`/api/dev/orders/${row.id}`, {
      method: 'PATCH',
      body: { status: next }
    })
    toast.add({ title: t('dev.commerce.orderUpdated'), color: 'success' })
    await refreshAll()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: err?.data?.message || err?.statusMessage || t('common.error'),
      color: 'error'
    })
  } finally {
    queueActionId.value = null
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
    <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
          {{ t('dev.nav.orders') }}
        </h1>
        <p class="text-sm text-muted mt-1">
          {{ t('dev.commerce.ordersSubtitle') }}
          <span v-if="data?.meta" class="tabular-nums"> · {{ data.meta.total }}</span>
        </p>
      </div>
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-refresh-cw"
        :loading="status === 'pending' || queueStatus === 'pending'"
        @click="refreshAll()"
      >
        {{ t('common.retry') }}
      </UButton>
    </div>

    <section
      v-if="canQueue"
      class="mb-8"
    >
      <div class="mb-3">
        <h2 class="text-lg font-semibold text-highlighted tracking-tight">
          {{ t('dev.commerce.queueTitle') }}
        </h2>
        <p class="text-sm text-muted mt-0.5">
          {{ t('dev.commerce.queueSubtitle') }}
          <span
            v-if="queueRows.length"
            class="tabular-nums"
          > · {{ queueRows.length }}</span>
        </p>
      </div>

      <DevSkeletonTable v-if="queueStatus === 'pending' && !queueData" />
      <UAlert
        v-else-if="queueError"
        color="error"
        variant="subtle"
        :title="t('common.error')"
        :description="queueError.statusMessage || queueError.message"
        class="mb-4"
      />
      <DevEmptyState
        v-else-if="!queueRows.length"
        :title="t('dev.commerce.queueEmpty')"
        :description="t('dev.commerce.queueEmptyDesc')"
        icon="i-lucide-circle-check"
      />
      <div
        v-else
        class="overflow-x-auto rounded-xl ring-1 ring-default bg-default shadow-soft-sm"
      >
        <table class="min-w-full text-sm">
          <thead class="bg-muted/40 text-left text-muted">
            <tr>
              <th class="px-4 py-3 font-medium">
                {{ t('dev.commerce.orderNumber') }}
              </th>
              <th class="px-4 py-3 font-medium">
                Domain
              </th>
              <th class="px-4 py-3 font-medium">
                {{ t('dev.commerce.paidAt') }}
              </th>
              <th class="px-4 py-3 font-medium">
                {{ t('dev.catalog.status') }}
              </th>
              <th class="px-4 py-3 font-medium">
                {{ t('dev.commerce.siteStatus') }}
              </th>
              <th class="px-4 py-3 font-medium text-right">
                {{ t('common.actions') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in queueRows"
              :key="row.id"
              class="border-t border-default"
            >
              <td class="px-4 py-3">
                <div class="font-mono text-xs text-highlighted">
                  {{ row.orderNumber }}
                </div>
                <div class="text-xs text-muted mt-0.5">
                  {{ row.customerName }}
                </div>
              </td>
              <td class="px-4 py-3 font-mono text-xs">
                {{ domainOf(row) }}
              </td>
              <td class="px-4 py-3 text-xs text-muted tabular-nums">
                {{ formatDate(row.paidAt || row.createdAt) }}
              </td>
              <td class="px-4 py-3">
                <UBadge
                  :color="statusColor(row.status)"
                  variant="subtle"
                >
                  {{ row.status }}
                </UBadge>
              </td>
              <td class="px-4 py-3">
                <UBadge
                  v-if="row.siteStatus"
                  :color="statusColor(row.siteStatus)"
                  variant="subtle"
                >
                  {{ row.siteStatus }}
                </UBadge>
                <span
                  v-else
                  class="text-xs text-muted"
                >-</span>
              </td>
              <td class="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                <UButton
                  v-if="row.status === 'paid'"
                  size="xs"
                  color="warning"
                  variant="soft"
                  icon="i-lucide-loader"
                  :loading="queueActionId === `${row.id}:provisioning`"
                  @click="setQueueStatus(row, 'provisioning')"
                >
                  {{ t('dev.commerce.setProvisioning') }}
                </UButton>
                <UButton
                  v-if="row.status === 'paid' || row.status === 'provisioning'"
                  size="xs"
                  color="success"
                  variant="soft"
                  icon="i-lucide-check"
                  :loading="queueActionId === `${row.id}:active`"
                  @click="setQueueStatus(row, 'active')"
                >
                  {{ t('dev.commerce.setActive') }}
                </UButton>
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-pencil"
                  :title="t('dev.commerce.notes')"
                  @click="openEdit(row)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <UInput
        v-model="q"
        icon="i-lucide-search"
        :placeholder="t('dev.commerce.searchOrder')"
        class="sm:max-w-xs"
        size="lg"
      />
      <USelect
        v-model="statusFilter"
        :items="filterItems"
        size="lg"
        class="sm:w-52"
      />
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

    <div
      v-else
      class="overflow-x-auto rounded-xl ring-1 ring-default bg-default shadow-soft-sm"
    >
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
          <tr
            v-for="row in rows"
            :key="row.id"
            class="border-t border-default"
          >
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
              <UBadge
                :color="statusColor(row.status)"
                variant="subtle"
              >
                {{ row.status }}
              </UBadge>
            </td>
            <td class="px-4 py-3 text-xs text-muted tabular-nums">
              {{ formatDate(row.createdAt) }}
            </td>
            <td class="px-4 py-3 text-right space-x-1">
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-pencil"
                @click="openEdit(row)"
              />
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
            <td
              colspan="7"
              class="px-4 py-10 text-center text-muted"
            >
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
              <span
                v-if="editing"
                class="font-mono text-sm text-muted ml-2"
              >{{ editing.orderNumber }}</span>
            </h2>
          </template>
          <form
            class="space-y-4"
            @submit.prevent="save"
          >
            <UFormField
              :label="t('dev.catalog.status')"
              required
            >
              <USelect
                v-model="form.status"
                :items="statusItems"
                class="w-full"
              />
            </UFormField>
            <UFormField :label="t('dev.commerce.notes')">
              <UTextarea
                v-model="form.notes"
                class="w-full"
                :rows="4"
              />
            </UFormField>
            <div class="flex justify-end gap-2 pt-2">
              <UButton
                color="neutral"
                variant="ghost"
                type="button"
                @click="open = false"
              >
                {{ t('common.cancel') }}
              </UButton>
              <UButton
                color="primary"
                type="submit"
                :loading="saving"
              >
                {{ t('common.save') }}
              </UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
    <DevConfirmModal
      v-model:open="confirmOpen"
      :title="t('dev.commerce.confirmMarkPaid', { number: pendingMarkPaid?.orderNumber || '' })"
      color="warning"
      :loading="markingPaid"
      :confirm-label="t('dev.commerce.markPaidDev')"
      @confirm="doMarkPaid"
    />
  </div>
</template>
