<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

definePageMeta({
  layout: 'dev',
  middleware: ['auth', 'staff']
})

useSeoMeta({ title: () => t('dev.nav.templates') })

interface DevTemplate {
  id: string
  slug: string
  name: string
  description: string | null
  category: string
  tags: string[] | null
  thumbnailUrl: string | null
  previewUrl: string | null
  demoUrl: string | null
  isFeatured: boolean
  isActive: boolean
  sortOrder: number
}

const categories = [
  'export', 'umkm', 'ecommerce', 'company', 'agriculture',
  'craft', 'automotive', 'restaurant', 'service', 'custom'
] as const

const q = ref('')
const categoryFilter = ref('all')
const open = ref(false)
const editing = ref<DevTemplate | null>(null)
const saving = ref(false)
const deletingId = ref<string | null>(null)

const form = reactive({
  slug: '',
  name: '',
  description: '',
  category: 'export' as typeof categories[number],
  tagsText: '',
  thumbnailUrl: '',
  previewUrl: '',
  demoUrl: '',
  isFeatured: false,
  isActive: true,
  sortOrder: 0
})

const categoryItems = computed(() =>
  categories.map(c => ({ label: c, value: c }))
)

const filterItems = computed(() => [
  { label: t('common.all'), value: 'all' },
  ...categoryItems.value
])

const queryParams = computed(() => ({
  q: q.value.trim() || undefined,
  category: categoryFilter.value === 'all' ? undefined : categoryFilter.value
}))

const { data, status, error, refresh } = await useFetch<{
  data: DevTemplate[]
  meta: { total: number }
}>('/api/dev/templates', {
  key: 'dev-templates',
  query: queryParams,
  watch: [q, categoryFilter]
})

const rows = computed(() => data.value?.data ?? [])

function openCreate() {
  editing.value = null
  form.slug = ''
  form.name = ''
  form.description = ''
  form.category = 'export'
  form.tagsText = ''
  form.thumbnailUrl = ''
  form.previewUrl = ''
  form.demoUrl = ''
  form.isFeatured = false
  form.isActive = true
  form.sortOrder = 0
  open.value = true
}

function openEdit(row: DevTemplate) {
  editing.value = row
  form.slug = row.slug
  form.name = row.name
  form.description = row.description || ''
  form.category = row.category as typeof categories[number]
  form.tagsText = (row.tags || []).join(', ')
  form.thumbnailUrl = row.thumbnailUrl || ''
  form.previewUrl = row.previewUrl || ''
  form.demoUrl = row.demoUrl || ''
  form.isFeatured = row.isFeatured
  form.isActive = row.isActive
  form.sortOrder = row.sortOrder
  open.value = true
}

function parseTags(text: string) {
  return text
    .split(/[,;\n]/)
    .map(s => s.trim())
    .filter(Boolean)
}

function bodyFromForm() {
  return {
    slug: form.slug.trim().toLowerCase(),
    name: form.name.trim(),
    description: form.description.trim() || null,
    category: form.category,
    tags: parseTags(form.tagsText),
    thumbnailUrl: form.thumbnailUrl.trim() || null,
    previewUrl: form.previewUrl.trim() || null,
    demoUrl: form.demoUrl.trim() || null,
    isFeatured: form.isFeatured,
    isActive: form.isActive,
    sortOrder: Number(form.sortOrder) || 0
  }
}

async function save() {
  saving.value = true
  try {
    const body = bodyFromForm()
    if (editing.value) {
      await $fetch(`/api/dev/templates/${editing.value.id}`, { method: 'PATCH', body })
      toast.add({ title: t('dev.catalog.templateUpdated'), color: 'success' })
    } else {
      await $fetch('/api/dev/templates', { method: 'POST', body })
      toast.add({ title: t('dev.catalog.templateCreated'), color: 'success' })
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

async function remove(row: DevTemplate) {
  if (!confirm(t('dev.catalog.confirmDeleteTemplate', { name: row.name }))) return
  deletingId.value = row.id
  try {
    await $fetch(`/api/dev/templates/${row.id}`, { method: 'DELETE' })
    toast.add({ title: t('dev.catalog.templateDeleted'), color: 'success' })
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
          {{ t('dev.nav.templates') }}
        </h1>
        <p class="text-sm text-muted mt-1">
          {{ t('dev.catalog.templatesSubtitle') }}
          <span v-if="data?.meta" class="tabular-nums"> · {{ data.meta.total }}</span>
        </p>
      </div>
      <UButton color="primary" icon="i-lucide-plus" @click="openCreate">
        {{ t('dev.catalog.addTemplate') }}
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
      <USelect
        v-model="categoryFilter"
        :items="filterItems"
        size="lg"
        class="sm:w-48"
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
            <th class="px-4 py-3 font-medium">{{ t('dev.catalog.name') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('dev.catalog.slug') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('dev.catalog.category') }}</th>
            <th class="px-4 py-3 font-medium">{{ t('dev.catalog.status') }}</th>
            <th class="px-4 py-3 font-medium text-right">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" class="border-t border-default">
            <td class="px-4 py-3 font-medium text-highlighted">
              {{ row.name }}
              <UBadge v-if="row.isFeatured" color="primary" variant="subtle" class="ml-2" size="sm">
                {{ t('dev.catalog.featured') }}
              </UBadge>
            </td>
            <td class="px-4 py-3 text-muted font-mono text-xs">{{ row.slug }}</td>
            <td class="px-4 py-3 text-muted">{{ row.category }}</td>
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
              {{ editing ? t('dev.catalog.editTemplate') : t('dev.catalog.addTemplate') }}
            </h2>
          </template>

          <form class="space-y-4 max-h-[70vh] overflow-y-auto" @submit.prevent="save">
            <UFormField :label="t('dev.catalog.name')" required>
              <UInput v-model="form.name" class="w-full" required />
            </UFormField>
            <UFormField :label="t('dev.catalog.slug')" required>
              <UInput v-model="form.slug" class="w-full font-mono" required />
            </UFormField>
            <UFormField :label="t('dev.catalog.category')" required>
              <USelect v-model="form.category" :items="categoryItems" class="w-full" />
            </UFormField>
            <UFormField :label="t('dev.catalog.description')">
              <UTextarea v-model="form.description" class="w-full" :rows="3" />
            </UFormField>
            <UFormField :label="t('dev.catalog.tags')" :hint="t('dev.catalog.tagsHint')">
              <UInput v-model="form.tagsText" class="w-full" />
            </UFormField>
            <UFormField label="Thumbnail URL">
              <UInput v-model="form.thumbnailUrl" class="w-full" />
            </UFormField>
            <UFormField label="Preview URL">
              <UInput v-model="form.previewUrl" class="w-full" />
            </UFormField>
            <UFormField label="Demo URL">
              <UInput v-model="form.demoUrl" class="w-full" />
            </UFormField>
            <UFormField :label="t('dev.catalog.sortOrder')">
              <UInput v-model.number="form.sortOrder" type="number" class="w-full" />
            </UFormField>
            <div class="flex flex-wrap gap-4">
              <label class="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input v-model="form.isFeatured" type="checkbox" class="rounded border-default">
                {{ t('dev.catalog.featured') }}
              </label>
              <label class="inline-flex items-center gap-2 text-sm cursor-pointer">
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
