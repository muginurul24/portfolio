<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('nav.faq'),
  description: 'FAQ MugiewDev - produk, bayar, aktivasi, dukungan.'
})

const items = [
  {
    label: 'Apa itu MugiewDev?',
    content: 'Platform website profesional untuk UMKM dan eksportir: template, domain, hosting, SSL, email bisnis, akademi, dan komunitas.'
  },
  {
    label: 'Berapa lama website live?',
    content: 'Maksimal 2x24 jam kerja setelah pembayaran terverifikasi.'
  },
  {
    label: 'Metode pembayaran apa saja?',
    content: 'VA bank, QRIS, e-wallet (OVO/DANA/LinkAja), kartu, dan Paylater via Xendit. Pesanan belum bayar auto-batal dalam 2x24 jam.'
  },
  {
    label: 'Bisa ganti template?',
    content: 'Ya, ganti gratis kapan saja setelah aktif.'
  },
  {
    label: 'Ada refund?',
    content: 'Setelah domain & website terdaftar, tidak ada pengembalian dana. Lihat Kebijakan Pengembalian.'
  }
]
</script>

<template>
  <UContainer class="py-10 md:py-16 max-w-3xl">
    <h1 class="text-3xl font-semibold text-highlighted tracking-tight mb-2">
      {{ t('nav.faq') }}
    </h1>
    <p class="text-muted mb-8">
      Jawaban cepat seputar produk dan layanan.
    </p>
    <UAccordion :items="items" type="multiple" />
  </UContainer>
</template>
