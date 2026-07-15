<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()

const contentPath = computed(() => {
  const slug = route.params.slug
  const parts = Array.isArray(slug) ? slug : [slug]
  return `/blog/${parts.filter(Boolean).join('/')}`
})

const { data: post } = await useAsyncData(
  () => `blog-${contentPath.value}`,
  () => queryCollection('blog').path(contentPath.value).first(),
  { watch: [contentPath] }
)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Artikel tidak ditemukan' })
}

useSeoMeta({
  title: () => post.value?.title || t('nav.blog'),
  description: () => post.value?.description || ''
})

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
  <UContainer class="py-10 md:py-16 max-w-3xl">
    <UButton
      :to="localePath('/blog')"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
      class="mb-6"
    >
      {{ t('nav.blog') }}
    </UButton>

    <article v-if="post">
      <p v-if="post.date" class="text-sm text-muted mb-3 tabular-nums">
        {{ formatDate(post.date) }}
      </p>
      <h1 class="text-display text-3xl md:text-4xl text-highlighted">
        {{ post.title }}
      </h1>
      <p v-if="post.description" class="mt-3 text-lg text-muted font-serif">
        {{ post.description }}
      </p>
      <div class="mt-8 prose prose-slate dark:prose-invert max-w-none font-serif prose-headings:font-display prose-headings:tracking-tight">
        <ContentRenderer :value="post" />
      </div>
    </article>
  </UContainer>
</template>
