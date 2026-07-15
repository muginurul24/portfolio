<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const name = ref('')
const selectedTld = ref('com')
const checking = ref(false)
const available = ref<boolean | null>(null)
const error = ref('')

const { data: tldData } = await useFetch<{ data: { tld: string, priceYearlyIdr: number }[] }>(
  '/api/domains/tlds',
  { key: 'home-domain-tlds' }
)
const tlds = computed(() => tldData.value?.data ?? [{ tld: 'com', priceYearlyIdr: 1_247_000 }])

watch(selectedTld, () => {
  available.value = null
})

async function check() {
  error.value = ''
  available.value = null
  const n = name.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
  if (n.length < 3) {
    error.value = t('order.domainTooShort')
    return
  }
  checking.value = true
  try {
    const res = await $fetch<{ domain: string, available: boolean }>('/api/domains/check', {
      query: { name: n, tld: selectedTld.value }
    })
    available.value = res.available
    if (res.available) {
      await navigateTo({
        path: localePath('/order/choose-domain'),
        query: { name: n, tld: selectedTld.value }
      })
    }
  } catch {
    error.value = t('common.error')
  } finally {
    checking.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-xl mx-auto">
    <div class="glass-panel shadow-soft-xl rounded-2xl p-2 sm:p-3">
      <form class="flex flex-col sm:flex-row gap-2" @submit.prevent="check">
        <UInput
          v-model="name"
          size="xl"
          :placeholder="t('order.domainPlaceholder')"
          class="flex-1"
          :ui="{ base: 'font-mono' }"
          autocomplete="off"
          :aria-label="t('order.chooseDomain')"
        />
        <USelect
          v-model="selectedTld"
          :items="tlds.map(x => ({ label: `.${x.tld}`, value: x.tld }))"
          size="xl"
          class="sm:w-32"
        />
        <UButton
          type="submit"
          color="primary"
          size="xl"
          :loading="checking"
          :disabled="checking"
          trailing-icon="i-lucide-search"
          class="shadow-glow-sky"
        >
          {{ t('common.search') }}
        </UButton>
      </form>
    </div>
    <p v-if="error" class="mt-2 text-sm text-error text-center">
      {{ error }}
    </p>
    <p v-else-if="available === false" class="mt-2 text-sm text-error text-center">
      {{ t('order.domainUnavailable') }}
    </p>
    <p class="mt-3 text-center text-xs text-muted">
      {{ t('order.domainSearchHint') }}
    </p>
  </div>
</template>
