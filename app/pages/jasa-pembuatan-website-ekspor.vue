<script setup lang="ts">
import type { ServicePackage } from '~/types'

const { t } = useI18n()
const localePath = useLocalePath()
const appConfig = useAppConfig()
const { link } = useWhatsApp()

useSeoMeta({
  title: () => t('services.export'),
  description: 'Website ekspor profesional: katalog HS code, multi-bahasa, form inquiry buyer, SEO Google.'
})

const { data: packagesRes, status } = await useFetch<{ data: ServicePackage[] }>(
  '/api/packages',
  {
    query: { serviceType: 'export' },
    key: 'packages-export'
  }
)

const packages = computed(() => packagesRes.value?.data ?? [])

const features = [
  {
    icon: 'i-lucide-globe',
    title: 'Domain + email bisnis',
    description: 'Domain resmi dan email profesional — kredibel di mata buyer global.'
  },
  {
    icon: 'i-lucide-search',
    title: 'SEO siap pakai',
    description: 'Meta, sitemap, schema produk, Search Console ready.'
  },
  {
    icon: 'i-lucide-languages',
    title: 'Multi-bahasa',
    description: 'ID + EN default; opsi Mandarin/Arab/Jepang sesuai target pasar.'
  },
  {
    icon: 'i-lucide-file-badge',
    title: 'Sertifikasi & legal',
    description: 'NIB, HACCP, Halal, Organic, Fair Trade — showcase di satu halaman.'
  },
  {
    icon: 'i-lucide-package',
    title: 'Katalog ekspor',
    description: 'HS code, MOQ, packaging, sample request — data yang buyer cari.'
  },
  {
    icon: 'i-lucide-inbox',
    title: 'Form inquiry',
    description: 'Email + WhatsApp + riwayat di dashboard. Tanpa komisi marketplace.'
  }
]

const steps = [
  { title: 'Pilih template ekspor', description: 'Ratusan design industri: agro, craft, seafood, furniture, dan lainnya.' },
  { title: 'Domain & paket', description: '.com / .id / .co.id + hosting + SSL + email bisnis.' },
  { title: 'Bayar & aktif', description: 'QRIS via QrisVIP. Live max 2×24 jam kerja.' }
]

const waHref = computed(() => link(t('whatsapp.consultExport')))

const discountLabel = computed(() =>
  formatIdr(appConfig.mugiew?.promoDiscountIdr || 500_000)
)

const priceFrom = computed(() => {
  const min = packages.value.reduce<number | null>((acc, p) => {
    if (acc == null || p.priceYearlyIdr < acc) return p.priceYearlyIdr
    return acc
  }, null)
  return min
})
</script>

<template>
  <div>
    <UPageHero
      :title="t('services.export')"
      description="Buyer global riset supplier lewat Google. Tampilkan HS code, MOQ, sertifikasi, dan form inquiry yang rapi — lead masuk tanpa komisi marketplace."
      :links="[
        {
          label: t('cta.buildNow'),
          to: localePath('/order/choose-domain'),
          color: 'primary',
          size: 'xl',
          trailingIcon: 'i-lucide-arrow-right'
        },
        {
          label: t('cta.viewTemplates'),
          to: localePath('/templates'),
          color: 'neutral',
          variant: 'outline',
          size: 'xl'
        }
      ]"
    >
      <template v-if="priceFrom != null" #headline>
        <UBadge color="primary" variant="subtle" size="lg" class="mb-2">
          {{ t('hero.priceFrom', { price: new Intl.NumberFormat('id-ID').format(priceFrom) }) }}
        </UBadge>
      </template>
    </UPageHero>

    <MarketingServiceProof />

    <UPageSection
      :title="t('serviceLanding.featuresTitle')"
      description="Semua yang dibutuhkan eksportir untuk dipercaya buyer — tanpa fee marketplace."
      :features="features"
    />

    <MarketingServiceSteps :steps="steps" />

    <MarketingServicePricing
      :packages="packages"
      billing-mode="yearly"
      :loading="status === 'pending'"
    />

    <MarketingServiceCta
      :title="t('serviceLanding.exportCtaTitle')"
      :description="t('serviceLanding.exportCtaDesc', {
        code: appConfig.mugiew?.promoCode || 'WEBSITEJUARA',
        discount: discountLabel
      })"
      :secondary-to="waHref"
      secondary-external
    />
  </div>
</template>
