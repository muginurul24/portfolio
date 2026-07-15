<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const appConfig = useAppConfig()
const { link } = useWhatsApp()

useSeoMeta({
  title: () => t('brand.tagline'),
  description: () => t('hero.subtitle')
})

const priceLabel = computed(() =>
  t('hero.priceFrom', {
    price: new Intl.NumberFormat('id-ID').format(appConfig.mugiew?.startingPriceYearlyIdr || 1_000_000)
  })
)

const discountLabel = computed(() =>
  formatIdr(appConfig.mugiew?.promoDiscountIdr || 500_000)
)

const features = computed(() => [
  {
    icon: 'i-lucide-globe',
    title: t('services.export'),
    description: 'Profil ekspor profesional: HS code, MOQ, sertifikasi, multi-bahasa, form inquiry buyer global.'
  },
  {
    icon: 'i-lucide-store',
    title: t('services.umkm'),
    description: 'Website UMKM SEO lokal, integrasi sosmed, dan admin mudah diganti kapan saja.'
  },
  {
    icon: 'i-lucide-shopping-cart',
    title: t('services.ecommerce'),
    description: 'Toko online lengkap: katalog, keranjang, pembayaran VA/QRIS/e-wallet, kelola produk.'
  },
  {
    icon: 'i-lucide-sparkles',
    title: t('services.custom'),
    description: 'Custom build: ERP, AI, mobile app, integrasi pihak ketiga sesuai kebutuhan.'
  },
  {
    icon: 'i-lucide-graduation-cap',
    title: t('nav.academy'),
    description: 'Kurikulum ekspor berjenjang: legalitas, HS code, logistik, cari buyer, sertifikat.'
  },
  {
    icon: 'i-lucide-users',
    title: t('nav.community'),
    description: 'Komunitas 12.000+ UMKM, kelas gratis, promo eksklusif, akses dana talangan ekspor.'
  }
])

const steps = [
  { title: 'Pilih template', description: 'Ratusan design siap pakai. Ganti gratis kapan pun.' },
  { title: 'Cari domain', description: '.com / .id / .co.id + hosting + SSL dalam satu paket.' },
  { title: 'Bayar & aktif', description: 'QRIS via QrisVIP. Live max 2×24 jam.' }
]

const waHref = computed(() => link(t('whatsapp.consultDefault')))
</script>

<template>
  <div>
    <UPageHero
      :title="t('hero.title')"
      :description="t('hero.subtitle')"
      :links="[
        {
          label: t('hero.ctaPrimary'),
          to: localePath('/order/choose-domain'),
          trailingIcon: 'i-lucide-arrow-right',
          size: 'xl',
          color: 'primary'
        },
        {
          label: t('hero.ctaSecondary'),
          to: waHref,
          target: '_blank',
          icon: 'i-simple-icons-whatsapp',
          size: 'xl',
          color: 'neutral',
          variant: 'outline'
        }
      ]"
    >
      <template #headline>
        <UBadge color="primary" variant="subtle" size="lg" class="mb-2">
          {{ priceLabel }}
        </UBadge>
      </template>

      <template #default>
        <div class="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-users" class="size-4 text-primary" />
            <span>{{ t('stats.members') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-star" class="size-4 text-primary" />
            <span>{{ t('stats.rating') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-trending-up" class="size-4 text-primary" />
            <span>{{ t('stats.salesUp') }}</span>
          </div>
        </div>
      </template>
    </UPageHero>

    <UPageSection
      id="layanan"
      :title="t('home.servicesTitle')"
      :description="t('home.servicesDesc')"
      :features="features"
    />

    <UPageSection
      id="cara-kerja"
      :title="t('home.stepsTitle')"
      :description="t('home.stepsDesc')"
    >
      <div class="grid gap-6 md:grid-cols-3">
        <UCard
          v-for="(step, i) in steps"
          :key="step.title"
          :ui="{ root: 'shadow-soft-md' }"
        >
          <div class="flex items-start gap-4">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold tabular-nums">
              {{ String(i + 1).padStart(2, '0') }}
            </div>
            <div>
              <h3 class="font-semibold text-highlighted">
                {{ step.title }}
              </h3>
              <p class="mt-1 text-sm text-muted">
                {{ step.description }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </UPageSection>

    <UPageSection>
      <UPageCTA
        :title="t('home.ctaTitle')"
        :description="t('home.ctaDesc', {
          code: appConfig.mugiew?.promoCode || 'WEBSITEJUARA',
          discount: discountLabel
        })"
        variant="subtle"
        :links="[
          {
            label: t('cta.buildNow'),
            to: localePath('/order/choose-domain'),
            trailingIcon: 'i-lucide-arrow-right',
            color: 'primary'
          },
          {
            label: t('cta.viewTemplates'),
            to: localePath('/templates'),
            color: 'neutral',
            variant: 'outline'
          }
        ]"
      />
    </UPageSection>
  </div>
</template>
