<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const services = computed(() => [
  {
    key: 'export',
    icon: 'i-lucide-globe',
    title: t('services.export'),
    description: t('home.serviceExportDesc'),
    to: localePath('/jasa-pembuatan-website-ekspor')
  },
  {
    key: 'umkm',
    icon: 'i-lucide-store',
    title: t('services.umkm'),
    description: t('home.serviceUmkmDesc'),
    to: localePath('/jasa-pembuatan-website-umkm')
  },
  {
    key: 'ecommerce',
    icon: 'i-lucide-shopping-cart',
    title: t('services.ecommerce'),
    description: t('home.serviceEcommerceDesc'),
    to: localePath('/jasa-pembuatan-website-toko-online')
  },
  {
    key: 'custom',
    icon: 'i-lucide-sparkles',
    title: t('services.custom'),
    description: t('home.serviceCustomDesc'),
    to: localePath('/jasa-pembuatan-website-custom')
  }
])
</script>

<template>
  <section id="layanan" class="section-y bg-muted/30">
    <UContainer>
      <SectionHeading
        :eyebrow="t('home.servicesEyebrow')"
        :title="t('home.servicesTitle')"
        :description="t('home.servicesDesc')"
      />
      <div class="grid gap-4 md:grid-cols-2">
        <NuxtLink
          v-for="svc in services"
          :key="svc.key"
          :to="svc.to"
          class="group block cursor-pointer"
        >
          <UCard class="card-lift h-full bg-primary/5 border-0" :ui="{ body: 'p-6 md:p-8' }">
            <div class="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5">
              <UIcon :name="svc.icon" class="size-6" />
            </div>
            <h3 class="text-lg font-semibold text-highlighted group-hover:text-primary transition-colors">
              {{ svc.title }}
            </h3>
            <p class="mt-2 text-sm text-muted leading-relaxed">
              {{ svc.description }}
            </p>
            <span class="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              {{ t('home.learnService') }}
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </UCard>
        </NuxtLink>
      </div>
    </UContainer>
  </section>
</template>
