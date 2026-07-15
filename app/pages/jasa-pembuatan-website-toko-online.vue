<script setup lang="ts">
import type { ServicePackage } from '~/types'

const { t } = useI18n()
const localePath = useLocalePath()
const appConfig = useAppConfig()

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

const waHref = computed(() => {
  const n = appConfig.mugiew?.supportWa || '6281280080275'
  return `https://wa.me/${n}?text=${encodeURIComponent('Halo, saya ingin konsultasi toko online')}`
})
</script>

<template>
  <div>
    <UPageHero
      :title="t('services.ecommerce')"
      description="Full commerce: keranjang, pembayaran, ongkir, notifikasi WA/email. Year-1 domain/hosting/email bisnis termasuk."
      :links="[
        {
          label: t('cta.consult'),
          to: waHref,
          target: '_blank',
          color: 'primary',
          size: 'xl',
          icon: 'i-simple-icons-whatsapp'
        },
        {
          label: t('cta.buildNow'),
          to: localePath('/order/choose-domain'),
          color: 'neutral',
          variant: 'outline',
          size: 'xl',
          trailingIcon: 'i-lucide-arrow-right'
        }
      ]"
    >
      <template #headline>
        <UBadge color="primary" variant="subtle" size="lg" class="mb-2">
          Basic ~15jt · Standard ~25jt
        </UBadge>
      </template>
    </UPageHero>

    <MarketingServiceProof />

    <UPageSection
      :title="t('serviceLanding.featuresTitle')"
      description="Toko online project-based. Fitur lengkap, harga fixed di muka."
      :features="features"
    />

    <MarketingServiceSteps
      title="Alur project toko online"
      description="Dari brief sampai go-live — dikelola tim, bukan DIY semalam."
      :steps="steps"
    />

    <MarketingServicePricing
      :packages="packages"
      billing-mode="project"
      highlight-id="pkg_ecom_standard"
      :loading="status === 'pending'"
      :cta-label="t('cta.consult')"
      :cta-to="waHref"
    />

    <MarketingServiceCta
      title="Siap jualan online dengan checkout lengkap?"
      description="Basic ~15jt · Standard ~25jt · Domain/hosting year-1 termasuk. Chat dulu biar pas kebutuhan."
      :primary-label="t('cta.consult')"
      :primary-to="waHref"
      :secondary-label="t('cta.buildNow')"
      :secondary-to="localePath('/order/choose-domain')"
    />
  </div>
</template>
