<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

definePageMeta({
  layout: 'panel',
  middleware: 'auth'
})

useSeoMeta({ title: () => t('panel.sites') })

type SiteRow = {
  id: string
  domain: string
  status: string
  adminUrl: string | null
  expiresAt: string | Date | null
  createdAt: string | Date | null
}

const { data, status, error, refresh } = await useFetch('/api/sites', {
  key: 'panel-sites'
})

const sites = computed(() => (data.value?.data ?? []) as SiteRow[])

function statusLabel(s: string) {
  const map: Record<string, string> = {
    provisioning: t('panel.statusProvisioning'),
    active: t('panel.statusActive'),
    suspended: t('panel.statusSuspended'),
    expired: t('panel.statusExpired')
  }
  return map[s] || s
}

function statusColor(s: string): 'neutral' | 'warning' | 'info' | 'success' | 'error' {
  switch (s) {
    case 'provisioning':
      return 'info'
    case 'active':
      return 'success'
    case 'suspended':
      return 'warning'
    case 'expired':
      return 'neutral'
    default:
      return 'neutral'
  }
}

function formatDate(value: string | Date | null) {
  if (!value) return '-'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(d)
}

function siteHref(domain: string) {
  return isSafeHttpHost(domain) ? `https://${domain}` : null
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
        {{ t('panel.sites') }}
      </h1>
      <UButton
        :to="localePath('/order/choose-domain')"
        color="primary"
        icon="i-lucide-plus"
      >
        {{ t('panel.orderNew') }}
      </UButton>
    </div>

    <div
      v-if="status === 'pending'"
      class="py-12 text-center text-muted"
    >
      {{ t('common.loading') }}
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      :title="t('common.error')"
      :description="error.statusMessage || error.message"
      icon="i-lucide-circle-alert"
    >
      <template #actions>
        <UButton
          size="sm"
          color="neutral"
          variant="outline"
          @click="refresh()"
        >
          {{ t('common.retry') }}
        </UButton>
      </template>
    </UAlert>

    <div
      v-else-if="sites.length"
      class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      <UCard
        v-for="site in sites"
        :key="site.id"
        :ui="{ root: 'shadow-soft-sm' }"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-semibold text-highlighted truncate">
              {{ site.domain }}
            </p>
            <p class="mt-1 text-xs text-muted">
              {{ t('panel.createdAt') }}: {{ formatDate(site.createdAt) }}
            </p>
          </div>
          <UBadge
            :color="statusColor(site.status)"
            variant="subtle"
            size="sm"
          >
            {{ statusLabel(site.status) }}
          </UBadge>
        </div>

        <dl class="mt-4 space-y-2 text-sm">
          <div class="flex justify-between gap-2">
            <dt class="text-muted">
              {{ t('panel.expiresAt') }}
            </dt>
            <dd class="tabular-nums">
              {{ formatDate(site.expiresAt) }}
            </dd>
          </div>
        </dl>

        <div class="mt-4 flex flex-wrap gap-2">
          <UButton
            v-if="siteHref(site.domain)"
            :to="siteHref(site.domain)!"
            color="neutral"
            variant="outline"
            size="sm"
            icon="i-lucide-external-link"
            target="_blank"
            rel="noopener"
            external
          >
            {{ t('panel.domain') }}
          </UButton>
          <span
            v-else
            class="inline-flex items-center text-sm text-muted"
          >
            {{ site.domain }}
          </span>
          <UButton
            v-if="site.adminUrl"
            :to="site.adminUrl"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-lucide-settings-2"
            target="_blank"
            rel="noopener"
            external
          >
            {{ t('panel.adminUrl') }}
          </UButton>
        </div>
      </UCard>
    </div>

    <UCard
      v-else
      class="text-center py-4"
      :ui="{ root: 'shadow-soft-sm' }"
    >
      <div class="flex flex-col items-center gap-3 py-8 px-4">
        <div class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UIcon
            name="i-lucide-globe"
            class="size-6"
          />
        </div>
        <h2 class="text-lg font-semibold text-highlighted">
          {{ t('panel.emptySitesTitle') }}
        </h2>
        <p class="text-muted max-w-md">
          {{ t('panel.emptySitesDesc') }}
        </p>
        <UButton
          :to="localePath('/order/choose-domain')"
          color="primary"
          icon="i-lucide-plus"
          class="mt-2"
        >
          {{ t('cta.buildNow') }}
        </UButton>
      </div>
    </UCard>
  </div>
</template>
