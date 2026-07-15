<script setup lang="ts">
import type { ServicePackage } from '~/types'

const { t } = useI18n()
const localePath = useLocalePath()
const appConfig = useAppConfig()

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
    description: 'ERP ringan, CRM, inventory, booking — sesuai proses internal Anda.'
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

const waHref = computed(() => {
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
        {
          label: t('cta.consult'),
          to: waHref,
          target: '_blank',
          color: 'primary',
          size: 'xl',
          icon: 'i-simple-icons-whatsapp'
        },
        {
          label: t('cta.viewTemplates'),
          to: localePath('/templates'),
          color: 'neutral',
          variant: 'outline',
          size: 'xl'
        }
      ]"
    >
      <template #headline>
        <UBadge color="primary" variant="subtle" size="lg" class="mb-2">
          Custom quote
        </UBadge>
      </template>
    </UPageHero>

    <MarketingServiceProof />

    <UPageSection
      :title="t('serviceLanding.featuresTitle')"
      description="Bukan paket fixed. Scope dan harga mengikuti brief — transparan dari awal."
      :features="features"
    />

    <MarketingServiceSteps
      title="Alur custom project"
      description="Dari discovery sampai serah terima — dikontrol milestone."
      :steps="steps"
    />

    <MarketingServicePricing
      :packages="packages"
      billing-mode="project"
      :loading="status === 'pending'"
      :cta-label="t('cta.consult')"
      :cta-to="waHref"
      empty-text="Paket custom dinilai per brief. Chat CS untuk estimasi dan timeline."
    />

    <MarketingServiceCta
      title="Punya brief? Mari kita bangun."
      description="Jelaskan kebutuhan, kami balas estimasi scope & timeline. Tanpa komitmen di chat awal."
      :primary-label="t('cta.consult')"
      :primary-to="waHref"
      :secondary-label="t('cta.viewTemplates')"
      :secondary-to="localePath('/templates')"
    />
  </div>
</template>
