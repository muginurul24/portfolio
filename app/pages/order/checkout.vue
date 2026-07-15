<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const appConfig = useAppConfig()

useSeoMeta({ title: () => t('order.checkout') })

const domain = computed(() => String(route.query.domain || ''))
const template = computed(() => String(route.query.template || ''))

const form = reactive({
  name: '',
  email: '',
  phone: '',
  promoCode: '',
  termYears: 1
})

const basePrice = 1_247_000
const promoDiscount = ref(0)
const loading = ref(false)
const error = ref('')
const success = ref(false)

const subtotal = computed(() => basePrice * form.termYears)
const total = computed(() => Math.max(0, subtotal.value - promoDiscount.value))

function applyPromo() {
  const code = form.promoCode.trim().toUpperCase()
  if (code === (appConfig.mugiew?.promoCode || 'WEBSITEJUARA')) {
    promoDiscount.value = appConfig.mugiew?.promoDiscountIdr || 500_000
  } else {
    promoDiscount.value = 0
    error.value = 'Kode promo tidak valid'
  }
}

async function submit() {
  error.value = ''
  if (!domain.value) {
    error.value = 'Domain belum dipilih'
    return
  }
  loading.value = true
  try {
    // Placeholder — wire to /api/orders + Xendit
    await new Promise(r => setTimeout(r, 600))
    success.value = true
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message || t('common.error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="py-10 md:py-16 max-w-3xl">
    <div class="mb-8">
      <UBadge color="primary" variant="subtle" class="mb-3">
        Step 2–3 / 3
      </UBadge>
      <h1 class="text-3xl font-semibold text-highlighted tracking-tight">
        {{ t('order.checkout') }}
      </h1>
    </div>

    <UAlert
      v-if="success"
      color="success"
      variant="subtle"
      title="Pesanan tercatat (stub)"
      description="Integrasi Xendit menyusul. Data order siap dihubungkan ke /api/orders."
      icon="i-lucide-check-circle"
      class="mb-6"
    />

    <div class="grid gap-6 lg:grid-cols-5">
      <UCard class="lg:col-span-3 shadow-soft-md">
        <h2 class="font-semibold mb-4">
          Data diri
        </h2>
        <form class="space-y-4" @submit.prevent="submit">
          <UFormField label="Nama lengkap" required>
            <UInput v-model="form.name" size="lg" class="w-full" required />
          </UFormField>
          <UFormField :label="t('auth.email')" required>
            <UInput v-model="form.email" type="email" size="lg" class="w-full" required />
          </UFormField>
          <UFormField label="WhatsApp" required>
            <UInput v-model="form.phone" type="tel" size="lg" class="w-full" required />
          </UFormField>

          <UFormField label="Durasi">
            <USelect
              v-model="form.termYears"
              :items="[
                { label: '1 tahun', value: 1 },
                { label: '2 tahun', value: 2 },
                { label: '3 tahun', value: 3 }
              ]"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <div class="flex gap-2">
            <UInput
              v-model="form.promoCode"
              :placeholder="t('order.promoPlaceholder')"
              size="lg"
              class="flex-1"
            />
            <UButton color="neutral" variant="outline" size="lg" type="button" @click="applyPromo">
              {{ t('order.applyPromo') }}
            </UButton>
          </div>

          <UAlert v-if="error" color="error" variant="subtle" :title="error" />

          <UButton
            type="submit"
            color="primary"
            size="lg"
            block
            :loading="loading"
            :disabled="loading || success"
          >
            {{ t('order.pay') }}
          </UButton>
        </form>
      </UCard>

      <UCard class="lg:col-span-2 shadow-soft-md h-fit">
        <h2 class="font-semibold mb-4">
          Ringkasan
        </h2>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-muted">
              Domain
            </dt>
            <dd class="font-mono font-medium">
              {{ domain || '—' }}
            </dd>
          </div>
          <div v-if="template" class="flex justify-between gap-4">
            <dt class="text-muted">
              Template
            </dt>
            <dd>{{ template }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted">
              Subtotal
            </dt>
            <dd class="tabular-nums">
              {{ formatIdr(subtotal) }}
            </dd>
          </div>
          <div v-if="promoDiscount" class="flex justify-between gap-4 text-success">
            <dt>Diskon</dt>
            <dd class="tabular-nums">
              −{{ formatIdr(promoDiscount) }}
            </dd>
          </div>
          <USeparator />
          <div class="flex justify-between gap-4 text-base font-semibold">
            <dt>Total</dt>
            <dd class="tabular-nums">
              {{ formatIdr(total) }}
            </dd>
          </div>
        </dl>
        <UButton
          :to="localePath('/order/choose-domain')"
          color="neutral"
          variant="ghost"
          size="sm"
          class="mt-4"
          icon="i-lucide-arrow-left"
        >
          {{ t('common.back') }}
        </UButton>
      </UCard>
    </div>
  </UContainer>
</template>
