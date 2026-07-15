<script setup lang="ts">
/** Static v1 — swap to testimonials API when available. */
const { t } = useI18n()

const reviews = computed(() => [
  {
    quote: t('home.testimonial1Quote'),
    name: t('home.testimonial1Name'),
    role: t('home.testimonial1Role')
  },
  {
    quote: t('home.testimonial2Quote'),
    name: t('home.testimonial2Name'),
    role: t('home.testimonial2Role')
  },
  {
    quote: t('home.testimonial3Quote'),
    name: t('home.testimonial3Name'),
    role: t('home.testimonial3Role')
  }
])

const stats = computed(() => [
  {
    value: t('home.statMembersValue'),
    label: t('home.statMembersLabel'),
    icon: 'i-lucide-users'
  },
  {
    value: t('home.statRatingValue'),
    label: t('home.statRatingLabel'),
    icon: 'i-lucide-star'
  },
  {
    value: t('home.statSalesValue'),
    label: t('home.statSalesLabel'),
    icon: 'i-lucide-trending-up'
  }
])
</script>

<template>
  <section id="testimoni" class="section-y bg-muted/30">
    <UContainer>
      <SectionHeading
        :eyebrow="t('home.testimonialsEyebrow')"
        :title="t('home.testimonialsTitle')"
        :description="t('home.testimonialsDesc')"
      />

      <div class="grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto mb-10">
        <UCard
          v-for="stat in stats"
          :key="stat.label"
          :ui="{ root: 'shadow-soft-md', body: 'p-5 text-center' }"
        >
          <div class="flex size-10 mx-auto mb-3 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UIcon :name="stat.icon" class="size-5" />
          </div>
          <p class="text-2xl md:text-3xl font-semibold tabular-nums text-highlighted tracking-tight">
            {{ stat.value }}
          </p>
          <p class="mt-1 text-sm text-muted">
            {{ stat.label }}
          </p>
        </UCard>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <UCard
          v-for="(review, i) in reviews"
          :key="i"
          class="card-lift h-full"
          :ui="{ root: 'shadow-soft-md', body: 'p-6 md:p-8 flex flex-col h-full' }"
        >
          <UIcon name="i-lucide-quote" class="size-8 text-primary/30 mb-4" />
          <blockquote class="text-sm md:text-base text-highlighted leading-relaxed flex-1">
            “{{ review.quote }}”
          </blockquote>
          <div class="mt-6 pt-4 border-t border-default">
            <p class="font-semibold text-highlighted">
              {{ review.name }}
            </p>
            <p class="text-sm text-muted mt-0.5">
              {{ review.role }}
            </p>
          </div>
        </UCard>
      </div>
    </UContainer>
  </section>
</template>
