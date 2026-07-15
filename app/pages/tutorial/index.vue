<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('nav.tutorial'),
  description: 'Tutorial kelola website, domain, dan panel MugiewDev - langkah demi langkah.'
})

const { data: tutorials, status } = await useAsyncData('tutorial-list', () =>
  queryCollection('tutorial')
    .select('title', 'path', 'description')
    .all()
)
</script>

<template>
  <UContainer class="py-10 md:py-16">
    <div class="max-w-2xl mb-10">
      <h1 class="text-3xl md:text-4xl font-semibold text-highlighted tracking-tight">
        {{ t('nav.tutorial') }}
      </h1>
      <p class="mt-3 text-muted">
        Panduan praktis pakai website, domain, dan fitur panel.
      </p>
    </div>

    <div v-if="status === 'pending'" class="py-16 text-center text-muted">
      {{ t('common.loading') }}
    </div>

    <div v-else-if="!tutorials?.length" class="py-16 text-center text-muted">
      {{ t('common.empty') }}
    </div>

    <ul v-else class="space-y-4 max-w-3xl">
      <li v-for="item in tutorials" :key="item.path">
        <UCard
          class="transition-shadow duration-200 hover:shadow-soft-md"
          :ui="{ body: 'p-5 flex items-start gap-4' }"
        >
          <div class="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <UIcon name="i-lucide-book-open" class="size-5 text-primary" />
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="font-semibold text-highlighted">
              <NuxtLink
                :to="localePath(item.path)"
                class="hover:text-primary transition-colors"
              >
                {{ item.title }}
              </NuxtLink>
            </h2>
            <p v-if="item.description" class="mt-1 text-sm text-muted">
              {{ item.description }}
            </p>
          </div>
          <UButton
            :to="localePath(item.path)"
            color="neutral"
            variant="ghost"
            icon="i-lucide-chevron-right"
            size="sm"
            :aria-label="item.title"
          />
        </UCard>
      </li>
    </ul>
  </UContainer>
</template>
