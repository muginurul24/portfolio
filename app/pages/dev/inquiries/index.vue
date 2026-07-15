<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

definePageMeta({
  layout: 'dev',
  middleware: ['auth', 'staff']
})

useSeoMeta({ title: () => t('dev.nav.inquiries') })

interface DevInquiry {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  message: string | null
  productInterest: string | null
  source: string | null
  status: string
  createdAt: string | Date | null
}

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const

const q = ref('')
const statusFilter = ref('all')
const open = ref(false)
const editing = ref<DevInquiry | null>(null)
const saving = ref(false)

const form = reactive({
  status: 'new' as string,
  message: ''
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
  data: DevInquiry[]
  meta: { total: number }
}>('/api/dev/inquiries', {
  key: 'dev-inquiries',
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

function openEdit(row: DevInquiry) {
  editing.value = row
  form.status = row.status
  form.message = row.message || ''
  open.value = true
}

async function save() {
  if (!editing.value) return
  saving.value = true
  try {
    await $fetch(`/api/dev/inquiries/${editing.value.id}`, {
      method: 'PATCH',
      body: {
        status: form.status,
        message: form.message.trim() || null
      }
    })
    toast.add({ title: t('dev.content.inquiryUpdated'), color: 'success' })
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
  if (s === 'won') return 'success'
  if (s === 'lost') return 'error'
  if (s === 'quoted' || s === 'contacted') return 'warning'
  return 'primary'
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
        {{ t('dev.nav.inquiries') }}
      </h1>
      <p class="text-sm text-muted mt-1">
        {{ t('dev.content.inquiriesSubtitle') }}
        <span v-if="data?.meta" class="tabular-nums"> · {{ data.meta.total }}</span>
      </p>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <UInput
        v-model="q"
        icon="i-lucide-search"
        :placeholder="t('dev.content.searchInquiry')"
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
              {{ t('auth.name') }}
            </th>
            <th class="px-4 py-3 font-medium">
              Kontak
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
            <td class="px-4 py-3">
              <div class="font-medium text-highlighted">
                {{ row.name }}
              </div>
              <div class="text-xs text-muted">
                {{ row.company || row.productInterest || '-' }}
              </div>
            </td>
            <td class="px-4 py-3 text-xs text-muted">
              <div>{{ row.email || '-' }}</div>
              <div class="font-mono">
                {{ row.phone || '-' }}
              </div>
            </td>
            <td class="px-4 py-3">
              <UBadge :color="statusColor(row.status)" variant="subtle">
                {{ row.status }}
              </UBadge>
            </td>
            <td class="px-4 py-3 text-xs text-muted tabular-nums">
              {{ formatDate(row.createdAt) }}
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
              {{ t('dev.content.editInquiry') }}
            </h2>
          </template>
          <form class="space-y-4" @submit.prevent="save">
            <UFormField :label="t('dev.catalog.status')" required>
              <USelect v-model="form.status" :items="statusItems" class="w-full" />
            </UFormField>
            <UFormField :label="t('dev.content.message')">
              <UTextarea v-model="form.message" class="w-full" :rows="4" />
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
