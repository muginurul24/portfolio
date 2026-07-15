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

const waHref = computed(() => link(t('whatsapp.consultDefault')))
</script>

<template>
  <div>
    <section class="bg-mesh-hero section-y pt-10 md:pt-14">
      <UContainer>
        <div class="max-w-3xl mx-auto text-center space-y-6">
          <UBadge color="primary" variant="subtle" size="lg">
            {{ priceLabel }}
          </UBadge>

          <h1 class="text-display text-4xl sm:text-5xl md:text-6xl text-highlighted">
            {{ t('hero.title') }}
          </h1>

          <p class="text-lg md:text-xl text-muted leading-relaxed">
            {{ t('hero.subtitle') }}
          </p>

          <HeroDomainSearch />

          <div class="flex flex-wrap justify-center gap-3">
            <UButton
              :to="localePath('/order/choose-domain')"
              color="primary"
              size="xl"
              trailing-icon="i-lucide-arrow-right"
            >
              {{ t('hero.ctaPrimary') }}
            </UButton>
            <UButton
              :to="waHref"
              target="_blank"
              color="neutral"
              variant="outline"
              size="xl"
              icon="i-simple-icons-whatsapp"
            >
              {{ t('hero.ctaSecondary') }}
            </UButton>
          </div>

          <div class="flex flex-wrap justify-center gap-6 text-sm text-muted pt-2">
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
        </div>
      </UContainer>
    </section>

    <HeroCarousel />
    <TrustLogoStrip />
    <HomeTemplateShowcase />
    <HomeServicesBento />
    <HomeSteps />
    <HomeDomainPackages />
    <HomeTestimonials />
    <HomeCommunity />
    <HomePortfolioTeaser />
    <HomeBlogTeaser />
    <HomeAcademyTeaser />
    <HomeFinalCta />
  </div>
</template>
