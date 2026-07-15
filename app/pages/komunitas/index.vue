<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('nav.community'),
  description: 'Komunitas UMKM & eksportir — grup diskusi, kelas gratis, promo member, dana talangan.'
})
</script>

<template>
  <div>
    <UPageHero
      :title="t('nav.community')"
      description="Gratis otomatis setelah website kamu live. Grup diskusi aktif, kelas belajar, promo eksklusif, dan akses dana talangan ekspor lewat partner."
      :links="[
        {
          label: t('cta.buildNow'),
          to: localePath('/order/choose-domain'),
          color: 'primary',
          size: 'xl',
          trailingIcon: 'i-lucide-arrow-right'
        }
      ]"
    />

    <UPageSection
      title="Benefit member"
      :features="[
        { icon: 'i-lucide-messages-square', title: 'Grup diskusi', description: 'Tukar ilmu ekspor & kelola website antar anggota.' },
        { icon: 'i-lucide-book-open', title: 'Kelas gratis', description: 'Jadwal rutin dari praktisi UMKM & ekspor.' },
        { icon: 'i-lucide-badge-percent', title: 'Promo member', description: 'Diskon domain, editing, upgrade template.' },
        { icon: 'i-lucide-landmark', title: 'Dana talangan', description: 'Akses partner pembiayaan modal kerja & PO ekspor.' }
      ]"
    />
  </div>
</template>
