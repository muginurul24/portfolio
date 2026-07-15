<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { link } = useWhatsApp()

const waHref = computed(() => link(t('whatsapp.consultDefault')))

const benefits = computed(() => [
  {
    key: 'group',
    icon: 'i-lucide-messages-square',
    title: t('home.communityBenefit1Title'),
    description: t('home.communityBenefit1Desc')
  },
  {
    key: 'class',
    icon: 'i-lucide-graduation-cap',
    title: t('home.communityBenefit2Title'),
    description: t('home.communityBenefit2Desc')
  },
  {
    key: 'promo',
    icon: 'i-lucide-badge-percent',
    title: t('home.communityBenefit3Title'),
    description: t('home.communityBenefit3Desc')
  },
  {
    key: 'funding',
    icon: 'i-lucide-hand-coins',
    title: t('home.communityBenefit4Title'),
    description: t('home.communityBenefit4Desc')
  }
])

/** Decorative initials only — not real member photos. */
const avatars = [
  { initials: 'HI', tone: 'bg-sky-600/15 text-sky-700 dark:text-sky-300' },
  { initials: 'QF', tone: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300' },
  { initials: 'SW', tone: 'bg-indigo-600/15 text-indigo-700 dark:text-indigo-300' },
  { initials: 'AR', tone: 'bg-amber-600/15 text-amber-800 dark:text-amber-300' },
  { initials: 'DN', tone: 'bg-rose-600/15 text-rose-700 dark:text-rose-300' },
  { initials: 'MK', tone: 'bg-violet-600/15 text-violet-700 dark:text-violet-300' },
  { initials: 'RL', tone: 'bg-teal-600/15 text-teal-700 dark:text-teal-300' },
  { initials: 'BS', tone: 'bg-primary/15 text-primary' }
]
</script>

<template>
  <section id="komunitas" class="section-y bg-primary/5">
    <UContainer>
      <div class="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-center">
        <div>
          <SectionHeading
            index="05"
            align="left"
            :eyebrow="t('home.communityEyebrow')"
            :title="t('home.communityTitle')"
            :description="t('home.communityDesc')"
          />

          <div class="flex flex-wrap items-center gap-3 mb-8" aria-hidden="true">
            <div class="flex -space-x-2">
              <span
                v-for="(avatar, i) in avatars"
                :key="i"
                class="inline-flex size-10 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-default shadow-soft-sm"
                :class="avatar.tone"
              >
                {{ avatar.initials }}
              </span>
            </div>
            <p class="text-sm text-muted">
              {{ t('home.communityAvatarCaption') }}
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <UButton
              :to="localePath('/komunitas')"
              color="primary"
              size="xl"
              trailing-icon="i-lucide-arrow-right"
              class="cursor-pointer"
            >
              {{ t('home.communityCta') }}
            </UButton>
            <UButton
              :to="waHref"
              target="_blank"
              rel="noopener noreferrer"
              color="neutral"
              variant="outline"
              size="xl"
              icon="i-simple-icons-whatsapp"
              class="cursor-pointer"
            >
              {{ t('home.communityWa') }}
            </UButton>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <UCard
            v-for="benefit in benefits"
            :key="benefit.key"
            class="card-lift h-full"
            :ui="{
              root: 'bg-default/80 dark:bg-elevated/60 ring-default shadow-soft-md border-0 backdrop-blur-sm',
              body: 'p-5 md:p-6'
            }"
          >
            <div class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              <UIcon :name="benefit.icon" class="size-5" />
            </div>
            <h3 class="text-base font-semibold text-highlighted">
              {{ benefit.title }}
            </h3>
            <p class="mt-1.5 text-sm text-muted leading-relaxed">
              {{ benefit.description }}
            </p>
          </UCard>
        </div>
      </div>
    </UContainer>
  </section>
</template>
