<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()

const contentPath = computed(() => {
  const slug = route.params.slug
  const parts = Array.isArray(slug) ? slug : [slug]
  return `/tutorial/${parts.filter(Boolean).join('/')}`
})

const { data: page } = await useAsyncData(
  `tutorial-${contentPath.value}`,
  () => queryCollection('tutorial').path(contentPath.value).first()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Tutorial tidak ditemukan' })
}

useSeoMeta({
  title: () => page.value?.title || t('nav.tutorial'),
  description: () => page.value?.description || ''
})
</script>

<template>
  <UContainer class="py-10 md:py-16 max-w-3xl">
    <UButton
      :to="localePath('/tutorial')"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
      class="mb-6"
    >
      {{ t('nav.tutorial') }}
    </UButton>

    <article v-if="page">
      <h1 class="text-3xl md:text-4xl font-semibold text-highlighted tracking-tight">
        {{ page.title }}
      </h1>
      <p v-if="page.description" class="mt-3 text-lg text-muted">
        {{ page.description }}
      </p>
      <div class="mt-8 prose prose-slate dark:prose-invert max-w-none">
        <ContentRenderer :value="page" />
      </div>
    </article>
  </UContainer>
</template>
