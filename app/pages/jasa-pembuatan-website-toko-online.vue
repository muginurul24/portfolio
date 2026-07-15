<script setup lang="ts">
import type { ServicePackage } from '~/types'

const { t } = useI18n()
const localePath = useLocalePath()
const { link } = useWhatsApp()

useSeoMeta({
  title: () => t('services.ecommerce'),
  description: 'Toko online lengkap: cart, payment gateway, shipping, stok, kupon, admin dashboard.'
})

const { data: packagesRes, status } = await useFetch<{ data: ServicePackage[] }>(
  '/api/packages',
  {
    query: { serviceType: 'ecommerce' },
    key: 'packages-ecommerce'
  }
)

const packages = computed(() => packagesRes.value?.data ?? [])

const features = [
  {
    icon: 'i-lucide-shopping-cart',
    title: 'Cart & checkout',
    description: 'Keranjang, alamat, ongkir, dan ringkasan pesanan yang jelas.'
  },
  {
    icon: 'i-lucide-credit-card',
    title: 'Payment gateway',
    description: 'VA, QRIS, e-wallet, kartu — terintegrasi gateway Indonesia.'
  },
  {
    icon: 'i-lucide-truck',
    title: 'Shipping & resi',
    description: 'Hitung ongkir, multi-kurir, dan update resi ke pembeli.'
  },
  {
    icon: 'i-lucide-boxes',
    title: 'Stok & SKU',
    description: 'Basic ≤300 SKU · Standard ≤1000+ SKU dengan multi-warehouse.'
  },
  {
    icon: 'i-lucide-ticket-percent',
    title: 'Kupon & promo',
    description: 'Diskon, voucher, dan harga tier/grosir untuk B2B ringan.'
  },
  {
    icon: 'i-lucide-layout-dashboard',
    title: 'Admin dashboard',
    description: 'Kelola produk, order, stok, dan laporan dari satu panel.'
  }
]

const steps = [
  { title: 'Konsultasi kebutuhan', description: 'Tentukan SKU, payment, kurir, dan integrasi marketplace jika perlu.' },
  { title: 'Build & integrasi', description: 'Katalog, cart, gateway, shipping, dan admin disiapkan tim MugiewDev.' },
  { title: 'Uji & go-live', description: 'Uji checkout end-to-end. Domain/hosting/email bisnis year-1 termasuk.' }
]

const waHref = computed(() => link(t('whatsapp.consultEcommerce')))

/** Prefer package API prices for teaser; fall back to known seed tiers. */
const ecomTeaser = computed(() => {
  const sorted = [...packages.value].sort((a, b) => a.priceYearlyIdr - b.priceYearlyIdr)
  const basic = sorted[0]
  const standard = sorted.find(p => p.id === 'pkg_ecom_standard' || p.slug?.includes('standard')) || sorted[1]
  if (basic && standard && basic.id !== standard.id) {
    return t('serviceLanding.ecomPriceTeaser', {
      basic: `Basic ${formatIdrCompact(basic.priceYearlyIdr)}`,
      standard: `Standard ${formatIdrCompact(standard.priceYearlyIdr)}`
    })
  }
  if (basic) {
    return `Basic ${formatIdrCompact(basic.priceYearlyIdr)}`
  }
  return t('serviceLanding.ecomPriceTeaser', {
    basic: 'Basic ~15jt',
    standard: 'Standard ~25jt'
  })
})
</script>

<template>
  <div>
    <section class="bg-mesh-hero border-b border-default">
      <UContainer class="section-y !pb-12 md:!pb-16">
        <div class="max-w-3xl text-left space-y-6">
          <UBadge color="primary" variant="subtle" size="lg">
            {{ ecomTeaser }}
          </UBadge>

          <h1 class="text-display text-4xl sm:text-5xl md:text-6xl text-highlighted">
            {{ t('services.ecommerce') }}
          </h1>

          <p class="text-lg md:text-xl text-muted leading-relaxed">
            Full commerce: keranjang, pembayaran, ongkir, notifikasi WA/email. Year-1 domain/hosting/email bisnis termasuk.
          </p>

          <div class="flex flex-wrap gap-3">
            <UButton
              :to="waHref"
              target="_blank"
              color="primary"
              size="xl"
              icon="i-simple-icons-whatsapp"
            >
              {{ t('cta.consult') }}
            </UButton>
            <UButton
              :to="localePath('/order/choose-domain')"
              color="neutral"
              variant="outline"
              size="xl"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ t('cta.buildNow') }}
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <ServiceProof />

    <UPageSection
      :title="t('serviceLanding.featuresTitle')"
      description="Toko online project-based. Fitur lengkap, harga fixed di muka."
      :features="features"
    />

    <ServiceSteps
      :title="t('serviceLanding.ecomStepsTitle')"
      :description="t('serviceLanding.ecomStepsDesc')"
      :steps="steps"
    />

    <ServicePricing
      :packages="packages"
      billing-mode="project"
      highlight-id="pkg_ecom_standard"
      :loading="status === 'pending'"
      :cta-label="t('cta.consult')"
      :cta-to="waHref"
    />

    <ServiceCta
      :title="t('serviceLanding.ecomCtaTitle')"
      :description="t('serviceLanding.ecomCtaDesc', { teaser: ecomTeaser })"
      :primary-label="t('cta.consult')"
      :primary-to="waHref"
      :secondary-label="t('cta.buildNow')"
      :secondary-to="localePath('/order/choose-domain')"
    />
  </div>
</template>
