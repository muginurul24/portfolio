<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('nav.portfolio'),
  description: 'Contoh website UMKM & eksportir yang dibangun dengan MugiewDev.'
})

const cases = [
  {
    name: 'Nusantara Craft Export',
    sector: 'Kerajinan',
    summary: 'Katalog produk anyaman + form inquiry multibahasa untuk buyer ASEAN.',
    outcome: 'Inquiry naik 3x dalam 2 bulan.',
    icon: 'i-lucide-palette'
  },
  {
    name: 'Agro Sejahtera',
    sector: 'Agrikultur',
    summary: 'Profil perusahaan, sertifikasi, dan daftar HS code komoditas kopi.',
    outcome: 'Buyer baru dari Jepang & Korea.',
    icon: 'i-lucide-sprout'
  },
  {
    name: 'Toko Rempah Nusantara',
    sector: 'Toko online',
    summary: 'Toko online B2C dengan katalog bumbu & checkout terintegrasi.',
    outcome: 'Order online stabil tiap minggu.',
    icon: 'i-lucide-shopping-bag'
  },
  {
    name: 'PT Baja Prima',
    sector: 'Manufaktur',
    summary: 'Company profile B2B dengan spesifikasi teknis & unduh katalog PDF.',
    outcome: 'Lead sales lebih terstruktur.',
    icon: 'i-lucide-factory'
  },
  {
    name: 'Rasa Nusantara Catering',
    sector: 'F&B',
    summary: 'Website jasa catering + paket menu dan booking WhatsApp.',
    outcome: 'Booking event lebih cepat.',
    icon: 'i-lucide-utensils'
  },
  {
    name: 'LogiFast Logistics',
    sector: 'Jasa',
    summary: 'Landing layanan freight & tracking inquiry untuk klien ekspor.',
    outcome: 'Konversi form inquiry naik 40%.',
    icon: 'i-lucide-truck'
  }
]
</script>

<template>
  <div>
    <UPageHero
      :title="t('nav.portfolio')"
      description="Beberapa contoh website yang dibangun untuk UMKM dan eksportir. Nama disamarkan untuk privasi klien."
      :links="[
        {
          label: t('cta.buildNow'),
          to: localePath('/order/choose-domain'),
          color: 'primary',
          size: 'xl',
          trailingIcon: 'i-lucide-arrow-right'
        },
        {
          label: t('cta.viewTemplates'),
          to: localePath('/templates'),
          color: 'neutral',
          variant: 'outline',
          size: 'xl'
        }
      ]"
    />

    <UContainer class="pb-16 md:pb-24">
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="item in cases"
          :key="item.name"
          class="transition-shadow duration-200 hover:shadow-soft-lg"
          :ui="{ body: 'p-6 flex flex-col h-full' }"
        >
          <div class="flex items-start gap-3 mb-4">
            <div class="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <UIcon :name="item.icon" class="size-5 text-primary" />
            </div>
            <div>
              <UBadge color="neutral" variant="subtle" size="sm">
                {{ item.sector }}
              </UBadge>
              <h2 class="mt-2 font-semibold text-highlighted tracking-tight">
                {{ item.name }}
              </h2>
            </div>
          </div>
          <p class="text-sm text-muted flex-1">
            {{ item.summary }}
          </p>
          <p class="mt-4 text-sm font-medium text-highlighted flex items-center gap-2">
            <UIcon name="i-lucide-trending-up" class="size-4 text-primary shrink-0" />
            {{ item.outcome }}
          </p>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>
