<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('services.ecommerce'),
  description: 'Toko online lengkap: cart, payment gateway, shipping, stok, kupon, admin dashboard.'
})

const plans = [
  {
    title: 'Basic',
    price: 'Rp15.000.000',
    description: '≤300 SKU · project one-time',
    features: ['Manajemen produk & stok', 'Cart + checkout', 'Payment gateway ID', 'Shipping + resi', 'Kupon', 'Blog & SEO']
  },
  {
    title: 'Standard',
    price: 'Rp25.000.000',
    description: '≤1000+ SKU · project one-time',
    features: ['Semua Basic', 'Membership & loyalty', 'Multi-warehouse', 'Custom shipping', 'Harga grosir/tier', 'Integrasi stock marketplace'],
    highlight: true
  }
]
</script>

<template>
  <div>
    <UPageHero
      :title="t('services.ecommerce')"
      description="Full commerce: keranjang, pembayaran, ongkir, notifikasi WA/email. Year-1 domain/hosting/email bisnis termasuk."
      :links="[
        { label: t('cta.consult'), to: localePath('/order/choose-domain'), color: 'primary', size: 'xl', trailingIcon: 'i-lucide-arrow-right' }
      ]"
    />

    <UPageSection title="Paket project">
      <div class="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        <UCard
          v-for="plan in plans"
          :key="plan.title"
          :ui="{ root: plan.highlight ? 'ring-2 ring-primary shadow-soft-lg' : 'shadow-soft-md' }"
        >
          <UBadge v-if="plan.highlight" color="primary" class="mb-2">
            Populer
          </UBadge>
          <h3 class="text-xl font-semibold">
            {{ plan.title }}
          </h3>
          <p class="text-2xl font-semibold tabular-nums mt-2">
            {{ plan.price }}
          </p>
          <p class="text-sm text-muted mt-1">
            {{ plan.description }}
          </p>
          <ul class="mt-4 space-y-2 text-sm">
            <li v-for="f in plan.features" :key="f" class="flex gap-2">
              <UIcon name="i-lucide-check" class="size-4 text-primary shrink-0 mt-0.5" />
              <span>{{ f }}</span>
            </li>
          </ul>
        </UCard>
      </div>
    </UPageSection>
  </div>
</template>
