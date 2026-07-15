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
  <UPageSection
    :title="title || t('serviceLanding.stepsTitle')"
    :description="description || t('serviceLanding.stepsDesc')"
  >
    <div class="grid gap-6 md:grid-cols-3">
      <UCard
        v-for="(step, i) in steps"
        :key="step.title"
        :ui="{ root: 'shadow-soft-md' }"
      >
        <div class="flex items-start gap-4">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold tabular-nums">
            {{ String(i + 1).padStart(2, '0') }}
          </div>
          <div>
            <h3 class="font-semibold text-highlighted">
              {{ step.title }}
            </h3>
            <p class="mt-1 text-sm text-muted">
              {{ step.description }}
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </UPageSection>
</template>
