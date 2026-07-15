<script setup lang="ts">
const appConfig = useAppConfig()
const { t } = useI18n()
const localePath = useLocalePath()

const code = computed(() => appConfig.mugiew?.promoCode || 'WEBSITEJUARA')
const discount = computed(() => formatIdr(appConfig.mugiew?.promoDiscountIdr || 500_000))
</script>

<template>
  <div class="bg-primary text-white">
    <UContainer class="py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
      <span class="font-medium">
        {{ t('promo.banner', { code, discount }) }}
      </span>
      <UButton
        :to="localePath('/order/choose-domain')"
        size="xs"
        color="neutral"
        variant="solid"
        class="bg-white text-primary hover:bg-white/90"
      >
        {{ t('promo.bannerCta') }}
      </UButton>
    </UContainer>
  </div>
</template>
