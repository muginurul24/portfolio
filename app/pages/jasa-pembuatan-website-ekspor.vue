<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('services.export'),
  description: 'Website ekspor profesional: katalog HS code, multi-bahasa, form inquiry buyer, SEO Google.'
})
</script>

<template>
  <div>
    <UPageHero
      :title="t('services.export')"
      description="Buyer global riset supplier lewat Google. Tampilkan HS code, MOQ, sertifikasi, dan form inquiry yang rapi — lead masuk tanpa komisi marketplace."
      :links="[
        { label: t('cta.buildNow'), to: localePath('/order/choose-domain'), color: 'primary', size: 'xl', trailingIcon: 'i-lucide-arrow-right' },
        { label: t('cta.viewTemplates'), to: localePath('/templates'), color: 'neutral', variant: 'outline', size: 'xl' }
      ]"
    />
    <UPageSection
      title="Yang termasuk"
      :features="[
        { icon: 'i-lucide-globe', title: 'Domain + email bisnis', description: 'Domain resmi dan email profesional.' },
        { icon: 'i-lucide-search', title: 'SEO siap pakai', description: 'Meta, sitemap, schema produk, Search Console ready.' },
        { icon: 'i-lucide-languages', title: 'Multi-bahasa', description: 'ID + EN default; opsi Mandarin/Arab/Jepang.' },
        { icon: 'i-lucide-file-badge', title: 'Sertifikasi & legal', description: 'NIB, HACCP, Halal, Organic, Fair Trade showcase.' },
        { icon: 'i-lucide-package', title: 'Katalog ekspor', description: 'HS code, MOQ, packaging, sample request.' },
        { icon: 'i-lucide-inbox', title: 'Form inquiry', description: 'Email + WhatsApp + riwayat di dashboard.' }
      ]"
    />
  </div>
</template>
