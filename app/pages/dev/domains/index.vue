<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

definePageMeta({
  layout: 'dev',
  middleware: ['auth', 'staff']
})

useSeoMeta({ title: () => t('dev.nav.domains') })

interface DevTld {
  id: string
  tld: string
  priceYearlyIdr: number
  promoPriceYearlyIdr: number | null
  isActive: boolean
}

const q = ref('')
const open = ref(false)
const editing = ref<DevTld | null>(null)
const saving = ref(false)
const deletingId = ref<string | null>(null)
const confirmOpen = ref(false)
const pendingDelete = ref<{ id: string, label: string } | null>(null)

const form = reactive({
  tld: '',
  priceYearlyIdr: 0,
  promoPriceYearlyIdr: null as number | null,
  isActive: true
})

const queryParams = computed(() => ({
  q: q.value.trim() || undefined
}))

const { data, status, error, refresh } = await useFetch<{
  data: DevTld[]
  meta: { total: number }
}>('/api/dev/domains', {
  key: 'dev-domains',
  query: queryParams,
  watch: [q]
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
  form.tld = ''
  form.priceYearlyIdr = 0
  form.promoPriceYearlyIdr = null
  form.isActive = true
  open.value = true
}

function openEdit(row: DevTld) {
  editing.value = row
  form.tld = row.tld
  form.priceYearlyIdr = row.priceYearlyIdr
  form.promoPriceYearlyIdr = row.promoPriceYearlyIdr
  form.isActive = row.isActive
  open.value = true
}

function bodyFromForm() {
  const promo = form.promoPriceYearlyIdr
  return {
    tld: form.tld.trim().toLowerCase().replace(/^\./, ''),
    priceYearlyIdr: Number(form.priceYearlyIdr) || 0,
    promoPriceYearlyIdr: promo == null || Number.isNaN(Number(promo)) ? null : Number(promo),
    isActive: form.isActive
  }
}

async function save() {
  saving.value = true
  try {
    const body = bodyFromForm()
    if (editing.value) {
      await $fetch(`/api/dev/domains/${editing.value.id}`, { method: 'PATCH', body })
      toast.add({ title: t('dev.catalog.tldUpdated'), color: 'success' })
    } else {
      await $fetch('/api/dev/domains', { method: 'POST', body })
      toast.add({ title: t('dev.catalog.tldCreated'), color: 'success' })
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

function askDelete(row: DevTld) {
  pendingDelete.value = { id: row.id, label: String(row.tld) }
  confirmOpen.value = true
}

async function doDelete() {
  if (!pendingDelete.value) return
  deletingId.value = pendingDelete.value.id
  try {
    await $fetch(`/api/dev/domains/${pendingDelete.value.id}`, { method: 'DELETE' })
    toast.add({ title: t('dev.catalog.tldDeleted'), color: 'success' })
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
          {{ t('dev.nav.domains') }}
        </h1>
        <p class="text-sm text-muted mt-1">
          {{ t('dev.catalog.domainsSubtitle') }}
          <span v-if="data?.meta" class="tabular-nums"> · {{ data.meta.total }}</span>
        </p>
      </div>
      <UButton color="primary" icon="i-lucide-plus" @click="openCreate">
        {{ t('dev.catalog.addTld') }}
      </UButton>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <UInput
        v-model="q"
        icon="i-lucide-search"
        :placeholder="t('dev.catalog.searchTld')"
        class="sm:max-w-xs"
        size="lg"
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

    <div v-else class="overflow-x-auto rounded-xl ring-1 ring-default bg-default shadow-soft-sm">
      <table class="min-w-full text-sm">
        <thead class="bg-muted/40 text-left text-muted">
          <tr>
            <th class="px-4 py-3 font-medium">
              TLD
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('dev.catalog.priceYearly') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('dev.catalog.promoPrice') }}
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
            <td class="px-4 py-3 font-mono font-medium text-highlighted">
              .{{ row.tld }}
            </td>
            <td class="px-4 py-3 tabular-nums">
              {{ formatIdr(row.priceYearlyIdr) }}
            </td>
            <td class="px-4 py-3 tabular-nums text-muted">
              {{ row.promoPriceYearlyIdr != null ? formatIdr(row.promoPriceYearlyIdr) : '-' }}
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
              {{ editing ? t('dev.catalog.editTld') : t('dev.catalog.addTld') }}
            </h2>
          
  <DevConfirmModal
    v-model:open="confirmOpen"
    :title="t('dev.catalog.confirmDeleteTld', { tld: pendingDelete?.label || '' })"
    color="error"
    :loading="!!deletingId"
    @confirm="doDelete"
  />
</template>

          <form class="space-y-4" @submit.prevent="save">
            <UFormField label="TLD" required :hint="t('dev.catalog.tldHint')">
              <UInput v-model="form.tld" class="w-full font-mono" required placeholder="com" />
            </UFormField>
            <UFormField :label="t('dev.catalog.priceYearly')" required>
              <UInput v-model.number="form.priceYearlyIdr" type="number" min="0" class="w-full" required />
            </UFormField>
            <UFormField :label="t('dev.catalog.promoPrice')">
              <UInput v-model.number="form.promoPriceYearlyIdr" type="number" min="0" class="w-full" />
            </UFormField>
            <label class="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input v-model="form.isActive" type="checkbox" class="rounded border-default">
              {{ t('dev.catalog.active') }}
            </label>

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
      
  