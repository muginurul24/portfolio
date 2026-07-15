<script setup lang="ts">
import type { ServicePackage } from '~/types'

const { t } = useI18n()
const localePath = useLocalePath()
const appConfig = useAppConfig()
const { link } = useWhatsApp()

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
    description: 'Terlihat profesional di Google & sosmed - profil, katalog, kontak jelas.'
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
    description: 'Halaman NIB, NPWP, Halal, PIRT, BPOM - bangun kepercayaan pembeli.'
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
  { title: 'Bayar & live', description: 'QRIS via QrisVIP. Situs aktif max 2×24 jam kerja.' }
]

const waHref = computed(() => link(t('whatsapp.consultUmkm')))

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
    <section class="bg-mesh-hero border-b border-default">
      <UContainer class="section-y !pb-12 md:!pb-16">
        <div class="max-w-3xl text-left space-y-6">
          <UBadge
            v-if="priceFrom != null"
            color="primary"
            variant="subtle"
            size="lg"
          >
            {{ t('hero.priceFrom', { price: new Intl.NumberFormat('id-ID').format(priceFrom) }) }}
          </UBadge>

          <h1 class="text-display text-4xl sm:text-5xl md:text-6xl text-highlighted">
            {{ t('services.umkm') }}
          </h1>

          <p class="text-lg md:text-xl text-muted leading-relaxed">
            Company profile + katalog produk + formulir pesanan WhatsApp. SEO lokal dan Google Business Profile — tanpa ribet checkout penuh.
          </p>

          <div class="flex flex-wrap gap-3">
            <UButton
              :to="localePath('/order/choose-domain')"
              color="primary"
              size="xl"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ t('cta.buildNow') }}
            </UButton>
            <UButton
              :to="waHref"
              target="_blank"
              color="neutral"
              variant="outline"
              size="xl"
              icon="i-simple-icons-whatsapp"
            >
              {{ t('cta.consult') }}
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <ServiceProof />

    <UPageSection
      :title="t('serviceLanding.featuresTitle')"
      description="Fokus jualan lokal & reputasi online. Fitur tepat guna, bukan fitur berlebih."
      :features="features"
    />

    <ServiceSteps :steps="steps" />

    <ServicePricing
      :packages="packages"
      billing-mode="yearly"
      :loading="status === 'pending'"
    />

    <ServiceCta
      :title="t('serviceLanding.umkmCtaTitle')"
      :description="t('serviceLanding.umkmCtaDesc', {
        code: appConfig.mugiew?.promoCode || 'WEBSITEJUARA',
        discount: discountLabel
      })"
    />
  </div>
</template>
