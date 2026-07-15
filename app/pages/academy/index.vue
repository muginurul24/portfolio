<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('nav.academy'),
  description: 'Akademi ekspor berjenjang: legalitas, HS code, logistik, cari buyer, sertifikat.'
})
</script>

<template>
  <div>
    <UPageHero
      :title="t('nav.academy')"
      description="Kurikulum ekspor praktis untuk UMKM. Modul berjenjang, kuis, sertifikat, dan template dokumen siap pakai."
      :links="[
        {
          label: t('cta.consult'),
          to: localePath('/order/choose-domain'),
          trailingIcon: 'i-lucide-arrow-right',
          color: 'primary',
          size: 'xl'
        }
      ]"
    />

    <UPageSection
      title="Yang kamu pelajari"
      :features="[
        { icon: 'i-lucide-brain', title: 'Mindset & legalitas', description: 'NIB, perizinan, dan fondasi bisnis ekspor.' },
        { icon: 'i-lucide-hash', title: 'HS code & dokumen', description: 'Klasifikasi produk, packing list, invoice, COO.' },
        { icon: 'i-lucide-ship', title: 'Logistik & bayar', description: 'Incoterms, freight, metode pembayaran internasional.' },
        { icon: 'i-lucide-target', title: 'Cari buyer', description: 'Outbound, inquiry handling, quotation yang menang.' }
      ]"
    />
  </div>
</template>
