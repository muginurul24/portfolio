<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

definePageMeta({
  layout: 'dev',
  middleware: ['auth', 'staff']
})

useSeoMeta({ title: () => t('dev.nav.academy') })

interface DevCourse {
  id: string
  slug: string
  title: string
  description: string | null
  level: string
  moduleCount: number
  isPublished: boolean
  sortOrder: number
}

interface DevModule {
  id: string
  courseId: string
  slug: string
  title: string
  contentMd: string | null
  videoUrl: string | null
  sortOrder: number
  durationMinutes: number | null
  hasQuiz: boolean
}

const q = ref('')
const open = ref(false)
const editing = ref<DevCourse | null>(null)
const saving = ref(false)
const deletingId = ref<string | null>(null)

const modulesOpen = ref(false)
const activeCourse = ref<DevCourse | null>(null)
const modules = ref<DevModule[]>([])
const modulesLoading = ref(false)
const moduleOpen = ref(false)
const moduleSaving = ref(false)
const editingModule = ref<DevModule | null>(null)

const form = reactive({
  slug: '',
  title: '',
  description: '',
  level: 'beginner' as 'beginner' | 'advanced',
  isPublished: false,
  sortOrder: 0
})

const moduleForm = reactive({
  slug: '',
  title: '',
  contentMd: '',
  videoUrl: '',
  sortOrder: 0,
  durationMinutes: null as number | null,
  hasQuiz: false
})

const levelItems = [
  { label: 'beginner', value: 'beginner' },
  { label: 'advanced', value: 'advanced' }
]

const queryParams = computed(() => ({ q: q.value.trim() || undefined }))

const { data, status, error, refresh } = await useFetch<{
  data: DevCourse[]
  meta: { total: number }
}>('/api/dev/courses', {
  key: 'dev-courses',
  query: queryParams,
  watch: [q]
})

const rows = computed(() => data.value?.data ?? [])

function openCreate() {
  editing.value = null
  form.slug = ''
  form.title = ''
  form.description = ''
  form.level = 'beginner'
  form.isPublished = false
  form.sortOrder = 0
  open.value = true
}

function openEdit(row: DevCourse) {
  editing.value = row
  form.slug = row.slug
  form.title = row.title
  form.description = row.description || ''
  form.level = row.level as 'beginner' | 'advanced'
  form.isPublished = row.isPublished
  form.sortOrder = row.sortOrder
  open.value = true
}

async function save() {
  saving.value = true
  try {
    const body = {
      slug: form.slug.trim().toLowerCase(),
      title: form.title.trim(),
      description: form.description.trim() || null,
      level: form.level,
      isPublished: form.isPublished,
      sortOrder: Number(form.sortOrder) || 0
    }
    if (editing.value) {
      await $fetch(`/api/dev/courses/${editing.value.id}`, { method: 'PATCH', body })
      toast.add({ title: t('dev.content.courseUpdated'), color: 'success' })
    } else {
      await $fetch('/api/dev/courses', { method: 'POST', body })
      toast.add({ title: t('dev.content.courseCreated'), color: 'success' })
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

async function remove(row: DevCourse) {
  if (!confirm(t('dev.content.confirmDeleteCourse', { title: row.title }))) return
  deletingId.value = row.id
  try {
    await $fetch(`/api/dev/courses/${row.id}`, { method: 'DELETE' })
    toast.add({ title: t('dev.content.courseDeleted'), color: 'success' })
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

async function openModules(row: DevCourse) {
  activeCourse.value = row
  modulesOpen.value = true
  modulesLoading.value = true
  try {
    const res = await $fetch<{ data: DevModule[] }>(`/api/dev/courses/${row.id}/modules`)
    modules.value = res.data || []
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: err?.data?.message || err?.statusMessage || t('common.error'),
      color: 'error'
    })
  } finally {
    modulesLoading.value = false
  }
}

function openCreateModule() {
  editingModule.value = null
  moduleForm.slug = ''
  moduleForm.title = ''
  moduleForm.contentMd = ''
  moduleForm.videoUrl = ''
  moduleForm.sortOrder = modules.value.length
  moduleForm.durationMinutes = null
  moduleForm.hasQuiz = false
  moduleOpen.value = true
}

function openEditModule(mod: DevModule) {
  editingModule.value = mod
  moduleForm.slug = mod.slug
  moduleForm.title = mod.title
  moduleForm.contentMd = mod.contentMd || ''
  moduleForm.videoUrl = mod.videoUrl || ''
  moduleForm.sortOrder = mod.sortOrder
  moduleForm.durationMinutes = mod.durationMinutes
  moduleForm.hasQuiz = mod.hasQuiz
  moduleOpen.value = true
}

async function saveModule() {
  if (!activeCourse.value) return
  moduleSaving.value = true
  try {
    const body = {
      slug: moduleForm.slug.trim().toLowerCase(),
      title: moduleForm.title.trim(),
      contentMd: moduleForm.contentMd.trim() || null,
      videoUrl: moduleForm.videoUrl.trim() || null,
      sortOrder: Number(moduleForm.sortOrder) || 0,
      durationMinutes:
        moduleForm.durationMinutes == null || Number.isNaN(Number(moduleForm.durationMinutes))
          ? null
          : Number(moduleForm.durationMinutes),
      hasQuiz: moduleForm.hasQuiz
    }
    if (editingModule.value) {
      await $fetch(`/api/dev/modules/${editingModule.value.id}`, { method: 'PATCH', body })
      toast.add({ title: t('dev.content.moduleUpdated'), color: 'success' })
    } else {
      await $fetch(`/api/dev/courses/${activeCourse.value.id}/modules`, { method: 'POST', body })
      toast.add({ title: t('dev.content.moduleCreated'), color: 'success' })
    }
    moduleOpen.value = false
    await openModules(activeCourse.value)
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: err?.data?.message || err?.statusMessage || t('common.error'),
      color: 'error'
    })
  } finally {
    moduleSaving.value = false
  }
}

async function removeModule(mod: DevModule) {
  if (!activeCourse.value) return
  if (!confirm(t('dev.content.confirmDeleteModule', { title: mod.title }))) return
  try {
    await $fetch(`/api/dev/modules/${mod.id}`, { method: 'DELETE' })
    toast.add({ title: t('dev.content.moduleDeleted'), color: 'success' })
    await openModules(activeCourse.value)
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: err?.data?.message || err?.statusMessage || t('common.error'),
      color: 'error'
    })
  }
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
          {{ t('dev.nav.academy') }}
        </h1>
        <p class="text-sm text-muted mt-1">
          {{ t('dev.content.academySubtitle') }}
          <span v-if="data?.meta" class="tabular-nums"> · {{ data.meta.total }}</span>
        </p>
      </div>
      <UButton color="primary" icon="i-lucide-plus" @click="openCreate">
        {{ t('dev.content.addCourse') }}
      </UButton>
    </div>

    <div class="mb-4">
      <UInput
        v-model="q"
        icon="i-lucide-search"
        :placeholder="t('dev.content.searchCourse')"
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
              {{ t('dev.content.courseTitle') }}
            </th>
            <th class="px-4 py-3 font-medium">
              Level
            </th>
            <th class="px-4 py-3 font-medium">
              Modules
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
                {{ row.title }}
              </div>
              <div class="text-xs font-mono text-muted">
                {{ row.slug }}
              </div>
            </td>
            <td class="px-4 py-3 text-muted">
              {{ row.level }}
            </td>
            <td class="px-4 py-3 tabular-nums">
              {{ row.moduleCount }}
            </td>
            <td class="px-4 py-3">
              <UBadge :color="row.isPublished ? 'success' : 'neutral'" variant="subtle">
                {{ row.isPublished ? t('dev.content.published') : t('dev.content.draft') }}
              </UBadge>
            </td>
            <td class="px-4 py-3 text-right space-x-1">
              <UButton
                size="xs"
                color="primary"
                variant="ghost"
                icon="i-lucide-list"
                @click="openModules(row)"
              />
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
              {{ editing ? t('dev.content.editCourse') : t('dev.content.addCourse') }}
            </h2>
          </template>
          <form class="space-y-4" @submit.prevent="save">
            <UFormField :label="t('dev.content.courseTitle')" required>
              <UInput v-model="form.title" class="w-full" required />
            </UFormField>
            <UFormField :label="t('dev.catalog.slug')" required>
              <UInput v-model="form.slug" class="w-full font-mono" required />
            </UFormField>
            <UFormField :label="t('dev.catalog.description')">
              <UTextarea v-model="form.description" class="w-full" :rows="3" />
            </UFormField>
            <UFormField label="Level">
              <USelect v-model="form.level" :items="levelItems" class="w-full" />
            </UFormField>
            <UFormField :label="t('dev.catalog.sortOrder')">
              <UInput v-model.number="form.sortOrder" type="number" class="w-full" />
            </UFormField>
            <label class="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input v-model="form.isPublished" type="checkbox" class="rounded border-default">
              {{ t('dev.content.published') }}
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
      </template>
    </UModal>

    <UModal v-model:open="modulesOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <h2 class="font-semibold text-highlighted">
                {{ t('dev.content.modules') }}
                <span v-if="activeCourse" class="text-sm text-muted font-normal ml-2">{{ activeCourse.title }}</span>
              </h2>
              <UButton size="sm" color="primary" icon="i-lucide-plus" @click="openCreateModule">
                {{ t('dev.content.addModule') }}
              </UButton>
            </div>
          </template>

          <div v-if="modulesLoading" class="py-8 text-center text-muted">
            {{ t('common.loading') }}
          </div>
          <ul v-else class="divide-y divide-default">
            <li
              v-for="mod in modules"
              :key="mod.id"
              class="py-3 flex items-start justify-between gap-3"
            >
              <div>
                <div class="font-medium text-highlighted">
                  {{ mod.title }}
                </div>
                <div class="text-xs text-muted font-mono">
                  {{ mod.slug }} · order {{ mod.sortOrder }}
                </div>
              </div>
              <div class="space-x-1 shrink-0">
                <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-pencil" @click="openEditModule(mod)" />
                <UButton size="xs" color="error" variant="ghost" icon="i-lucide-trash-2" @click="removeModule(mod)" />
              </div>
            </li>
            <li v-if="!modules.length" class="py-8 text-center text-muted">
              {{ t('common.empty') }}
            </li>
          </ul>
        </UCard>
      </template>
    </UModal>

    <UModal v-model:open="moduleOpen">
      <template #content>
        <UCard>
          <template #header>
            <h2 class="font-semibold text-highlighted">
              {{ editingModule ? t('dev.content.editModule') : t('dev.content.addModule') }}
            </h2>
          </template>
          <form class="space-y-4 max-h-[70vh] overflow-y-auto" @submit.prevent="saveModule">
            <UFormField :label="t('dev.content.courseTitle')" required>
              <UInput v-model="moduleForm.title" class="w-full" required />
            </UFormField>
            <UFormField :label="t('dev.catalog.slug')" required>
              <UInput v-model="moduleForm.slug" class="w-full font-mono" required />
            </UFormField>
            <UFormField label="Markdown">
              <UTextarea v-model="moduleForm.contentMd" class="w-full font-mono text-xs" :rows="6" />
            </UFormField>
            <UFormField label="Video URL">
              <UInput v-model="moduleForm.videoUrl" class="w-full" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField :label="t('dev.catalog.sortOrder')">
                <UInput v-model.number="moduleForm.sortOrder" type="number" class="w-full" />
              </UFormField>
              <UFormField label="Duration (min)">
                <UInput v-model.number="moduleForm.durationMinutes" type="number" min="0" class="w-full" />
              </UFormField>
            </div>
            <label class="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input v-model="moduleForm.hasQuiz" type="checkbox" class="rounded border-default">
              Quiz
            </label>
            <div class="flex justify-end gap-2 pt-2">
              <UButton color="neutral" variant="ghost" type="button" @click="moduleOpen = false">
                {{ t('common.cancel') }}
              </UButton>
              <UButton color="primary" type="submit" :loading="moduleSaving">
                {{ t('common.save') }}
              </UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
