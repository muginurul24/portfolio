<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('nav.templates'),
  description: () => t('templates.seoDesc')
})

const categories = computed(() => [
  { key: 'all', label: t('templates.catAll') },
  { key: 'export', label: t('templates.catExport') },
  { key: 'agriculture', label: t('templates.catAgriculture') },
  { key: 'craft', label: t('templates.catCraft') },
  { key: 'company', label: t('templates.catCompany') },
  { key: 'automotive', label: t('templates.catAutomotive') },
  { key: 'restaurant', label: t('templates.catRestaurant') },
  { key: 'service', label: t('templates.catService') },
  { key: 'ecommerce', label: t('templates.catEcommerce') }
])

const activeCategory = ref('all')
const search = ref('')

const { data, status } = await useFetch('/api/templates', {
  key: 'templates-catalog',
  query: computed(() => ({
    category: activeCategory.value === 'all' ? undefined : activeCategory.value,
    q: search.value.trim() || undefined
  })),
  watch: [activeCategory, search]
})

const templates = computed(() => data.value?.data ?? [])

function resetFilters() {
  activeCategory.value = 'all'
  search.value = ''
}
</script>

<template>
  <div>
    <div class="bg-mesh-hero border-b border-default">
      <UContainer class="section-y !pb-10 md:!pb-12">
        <div class="max-w-2xl">
          <p class="text-sm font-medium text-primary mb-3">
            {{ t('templates.eyebrow') }}
          </p>
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-semibold text-highlighted tracking-tight text-display">
            {{ t('nav.templates') }}
          </h1>
          <p class="mt-4 text-muted text-lg leading-relaxed">
            {{ t('templates.pageDesc') }}
          </p>
        </div>
      </UContainer>
    </div>

    <UContainer class="py-8 md:py-12">
      <div class="glass-panel sticky top-16 z-10 -mx-4 px-4 py-4 mb-10 rounded-none sm:mx-0 sm:rounded-xl sm:px-5 md:top-20">
        <div class="flex flex-col lg:flex-row gap-4 lg:items-center">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            :placeholder="t('common.search')"
            class="w-full lg:max-w-sm"
            size="lg"
          />
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="cat in categories"
              :key="cat.key"
              :color="activeCategory === cat.key ? 'primary' : 'neutral'"
              :variant="activeCategory === cat.key ? 'solid' : 'outline'"
              size="sm"
              class="cursor-pointer"
              @click="activeCategory = cat.key"
            >
              {{ cat.label }}
            </UButton>
          </div>
        </div>
      </div>

      <div v-if="status === 'pending'" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <USkeleton v-for="i in 8" :key="i" class="h-72 rounded-xl" />
      </div>

      <div v-else-if="templates.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <UCard
          v-for="tpl in templates"
          :key="tpl.id"
          class="card-lift overflow-hidden h-full"
          :ui="{ body: 'p-0', root: 'ring-default shadow-soft-md' }"
        >
          <div class="aspect-[4/3] bg-muted flex items-center justify-center relative">
            <UIcon
              name="i-lucide-layout-template"
              class="size-12 text-muted"
            />
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
              class="absolute top-3 left-3"
            >
              {{ tpl.category }}
            </UBadge>
          </div>
          <div class="p-4 md:p-5">
            <h3 class="font-semibold text-highlighted tracking-tight line-clamp-2">
              {{ tpl.name }}
            </h3>
            <div class="mt-4 flex flex-wrap gap-2">
              <UButton
                :to="localePath({ path: '/order/choose-domain', query: { template: tpl.slug } })"
                size="sm"
                color="primary"
                class="flex-1 min-w-[7rem]"
              >
                {{ t('cta.buildNow') }}
              </UButton>
              <UButton
                :to="localePath(`/templates/${tpl.slug}`)"
                size="sm"
                variant="outline"
                color="neutral"
              >
                {{ t('common.detail') }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <div
        v-else
        class="py-16 md:py-24 flex flex-col items-center text-center max-w-md mx-auto"
      >
        <div class="size-16 rounded-2xl bg-muted flex items-center justify-center mb-5 shadow-soft-sm">
          <UIcon name="i-lucide-search-x" class="size-8 text-muted" />
        </div>
        <h2 class="text-lg font-semibold text-highlighted">
          {{ t('common.empty') }}
        </h2>
        <p class="mt-2 text-muted text-sm leading-relaxed">
          {{ t('templates.emptyHint') }}
        </p>
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <UButton color="primary" size="md" @click="resetFilters">
            {{ t('common.resetFilter') }}
          </UButton>
          <UButton
            :to="localePath('/order/choose-domain')"
            color="neutral"
            variant="outline"
            size="md"
          >
            {{ t('cta.buildNow') }}
          </UButton>
        </div>
      </div>
    </UContainer>
  </div>
</template>
