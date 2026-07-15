<script setup lang="ts">
const { t } = useI18n()

const steps = computed(() => [
  {
    n: '01',
    title: t('home.step1Title'),
    description: t('home.step1Desc')
  },
  {
    n: '02',
    title: t('home.step2Title'),
    description: t('home.step2Desc')
  },
  {
    n: '03',
    title: t('home.step3Title'),
    description: t('home.step3Desc')
  }
])
</script>

<template>
  <section id="cara-kerja" class="section-y bg-default">
    <UContainer>
      <SectionHeading
        :eyebrow="t('home.stepsEyebrow')"
        :title="t('home.stepsTitle')"
        :description="t('home.stepsDesc')"
      />
      <div class="relative grid gap-6 md:grid-cols-3">
        <div
          class="pointer-events-none absolute top-12 left-[16%] right-[16%] hidden h-px border-t border-dashed border-primary/25 md:block"
          aria-hidden="true"
        />
        <UCard
          v-for="step in steps"
          :key="step.n"
          class="card-lift relative h-full"
          :ui="{ root: 'shadow-soft-md', body: 'p-6 md:p-8' }"
        >
          <p class="text-display text-5xl md:text-6xl text-primary/20 tabular-nums mb-4">
            {{ step.n }}
          </p>
          <h3 class="text-lg font-semibold text-highlighted">
            {{ step.title }}
          </h3>
          <p class="mt-2 text-sm text-muted leading-relaxed">
            {{ step.description }}
          </p>
        </UCard>
      </div>
    </UContainer>
  </section>
</template>
