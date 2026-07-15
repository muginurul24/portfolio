<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const services = computed(() => [
  {
    key: 'export',
    icon: 'i-lucide-globe',
    audience: t('home.serviceAudienceExport'),
    title: t('services.export'),
    description: t('home.serviceExportDesc'),
    to: localePath('/jasa-pembuatan-website-ekspor')
  },
  {
    key: 'umkm',
    icon: 'i-lucide-store',
    audience: t('home.serviceAudienceUmkm'),
    title: t('services.umkm'),
    description: t('home.serviceUmkmDesc'),
    to: localePath('/jasa-pembuatan-website-umkm')
  },
  {
    key: 'ecommerce',
    icon: 'i-lucide-shopping-cart',
    audience: t('home.serviceAudienceEcommerce'),
    title: t('services.ecommerce'),
    description: t('home.serviceEcommerceDesc'),
    to: localePath('/jasa-pembuatan-website-toko-online')
  },
  {
    key: 'custom',
    icon: 'i-lucide-sparkles',
    audience: t('home.serviceAudienceCustom'),
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
          <UCard
            class="card-lift h-full"
            :ui="{
              root: 'bg-default ring-default shadow-soft-md border-0',
              body: 'p-6 md:p-8'
            }"
          >
            <div class="flex items-start justify-between gap-4 mb-5">
              <div class="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <UIcon :name="svc.icon" class="size-6" />
              </div>
              <p class="text-xs font-semibold uppercase tracking-wide text-primary pt-1">
                {{ svc.audience }}
              </p>
            </div>
            <h3 class="text-lg md:text-xl font-semibold text-highlighted group-hover:text-primary transition-colors">
              {{ svc.title }}
            </h3>
            <p class="mt-2 text-sm text-muted leading-relaxed">
              {{ svc.description }}
            </p>
            <span class="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              {{ t('home.learnService') }}
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              />
            </span>
          </UCard>
        </NuxtLink>
      </div>
    </UContainer>
  </section>
</template>
