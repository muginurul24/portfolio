<script setup lang="ts">
const { t } = useI18n()

const items = computed(() => [
  { icon: 'i-lucide-users', label: t('stats.members') },
  { icon: 'i-lucide-star', label: t('stats.rating') },
  { icon: 'i-lucide-trending-up', label: t('stats.salesUp') }
])
</script>

<template>
  <section class="section-y bg-default">
    <UContainer>
      <SectionHeading
        :title="t('serviceLanding.proofTitle')"
        :description="t('serviceLanding.proofDesc')"
      />
      <div class="grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
        <UCard
          v-for="item in items"
          :key="item.label"
          class="card-lift"
          :ui="{ root: 'shadow-soft-md', body: 'flex items-center gap-3 py-4 px-5' }"
        >
          <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UIcon :name="item.icon" class="size-5" />
          </div>
          <p class="font-semibold text-highlighted">
            {{ item.label }}
          </p>
        </UCard>
      </div>
    </UContainer>
  </section>
</template>
