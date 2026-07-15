<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const appConfig = useAppConfig()
const { link } = useWhatsApp()

const discountLabel = computed(() =>
  formatIdr(appConfig.mugiew?.promoDiscountIdr || 500_000)
)

const waHref = computed(() => link(t('whatsapp.consultDefault')))
</script>

<template>
  <section id="mulai" class="section-y bg-mesh-hero border-y border-default">
    <UContainer>
      <UPageCTA
        :title="t('home.ctaTitle')"
        :description="t('home.ctaDesc', {
          code: appConfig.mugiew?.promoCode || 'WEBSITEJUARA',
          discount: discountLabel
        })"
        variant="subtle"
        class="shadow-soft-lg ring-1 ring-default"
        :links="[
          {
            label: t('cta.buildNow'),
            to: localePath('/order/choose-domain'),
            color: 'primary',
            size: 'xl',
            trailingIcon: 'i-lucide-arrow-right'
          },
          {
            label: t('cta.consult'),
            to: waHref,
            target: '_blank',
            icon: 'i-simple-icons-whatsapp',
            color: 'neutral',
            variant: 'outline',
            size: 'xl'
          }
        ]"
      />

      <p class="mt-5 text-center text-sm text-muted">
        {{ t('home.finalCtaMicro') }}
      </p>
    </UContainer>
  </section>
</template>
