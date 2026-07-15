<script setup lang="ts">
import type { ServicePackage } from '~/types'

const { t } = useI18n()
const localePath = useLocalePath()
const appConfig = useAppConfig()

useSeoMeta({
  title: () => t('services.umkm'),
  description: 'Website UMKM: profil, katalog, form WA, SEO lokal, Google Business Profile.'
})

const { data: packagesRes, status } = await useFetch<{ data: ServicePackage[] }>(
  '/api/packages',
  {
    query: { serviceType: 'umkm' },
    key: 'packages-umkm'
  }
)

const packages = computed(() => packagesRes.value?.data ?? [])

const features = [
  {
    icon: 'i-lucide-store',
    title: 'UMKM lokal',
    description: 'Terlihat profesional di Google & sosmed — profil, katalog, kontak jelas.'
  },
  {
    icon: 'i-lucide-map-pin',
    title: 'SEO lokal',
    description: 'Optimasi wilayah + Google Business Profile supaya pelanggan dekat menemukan Anda.'
  },
  {
    icon: 'i-lucide-message-circle',
    title: 'Order via WA',
    description: 'Form terstruktur ke WhatsApp bisnis. Lead masuk rapi, bukan chat acak.'
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'Legalitas',
    description: 'Halaman NIB, NPWP, Halal, PIRT, BPOM — bangun kepercayaan pembeli.'
  },
  {
    icon: 'i-lucide-image',
    title: 'Galeri produk',
    description: 'Tampilkan foto produk rapi, deskripsi singkat, dan CTA order.'
  },
  {
    icon: 'i-lucide-layout-dashboard',
    title: 'Admin mudah',
    description: 'Ganti teks & foto tanpa coding. Template bisa diganti kapan saja.'
  }
]

const steps = [
  { title: 'Pilih template UMKM', description: 'Design siap pakai untuk toko, jasa, F&B, dan kerajinan.' },
  { title: 'Domain + paket', description: 'Domain .com / .id + hosting + SSL dalam satu tagihan.' },
  { title: 'Bayar & live', description: 'Xendit VA/QRIS/e-wallet. Situs aktif max 2×24 jam kerja.' }
]

const waHref = computed(() => {
  const n = appConfig.mugiew?.supportWa || '6281280080275'
  return `https://wa.me/${n}?text=${encodeURIComponent('Halo, saya ingin konsultasi website UMKM')}`
})

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
      :title="t('services.umkm')"
      description="Company profile + katalog produk + formulir pesanan WhatsApp. SEO lokal dan Google Business Profile — tanpa ribet checkout penuh."
      :links="[
        {
          label: t('cta.buildNow'),
          to: localePath('/order/choose-domain'),
          color: 'primary',
          size: 'xl',
          trailingIcon: 'i-lucide-arrow-right'
        },
        {
          label: t('cta.consult'),
          to: waHref,
          target: '_blank',
          color: 'neutral',
          variant: 'outline',
          size: 'xl',
          icon: 'i-simple-icons-whatsapp'
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
      description="Fokus jualan lokal & reputasi online. Fitur tepat guna, bukan fitur berlebih."
      :features="features"
    />

    <MarketingServiceSteps :steps="steps" />

    <MarketingServicePricing
      :packages="packages"
      billing-mode="yearly"
      :loading="status === 'pending'"
    />

    <MarketingServiceCta
      title="Bikin website UMKM yang siap dapat order."
      description="SEO lokal · Form WA · Harga transparan. Pakai promo WEBSITEJUARA potong Rp500.000."
    />
  </div>
</template>
