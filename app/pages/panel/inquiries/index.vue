<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

definePageMeta({
  layout: 'panel',
  middleware: 'auth'
})

useSeoMeta({ title: () => t('panel.inquiries') })
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-highlighted tracking-tight mb-6">
      {{ t('panel.inquiries') }}
    </h1>

    <UCard
      class="text-center py-4"
      :ui="{ root: 'shadow-soft-sm' }"
    >
      <div class="flex flex-col items-center gap-3 py-8 px-4">
        <div class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UIcon
            name="i-lucide-inbox"
            class="size-6"
          />
        </div>
        <h2 class="text-lg font-semibold text-highlighted">
          {{ t('panel.emptyInquiriesTitle') }}
        </h2>
        <p class="text-muted max-w-md">
          {{ t('panel.emptyInquiriesDesc') }}
        </p>
        <UButton
          :to="localePath('/order/choose-domain')"
          color="primary"
          icon="i-lucide-plus"
          class="mt-2"
        >
          {{ t('cta.buildNow') }}
        </UButton>
      </div>
    </UCard>
  </div>
</template>
