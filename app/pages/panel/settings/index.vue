<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'panel',
  middleware: 'auth'
})

useSeoMeta({ title: () => t('panel.settings') })

const { user } = useUserSession()

const profile = computed(() => {
  const u = user.value as {
    id?: string
    email?: string
    name?: string
    phone?: string | null
    role?: string
  } | null
  return {
    name: u?.name || '—',
    email: u?.email || '—',
    phone: u?.phone || '—',
    role: u?.role || '—'
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-highlighted tracking-tight mb-6">
      {{ t('panel.settings') }}
    </h1>

    <UCard :ui="{ root: 'shadow-soft-sm max-w-xl' }">
      <h2 class="text-lg font-semibold text-highlighted mb-1">
        {{ t('panel.profile') }}
      </h2>
      <p class="text-sm text-muted mb-6">
        {{ t('panel.profileReadonly') }}
      </p>

      <dl class="space-y-4 text-sm">
        <div>
          <dt class="text-muted">
            {{ t('auth.name') }}
          </dt>
          <dd class="mt-1 font-medium">
            {{ profile.name }}
          </dd>
        </div>
        <div>
          <dt class="text-muted">
            {{ t('auth.email') }}
          </dt>
          <dd class="mt-1 font-medium break-all">
            {{ profile.email }}
          </dd>
        </div>
        <div>
          <dt class="text-muted">
            {{ t('auth.phone') }}
          </dt>
          <dd class="mt-1 font-medium">
            {{ profile.phone }}
          </dd>
        </div>
        <div>
          <dt class="text-muted">
            {{ t('panel.role') }}
          </dt>
          <dd class="mt-1">
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
            >
              {{ profile.role }}
            </UBadge>
          </dd>
        </div>
      </dl>
    </UCard>
  </div>
</template>
