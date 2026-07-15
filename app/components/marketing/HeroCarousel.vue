<script setup lang="ts">
/**
 * Enterprise hero carousel — Embla via Nuxt UI UCarousel
 *
 * Hydration: UCarousel mutates arrow `disabled` after Embla init on client,
 * which mismatches SSR. Mount interactive carousel with <ClientOnly> and
 * render a static first-slide fallback for SSR/SEO (Nuxt hydration best practice).
 *
 * UX: loop, arrows, dots, autoplay, pause on hover/focus, reduced-motion safe.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const { link } = useWhatsApp()

interface HeroSlide {
  key: string
  badge: string
  title: string
  description: string
  icon: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel: string
  secondaryTo: string
  accent: string
  glow: string
}

const slides = computed((): HeroSlide[] => [
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
    accent: 'from-sky-500/25 via-sky-600/10 to-slate-900/5 dark:from-sky-400/20 dark:via-sky-900/30 dark:to-slate-950/50',
    glow: 'bg-sky-500/20'
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
    accent: 'from-emerald-500/20 via-sky-600/10 to-slate-900/5 dark:from-emerald-400/15 dark:via-slate-900/40 dark:to-slate-950/50',
    glow: 'bg-emerald-500/20'
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
    accent: 'from-indigo-500/20 via-sky-700/10 to-slate-900/5 dark:from-indigo-400/15 dark:via-slate-900/40 dark:to-slate-950/50',
    glow: 'bg-indigo-500/20'
  }
])

const firstSlide = computed(() => slides.value[0]!)

const motionQuery = useMediaQuery('(prefers-reduced-motion: reduce)')
const activeIndex = ref(0)
const isPaused = ref(false)
/** Enable autoplay only after client mount — avoids SSR/client media-query drift */
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})

const autoplay = computed(() => {
  if (!mounted.value || motionQuery.value) return false
  return {
    delay: 5000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
    stopOnFocusIn: true
  }
})

/** Perfect circle nav — fixed square box + centered icon */
const navBtn = {
  size: 'md' as const,
  color: 'neutral' as const,
  variant: 'solid' as const,
  square: true,
  ui: {
    base: [
      'pointer-events-auto',
      // force equal box (beat size token width/height drift)
      '!size-11 sm:!size-12 !min-w-11 sm:!min-w-12 !p-0',
      '!rounded-full aspect-square',
      'inline-flex items-center justify-center',
      'shadow-soft-lg ring-1 ring-default/80',
      'bg-default/95 backdrop-blur-md text-highlighted',
      'hover:bg-elevated hover:text-primary',
      'disabled:opacity-40'
    ].join(' '),
    leadingIcon: 'size-5 shrink-0'
  }
}

const carouselUi = {
  root: 'relative w-full focus:outline-none',
  viewport: 'overflow-hidden rounded-2xl',
  container: 'flex touch-pan-y ms-0',
  item: 'basis-full min-w-0 shrink-0 grow-0 ps-0',
  // full stage overlay for absolute arrow centering
  controls: 'absolute inset-0 z-20 pointer-events-none',
  // don't use contents — keep positioning context on each arrow slot
  arrows: 'absolute inset-0 pointer-events-none',
  // exact vertical center of carousel stage (override theme sm:-start-12 etc.)
  prev: [
    '!absolute !start-3 sm:!start-5',
    '!top-1/2 !-translate-y-1/2 !bottom-auto !left-auto',
    'rtl:!end-3 rtl:sm:!end-5',
    'z-30'
  ].join(' '),
  next: [
    '!absolute !end-3 sm:!end-5',
    '!top-1/2 !-translate-y-1/2 !bottom-auto !right-auto',
    'rtl:!start-3 rtl:sm:!start-5',
    'z-30'
  ].join(' '),
  dots: [
    'absolute inset-x-0 bottom-4 sm:bottom-5 z-30',
    'flex flex-wrap items-center justify-center gap-2',
    'pointer-events-auto'
  ].join(' '),
  dot: [
    'cursor-pointer rounded-full outline-none',
    'size-2.5 bg-default/70 ring-1 ring-default/80',
    'transition-all duration-300 ease-out',
    'hover:bg-primary/50',
    'focus-visible:ring-2 focus-visible:ring-primary',
    'data-[state=active]:bg-primary data-[state=active]:ring-primary/40',
    'data-[state=active]:w-7 data-[state=active]:shadow-glow-sky'
  ].join(' ')
}

function onSelect(index: number) {
  activeIndex.value = index
}
</script>

<template>
  <section
    class="section-y pt-2 md:pt-4"
    :aria-label="t('home.carousel.label')"
  >
    <UContainer>
      <div class="relative group/carousel hero-carousel-stage">
        <div class="absolute -inset-px rounded-[1.15rem] bg-gradient-to-br from-primary/25 via-default to-primary/10 dark:from-primary/30 dark:via-transparent dark:to-primary/15 pointer-events-none" />

        <ClientOnly>
          <UCarousel
            v-slot="{ item, index }"
            :items="slides"
            :ui="carouselUi"
            :autoplay="autoplay"
            :prev="navBtn"
            :next="navBtn"
            prev-icon="i-lucide-chevron-left"
            next-icon="i-lucide-chevron-right"
            arrows
            dots
            loop
            :duration="28"
            class="rounded-2xl overflow-hidden ring-1 ring-default/80 shadow-soft-xl bg-elevated"
            @select="onSelect"
          >
            <article
              class="relative min-h-[340px] sm:min-h-[380px] md:min-h-[420px] grid md:grid-cols-2"
              :aria-roledescription="t('home.carousel.slideRole')"
              :aria-label="t('home.carousel.slideOf', { current: index + 1, total: slides.length })"
            >
              <div class="relative z-10 flex flex-col justify-center p-8 sm:p-10 md:p-12 lg:p-14 space-y-5 order-2 md:order-1">
                <div class="flex items-center gap-3">
                  <UBadge color="primary" variant="subtle" size="md" class="w-fit">
                    {{ item.badge }}
                  </UBadge>
                  <span class="text-xs font-medium text-muted tabular-nums hidden sm:inline">
                    {{ String(index + 1).padStart(2, '0') }} / {{ String(slides.length).padStart(2, '0') }}
                  </span>
                </div>

                <h2 class="text-display text-3xl sm:text-4xl lg:text-[2.75rem] text-highlighted max-w-xl">
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
                    class="shadow-glow-sky cursor-pointer"
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
                    class="cursor-pointer"
                  >
                    {{ item.secondaryLabel }}
                  </UButton>
                </div>
              </div>

              <div
                class="relative hidden md:flex items-center justify-center overflow-hidden order-1 md:order-2 bg-gradient-to-br min-h-[240px]"
                :class="item.accent"
                aria-hidden="true"
              >
                <div
                  class="absolute size-56 rounded-full blur-3xl opacity-60 -top-10 -end-10"
                  :class="item.glow"
                />
                <div class="absolute size-40 rounded-full blur-2xl opacity-40 bottom-6 start-8 bg-primary/15" />

                <div class="relative glass-panel rounded-2xl p-10 lg:p-12 shadow-soft-xl flex flex-col items-center gap-5 max-w-[16rem]">
                  <div class="flex size-20 lg:size-24 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <UIcon :name="item.icon" class="size-10 lg:size-12" />
                  </div>
                  <p class="text-sm font-semibold text-highlighted text-center leading-snug">
                    {{ item.badge }}
                  </p>
                </div>
              </div>
            </article>
          </UCarousel>

          <!-- SSR / pre-hydration: static first slide (same chrome, no Embla controls) -->
          <template #fallback>
            <div
              class="rounded-2xl overflow-hidden ring-1 ring-default/80 shadow-soft-xl bg-elevated"
              role="region"
              :aria-label="t('home.carousel.label')"
            >
              <article class="relative min-h-[340px] sm:min-h-[380px] md:min-h-[420px] grid md:grid-cols-2">
                <div class="relative z-10 flex flex-col justify-center p-8 sm:p-10 md:p-12 lg:p-14 space-y-5 order-2 md:order-1">
                  <div class="flex items-center gap-3">
                    <UBadge color="primary" variant="subtle" size="md" class="w-fit">
                      {{ firstSlide.badge }}
                    </UBadge>
                    <span class="text-xs font-medium text-muted tabular-nums hidden sm:inline">
                      01 / {{ String(slides.length).padStart(2, '0') }}
                    </span>
                  </div>
                  <h2 class="text-display text-3xl sm:text-4xl lg:text-[2.75rem] text-highlighted max-w-xl">
                    {{ firstSlide.title }}
                  </h2>
                  <p class="text-muted text-base md:text-lg leading-relaxed max-w-lg">
                    {{ firstSlide.description }}
                  </p>
                  <div class="flex flex-wrap gap-3 pt-1">
                    <UButton
                      :to="firstSlide.primaryTo"
                      color="primary"
                      size="lg"
                      trailing-icon="i-lucide-arrow-right"
                      class="shadow-glow-sky cursor-pointer"
                    >
                      {{ firstSlide.primaryLabel }}
                    </UButton>
                    <UButton
                      :to="firstSlide.secondaryTo"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="neutral"
                      variant="outline"
                      size="lg"
                      icon="i-simple-icons-whatsapp"
                      class="cursor-pointer"
                    >
                      {{ firstSlide.secondaryLabel }}
                    </UButton>
                  </div>
                </div>
                <div
                  class="relative hidden md:flex items-center justify-center overflow-hidden order-1 md:order-2 bg-gradient-to-br min-h-[240px]"
                  :class="firstSlide.accent"
                  aria-hidden="true"
                >
                  <div
                    class="absolute size-56 rounded-full blur-3xl opacity-60 -top-10 -end-10"
                    :class="firstSlide.glow"
                  />
                  <div class="relative glass-panel rounded-2xl p-10 lg:p-12 shadow-soft-xl flex flex-col items-center gap-5 max-w-[16rem]">
                    <div class="flex size-20 lg:size-24 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                      <UIcon :name="firstSlide.icon" class="size-10 lg:size-12" />
                    </div>
                    <p class="text-sm font-semibold text-highlighted text-center leading-snug">
                      {{ firstSlide.badge }}
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </template>
        </ClientOnly>

        <p class="sr-only" aria-live="polite">
          {{ t('home.carousel.slideOf', { current: activeIndex + 1, total: slides.length }) }}
          <span v-if="isPaused && mounted && !motionQuery">{{ t('home.carousel.paused') }}</span>
        </p>
      </div>

      <p class="mt-3 text-center text-xs text-muted">
        {{ t('home.carousel.hint') }}
      </p>
    </UContainer>
  </section>
</template>
