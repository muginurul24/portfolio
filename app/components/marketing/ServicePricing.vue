<script setup lang="ts">
import type { ServicePackage } from '~/types'

const props = withDefaults(defineProps<{
  packages: ServicePackage[]
  /** yearly = /tahun; project = one-time fee (ecommerce) */
  billingMode?: 'yearly' | 'project'
  /** slug or id to ring as popular */
  highlightId?: string
  ctaLabel?: string
  ctaTo?: string
  emptyText?: string
  loading?: boolean
}>(), {
  billingMode: 'yearly',
  loading: false
})

const { t } = useI18n()
const localePath = useLocalePath()

const orderPath = computed(() => props.ctaTo || localePath('/order/choose-domain'))
const ctaExternal = computed(() => /^https?:\/\//i.test(orderPath.value))

function isHighlight(pkg: ServicePackage, index: number) {
  if (props.highlightId) {
    return pkg.id === props.highlightId || pkg.slug === props.highlightId
  }
  // default: middle card, or last if only 2
  if (props.packages.length === 2) return index === 1
  return index === Math.floor(props.packages.length / 2)
}

function priceSuffix(_pkg: ServicePackage) {
  if (props.billingMode === 'project') return t('serviceLanding.projectOneTime')
  return t('order.perYear')
}

function featureList(pkg: ServicePackage) {
  return Array.isArray(pkg.features) ? pkg.features : []
}
</script>

<template>
  <section class="section-y bg-default">
    <UContainer>
      <SectionHeading
        :title="t('serviceLanding.pricingTitle')"
        :description="t('serviceLanding.pricingDesc')"
      />

      <div v-if="loading" class="grid gap-6 md:grid-cols-3">
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
            root: isHighlight(pkg, i)
              ? 'ring-2 ring-primary shadow-glow-sky'
              : 'shadow-soft-md',
            body: 'p-6 md:p-8 flex flex-col h-full'
          }"
        >
          <UBadge v-if="isHighlight(pkg, i)" color="primary" class="mb-3 self-start">
            {{ t('serviceLanding.popular') }}
          </UBadge>
          <h3 class="text-xl font-semibold text-highlighted">
            {{ pkg.name }}
          </h3>
          <p class="text-3xl md:text-4xl font-semibold tabular-nums mt-3 text-highlighted tracking-tight">
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
            :target="ctaExternal ? '_blank' : undefined"
            :trailing-icon="ctaExternal ? undefined : 'i-lucide-arrow-right'"
            :icon="ctaExternal && orderPath.includes('wa.me') ? 'i-simple-icons-whatsapp' : undefined"
          >
            {{ ctaLabel || t('cta.buildNow') }}
          </UButton>
        </UCard>
      </div>

      <div v-else class="py-8 text-center text-muted max-w-lg mx-auto">
        {{ emptyText || t('serviceLanding.pricingEmpty') }}
      </div>
    </UContainer>
  </section>
</template>
