<script setup lang="ts">
import type { ServicePackage } from '~/types'

const { t } = useI18n()
const localePath = useLocalePath()
const { link } = useWhatsApp()

useSeoMeta({
  title: () => t('services.custom'),
  description: 'Custom build: ERP, AI, mobile app, integrasi pihak ketiga.'
})

const { data: packagesRes, status } = await useFetch<{ data: ServicePackage[] }>(
  '/api/packages',
  {
    query: { serviceType: 'custom' },
    key: 'packages-custom'
  }
)

const packages = computed(() => packagesRes.value?.data ?? [])

const features = [
  {
    icon: 'i-lucide-blocks',
    title: 'Sistem bisnis',
    description: 'ERP ringan, CRM, inventory, booking - sesuai proses internal Anda.'
  },
  {
    icon: 'i-lucide-bot',
    title: 'AI & otomasi',
    description: 'Chatbot, klasifikasi lead, ringkasan dokumen, workflow otomatis.'
  },
  {
    icon: 'i-lucide-smartphone',
    title: 'Mobile app',
    description: 'Companion app atau PWA untuk tim lapangan dan pelanggan.'
  },
  {
    icon: 'i-lucide-plug',
    title: 'Integrasi pihak ketiga',
    description: 'Payment, logistik, marketplace, accounting, API internal.'
  },
  {
    icon: 'i-lucide-shield',
    title: 'Keamanan & akses',
    description: 'Role-based access, audit log, dan hardening sesuai kebutuhan.'
  },
  {
    icon: 'i-lucide-life-buoy',
    title: 'Support lanjutan',
    description: 'SLA, training, dan handover dokumentasi setelah go-live.'
  }
]

const steps = [
  { title: 'Discovery & brief', description: 'Wawancara proses, user, integrasi, dan target hasil.' },
  { title: 'Proposal & sprint', description: 'Scope, estimasi, milestone, dan prototype disetujui dulu.' },
  { title: 'Build · uji · serah', description: 'Iterasi, UAT, go-live, dan training tim Anda.' }
]

const waHref = computed(() => link(t('whatsapp.consultCustom')))
</script>

<template>
  <div>
    <section class="bg-mesh-hero border-b border-default">
      <UContainer class="section-y !pb-12 md:!pb-16">
        <div class="max-w-3xl text-left space-y-6">
          <UBadge color="primary" variant="subtle" size="lg">
            {{ t('serviceLanding.customQuote') }}
          </UBadge>

          <h1 class="text-display text-4xl sm:text-5xl md:text-6xl text-highlighted">
            {{ t('services.custom') }}
          </h1>

          <p class="text-lg md:text-xl text-muted leading-relaxed">
            Butuh lebih dari template? ERP, integrasi AI, mobile app, dan sistem pihak ketiga — dikerjakan sesuai brief.
          </p>

          <div class="flex flex-wrap gap-3">
            <UButton
              :to="waHref"
              target="_blank"
              color="primary"
              size="xl"
              icon="i-simple-icons-whatsapp"
            >
              {{ t('cta.consult') }}
            </UButton>
            <UButton
              :to="localePath('/templates')"
              color="neutral"
              variant="outline"
              size="xl"
            >
              {{ t('cta.viewTemplates') }}
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <ServiceProof />

    <UPageSection
      :title="t('serviceLanding.featuresTitle')"
      description="Bukan paket fixed. Scope dan harga mengikuti brief — transparan dari awal."
      :features="features"
    />

    <ServiceSteps
      :title="t('serviceLanding.customStepsTitle')"
      :description="t('serviceLanding.customStepsDesc')"
      :steps="steps"
    />

    <ServicePricing
      :packages="packages"
      billing-mode="project"
      :loading="status === 'pending'"
      :cta-label="t('cta.consult')"
      :cta-to="waHref"
      :empty-text="t('serviceLanding.customEmpty')"
    />

    <ServiceCta
      :title="t('serviceLanding.customCtaTitle')"
      :description="t('serviceLanding.customCtaDesc')"
      :primary-label="t('cta.consult')"
      :primary-to="waHref"
      :secondary-label="t('cta.viewTemplates')"
      :secondary-to="localePath('/templates')"
    />
  </div>
</template>
