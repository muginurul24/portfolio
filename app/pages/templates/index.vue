<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('nav.templates'),
  description: 'Ratusan template website siap pakai untuk ekspor, UMKM, toko online, dan perusahaan.'
})

const categories = [
  { key: 'all', label: 'Semua' },
  { key: 'export', label: 'Produk Ekspor' },
  { key: 'agriculture', label: 'Agrikultur' },
  { key: 'craft', label: 'Craft' },
  { key: 'company', label: 'Company' },
  { key: 'automotive', label: 'Otomotif' },
  { key: 'restaurant', label: 'Restaurant' },
  { key: 'service', label: 'Jasa' },
  { key: 'ecommerce', label: 'Toko Online' }
]

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
</script>

<template>
  <UContainer class="py-10 md:py-16">
    <div class="max-w-2xl mb-10">
      <h1 class="text-3xl md:text-4xl font-semibold text-highlighted tracking-tight">
        {{ t('nav.templates') }}
      </h1>
      <p class="mt-3 text-muted">
        Ratusan design siap pakai. Ganti gratis kapan saja setelah aktif.
      </p>
    </div>

    <div class="flex flex-col md:flex-row gap-4 mb-8">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        :placeholder="t('common.search')"
        class="md:max-w-sm"
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

    <div v-if="status === 'pending'" class="py-20 text-center text-muted">
      {{ t('common.loading') }}
    </div>

    <div v-else-if="templates.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <UCard
        v-for="tpl in templates"
        :key="tpl.id"
        class="group cursor-pointer overflow-hidden transition-shadow duration-200 hover:shadow-soft-lg"
        :ui="{ body: 'p-0' }"
      >
        <div class="aspect-[4/3] bg-muted flex items-center justify-center">
          <UIcon name="i-lucide-layout-template" class="size-12 text-muted" />
        </div>
        <div class="p-4">
          <UBadge color="neutral" variant="subtle" size="sm" class="mb-2">
            {{ tpl.category }}
          </UBadge>
          <h3 class="font-semibold text-highlighted">
            {{ tpl.name }}
          </h3>
          <div class="mt-4 flex gap-2">
            <UButton
              :to="localePath(`/templates/${tpl.slug}`)"
              size="sm"
              variant="outline"
              color="neutral"
            >
              Lihat
            </UButton>
            <UButton
              :to="localePath(`/order/choose-domain?template=${tpl.slug}`)"
              size="sm"
              color="primary"
            >
              Beli
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <div v-else class="py-20 text-center text-muted">
      {{ t('common.empty') }}
    </div>
  </UContainer>
</template>
