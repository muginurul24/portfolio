<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

definePageMeta({
  layout: 'dev',
  middleware: ['auth', 'staff']
})

useSeoMeta({ title: () => t('dev.nav.sites') })

interface DevSite {
  id: string
  domain: string
  status: string
  adminUrl: string | null
  userId: string
  orderId: string | null
  expiresAt: string | Date | null
  createdAt: string | Date | null
}

const STATUSES = ['provisioning', 'active', 'suspended', 'expired'] as const

const q = ref('')
const statusFilter = ref('all')
const open = ref(false)
const editing = ref<DevSite | null>(null)
const saving = ref(false)

const form = reactive({
  status: 'provisioning' as string,
  adminUrl: '',
  expiresAt: ''
})

const statusItems = computed(() => STATUSES.map(s => ({ label: s, value: s })))
const filterItems = computed(() => [
  { label: t('common.all'), value: 'all' },
  ...statusItems.value
])

const queryParams = computed(() => ({
  q: q.value.trim() || undefined,
  status: statusFilter.value === 'all' ? undefined : statusFilter.value
}))

const { data, status, error, refresh } = await useFetch<{
  data: DevSite[]
  meta: { total: number }
}>('/api/dev/sites', {
  key: 'dev-sites',
  query: queryParams,
  watch: [q, statusFilter]
})

const rows = computed(() => data.value?.data ?? [])

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

function toLocalInput(value: string | Date | null) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function openEdit(row: DevSite) {
  editing.value = row
  form.status = row.status
  form.adminUrl = row.adminUrl || ''
  form.expiresAt = toLocalInput(row.expiresAt)
  open.value = true
}

async function save() {
  if (!editing.value) return
  saving.value = true
  try {
    const expiresAt = form.expiresAt
      ? new Date(form.expiresAt).toISOString()
      : null
    await $fetch(`/api/dev/sites/${editing.value.id}`, {
      method: 'PATCH',
      body: {
        status: form.status,
        adminUrl: form.adminUrl.trim() || null,
        expiresAt
      }
    })
    toast.add({ title: t('dev.commerce.siteUpdated'), color: 'success' })
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

function statusColor(s: string) {
  if (s === 'active') return 'success'
  if (s === 'suspended' || s === 'expired') return 'error'
  return 'warning'
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
        {{ t('dev.nav.sites') }}
      </h1>
      <p class="text-sm text-muted mt-1">
        {{ t('dev.commerce.sitesSubtitle') }}
        <span v-if="data?.meta" class="tabular-nums"> · {{ data.meta.total }}</span>
      </p>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <UInput
        v-model="q"
        icon="i-lucide-search"
        :placeholder="t('dev.commerce.searchSite')"
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
              Domain
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('dev.catalog.status') }}
            </th>
            <th class="px-4 py-3 font-medium">
              Admin URL
            </th>
            <th class="px-4 py-3 font-medium">
              Expires
            </th>
            <th class="px-4 py-3 font-medium text-right">
              {{ t('common.actions') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" class="border-t border-default">
            <td class="px-4 py-3 font-mono font-medium text-highlighted">
              {{ row.domain }}
            </td>
            <td class="px-4 py-3">
              <UBadge :color="statusColor(row.status)" variant="subtle">
                {{ row.status }}
              </UBadge>
            </td>
            <td class="px-4 py-3 text-xs text-muted truncate max-w-[14rem]">
              {{ row.adminUrl || '-' }}
            </td>
            <td class="px-4 py-3 text-xs text-muted tabular-nums">
              {{ formatDate(row.expiresAt) }}
            </td>
            <td class="px-4 py-3 text-right">
              <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-pencil" @click="openEdit(row)" />
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="5" class="px-4 py-10 text-center text-muted">
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
              {{ t('dev.commerce.editSite') }}
              <span v-if="editing" class="font-mono text-sm text-muted ml-2">{{ editing.domain }}</span>
            </h2>
          </template>
          <form class="space-y-4" @submit.prevent="save">
            <UFormField :label="t('dev.catalog.status')" required>
              <USelect v-model="form.status" :items="statusItems" class="w-full" />
            </UFormField>
            <UFormField label="Admin URL">
              <UInput v-model="form.adminUrl" class="w-full" />
            </UFormField>
            <UFormField label="Expires at">
              <UInput v-model="form.expiresAt" type="datetime-local" class="w-full" />
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
      </template>
    </UModal>
  </div>
</template>
