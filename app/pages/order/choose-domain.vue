<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

useSeoMeta({
  title: () => t('order.chooseDomain'),
  description: 'Cari dan pilih domain untuk website bisnis Anda.'
})

const tlds = [
  { tld: 'com', price: 1_247_000, promo: 1_247_000 },
  { tld: 'co.id', price: 1_477_000, promo: 1_477_000 },
  { tld: 'id', price: 1_466_000, promo: 1_466_000 },
  { tld: 'net', price: 1_300_000, promo: null },
  { tld: 'org', price: 1_300_000, promo: null }
]

const name = ref('')
const selectedTld = ref('com')
const checking = ref(false)
const available = ref<boolean | null>(null)

const templateSlug = computed(() => String(route.query.template || ''))

const fullDomain = computed(() => {
  const n = name.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
  return n ? `${n}.${selectedTld.value}` : ''
})

async function checkDomain() {
  if (!fullDomain.value) return
  checking.value = true
  available.value = null
  try {
    // Stub: real registrar API later
    await new Promise(r => setTimeout(r, 400))
    available.value = name.value.trim().length >= 3
  } finally {
    checking.value = false
  }
}

function continueOrder() {
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
  <UContainer class="py-10 md:py-16 max-w-3xl">
    <div class="mb-8">
      <UBadge color="primary" variant="subtle" class="mb-3">
        Step 1 / 3
      </UBadge>
      <h1 class="text-3xl font-semibold text-highlighted tracking-tight">
        {{ t('order.chooseDomain') }}
      </h1>
      <p class="mt-2 text-muted">
        Domain + hosting + SSL dalam satu paket. Unlimited host.
      </p>
    </div>

    <UCard :ui="{ root: 'shadow-soft-md' }">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput
          v-model="name"
          size="lg"
          placeholder="namabisnis"
          class="flex-1"
          :ui="{ base: 'font-mono' }"
          @keyup.enter="checkDomain"
        />
        <USelect
          v-model="selectedTld"
          :items="tlds.map(t => ({ label: `.${t.tld}`, value: t.tld }))"
          size="lg"
          class="sm:w-36"
        />
        <UButton
          color="primary"
          size="lg"
          :loading="checking"
          :disabled="!name.trim() || checking"
          @click="checkDomain"
        >
          {{ t('common.search') }}
        </UButton>
      </div>

      <div v-if="available !== null" class="mt-6">
        <UAlert
          :color="available ? 'success' : 'error'"
          variant="subtle"
          :title="available ? `${fullDomain} tersedia` : `${fullDomain} tidak tersedia`"
          :icon="available ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
        />

        <div v-if="available" class="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p class="text-sm text-muted">
            Paket mulai
            <span class="font-semibold text-highlighted tabular-nums">
              {{ formatIdr(tlds.find(x => x.tld === selectedTld)?.price || 0) }}/tahun
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
      <UCard v-for="t in tlds.slice(0, 3)" :key="t.tld" :ui="{ root: 'shadow-soft-sm' }">
        <p class="font-mono font-semibold">
          .{{ t.tld }}
        </p>
        <p class="text-sm text-muted tabular-nums mt-1">
          {{ formatIdr(t.price) }}/thn
        </p>
      </UCard>
    </div>
  </UContainer>
</template>
