<script setup lang="ts">
import { useOrderStore } from '~/stores/order'

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const orderStore = useOrderStore()
const { link } = useWhatsApp()
const { user, loggedIn } = useUserSession()

useSeoMeta({ title: () => t('order.checkout') })

interface PackageRow {
  id: string
  slug: string
  name: string
  priceYearlyIdr: number
  serviceType: string
}

const { data: packagesRes } = await useFetch<{ data: PackageRow[] }>(
  '/api/packages',
  { key: 'order-packages' }
)

const packages = computed(() => packagesRes.value?.data ?? [])

const form = reactive({
  name: '',
  email: '',
  phone: '',
  promoCode: orderStore.promoCode || '',
  termYears: orderStore.termYears || 1,
  packageId: orderStore.packageId || 'pkg_export_1y'
})

if (import.meta.client && loggedIn.value && user.value) {
  const u = user.value as { name?: string, email?: string, phone?: string }
  if (!form.name && u.name) form.name = u.name
  if (!form.email && u.email) form.email = u.email
  if (!form.phone && u.phone) form.phone = u.phone
}

const domainFromQuery = computed(() => String(route.query.domain || orderStore.fullDomain || ''))
const template = computed(() => String(route.query.template || orderStore.templateSlug || ''))

/** Split full domain into name + tld; prefer store; handle multi-part TLD (co.id). */
function parseDomainParts(full: string): { name: string, tld: string } {
  if (orderStore.domainName && orderStore.domainTld) {
    return { name: orderStore.domainName, tld: orderStore.domainTld }
  }
  const raw = full.trim().toLowerCase().replace(/^\.+/, '')
  if (!raw) return { name: '', tld: 'com' }

  const knownTlds = ['co.id', 'com', 'id', 'net', 'org']
  for (const tld of knownTlds) {
    if (raw.endsWith(`.${tld}`)) {
      const name = raw.slice(0, -(tld.length + 1))
      if (name) return { name, tld }
    }
  }
  const idx = raw.lastIndexOf('.')
  if (idx > 0) {
    return { name: raw.slice(0, idx), tld: raw.slice(idx + 1) }
  }
  return { name: raw, tld: 'com' }
}

const domainParts = computed(() => parseDomainParts(domainFromQuery.value))

const selectedPackage = computed(() =>
  packages.value.find(p => p.id === form.packageId)
  || packages.value.find(p => p.id === 'pkg_export_1y')
  || packages.value[0]
)

const basePrice = computed(() => selectedPackage.value?.priceYearlyIdr ?? 1_247_000)
const promoDiscount = ref(0)
const promoPercent = ref<number | null>(null)
const promoAppliedCode = ref('')
const loading = ref(false)
const promoLoading = ref(false)
const error = ref('')

const termYearsNum = computed(() => {
  const n = Number(form.termYears)
  return (n === 2 || n === 3 ? n : 1) as 1 | 2 | 3
})

const subtotal = computed(() => basePrice.value * termYearsNum.value)

const effectivePromoDiscount = computed(() => {
  if (promoDiscount.value > 0) return Math.min(promoDiscount.value, subtotal.value)
  if (promoPercent.value != null && promoPercent.value > 0) {
    return Math.min(Math.floor((subtotal.value * promoPercent.value) / 100), subtotal.value)
  }
  return 0
})

const total = computed(() => Math.max(0, subtotal.value - effectivePromoDiscount.value))

const termItems = computed(() => [
  { label: t('order.termYears', { n: 1 }), value: 1 },
  { label: t('order.termYears', { n: 2 }), value: 2 },
  { label: t('order.termYears', { n: 3 }), value: 3 }
])

const packageItems = computed(() =>
  packages.value.map(p => ({
    label: `${p.name} — ${formatIdr(p.priceYearlyIdr)}${t('order.perYearShort')}`,
    value: p.id
  }))
)

watch(() => form.termYears, () => {
  // percent promo recalculates via computed; fixed IDR stays
})

watch(() => form.packageId, (id) => {
  if (id) orderStore.setPackage(id)
})

onMounted(() => {
  if (route.query.failed === '1') {
    error.value = t('order.paymentFailed')
  }
  // hydrate store from query if empty
  if (!orderStore.domainName && domainParts.value.name) {
    orderStore.setDomain(domainParts.value.name, domainParts.value.tld)
  }
  if (template.value) orderStore.setTemplate(template.value)
})

async function applyPromo() {
  error.value = ''
  const code = form.promoCode.trim()
  if (!code) {
    promoDiscount.value = 0
    promoPercent.value = null
    promoAppliedCode.value = ''
    return
  }
  promoLoading.value = true
  try {
    const r = await $fetch<{
      valid: boolean
      discountIdr: number
      discountPercent: number | null
      code: string
    }>('/api/promo/validate', {
      method: 'POST',
      body: { code, subtotalIdr: subtotal.value }
    })
    if (r.valid) {
      promoDiscount.value = r.discountIdr || 0
      promoPercent.value = r.discountPercent
      promoAppliedCode.value = r.code
      orderStore.setPromoCode(r.code)
    } else {
      promoDiscount.value = 0
      promoPercent.value = null
      promoAppliedCode.value = ''
      error.value = t('order.promoInvalid')
    }
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    promoDiscount.value = 0
    promoPercent.value = null
    promoAppliedCode.value = ''
    error.value = err?.data?.message || err?.statusMessage || t('common.error')
  } finally {
    promoLoading.value = false
  }
}

async function submit() {
  error.value = ''
  const parts = domainParts.value
  if (!parts.name || !parts.tld) {
    error.value = t('order.domainMissing')
    return
  }
  if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
    error.value = t('order.formIncomplete')
    return
  }

  loading.value = true
  try {
    orderStore.setDomain(parts.name, parts.tld)
    orderStore.setTermYears(termYearsNum.value)
    orderStore.setPackage(form.packageId || 'pkg_export_1y')
    if (form.promoCode.trim()) orderStore.setPromoCode(form.promoCode.trim())

    const res = await $fetch<{
      data: {
        id: string
        orderNumber?: string
        paymentUrl: string | null
        totalIdr: number
        status?: string
      }
    }>('/api/orders', {
      method: 'POST',
      body: {
        packageId: form.packageId || 'pkg_export_1y',
        templateSlug: template.value || undefined,
        domainName: parts.name,
        domainTld: parts.tld,
        termYears: termYearsNum.value,
        promoCode: form.promoCode.trim() || undefined,
        customerName: form.name.trim(),
        customerEmail: form.email.trim(),
        customerPhone: form.phone.trim()
      }
    })

    const totalIdr = res.data.totalIdr ?? 0
    const paymentUrl = res.data.paymentUrl

    // Paid path: must have gateway URL. Free (0) may go success without URL.
    if (paymentUrl) {
      await navigateTo(paymentUrl, { external: true })
      return
    }

    if (totalIdr > 0) {
      const ref = res.data.orderNumber || res.data.id
      error.value = t('order.paymentUnavailable', { order: ref })
      return
    }

    await navigateTo({
      path: localePath('/order/success'),
      query: { order: res.data.id }
    })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string, statusMessage?: string }, statusMessage?: string }
    error.value = err?.data?.message || err?.data?.statusMessage || err?.statusMessage || t('common.error')
  } finally {
    loading.value = false
  }
}

const waHref = computed(() => link(t('whatsapp.orderHelp')))
</script>

<template>
  <UContainer class="py-10 md:py-16 max-w-3xl">
    <div class="mb-8">
      <UBadge color="primary" variant="subtle" class="mb-3">
        {{ t('order.stepOf', { step: '2–3', total: 3 }) }}
      </UBadge>
      <h1 class="text-3xl font-semibold text-highlighted tracking-tight">
        {{ t('order.checkout') }}
      </h1>
    </div>

    <div class="grid gap-6 lg:grid-cols-5">
      <UCard class="lg:col-span-3 shadow-soft-md">
        <h2 class="font-semibold mb-4">
          {{ t('order.personalData') }}
        </h2>
        <UAlert
          v-if="!loggedIn"
          color="warning"
          variant="subtle"
          class="mb-4"
          icon="i-lucide-user-round"
          :title="t('order.loginRecommendedTitle')"
          :description="t('order.loginRecommendedDesc')"
        >
          <template #actions>
            <UButton
              :to="localePath({ path: '/login', query: { redirect: route.fullPath } })"
              color="warning"
              variant="soft"
              size="sm"
            >
              {{ t('auth.login') }}
            </UButton>
          </template>
        </UAlert>

        <form class="space-y-4" @submit.prevent="submit">
          <UFormField :label="t('auth.name')" required>
            <UInput v-model="form.name" size="lg" class="w-full" required autocomplete="name" />
          </UFormField>
          <UFormField :label="t('auth.email')" required>
            <UInput
              v-model="form.email"
              type="email"
              size="lg"
              class="w-full"
              required
              autocomplete="email"
            />
          </UFormField>
          <UFormField :label="t('auth.phone')" required>
            <UInput
              v-model="form.phone"
              type="tel"
              size="lg"
              class="w-full"
              required
              autocomplete="tel"
            />
          </UFormField>

          <UFormField v-if="packageItems.length" :label="t('order.choosePackage')">
            <USelect
              v-model="form.packageId"
              :items="packageItems"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('order.duration')">
            <USelect
              v-model="form.termYears"
              :items="termItems"
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
            <UButton
              color="neutral"
              variant="outline"
              size="lg"
              type="button"
              :loading="promoLoading"
              @click="applyPromo"
            >
              {{ t('order.applyPromo') }}
            </UButton>
          </div>

          <UAlert v-if="error" color="error" variant="subtle" :title="error" icon="i-lucide-alert-circle" />

          <UButton
            type="submit"
            color="primary"
            size="lg"
            block
            :loading="loading"
            :disabled="loading"
            icon="i-lucide-credit-card"
          >
            {{ t('order.pay') }}
          </UButton>
        </form>
      </UCard>

      <UCard class="lg:col-span-2 shadow-soft-md h-fit">
        <h2 class="font-semibold mb-4">
          {{ t('order.summary') }}
        </h2>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-muted">
              {{ t('order.domainLabel') }}
            </dt>
            <dd class="font-mono font-medium">
              {{ domainFromQuery || '—' }}
            </dd>
          </div>
          <div v-if="template" class="flex justify-between gap-4">
            <dt class="text-muted">
              {{ t('order.templateLabel') }}
            </dt>
            <dd>{{ template }}</dd>
          </div>
          <div v-if="selectedPackage" class="flex justify-between gap-4">
            <dt class="text-muted">
              {{ t('order.packageLabel') }}
            </dt>
            <dd class="text-right">
              {{ selectedPackage.name }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted">
              {{ t('order.subtotal') }}
            </dt>
            <dd class="tabular-nums">
              {{ formatIdr(subtotal) }}
            </dd>
          </div>
          <div v-if="effectivePromoDiscount" class="flex justify-between gap-4 text-success">
            <dt>
              {{ t('order.discount') }}
              <span v-if="promoAppliedCode" class="text-muted font-normal">
                ({{ promoAppliedCode }})
              </span>
            </dt>
            <dd class="tabular-nums">
              −{{ formatIdr(effectivePromoDiscount) }}
            </dd>
          </div>
          <USeparator />
          <div class="flex justify-between gap-4 text-base font-semibold">
            <dt>{{ t('order.total') }}</dt>
            <dd class="tabular-nums">
              {{ formatIdr(total) }}
            </dd>
          </div>
        </dl>
        <p class="mt-3 text-xs text-muted">
          {{ t('order.serverRecomputeNote') }}
        </p>
        <UButton
          :to="localePath({
            path: '/order/choose-domain',
            query: template ? { template } : {}
          })"
          color="neutral"
          variant="ghost"
          size="sm"
          class="mt-4"
          icon="i-lucide-arrow-left"
        >
          {{ t('common.back') }}
        </UButton>
        <UButton
          :to="waHref"
          target="_blank"
          rel="noopener"
          color="neutral"
          variant="link"
          size="sm"
          class="mt-1"
          icon="i-lucide-message-circle"
          external
        >
          {{ t('order.contactSupport') }}
        </UButton>
      </UCard>
    </div>
  </UContainer>
</template>
