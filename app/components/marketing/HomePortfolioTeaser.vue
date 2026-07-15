<script setup lang="ts">
/** Static v1 teaser — full list lives on /portofolio. */
const { t } = useI18n()
const localePath = useLocalePath()

const cases = computed(() => [
  {
    key: 'craft',
    icon: 'i-lucide-palette',
    niche: t('home.portfolioCase1Niche'),
    name: t('home.portfolioCase1Name'),
    metric: t('home.portfolioCase1Metric')
  },
  {
    key: 'agro',
    icon: 'i-lucide-sprout',
    niche: t('home.portfolioCase2Niche'),
    name: t('home.portfolioCase2Name'),
    metric: t('home.portfolioCase2Metric')
  },
  {
    key: 'spice',
    icon: 'i-lucide-shopping-bag',
    niche: t('home.portfolioCase3Niche'),
    name: t('home.portfolioCase3Name'),
    metric: t('home.portfolioCase3Metric')
  }
])
</script>

<template>
  <section id="portofolio" class="section-y bg-default">
    <UContainer>
      <SectionHeading
        index="06"
        :eyebrow="t('home.portfolioEyebrow')"
        :title="t('home.portfolioTitle')"
        :description="t('home.portfolioDesc')"
      />

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="item in cases"
          :key="item.key"
          class="card-lift h-full"
          :ui="{
            root: 'bg-default ring-default shadow-soft-md border-0 h-full',
            body: 'p-6 md:p-7 flex flex-col h-full'
          }"
        >
          <div class="flex items-start gap-3 mb-5">
            <div
              class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <UIcon :name="item.icon" class="size-5" />
            </div>
            <div class="min-w-0">
              <UBadge color="neutral" variant="subtle" size="sm">
                {{ item.niche }}
              </UBadge>
              <h3 class="mt-2 text-base md:text-lg font-semibold text-highlighted tracking-tight">
                {{ item.name }}
              </h3>
            </div>
          </div>

          <p class="mt-auto pt-4 border-t border-default text-sm font-medium text-highlighted flex items-start gap-2">
            <UIcon name="i-lucide-trending-up" class="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <span>{{ item.metric }}</span>
          </p>
        </UCard>
      </div>

      <div class="mt-10 text-center">
        <UButton
          :to="localePath('/portofolio')"
          color="primary"
          variant="outline"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
          class="cursor-pointer"
        >
          {{ t('home.portfolioViewAll') }}
        </UButton>
      </div>
    </UContainer>
  </section>
</template>
