<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()
const { t, locale } = useI18n()
const appConfig = useAppConfig()
const slug = computed(() => String(route.params.slug))

const { data, error } = await useFetch(() => `/api/templates/${slug.value}`, {
  key: () => `template-${slug.value}`
})

const tpl = computed(() => data.value?.data)

const categoryTone: Record<string, string> = {
  export: 'from-sky-600/20 to-slate-800/10',
  agriculture: 'from-emerald-600/20 to-lime-700/10',
  craft: 'from-amber-500/20 to-orange-800/10',
  company: 'from-slate-500/20 to-sky-900/10',
  automotive: 'from-red-600/15 to-slate-800/10',
  restaurant: 'from-orange-500/20 to-rose-800/10',
  service: 'from-violet-500/20 to-sky-800/10',
  ecommerce: 'from-cyan-500/20 to-indigo-800/10'
}

const categoryIcon: Record<string, string> = {
  export: 'i-lucide-ship',
  agriculture: 'i-lucide-sprout',
  craft: 'i-lucide-palette',
  company: 'i-lucide-building-2',
  automotive: 'i-lucide-car',
  restaurant: 'i-lucide-utensils',
  service: 'i-lucide-briefcase',
  ecommerce: 'i-lucide-shopping-bag'
}

const categoryFeatures: Record<string, string[]> = {
  export: [
    'Profil perusahaan multi-bahasa',
    'Katalog produk + HS code',
    'Form inquiry buyer global',
    'Sertifikasi & dokumen unduh'
  ],
  agriculture: [
    'Showcase komoditas & panen',
    'Sertifikasi organik / GAP',
    'Kontak buyer & distributor',
    'Galeri kebun & fasilitas'
  ],
  craft: [
    'Galeri produk kerajinan',
    'Cerita pengrajin & material',
    'Inquiry B2B / custom order',
    'Optimasi SEO katalog'
  ],
  company: [
    'Company profile profesional',
    'Tim, visi, dan klien',
    'Unduh brochure PDF',
    'Form kontak & lokasi'
  ],
  automotive: [
    'Katalog unit & sparepart',
    'Spesifikasi teknis jelas',
    'CTA test drive / inquiry',
    'Galeri showroom'
  ],
  restaurant: [
    'Menu digital rapi',
    'Reservasi via WhatsApp',
    'Galeri suasana outlet',
    'Lokasi & jam buka'
  ],
  service: [
    'Paket layanan transparan',
    'Portofolio pekerjaan',
    'CTA konsultasi cepat',
    'Testimoni klien'
  ],
  ecommerce: [
    'Katalog & keranjang',
    'Pembayaran VA / QRIS',
    'Kelola stok produk',
    'Notifikasi order'
  ]
}

const defaultFeatures = [
  'Design responsif mobile-first',
  'Ganti template gratis kapan saja',
  'Hosting + SSL dalam paket',
  'Admin mudah dikelola'
]

const features = computed(() => {
  const cat = tpl.value?.category?.toLowerCase?.() || ''
  return categoryFeatures[cat] || defaultFeatures
})

const previewTone = computed(() => {
  const cat = tpl.value?.category?.toLowerCase?.() || ''
  return categoryTone[cat] || 'from-sky-600/15 to-slate-700/10'
})

const previewIcon = computed(() => {
  const cat = tpl.value?.category?.toLowerCase?.() || ''
  return categoryIcon[cat] || 'i-lucide-layout-template'
})

const fromPriceLabel = computed(() => {
  const amount = appConfig.mugiew?.startingPriceYearlyIdr
  if (!amount) return null
  const price = formatIdr(amount, locale.value === 'en' ? 'en-ID' : 'id-ID')
  return t('templates.fromPrice', { price })
})

useSeoMeta({
  title: () => tpl.value?.name || t('nav.templates'),
  description: () => tpl.value?.description || undefined
})
</script>

<template>
  <UContainer class="py-10 md:py-16">
    <UAlert v-if="error" color="error" :title="t('templates.notFound')" />
    <template v-else-if="tpl">
      <div class="mb-6">
        <UButton
          :to="localePath('/templates')"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-arrow-left"
        >
          {{ t('templates.backToList') }}
        </UButton>
      </div>

      <div class="grid gap-8 lg:gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
        <div
          class="aspect-[4/3] rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-soft-xl ring-1 ring-default overflow-hidden"
          :class="previewTone"
        >
          <div class="size-24 md:size-28 rounded-3xl bg-default/70 backdrop-blur-sm ring-1 ring-default/60 shadow-soft-md flex items-center justify-center">
            <UIcon :name="previewIcon" class="size-12 md:size-14 text-primary" />
          </div>
        </div>

        <aside class="lg:sticky lg:top-24">
          <div class="glass-panel rounded-2xl p-6 md:p-8 shadow-soft-md">
            <UBadge color="primary" variant="subtle" class="mb-3">
              {{ tpl.category }}
            </UBadge>
            <h1 class="text-2xl md:text-3xl font-semibold tracking-tight text-highlighted text-display">
              {{ tpl.name }}
            </h1>
            <p v-if="fromPriceLabel" class="mt-2 text-sm text-muted tabular-nums">
              {{ fromPriceLabel }}
            </p>
            <p v-if="tpl.description" class="mt-3 text-muted leading-relaxed">
              {{ tpl.description }}
            </p>

            <ul class="mt-6 space-y-3">
              <li
                v-for="item in features"
                :key="item"
                class="flex items-start gap-3 text-sm text-highlighted"
              >
                <UIcon
                  name="i-lucide-check-circle-2"
                  class="size-5 text-primary shrink-0 mt-0.5"
                />
                <span>{{ item }}</span>
              </li>
            </ul>

            <div class="mt-8 flex flex-col gap-3">
              <UButton
                color="primary"
                size="lg"
                block
                :to="localePath({ path: '/order/choose-domain', query: { template: tpl.slug } })"
                trailing-icon="i-lucide-arrow-right"
              >
                {{ t('cta.buildNow') }}
              </UButton>
              <UButton
                v-if="tpl.demoUrl"
                color="neutral"
                variant="outline"
                size="lg"
                block
                :to="tpl.demoUrl"
                target="_blank"
                external
                icon="i-lucide-external-link"
              >
                {{ t('templates.preview') }}
              </UButton>
            </div>
          </div>
        </aside>
      </div>
    </template>
  </UContainer>
</template>
