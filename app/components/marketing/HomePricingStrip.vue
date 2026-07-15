<script setup lang="ts">
import type { ServicePackage } from '~/types'

const { t } = useI18n()
const localePath = useLocalePath()

const { data, status } = await useFetch<{ data: ServicePackage[] }>('/api/packages', {
  key: 'home-packages-strip'
})

function pickPackage(all: ServicePackage[], serviceType: string, slug?: string) {
  if (slug) {
    const bySlug = all.find(p => p.slug === slug)
    if (bySlug) return bySlug
  }
  return all.find(p => p.serviceType === serviceType)
}

const packages = computed(() => {
  const all = data.value?.data ?? []
  const picks = [
    pickPackage(all, 'export', 'website-ekspor-1y'),
    pickPackage(all, 'umkm', 'website-umkm-1y'),
    pickPackage(all, 'ecommerce', 'toko-online-basic')
  ].filter((p): p is ServicePackage => Boolean(p))

  if (picks.length) return picks.slice(0, 3)

  // fallback: first 3 active packages from API order
  return all.slice(0, 3)
})

function isPopular(pkg: ServicePackage, index: number) {
  if (pkg.slug === 'website-umkm-1y' || pkg.serviceType === 'umkm') return true
  if (packages.value.some(p => p.serviceType === 'umkm')) return false
  return index === Math.floor(packages.value.length / 2)
}

function priceSuffix(pkg: ServicePackage) {
  if (pkg.serviceType === 'ecommerce') return t('serviceLanding.projectOneTime')
  return t('order.perYear')
}

function featureList(pkg: ServicePackage) {
  return Array.isArray(pkg.features) ? pkg.features.slice(0, 5) : []
}

const orderPath = computed(() => localePath('/order/choose-domain'))
</script>

<template>
  <section id="harga" class="section-y bg-default">
    <UContainer>
      <SectionHeading
        :eyebrow="t('home.pricingEyebrow')"
        :title="t('home.pricingTitle')"
        :description="t('home.pricingDesc')"
      />

      <div v-if="status === 'pending'" class="grid gap-6 md:grid-cols-3">
        <USkeleton v-for="i in 3" :key="i" class="h-80 rounded-xl" />
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
            {{ t('serviceLanding.popular') }}
          </UBadge>
          <h3 class="text-xl font-semibold text-highlighted">
            {{ pkg.name }}
          </h3>
          <p class="text-2xl md:text-3xl font-semibold tabular-nums mt-3 text-highlighted">
            {{ formatIdr(pkg.priceYearlyIdr) }}
          </p>
          <p class="text-sm text-muted mt-1">
            {{ priceSuffix(pkg) }}
          </p>
          <p v-if="pkg.description" class="text-sm text-muted mt-2">
            {{ pkg.description }}
          </p>
          <ul v-if="featureList(pkg).length" class="mt-5 space-y-2 text-sm flex-1">
            <li
              v-for="f in featureList(pkg)"
              :key="f"
              class="flex gap-2"
            >
              <UIcon name="i-lucide-check" class="size-4 text-primary shrink-0 mt-0.5" />
              <span>{{ f }}</span>
            </li>
          </ul>
          <UButton
            class="mt-6 w-full cursor-pointer"
            color="primary"
            size="lg"
            :to="orderPath"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ t('cta.buildNow') }}
          </UButton>
        </UCard>
      </div>

      <div v-else class="py-8 text-center text-muted max-w-lg mx-auto">
        {{ t('serviceLanding.pricingEmpty') }}
      </div>

      <div v-if="packages.length" class="mt-10 text-center">
        <UButton
          :to="localePath('/jasa-pembuatan-website-umkm')"
          color="primary"
          variant="outline"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ t('home.viewAllPackages') }}
        </UButton>
      </div>
    </UContainer>
  </section>
</template>
