<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { link } = useWhatsApp()

const slides = computed(() => [
  {
    key: 'export',
    badge: t('home.carousel.exportBadge'),
    title: t('home.carousel.exportTitle'),
    description: t('home.carousel.exportDesc'),
    icon: 'i-lucide-globe',
    primaryLabel: t('hero.ctaPrimary'),
    primaryTo: localePath('/order/choose-domain'),
    secondaryLabel: t('cta.consult'),
    secondaryTo: link(t('whatsapp.consultExport')),
    accent: 'from-sky-600/20 to-slate-900/10 dark:from-sky-500/25 dark:to-slate-950/40'
  },
  {
    key: 'umkm',
    badge: t('home.carousel.umkmBadge'),
    title: t('home.carousel.umkmTitle'),
    description: t('home.carousel.umkmDesc'),
    icon: 'i-lucide-store',
    primaryLabel: t('cta.buildNow'),
    primaryTo: localePath('/jasa-pembuatan-website-umkm'),
    secondaryLabel: t('cta.consult'),
    secondaryTo: link(t('whatsapp.consultUmkm')),
    accent: 'from-emerald-600/15 to-sky-900/10 dark:from-emerald-500/20 dark:to-slate-950/40'
  },
  {
    key: 'ecommerce',
    badge: t('home.carousel.ecomBadge'),
    title: t('home.carousel.ecomTitle'),
    description: t('home.carousel.ecomDesc'),
    icon: 'i-lucide-shopping-cart',
    primaryLabel: t('services.ecommerce'),
    primaryTo: localePath('/jasa-pembuatan-website-toko-online'),
    secondaryLabel: t('cta.consult'),
    secondaryTo: link(t('whatsapp.consultEcommerce')),
    accent: 'from-indigo-600/15 to-slate-900/10 dark:from-indigo-500/20 dark:to-slate-950/40'
  }
])

const motionQuery = useMediaQuery('(prefers-reduced-motion: reduce)')
const autoplay = computed(() => (motionQuery.value ? false : { delay: 5500 }))
</script>

<template>
  <section class="section-y pt-0" :aria-label="t('home.carousel.label')">
    <UContainer>
      <UCarousel
        v-slot="{ item }"
        :items="slides"
        :ui="{ item: 'basis-full' }"
        :autoplay="autoplay"
        arrows
        dots
        loop
        class="rounded-2xl overflow-hidden ring-1 ring-default shadow-soft-xl"
      >
        <div
          class="relative min-h-[320px] md:min-h-[380px] grid md:grid-cols-2 gap-0 bg-elevated"
        >
          <div class="flex flex-col justify-center p-8 md:p-12 lg:p-14 space-y-5">
            <UBadge color="primary" variant="subtle" class="w-fit">
              {{ item.badge }}
            </UBadge>
            <h2 class="text-display text-3xl md:text-4xl text-highlighted">
              {{ item.title }}
            </h2>
            <p class="text-muted text-base md:text-lg leading-relaxed max-w-lg">
              {{ item.description }}
            </p>
            <div class="flex flex-wrap gap-3 pt-1">
              <UButton
                :to="item.primaryTo"
                color="primary"
                size="lg"
                trailing-icon="i-lucide-arrow-right"
              >
                {{ item.primaryLabel }}
              </UButton>
              <UButton
                :to="item.secondaryTo"
                target="_blank"
                rel="noopener noreferrer"
                color="neutral"
                variant="outline"
                size="lg"
                icon="i-simple-icons-whatsapp"
              >
                {{ item.secondaryLabel }}
              </UButton>
            </div>
          </div>
          <div
            class="relative hidden md:flex items-center justify-center bg-gradient-to-br p-10"
            :class="item.accent"
          >
            <div class="glass-panel rounded-2xl p-10 shadow-soft-lg flex flex-col items-center gap-4">
              <div class="flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UIcon :name="item.icon" class="size-10" />
              </div>
              <p class="text-sm font-semibold text-highlighted text-center">
                {{ item.badge }}
              </p>
            </div>
          </div>
        </div>
      </UCarousel>
    </UContainer>
  </section>
</template>
