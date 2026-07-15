<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('nav.blog'),
  description: 'Artikel praktis website, UMKM, dan ekspor dari MugiewDev.'
})

const { data: posts, status } = await useAsyncData('blog-list', () =>
  queryCollection('blog')
    .order('date', 'DESC')
    .select('title', 'path', 'description', 'date')
    .all()
)

function formatDate(value?: string) {
  if (!value) return ''
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(value))
  } catch {
    return value
  }
}
</script>

<template>
  <UContainer class="py-10 md:py-16">
    <div class="max-w-2xl mb-10">
      <h1 class="text-3xl md:text-4xl font-semibold text-highlighted tracking-tight">
        {{ t('nav.blog') }}
      </h1>
      <p class="mt-3 text-muted">
        Tips website, digital marketing, dan ekspor untuk UMKM Indonesia.
      </p>
    </div>

    <div v-if="status === 'pending'" class="py-16 text-center text-muted">
      {{ t('common.loading') }}
    </div>

    <div v-else-if="!posts?.length" class="py-16 text-center text-muted">
      {{ t('common.empty') }}
    </div>

    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="post in posts"
        :key="post.path"
        class="transition-shadow duration-200 hover:shadow-soft-lg"
        :ui="{ body: 'p-5 flex flex-col h-full' }"
      >
        <p v-if="post.date" class="text-xs text-muted mb-2 tabular-nums">
          {{ formatDate(post.date) }}
        </p>
        <h2 class="text-lg font-semibold text-highlighted tracking-tight">
          <NuxtLink
            :to="localePath(post.path)"
            class="hover:text-primary transition-colors"
          >
            {{ post.title }}
          </NuxtLink>
        </h2>
        <p v-if="post.description" class="mt-2 text-sm text-muted flex-1">
          {{ post.description }}
        </p>
        <div class="mt-4">
          <UButton
            :to="localePath(post.path)"
            color="primary"
            variant="ghost"
            trailing-icon="i-lucide-arrow-right"
            size="sm"
          >
            Baca
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
