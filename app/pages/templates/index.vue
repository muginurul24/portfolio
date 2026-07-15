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

// Placeholder catalog — replace with useFetch('/api/templates') when API ready
const templates = ref([
  { id: '1', slug: 'coconut-briquettes', name: 'Coconut Briquettes Export', category: 'export', thumbnailUrl: null },
  { id: '2', slug: 'spice-exporter', name: 'Spice Exporter Pro', category: 'export', thumbnailUrl: null },
  { id: '3', slug: 'umkm-local', name: 'UMKM Lokal SEO', category: 'umkm', thumbnailUrl: null },
  { id: '4', slug: 'craft-gallery', name: 'Craft Gallery', category: 'craft', thumbnailUrl: null },
  { id: '5', slug: 'company-profile', name: 'Company Profile', category: 'company', thumbnailUrl: null },
  { id: '6', slug: 'seafood-export', name: 'Seafood Export', category: 'export', thumbnailUrl: null },
  { id: '7', slug: 'furniture-rattan', name: 'Furniture & Rotan', category: 'export', thumbnailUrl: null },
  { id: '8', slug: 'toko-online-basic', name: 'Toko Online Basic', category: 'ecommerce', thumbnailUrl: null }
])

const filtered = computed(() => {
  return templates.value.filter((tpl) => {
    const catOk = activeCategory.value === 'all' || tpl.category === activeCategory.value
    const q = search.value.trim().toLowerCase()
    const searchOk = !q || tpl.name.toLowerCase().includes(q)
    return catOk && searchOk
  })
})
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

    <div v-if="filtered.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <UCard
        v-for="tpl in filtered"
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
