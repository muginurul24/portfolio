<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

definePageMeta({
  layout: 'dev',
  middleware: ['auth', 'staff']
})

useSeoMeta({ title: () => t('dev.nav.testimonials') })

interface DevTestimonial {
  id: string
  name: string
  role: string | null
  company: string | null
  avatarUrl: string | null
  content: string
  rating: number
  isFeatured: boolean
  sortOrder: number
  isActive: boolean
}

const q = ref('')
const open = ref(false)
const editing = ref<DevTestimonial | null>(null)
const saving = ref(false)
const deletingId = ref<string | null>(null)

const form = reactive({
  name: '',
  role: '',
  company: '',
  avatarUrl: '',
  content: '',
  rating: 5,
  isFeatured: false,
  sortOrder: 0,
  isActive: true
})

const queryParams = computed(() => ({ q: q.value.trim() || undefined }))

const { data, status, error, refresh } = await useFetch<{
  data: DevTestimonial[]
  meta: { total: number }
}>('/api/dev/testimonials', {
  key: 'dev-testimonials',
  query: queryParams,
  watch: [q]
})

const rows = computed(() => data.value?.data ?? [])

function openCreate() {
  editing.value = null
  form.name = ''
  form.role = ''
  form.company = ''
  form.avatarUrl = ''
  form.content = ''
  form.rating = 5
  form.isFeatured = false
  form.sortOrder = 0
  form.isActive = true
  open.value = true
}

function openEdit(row: DevTestimonial) {
  editing.value = row
  form.name = row.name
  form.role = row.role || ''
  form.company = row.company || ''
  form.avatarUrl = row.avatarUrl || ''
  form.content = row.content
  form.rating = row.rating
  form.isFeatured = row.isFeatured
  form.sortOrder = row.sortOrder
  form.isActive = row.isActive
  open.value = true
}

function bodyFromForm() {
  return {
    name: form.name.trim(),
    role: form.role.trim() || null,
    company: form.company.trim() || null,
    avatarUrl: form.avatarUrl.trim() || null,
    content: form.content.trim(),
    rating: Number(form.rating) || 5,
    isFeatured: form.isFeatured,
    sortOrder: Number(form.sortOrder) || 0,
    isActive: form.isActive
  }
}

async function save() {
  saving.value = true
  try {
    const body = bodyFromForm()
    if (editing.value) {
      await $fetch(`/api/dev/testimonials/${editing.value.id}`, { method: 'PATCH', body })
      toast.add({ title: t('dev.content.testimonialUpdated'), color: 'success' })
    } else {
      await $fetch('/api/dev/testimonials', { method: 'POST', body })
      toast.add({ title: t('dev.content.testimonialCreated'), color: 'success' })
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

async function remove(row: DevTestimonial) {
  if (!confirm(t('dev.content.confirmDeleteTestimonial', { name: row.name }))) return
  deletingId.value = row.id
  try {
    await $fetch(`/api/dev/testimonials/${row.id}`, { method: 'DELETE' })
    toast.add({ title: t('dev.content.testimonialDeleted'), color: 'success' })
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
          {{ t('dev.nav.testimonials') }}
        </h1>
        <p class="text-sm text-muted mt-1">
          {{ t('dev.content.testimonialsSubtitle') }}
          <span v-if="data?.meta" class="tabular-nums"> · {{ data.meta.total }}</span>
        </p>
      </div>
      <UButton color="primary" icon="i-lucide-plus" @click="openCreate">
        {{ t('dev.content.addTestimonial') }}
      </UButton>
    </div>

    <div class="mb-4">
      <UInput
        v-model="q"
        icon="i-lucide-search"
        :placeholder="t('dev.content.searchTestimonial')"
        class="sm:max-w-xs"
        size="lg"
      />
    </div>

    <div v-if="status === 'pending'" class="py-12 text-center text-muted">
      {{ t('common.loading') }}
    </div>
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
              {{ t('dev.content.quote') }}
            </th>
            <th class="px-4 py-3 font-medium">
              Rating
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
                <UBadge v-if="row.isFeatured" color="primary" variant="subtle" size="sm" class="ml-1">
                  {{ t('dev.catalog.featured') }}
                </UBadge>
              </div>
              <div class="text-xs text-muted">
                {{ [row.role, row.company].filter(Boolean).join(' · ') || '-' }}
              </div>
            </td>
            <td class="px-4 py-3 text-muted max-w-xs truncate">
              {{ row.content }}
            </td>
            <td class="px-4 py-3 tabular-nums">
              {{ row.rating }}/5
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
                @click="remove(row)"
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
              {{ editing ? t('dev.content.editTestimonial') : t('dev.content.addTestimonial') }}
            </h2>
          </template>
          <form class="space-y-4 max-h-[70vh] overflow-y-auto" @submit.prevent="save">
            <UFormField :label="t('auth.name')" required>
              <UInput v-model="form.name" class="w-full" required />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField :label="t('panel.role')">
                <UInput v-model="form.role" class="w-full" />
              </UFormField>
              <UFormField label="Company">
                <UInput v-model="form.company" class="w-full" />
              </UFormField>
            </div>
            <UFormField :label="t('dev.content.quote')" required>
              <UTextarea v-model="form.content" class="w-full" :rows="4" required />
            </UFormField>
            <UFormField label="Avatar URL">
              <UInput v-model="form.avatarUrl" class="w-full" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Rating">
                <UInput v-model.number="form.rating" type="number" min="1" max="5" class="w-full" />
              </UFormField>
              <UFormField :label="t('dev.catalog.sortOrder')">
                <UInput v-model.number="form.sortOrder" type="number" class="w-full" />
              </UFormField>
            </div>
            <div class="flex flex-wrap gap-4 text-sm">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.isFeatured" type="checkbox" class="rounded border-default">
                {{ t('dev.catalog.featured') }}
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input v-model="form.isActive" type="checkbox" class="rounded border-default">
                {{ t('dev.catalog.active') }}
              </label>
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
      </template>
    </UModal>
  </div>
</template>
