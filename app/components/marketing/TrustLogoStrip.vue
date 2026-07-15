<script setup lang="ts">
const { t } = useI18n()

const items = computed(() => [
  { icon: 'i-lucide-shield-check', label: t('home.trust.ssl') },
  { icon: 'i-lucide-credit-card', label: t('home.trust.xendit') },
  { icon: 'i-lucide-smartphone', label: t('home.trust.responsive') },
  { icon: 'i-lucide-search', label: t('home.trust.seo') },
  { icon: 'i-lucide-server', label: t('home.trust.hosting') },
  { icon: 'i-lucide-headphones', label: t('home.trust.support') }
])
</script>

<template>
  <section class="py-8 border-y border-default bg-muted/30">
    <UContainer>
      <p class="text-center text-xs font-semibold uppercase tracking-wider text-muted mb-6">
        {{ t('home.trust.eyebrow') }}
      </p>
      <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <li
          v-for="item in items"
          :key="item.label"
          class="flex flex-col items-center gap-2 text-center"
        >
          <div class="flex size-11 items-center justify-center rounded-xl bg-default ring-1 ring-default shadow-soft-sm text-primary">
            <UIcon :name="item.icon" class="size-5" />
          </div>
          <span class="text-xs font-medium text-highlighted">{{ item.label }}</span>
        </li>
      </ul>
    </UContainer>
  </section>
</template>
