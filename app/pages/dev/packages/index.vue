<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

definePageMeta({
  layout: 'dev',
  middleware: ['auth', 'staff']
})

useSeoMeta({ title: () => t('dev.nav.packages') })

interface DevPackage {
  id: string
  slug: string
  name: string
  description: string | null
  serviceType: string
  priceYearlyIdr: number
  priceMonthlyIdr: number | null
  features: string[] | null
  includesDomain: boolean
  includesHosting: boolean
  includesSsl: boolean
  includesBizEmail: boolean
  termYears: number
  isActive: boolean
  sortOrder: number
}

const serviceTypes = ['export', 'umkm', 'ecommerce', 'custom', 'academy'] as const

const q = ref('')
const typeFilter = ref('all')
const open = ref(false)
const editing = ref<DevPackage | null>(null)
const saving = ref(false)
const deletingId = ref<string | null>(null)
const confirmOpen = ref(false)
const pendingDelete = ref<{ id: string, label: string } | null>(null)

const form = reactive({
  slug: '',
  name: '',
  description: '',
  serviceType: 'export' as typeof serviceTypes[number],
  priceYearlyIdr: 0,
  priceMonthlyIdr: null as number | null,
  featuresText: '',
  includesDomain: true,
  includesHosting: true,
  includesSsl: true,
  includesBizEmail: true,
  termYears: 1,
  isActive: true,
  sortOrder: 0
})

const typeItems = computed(() => serviceTypes.map(s => ({ label: s, value: s })))
const filterItems = computed(() => [
  { label: t('common.all'), value: 'all' },
  ...typeItems.value
])

const queryParams = computed(() => ({
  q: q.value.trim() || undefined,
  serviceType: typeFilter.value === 'all' ? undefined : typeFilter.value
}))

const { data, status, error, refresh } = await useFetch<{
  data: DevPackage[]
  meta: { total: number }
}>('/api/dev/packages', {
  key: 'dev-packages',
  query: queryParams,
  watch: [q, typeFilter]
})

const rows = computed(() => data.value?.data ?? [])

function formatIdr(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(n)
}

function openCreate() {
  editing.value = null
  form.slug = ''
  form.name = ''
  form.description = ''
  form.serviceType = 'export'
  form.priceYearlyIdr = 0
  form.priceMonthlyIdr = null
  form.featuresText = ''
  form.includesDomain = true
  form.includesHosting = true
  form.includesSsl = true
  form.includesBizEmail = true
  form.termYears = 1
  form.isActive = true
  form.sortOrder = 0
  open.value = true
}

function openEdit(row: DevPackage) {
  editing.value = row
  form.slug = row.slug
  form.name = row.name
  form.description = row.description || ''
  form.serviceType = row.serviceType as typeof serviceTypes[number]
  form.priceYearlyIdr = row.priceYearlyIdr
  form.priceMonthlyIdr = row.priceMonthlyIdr
  form.featuresText = (row.features || []).join('\n')
  form.includesDomain = row.includesDomain
  form.includesHosting = row.includesHosting
  form.includesSsl = row.includesSsl
  form.includesBizEmail = row.includesBizEmail
  form.termYears = row.termYears
  form.isActive = row.isActive
  form.sortOrder = row.sortOrder
  open.value = true
}

function bodyFromForm() {
  const features = form.featuresText
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
  const monthly = form.priceMonthlyIdr
  return {
    slug: form.slug.trim().toLowerCase(),
    name: form.name.trim(),
    description: form.description.trim() || null,
    serviceType: form.serviceType,
    priceYearlyIdr: Number(form.priceYearlyIdr) || 0,
    priceMonthlyIdr: monthly == null || Number.isNaN(Number(monthly)) ? null : Number(monthly),
    features,
    includesDomain: form.includesDomain,
    includesHosting: form.includesHosting,
    includesSsl: form.includesSsl,
    includesBizEmail: form.includesBizEmail,
    termYears: Number(form.termYears) || 1,
    isActive: form.isActive,
    sortOrder: Number(form.sortOrder) || 0
  }
}

async function save() {
  saving.value = true
  try {
    const body = bodyFromForm()
    if (editing.value) {
      await $fetch(`/api/dev/packages/${editing.value.id}`, { method: 'PATCH', body })
      toast.add({ title: t('dev.catalog.packageUpdated'), color: 'success' })
    } else {
      await $fetch('/api/dev/packages', { method: 'POST', body })
      toast.add({ title: t('dev.catalog.packageCreated'), color: 'success' })
    }
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

function askDelete(row: DevPackage) {
  pendingDelete.value = { id: row.id, label: String(row.name) }
  confirmOpen.value = true
}

async function doDelete() {
  if (!pendingDelete.value) return
  deletingId.value = pendingDelete.value.id
  try {
    await $fetch(`/api/dev/packages/${pendingDelete.value.id}`, { method: 'DELETE' })
    toast.add({ title: t('dev.catalog.packageDeleted'), color: 'success' })
    confirmOpen.value = false
    pendingDelete.value = null
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: err?.data?.message || err?.statusMessage || t('common.error'),
      color: 'error'
    })
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
          {{ t('dev.nav.packages') }}
        </h1>
        <p class="text-sm text-muted mt-1">
          {{ t('dev.catalog.packagesSubtitle') }}
          <span v-if="data?.meta" class="tabular-nums"> · {{ data.meta.total }}</span>
        </p>
      </div>
      <UButton color="primary" icon="i-lucide-plus" @click="openCreate">
        {{ t('dev.catalog.addPackage') }}
      </UButton>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <UInput
        v-model="q"
        icon="i-lucide-search"
        :placeholder="t('dev.catalog.search')"
        class="sm:max-w-xs"
        size="lg"
      />
      <USelect v-model="typeFilter" :items="filterItems" size="lg" class="sm:w-48" />
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
              {{ t('dev.catalog.name') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('dev.catalog.serviceType') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('dev.catalog.priceYearly') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('dev.catalog.status') }}
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
              <div class="text-xs text-muted font-mono">
                {{ row.slug }}
              </div>
            </td>
            <td class="px-4 py-3 text-muted">
              {{ row.serviceType }}
            </td>
            <td class="px-4 py-3 tabular-nums">
              {{ formatIdr(row.priceYearlyIdr) }}
            </td>
            <td class="px-4 py-3">
              <UBadge :color="row.isActive ? 'success' : 'neutral'" variant="subtle">
                {{ row.isActive ? t('dev.catalog.active') : t('dev.catalog.inactive') }}
              </UBadge>
            </td>
            <td class="px-4 py-3 text-right space-x-1">
              <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-pencil" @click="openEdit(row)" />
              <UButton
                size="xs"
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                :loading="deletingId === row.id"
                @click="askDelete(row)"
              />
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
              {{ editing ? t('dev.catalog.editPackage') : t('dev.catalog.addPackage') }}
            </h2>
          
  <DevConfirmModal
    v-model:open="confirmOpen"
    :title="t('dev.catalog.confirmDeletePackage', { name: pendingDelete?.label || '' })"
    color="error"
    :loading="!!deletingId"
    @confirm="doDelete"
  />
</template>

          <form class="space-y-4 max-h-[70vh] overflow-y-auto" @submit.prevent="save">
            <UFormField :label="t('dev.catalog.name')" required>
              <UInput v-model="form.name" class="w-full" required />
            </UFormField>
            <UFormField :label="t('dev.catalog.slug')" required>
              <UInput v-model="form.slug" class="w-full font-mono" required />
            </UFormField>
            <UFormField :label="t('dev.catalog.serviceType')" required>
              <USelect v-model="form.serviceType" :items="typeItems" class="w-full" />
            </UFormField>
            <UFormField :label="t('dev.catalog.description')">
              <UTextarea v-model="form.description" class="w-full" :rows="2" />
            </UFormField>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField :label="t('dev.catalog.priceYearly')" required>
                <UInput v-model.number="form.priceYearlyIdr" type="number" min="0" class="w-full" required />
              </UFormField>
              <UFormField :label="t('dev.catalog.priceMonthly')">
                <UInput v-model.number="form.priceMonthlyIdr" type="number" min="0" class="w-full" />
              </UFormField>
            </div>
            <UFormField :label="t('dev.catalog.features')" :hint="t('dev.catalog.featuresHint')">
              <UTextarea v-model="form.featuresText" class="w-full font-mono text-xs" :rows="5" />
            </UFormField>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.includesDomain" type="checkbox" class="rounded border-default">
                Domain
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.includesHosting" type="checkbox" class="rounded border-default">
                Hosting
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.includesSsl" type="checkbox" class="rounded border-default">
                SSL
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.includesBizEmail" type="checkbox" class="rounded border-default">
                Email bisnis
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.isActive" type="checkbox" class="rounded border-default">
                {{ t('dev.catalog.active') }}
              </label>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <UFormField :label="t('dev.catalog.termYears')">
                <UInput v-model.number="form.termYears" type="number" min="1" max="10" class="w-full" />
              </UFormField>
              <UFormField :label="t('dev.catalog.sortOrder')">
                <UInput v-model.number="form.sortOrder" type="number" class="w-full" />
              </UFormField>
            </div>

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
      
  