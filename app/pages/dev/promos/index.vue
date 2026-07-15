<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

definePageMeta({
  layout: 'dev',
  middleware: ['auth', 'staff']
})

useSeoMeta({ title: () => t('dev.nav.promos') })

interface DevPromo {
  id: string
  code: string
  discountIdr: number | null
  discountPercent: number | null
  maxUses: number | null
  usedCount: number
  validFrom: string | Date | null
  validUntil: string | Date | null
  isActive: boolean
}

const q = ref('')
const open = ref(false)
const editing = ref<DevPromo | null>(null)
const saving = ref(false)
const deletingId = ref<string | null>(null)
const confirmOpen = ref(false)
const pendingDelete = ref<{ id: string, label: string } | null>(null)

const form = reactive({
  code: '',
  discountIdr: null as number | null,
  discountPercent: null as number | null,
  maxUses: null as number | null,
  validFrom: '',
  validUntil: '',
  isActive: true
})

const queryParams = computed(() => ({ q: q.value.trim() || undefined }))

const { data, status, error, refresh } = await useFetch<{
  data: DevPromo[]
  meta: { total: number }
}>('/api/dev/promos', {
  key: 'dev-promos',
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

function toLocalInput(value: string | Date | null) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toIsoOrNull(local: string) {
  if (!local) return null
  const d = new Date(local)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function openCreate() {
  editing.value = null
  form.code = ''
  form.discountIdr = null
  form.discountPercent = null
  form.maxUses = null
  form.validFrom = ''
  form.validUntil = ''
  form.isActive = true
  open.value = true
}

function openEdit(row: DevPromo) {
  editing.value = row
  form.code = row.code
  form.discountIdr = row.discountIdr
  form.discountPercent = row.discountPercent
  form.maxUses = row.maxUses
  form.validFrom = toLocalInput(row.validFrom)
  form.validUntil = toLocalInput(row.validUntil)
  form.isActive = row.isActive
  open.value = true
}

function bodyFromForm() {
  return {
    code: form.code.trim().toUpperCase(),
    discountIdr: form.discountIdr == null || Number.isNaN(Number(form.discountIdr))
      ? null
      : Number(form.discountIdr),
    discountPercent: form.discountPercent == null || Number.isNaN(Number(form.discountPercent))
      ? null
      : Number(form.discountPercent),
    maxUses: form.maxUses == null || Number.isNaN(Number(form.maxUses))
      ? null
      : Number(form.maxUses),
    validFrom: toIsoOrNull(form.validFrom),
    validUntil: toIsoOrNull(form.validUntil),
    isActive: form.isActive
  }
}

async function save() {
  saving.value = true
  try {
    const body = bodyFromForm()
    if (editing.value) {
      await $fetch(`/api/dev/promos/${editing.value.id}`, { method: 'PATCH', body })
      toast.add({ title: t('dev.commerce.promoUpdated'), color: 'success' })
    } else {
      await $fetch('/api/dev/promos', { method: 'POST', body })
      toast.add({ title: t('dev.commerce.promoCreated'), color: 'success' })
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

function askDelete(row: DevPromo) {
  pendingDelete.value = { id: row.id, label: String(row.code) }
  confirmOpen.value = true
}

async function doDelete() {
  if (!pendingDelete.value) return
  deletingId.value = pendingDelete.value.id
  try {
    await $fetch(`/api/dev/promos/${pendingDelete.value.id}`, { method: 'DELETE' })
    toast.add({ title: t('dev.commerce.promoDeleted'), color: 'success' })
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

function discountLabel(row: DevPromo) {
  if (row.discountPercent) return `${row.discountPercent}%`
  if (row.discountIdr) return formatIdr(row.discountIdr)
  return '-'
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
          {{ t('dev.nav.promos') }}
        </h1>
        <p class="text-sm text-muted mt-1">
          {{ t('dev.commerce.promosSubtitle') }}
          <span v-if="data?.meta" class="tabular-nums"> · {{ data.meta.total }}</span>
        </p>
      </div>
      <UButton color="primary" icon="i-lucide-plus" @click="openCreate">
        {{ t('dev.commerce.addPromo') }}
      </UButton>
    </div>

    <div class="mb-4">
      <UInput
        v-model="q"
        icon="i-lucide-search"
        :placeholder="t('dev.commerce.searchPromo')"
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
              {{ t('dev.commerce.code') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('dev.commerce.discount') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('dev.commerce.uses') }}
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
              {{ row.code }}
            </td>
            <td class="px-4 py-3 tabular-nums">
              {{ discountLabel(row) }}
            </td>
            <td class="px-4 py-3 tabular-nums text-muted">
              {{ row.usedCount }}{{ row.maxUses != null ? ` / ${row.maxUses}` : '' }}
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
              {{ editing ? t('dev.commerce.editPromo') : t('dev.commerce.addPromo') }}
            </h2>
          
  <DevConfirmModal
    v-model:open="confirmOpen"
    :title="t('dev.commerce.confirmDeletePromo', { code: pendingDelete?.label || '' })"
    color="error"
    :loading="!!deletingId"
    @confirm="doDelete"
  />
</template>
          <form class="space-y-4" @submit.prevent="save">
            <UFormField :label="t('dev.commerce.code')" required>
              <UInput v-model="form.code" class="w-full font-mono uppercase" required />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField :label="t('dev.commerce.discountIdr')">
                <UInput v-model.number="form.discountIdr" type="number" min="0" class="w-full" />
              </UFormField>
              <UFormField :label="t('dev.commerce.discountPercent')">
                <UInput v-model.number="form.discountPercent" type="number" min="0" max="100" class="w-full" />
              </UFormField>
            </div>
            <UFormField :label="t('dev.commerce.maxUses')">
              <UInput v-model.number="form.maxUses" type="number" min="1" class="w-full" />
            </UFormField>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField :label="t('dev.commerce.validFrom')">
                <UInput v-model="form.validFrom" type="datetime-local" class="w-full" />
              </UFormField>
              <UFormField :label="t('dev.commerce.validUntil')">
                <UInput v-model="form.validUntil" type="datetime-local" class="w-full" />
              </UFormField>
            </div>
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
      
  