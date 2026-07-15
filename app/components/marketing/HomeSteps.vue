<script setup lang="ts">
const { t } = useI18n()

const steps = computed(() => [
  {
    n: '01',
    icon: 'i-lucide-layout-template',
    title: t('home.step1Title'),
    description: t('home.step1Desc')
  },
  {
    n: '02',
    icon: 'i-lucide-globe',
    title: t('home.step2Title'),
    description: t('home.step2Desc')
  },
  {
    n: '03',
    icon: 'i-lucide-badge-check',
    title: t('home.step3Title'),
    description: t('home.step3Desc')
  }
])
</script>

<template>
  <section id="cara-kerja" class="section-y bg-default">
    <UContainer>
      <SectionHeading
        index="02"
        :eyebrow="t('home.stepsEyebrow')"
        :title="t('home.stepsTitle')"
        :description="t('home.stepsDesc')"
      />
      <div class="relative grid gap-6 md:grid-cols-3 md:gap-8">
        <div
          class="pointer-events-none absolute top-16 left-[16%] right-[16%] hidden h-px border-t border-dashed border-primary/25 md:block"
          aria-hidden="true"
        />
        <UCard
          v-for="step in steps"
          :key="step.n"
          class="card-lift relative h-full"
          :ui="{ root: 'shadow-soft-md ring-default', body: 'p-7 md:p-9' }"
        >
          <div class="flex items-start justify-between gap-4 mb-6">
            <p class="text-display text-6xl md:text-7xl text-primary/20 tabular-nums leading-none">
              {{ step.n }}
            </p>
            <div class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <UIcon :name="step.icon" class="size-5" />
            </div>
          </div>
          <h3 class="text-xl font-semibold text-highlighted tracking-tight">
            {{ step.title }}
          </h3>
          <p class="mt-3 text-base text-muted leading-relaxed">
            {{ step.description }}
          </p>
        </UCard>
      </div>
    </UContainer>
  </section>
</template>
