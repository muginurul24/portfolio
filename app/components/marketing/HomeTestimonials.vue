<script setup lang="ts">
/** Static v1 — swap to testimonials API when available. */
const { t } = useI18n()

const stats = computed(() => [
  {
    value: t('home.statMembersValue'),
    label: t('home.statMembersLabel')
  },
  {
    value: t('home.statSalesValue'),
    label: t('home.statSalesLabel')
  },
  {
    value: t('home.statRatingValue'),
    label: t('home.statRatingLabel')
  }
])

const reviews = computed(() => [
  {
    quote: t('home.testimonial1Quote'),
    name: t('home.testimonial1Name'),
    role: t('home.testimonial1Role'),
    site: t('home.testimonial1Site'),
    initials: 'HI',
    icon: 'i-lucide-globe'
  },
  {
    quote: t('home.testimonial2Quote'),
    name: t('home.testimonial2Name'),
    role: t('home.testimonial2Role'),
    site: t('home.testimonial2Site'),
    initials: 'QF',
    icon: 'i-lucide-store'
  },
  {
    quote: t('home.testimonial3Quote'),
    name: t('home.testimonial3Name'),
    role: t('home.testimonial3Role'),
    site: t('home.testimonial3Site'),
    initials: 'SW',
    icon: 'i-lucide-palette'
  },
  {
    quote: t('home.testimonial4Quote'),
    name: t('home.testimonial4Name'),
    role: t('home.testimonial4Role'),
    site: t('home.testimonial4Site'),
    initials: 'AR',
    icon: 'i-lucide-shopping-bag'
  }
])
</script>

<template>
  <section id="testimoni" class="section-y bg-muted/30">
    <UContainer>
      <SectionHeading
        index="04"
        :eyebrow="t('home.testimonialsEyebrow')"
        :title="t('home.testimonialsTitle')"
        :description="t('home.testimonialsDesc')"
      />

      <div
        class="mb-10 md:mb-12 rounded-2xl glass-panel shadow-soft-md ring-1 ring-default overflow-hidden"
        role="group"
        :aria-label="t('home.testimonialsStatsLabel')"
      >
        <div class="grid divide-y divide-default sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="px-6 py-8 md:px-8 md:py-10 text-center"
          >
            <p class="text-4xl md:text-5xl lg:text-6xl font-bold tabular-nums tracking-tight text-highlighted">
              {{ stat.value }}
            </p>
            <p class="mt-2 text-sm md:text-base text-muted">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <UCard
          v-for="(review, i) in reviews"
          :key="i"
          class="card-lift h-full"
          :ui="{
            root: 'bg-default ring-default shadow-soft-md border-0 h-full',
            body: 'p-6 md:p-7 flex flex-col h-full'
          }"
        >
          <div class="flex items-center gap-3 mb-5">
            <div
              class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15"
              aria-hidden="true"
            >
              <UIcon :name="review.icon" class="size-5" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-highlighted truncate">
                {{ review.name }}
              </p>
              <p class="text-sm text-muted truncate">
                {{ review.role }}
              </p>
            </div>
          </div>

          <UIcon name="i-lucide-quote" class="size-7 text-primary/25 mb-3" aria-hidden="true" />

          <blockquote class="text-sm md:text-[0.95rem] text-highlighted leading-relaxed flex-1">
            “{{ review.quote }}”
          </blockquote>

          <p
            v-if="review.site"
            class="mt-5 pt-4 border-t border-default text-xs font-medium text-primary truncate"
          >
            {{ review.site }}
          </p>
        </UCard>
      </div>
    </UContainer>
  </section>
</template>
