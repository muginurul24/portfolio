<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const highlights = computed(() => [
  {
    key: 'modules',
    icon: 'i-lucide-book-open',
    label: t('home.academyHighlight1')
  },
  {
    key: 'quiz',
    icon: 'i-lucide-badge-check',
    label: t('home.academyHighlight2')
  },
  {
    key: 'docs',
    icon: 'i-lucide-file-text',
    label: t('home.academyHighlight3')
  },
  {
    key: 'cert',
    icon: 'i-lucide-award',
    label: t('home.academyHighlight4')
  }
])
</script>

<template>
  <section id="academy" class="section-y bg-primary/5">
    <UContainer>
      <div
        class="rounded-2xl glass-panel shadow-soft-md ring-1 ring-default overflow-hidden"
      >
        <div class="grid gap-8 p-6 md:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-12 lg:p-12">
          <div>
            <SectionHeading
              index="08"
              align="left"
              :eyebrow="t('home.academyEyebrow')"
              :title="t('home.academyTitle')"
              :description="t('home.academyDesc')"
              class="!mb-6 md:!mb-8"
            />

            <ul class="grid gap-3 sm:grid-cols-2 mb-8">
              <li
                v-for="item in highlights"
                :key="item.key"
                class="flex items-start gap-3 text-sm text-highlighted"
              >
                <span
                  class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <UIcon :name="item.icon" class="size-4" />
                </span>
                <span class="leading-snug pt-1">{{ item.label }}</span>
              </li>
            </ul>

            <UButton
              :to="localePath('/academy')"
              color="primary"
              size="xl"
              trailing-icon="i-lucide-arrow-right"
              class="cursor-pointer"
            >
              {{ t('home.academyCta') }}
            </UButton>
          </div>

          <div
            class="relative rounded-xl bg-default/80 dark:bg-elevated/60 ring-1 ring-default shadow-soft-sm p-6 md:p-8 backdrop-blur-sm"
          >
            <p class="text-xs font-semibold uppercase tracking-wide text-primary mb-3">
              {{ t('home.academyPitchEyebrow') }}
            </p>
            <p class="text-display text-4xl md:text-5xl text-highlighted tabular-nums tracking-tight">
              {{ t('home.academyModuleCount') }}
            </p>
            <p class="mt-2 text-base md:text-lg font-semibold text-highlighted">
              {{ t('home.academyModuleLabel') }}
            </p>
            <p class="mt-3 text-sm text-muted leading-relaxed">
              {{ t('home.academyPitchBody') }}
            </p>
            <div class="mt-6 flex flex-wrap gap-2">
              <UBadge color="primary" variant="subtle" size="sm">
                {{ t('home.academyTag1') }}
              </UBadge>
              <UBadge color="neutral" variant="subtle" size="sm">
                {{ t('home.academyTag2') }}
              </UBadge>
              <UBadge color="neutral" variant="subtle" size="sm">
                {{ t('home.academyTag3') }}
              </UBadge>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </section>
</template>
