<script setup lang="ts">
interface DomainTld {
  id: string
  tld: string
  priceYearlyIdr: number
  promoPriceYearlyIdr: number | null
  isActive: boolean
}

const PREFERRED_TLDS = ['com', 'co.id', 'id'] as const

const { t } = useI18n()
const localePath = useLocalePath()

const { data, status } = await useFetch<{ data: DomainTld[] }>('/api/domains/tlds', {
  key: 'home-domain-packages'
})

const packages = computed(() => {
  const all = data.value?.data ?? []
  const preferred = PREFERRED_TLDS
    .map(tld => all.find(row => row.tld === tld))
    .filter((row): row is DomainTld => Boolean(row))

  if (preferred.length) return preferred.slice(0, 3)

  return all.slice(0, 3)
})

function displayPrice(row: DomainTld) {
  return row.promoPriceYearlyIdr ?? row.priceYearlyIdr
}

function isPopular(row: DomainTld, index: number) {
  if (row.tld === 'com') return true
  if (packages.value.some(p => p.tld === 'com')) return false
  return index === Math.floor(packages.value.length / 2)
}

const includes = computed(() => [
  t('home.domainPackages.includeDomain'),
  t('home.domainPackages.includeHosting'),
  t('home.domainPackages.includeSsl')
])

const orderPath = computed(() => localePath('/order/choose-domain'))
</script>

<template>
  <section id="harga-domain" class="section-y bg-default">
    <UContainer>
      <SectionHeading
        index="03"
        :eyebrow="t('home.domainPackages.eyebrow')"
        :title="t('home.domainPackages.title')"
        :description="t('home.domainPackages.description')"
      />

      <div v-if="status === 'pending'" class="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        <USkeleton v-for="i in 3" :key="i" class="h-72 rounded-xl" />
      </div>

      <div
        v-else-if="packages.length"
        class="grid gap-6 max-w-5xl mx-auto"
        :class="packages.length === 1 ? 'md:grid-cols-1 max-w-md' : packages.length === 2 ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-3'"
      >
        <UCard
          v-for="(pkg, i) in packages"
          :key="pkg.id"
          class="card-lift h-full flex flex-col"
          :ui="{
            root: isPopular(pkg, i) ? 'ring-2 ring-primary shadow-soft-lg' : 'shadow-soft-md',
            body: 'p-6 md:p-8 flex flex-col h-full'
          }"
        >
          <UBadge v-if="isPopular(pkg, i)" color="primary" class="mb-3 self-start">
            {{ t('home.domainPackages.popular') }}
          </UBadge>
          <h3 class="text-xl font-semibold text-highlighted font-mono tracking-tight">
            .{{ pkg.tld }}
          </h3>
          <p class="text-2xl md:text-3xl font-semibold tabular-nums mt-3 text-highlighted font-mono">
            {{ formatIdr(displayPrice(pkg)) }}
          </p>
          <p class="text-sm text-muted mt-1">
            {{ t('order.perYear') }}
          </p>
          <ul class="mt-5 space-y-2 text-sm flex-1">
            <li
              v-for="item in includes"
              :key="item"
              class="flex gap-2"
            >
              <UIcon name="i-lucide-check" class="size-4 text-primary shrink-0 mt-0.5" />
              <span>{{ item }}</span>
            </li>
          </ul>
          <UButton
            class="mt-6 w-full cursor-pointer"
            color="primary"
            size="lg"
            :to="orderPath"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ t('home.domainPackages.cta') }}
          </UButton>
        </UCard>
      </div>

      <div v-else class="py-8 text-center text-muted max-w-lg mx-auto">
        {{ t('home.domainPackages.empty') }}
      </div>

      <div v-if="packages.length" class="mt-10 text-center">
        <UButton
          :to="orderPath"
          color="primary"
          variant="outline"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ t('home.domainPackages.viewAllTlds') }}
        </UButton>
      </div>
    </UContainer>
  </section>
</template>
