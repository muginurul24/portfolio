<script setup lang="ts">
export interface ServiceStep {
  title: string
  description: string
}

defineProps<{
  title?: string
  description?: string
  steps: ServiceStep[]
}>()

const { t } = useI18n()
</script>

<template>
  <section class="section-y bg-default">
    <UContainer>
      <SectionHeading
        :title="title || t('serviceLanding.stepsTitle')"
        :description="description || t('serviceLanding.stepsDesc')"
      />
      <div class="relative grid gap-6 md:grid-cols-3">
        <div
          class="pointer-events-none absolute top-12 left-[16%] right-[16%] hidden h-px border-t border-dashed border-primary/25 md:block"
          aria-hidden="true"
        />
        <UCard
          v-for="(step, i) in steps"
          :key="step.title"
          class="card-lift relative h-full"
          :ui="{ root: 'shadow-soft-md', body: 'p-6 md:p-8' }"
        >
          <p class="text-display text-5xl md:text-6xl text-primary/20 tabular-nums mb-4">
            {{ String(i + 1).padStart(2, '0') }}
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
