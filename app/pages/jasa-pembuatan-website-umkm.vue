<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('services.umkm'),
  description: 'Website UMKM: profil, katalog, form WA, SEO lokal, Google Business Profile.'
})
</script>

<template>
  <div>
    <UPageHero
      :title="t('services.umkm')"
      description="Company profile + katalog produk + formulir pesanan WhatsApp. SEO lokal dan Google Business Profile — tanpa ribet checkout penuh."
      :links="[
        { label: t('cta.buildNow'), to: localePath('/order/choose-domain'), color: 'primary', size: 'xl', trailingIcon: 'i-lucide-arrow-right' }
      ]"
    />
    <UPageSection
      title="Cocok untuk"
      :features="[
        { icon: 'i-lucide-store', title: 'UMKM lokal', description: 'Terlihat profesional di Google & sosmed.' },
        { icon: 'i-lucide-map-pin', title: 'SEO lokal', description: 'Optimasi wilayah + Google Business Profile.' },
        { icon: 'i-lucide-message-circle', title: 'Order via WA', description: 'Form terstruktur ke WhatsApp bisnis.' },
        { icon: 'i-lucide-shield-check', title: 'Legalitas', description: 'Halaman NIB, NPWP, Halal, PIRT, BPOM.' }
      ]"
    />
  </div>
</template>
