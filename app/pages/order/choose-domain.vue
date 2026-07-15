<script setup lang="ts">
import { useOrderStore } from '~/stores/order'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const orderStore = useOrderStore()

useSeoMeta({
  title: () => t('order.chooseDomain'),
  description: () => t('order.chooseDomainDesc')
})

interface DomainTld {
  id: string
  tld: string
  priceYearlyIdr: number
  promoPriceYearlyIdr: number | null
  isActive: boolean
}

const { data: tldsRes, status: tldsStatus } = await useFetch<{ data: DomainTld[] }>(
  '/api/domains/tlds',
  { key: 'domain-tlds' }
)

const tlds = computed(() => tldsRes.value?.data ?? [])

const queryName = typeof route.query.name === 'string' ? route.query.name : ''
const queryTld = typeof route.query.tld === 'string' ? route.query.tld : ''

const name = ref(queryName || orderStore.domainName || '')
const selectedTld = ref(queryTld || orderStore.domainTld || 'com')
const checking = ref(false)
const available = ref<boolean | null>(null)
const checkError = ref('')

const templateSlug = computed(() => String(route.query.template || orderStore.templateSlug || ''))

watch(tlds, (list) => {
  if (!list.length) return
  if (!list.some(x => x.tld === selectedTld.value)) {
    selectedTld.value = list[0]!.tld
  }
}, { immediate: true })

const cleanName = computed(() =>
  name.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
)

const fullDomain = computed(() => {
  const n = cleanName.value
  return n ? `${n}.${selectedTld.value}` : ''
})

const selectedTldRow = computed(() =>
  tlds.value.find(x => x.tld === selectedTld.value)
)

const displayPrice = computed(() => {
  const row = selectedTldRow.value
  if (!row) return 0
  return row.promoPriceYearlyIdr ?? row.priceYearlyIdr
})

watch([name, selectedTld], () => {
  available.value = null
  checkError.value = ''
})

async function checkDomain() {
  if (!cleanName.value || cleanName.value.length < 3) {
    checkError.value = t('order.domainNameInvalid')
    available.value = null
    return
  }
  checking.value = true
  available.value = null
  checkError.value = ''
  try {
    const res = await $fetch<{ domain: string, available: boolean }>(
      '/api/domains/check',
      { query: { name: cleanName.value, tld: selectedTld.value } }
    )
    available.value = res.available
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    checkError.value = err?.data?.message || err?.statusMessage || t('common.error')
    available.value = null
  } finally {
    checking.value = false
  }
}

function continueOrder() {
  if (!available.value || !cleanName.value) return
  orderStore.setDomain(cleanName.value, selectedTld.value)
  if (templateSlug.value) orderStore.setTemplate(templateSlug.value)

  navigateTo({
    path: localePath('/order/checkout'),
    query: {
      domain: fullDomain.value,
      ...(templateSlug.value ? { template: templateSlug.value } : {})
    }
  })
}
</script>

<template>
  <div class="bg-mesh-hero min-h-[60vh]">
    <UContainer class="py-10 md:py-16 max-w-3xl">
      <OrderStepper :step="1" />

      <div class="mb-8">
        <h1 class="text-3xl font-semibold text-highlighted tracking-tight">
          {{ t('order.chooseDomain') }}
        </h1>
        <p class="mt-2 text-muted">
          {{ t('order.chooseDomainDesc') }}
        </p>
      </div>

      <UCard
        class="glass-panel"
        :ui="{ root: 'shadow-soft-md ring-1 ring-default/60' }"
      >
        <div class="flex flex-col sm:flex-row gap-3">
          <UInput
            v-model="name"
            size="lg"
            :placeholder="t('order.domainPlaceholder')"
            class="flex-1"
            :ui="{ base: 'font-mono' }"
            @keyup.enter="checkDomain"
          />
          <USelect
            v-model="selectedTld"
            :items="tlds.map(x => ({ label: `.${x.tld}`, value: x.tld }))"
            :loading="tldsStatus === 'pending'"
            size="lg"
            class="sm:w-36"
          />
          <UButton
            color="primary"
            size="lg"
            :loading="checking"
            :disabled="!name.trim() || checking || tldsStatus === 'pending'"
            @click="checkDomain"
          >
            {{ t('common.search') }}
          </UButton>
        </div>

        <UAlert
          v-if="checkError"
          color="error"
          variant="subtle"
          :title="checkError"
          icon="i-lucide-alert-circle"
          class="mt-4"
        />

        <div v-if="available !== null" class="mt-6">
          <UAlert
            :color="available ? 'success' : 'error'"
            variant="subtle"
            :title="available
              ? t('order.domainAvailable', { domain: fullDomain })
              : `${fullDomain} — ${t('order.domainUnavailable')}`"
            :icon="available ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
          />

          <div
            v-if="available"
            class="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl bg-muted/40 px-4 py-3"
          >
            <p class="text-sm text-muted">
              {{ t('order.domainPriceFrom') }}
              <span class="font-semibold text-highlighted tabular-nums">
                {{ formatIdr(displayPrice) }}{{ t('order.perYear') }}
              </span>
            </p>
            <UButton
              color="primary"
              size="lg"
              trailing-icon="i-lucide-arrow-right"
              @click="continueOrder"
            >
              {{ t('common.continue') }}
            </UButton>
          </div>
        </div>
      </UCard>

      <div class="mt-8 grid gap-3 sm:grid-cols-3">
        <UCard
          v-for="row in tlds.slice(0, 3)"
          :key="row.tld"
          class="card-lift"
          :ui="{ root: 'shadow-soft-sm' }"
        >
          <p class="font-mono font-semibold">
            .{{ row.tld }}
          </p>
          <p class="text-sm text-muted tabular-nums mt-1">
            {{ formatIdr(row.promoPriceYearlyIdr ?? row.priceYearlyIdr) }}{{ t('order.perYearShort') }}
          </p>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>
