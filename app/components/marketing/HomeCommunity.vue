<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { link } = useWhatsApp()

const waHref = computed(() => link(t('whatsapp.consultDefault')))
</script>

<template>
  <section id="komunitas" class="section-y bg-primary/5">
    <UContainer>
      <div class="max-w-3xl mx-auto text-center">
        <p class="text-sm font-semibold tracking-wide text-primary uppercase mb-2">
          {{ t('home.communityEyebrow') }}
        </p>
        <h2 class="text-display text-3xl md:text-4xl text-highlighted">
          {{ t('home.communityTitle') }}
        </h2>
        <p class="mt-3 text-muted text-base md:text-lg leading-relaxed">
          {{ t('home.communityDesc') }}
        </p>

        <ul class="mt-8 grid gap-3 sm:grid-cols-3 text-left max-w-2xl mx-auto">
          <li class="flex gap-2 text-sm text-highlighted">
            <UIcon name="i-lucide-messages-square" class="size-5 text-primary shrink-0 mt-0.5" />
            <span>{{ t('home.communityBenefit1') }}</span>
          </li>
          <li class="flex gap-2 text-sm text-highlighted">
            <UIcon name="i-lucide-book-open" class="size-5 text-primary shrink-0 mt-0.5" />
            <span>{{ t('home.communityBenefit2') }}</span>
          </li>
          <li class="flex gap-2 text-sm text-highlighted">
            <UIcon name="i-lucide-badge-percent" class="size-5 text-primary shrink-0 mt-0.5" />
            <span>{{ t('home.communityBenefit3') }}</span>
          </li>
        </ul>

        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
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
    </UContainer>
  </section>
</template>
