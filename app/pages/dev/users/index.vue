<script setup lang="ts">
import type { UserRole } from '~/utils/roles'
import { canPromoteDev } from '~/utils/roles'

const { t } = useI18n()
const { user: sessionUserRef } = useUserSession()
const toast = useToast()

definePageMeta({
  layout: 'dev',
  middleware: ['auth', 'staff']
})

useSeoMeta({ title: () => t('dev.nav.users') })

interface DevUser {
  id: string
  email: string
  name: string
  phone: string | null
  role: UserRole
  createdAt: string | Date | null
  updatedAt: string | Date | null
}

const actorRole = computed(() => (sessionUserRef.value as { role?: UserRole } | null)?.role)
const q = ref('')
const roleFilter = ref<string>('all')
const open = ref(false)
const editing = ref<DevUser | null>(null)
const saving = ref(false)
const deletingId = ref<string | null>(null)
const confirmOpen = ref(false)
const pendingDelete = ref<{ id: string, label: string } | null>(null)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  role: 'customer' as UserRole,
  password: ''
})

const roleItems = computed(() => {
  const base: Array<{ label: string, value: UserRole }> = [
    { label: t('panel.roleCustomer'), value: 'customer' },
    { label: t('dev.roleCs'), value: 'cs' },
    { label: t('panel.roleAdmin'), value: 'admin' }
  ]
  if (actorRole.value && canPromoteDev(actorRole.value)) {
    base.push({ label: t('dev.roleDev'), value: 'dev' })
  }
  return base
})

const filterItems = computed(() => [
  { label: t('common.all'), value: 'all' },
  ...roleItems.value
])

const queryParams = computed(() => ({
  q: q.value.trim() || undefined,
  role: roleFilter.value === 'all' ? undefined : roleFilter.value
}))

const { data, status, error, refresh } = await useFetch<{
  data: DevUser[]
  meta: { total: number }
}>('/api/dev/users', {
  key: 'dev-users',
  query: queryParams,
  watch: [q, roleFilter]
})

const rows = computed(() => data.value?.data ?? [])

function roleLabel(role: string) {
  if (role === 'customer') return t('panel.roleCustomer')
  if (role === 'admin') return t('panel.roleAdmin')
  if (role === 'cs') return t('dev.roleCs')
  if (role === 'dev') return t('dev.roleDev')
  return role
}

function openCreate() {
  editing.value = null
  form.name = ''
  form.email = ''
  form.phone = ''
  form.role = 'customer'
  form.password = ''
  open.value = true
}

function openEdit(row: DevUser) {
  editing.value = row
  form.name = row.name
  form.email = row.email
  form.phone = row.phone || ''
  form.role = row.role
  form.password = ''
  open.value = true
}

async function save() {
  saving.value = true
  try {
    if (editing.value) {
      const body: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        role: form.role
      }
      if (form.password.trim()) body.password = form.password
      await $fetch(`/api/dev/users/${editing.value.id}`, { method: 'PATCH', body })
      toast.add({ title: t('dev.users.updated'), color: 'success' })
    } else {
      if (form.password.length < 8) {
        toast.add({ title: t('dev.users.passwordRequired'), color: 'error' })
        return
      }
      await $fetch('/api/dev/users', {
        method: 'POST',
        body: {
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          role: form.role,
          password: form.password
        }
      })
      toast.add({ title: t('dev.users.created'), color: 'success' })
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

function askDelete(row: DevUser) {
  pendingDelete.value = { id: row.id, label: String(row.email) }
  confirmOpen.value = true
}

async function doDelete() {
  if (!pendingDelete.value) return
  deletingId.value = pendingDelete.value.id
  try {
    await $fetch(`/api/dev/users/${pendingDelete.value.id}`, { method: 'DELETE' })
    toast.add({ title: t('dev.users.deleted'), color: 'success' })
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
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
          {{ t('dev.nav.users') }}
        </h1>
        <p class="text-sm text-muted mt-1">
          {{ t('dev.users.subtitle') }}
          <span v-if="data?.meta" class="tabular-nums"> · {{ data.meta.total }}</span>
        </p>
      </div>
      <UButton
        color="primary"
        icon="i-lucide-user-plus"
        @click="openCreate"
      >
        {{ t('dev.users.add') }}
      </UButton>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <UInput
        v-model="q"
        icon="i-lucide-search"
        :placeholder="t('dev.users.search')"
        class="sm:max-w-xs"
        size="lg"
      />
      <USelect
        v-model="roleFilter"
        :items="filterItems"
        size="lg"
        class="sm:w-48"
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
              {{ t('auth.name') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('auth.email') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('panel.role') }}
            </th>
            <th class="px-4 py-3 font-medium">
              {{ t('auth.phone') }}
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
            <td class="px-4 py-3 font-medium text-highlighted">
              {{ row.name }}
            </td>
            <td class="px-4 py-3 text-muted">
              {{ row.email }}
            </td>
            <td class="px-4 py-3">
              <UBadge
                :color="row.role === 'dev' ? 'primary' : row.role === 'admin' ? 'warning' : 'neutral'"
                variant="subtle"
              >
                {{ roleLabel(row.role) }}
              </UBadge>
            </td>
            <td class="px-4 py-3 text-muted font-mono text-xs">
              {{ row.phone || '-' }}
            </td>
            <td class="px-4 py-3 text-muted tabular-nums text-xs">
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
            <td colspan="6" class="px-4 py-10 text-center text-muted">
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
              {{ editing ? t('dev.users.edit') : t('dev.users.add') }}
            </h2>
          </template>

          <form class="space-y-4" @submit.prevent="save">
            <UFormField :label="t('auth.name')" required>
              <UInput v-model="form.name" class="w-full" required />
            </UFormField>
            <UFormField :label="t('auth.email')" required>
              <UInput v-model="form.email" type="email" class="w-full" required />
            </UFormField>
            <UFormField :label="t('auth.phone')">
              <UInput v-model="form.phone" class="w-full" />
            </UFormField>
            <UFormField :label="t('panel.role')" required>
              <USelect v-model="form.role" :items="roleItems" class="w-full" />
            </UFormField>
            <UFormField
              :label="editing ? t('dev.users.passwordOptional') : t('auth.password')"
              :required="!editing"
            >
              <UInput
                v-model="form.password"
                type="password"
                class="w-full"
                :required="!editing"
                autocomplete="new-password"
              />
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
  <DevConfirmModal
    v-model:open="confirmOpen"
    :title="t('dev.users.confirmDelete', { email: pendingDelete?.label || '' })"
    color="error"
    :loading="!!deletingId"
    @confirm="doDelete"
  />

  </div>
</template>
