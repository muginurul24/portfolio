<script setup lang="ts">
const { t } = useI18n()
const appConfig = useAppConfig()

useSeoMeta({
  title: () => t('services.custom'),
  description: 'Custom build: ERP, AI, mobile app, integrasi pihak ketiga.'
})

const wa = computed(() => {
  const n = appConfig.mugiew?.supportWa || '6281280080275'
  return `https://wa.me/${n}?text=${encodeURIComponent('Halo, saya butuh pesanan khusus website/app')}`
})
</script>

<template>
  <div>
    <UPageHero
      :title="t('services.custom')"
      description="Butuh lebih dari template? ERP, integrasi AI, mobile app, dan sistem pihak ketiga — dikerjakan sesuai brief."
      :links="[
        { label: t('cta.consult'), to: wa, target: '_blank', color: 'primary', size: 'xl', icon: 'i-simple-icons-whatsapp' }
      ]"
    />
  </div>
</template>
