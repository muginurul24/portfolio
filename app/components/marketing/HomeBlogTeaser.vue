<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data: posts, status } = await useAsyncData('home-blog-teaser', () =>
  queryCollection('blog')
    .order('date', 'DESC')
    .select('title', 'path', 'description', 'date')
    .limit(3)
    .all()
)

function formatDate(value?: string) {
  if (!value) return ''
  try {
    return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'id-ID', {
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
  <section id="blog" class="section-y bg-default">
    <UContainer>
      <SectionHeading
        :eyebrow="t('home.blogEyebrow')"
        :title="t('home.blogTitle')"
        :description="t('home.blogDesc')"
      />

      <div v-if="status === 'pending'" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <USkeleton v-for="i in 3" :key="i" class="h-48 rounded-xl" />
      </div>

      <div v-else-if="!posts?.length" class="py-12 text-center text-muted">
        {{ t('common.empty') }}
      </div>

      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="post in posts"
          :key="post.path"
          class="card-lift h-full"
          :ui="{ root: 'shadow-soft-md', body: 'p-5 flex flex-col h-full' }"
        >
          <p v-if="post.date" class="text-xs text-muted mb-2 tabular-nums">
            {{ formatDate(post.date) }}
          </p>
          <h3 class="text-lg font-semibold text-highlighted tracking-tight">
            <NuxtLink
              :to="localePath(post.path)"
              class="hover:text-primary transition-colors cursor-pointer"
            >
              {{ post.title }}
            </NuxtLink>
          </h3>
          <p v-if="post.description" class="mt-2 text-sm text-muted flex-1 leading-relaxed">
            {{ post.description }}
          </p>
          <div class="mt-4">
            <UButton
              :to="localePath(post.path)"
              color="primary"
              variant="ghost"
              trailing-icon="i-lucide-arrow-right"
              size="sm"
              class="cursor-pointer"
            >
              {{ t('home.readPost') }}
            </UButton>
          </div>
        </UCard>
      </div>

      <div v-if="posts?.length" class="mt-10 text-center">
        <UButton
          :to="localePath('/blog')"
          color="primary"
          variant="outline"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
          class="cursor-pointer"
        >
          {{ t('home.viewAllBlog') }}
        </UButton>
      </div>
    </UContainer>
  </section>
</template>
