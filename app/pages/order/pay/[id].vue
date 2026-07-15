<script setup lang="ts">
import QRCode from 'qrcode'
import { formatIdr } from '~/utils/format'

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const toast = useToast()

const orderId = computed(() => String(route.params.id || ''))
const payToken = computed(() => {
  const q = route.query.token
  return typeof q === 'string' ? q : Array.isArray(q) ? String(q[0] || '') : ''
})

useSeoMeta({ title: () => t('order.payTitle') })

const qrDataUrl = ref<string | null>(null)
const checking = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null

const { data, status, error, refresh } = await useFetch(
  () => `/api/orders/${orderId.value}/payment`,
  {
    key: () => `order-pay-${orderId.value}-${payToken.value}`,
    query: computed(() => (payToken.value ? { token: payToken.value } : {})),
    watch: [orderId, payToken]
  }
)

const pay = computed(() => data.value?.data)

async function renderQr(payload: string) {
  try {
    qrDataUrl.value = await QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#0F172A', light: '#FFFFFF' }
    })
  } catch {
    qrDataUrl.value = null
  }
}

watch(
  () => pay.value?.qrisPayload,
  async (payload) => {
    if (payload) await renderQr(payload)
    else qrDataUrl.value = null
  },
  { immediate: true }
)

async function checkStatus(navigateOnPaid = true) {
  if (!orderId.value) return
  checking.value = true
  try {
    const res = await $fetch<{
      data: { paid?: boolean, orderStatus?: string, paymentStatus?: string, remoteError?: string }
    }>(`/api/orders/${orderId.value}/payment-status`, {
      query: payToken.value ? { token: payToken.value } : {}
    })
    if (res.data.paid) {
      stopPoll()
      if (navigateOnPaid) {
        await navigateTo({
          path: localePath('/order/success'),
          query: { order: orderId.value }
        })
      }
      return
    }
    await refresh()
    if (res.data.remoteError) {
      // soft: keep pending UI
    }
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: err?.data?.message || err?.statusMessage || t('common.error'),
      color: 'error'
    })
  } finally {
    checking.value = false
  }
}

function stopPoll() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

function startPoll() {
  stopPoll()
  pollTimer = setInterval(() => {
    if (import.meta.client && document.visibilityState === 'visible') {
      void checkStatus(true)
    }
  }, 5000)
}

onMounted(() => {
  if (pay.value?.paymentStatus === 'paid' || pay.value?.orderStatus === 'paid') {
    void navigateTo({
      path: localePath('/order/success'),
      query: { order: orderId.value }
    })
    return
  }
  startPoll()
})

onBeforeUnmount(() => stopPoll())

const expiresLabel = computed(() => {
  const exp = pay.value?.expiresAt
  if (!exp) return null
  try {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(exp))
  } catch {
    return null
  }
})

const isExpired = computed(() => {
  const exp = pay.value?.expiresAt
  if (!exp) return false
  return new Date(exp).getTime() < Date.now()
})
</script>

<template>
  <UContainer class="py-10 md:py-16 max-w-lg">
    <div class="text-center mb-8">
      <p class="text-sm font-semibold text-primary tracking-wide uppercase">
        QRIS
      </p>
      <h1 class="mt-2 text-2xl md:text-3xl font-semibold text-highlighted tracking-tight">
        {{ t('order.payTitle') }}
      </h1>
      <p class="mt-2 text-sm text-muted">
        {{ t('order.paySubtitle') }}
      </p>
    </div>

    <div
      v-if="status === 'pending'"
      class="rounded-2xl ring-1 ring-default bg-default shadow-soft-md p-8 text-center text-muted"
    >
      {{ t('common.loading') }}
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      :title="t('common.error')"
      :description="error.statusMessage || error.message"
      class="mb-4"
    />

    <div
      v-else-if="pay"
      class="space-y-6"
    >
      <UCard :ui="{ root: 'shadow-soft-lg rounded-2xl' }">
        <div class="space-y-3 text-sm">
          <div class="flex justify-between gap-3">
            <span class="text-muted">{{ t('order.orderNumber') }}</span>
            <span class="font-mono text-highlighted">{{ pay.orderNumber }}</span>
          </div>
          <div
            v-if="pay.domainLabel"
            class="flex justify-between gap-3"
          >
            <span class="text-muted">Domain</span>
            <span class="font-mono text-highlighted">{{ pay.domainLabel }}</span>
          </div>
          <div class="flex justify-between gap-3 items-baseline">
            <span class="text-muted">{{ t('order.total') }}</span>
            <span class="text-xl font-semibold text-highlighted tabular-nums">
              {{ formatIdr(pay.totalIdr) }}
            </span>
          </div>
          <div
            v-if="expiresLabel"
            class="flex justify-between gap-3 text-xs"
          >
            <span class="text-muted">{{ t('order.expiresAt') }}</span>
            <span :class="isExpired ? 'text-error' : 'text-muted'">{{ expiresLabel }}</span>
          </div>
        </div>
      </UCard>

      <UAlert
        v-if="!pay.qrisPayload"
        color="warning"
        variant="subtle"
        :title="t('order.qrisMissingTitle')"
        :description="t('order.qrisMissingDesc')"
      />

      <div
        v-else
        class="rounded-2xl ring-1 ring-default bg-default shadow-soft-md p-6 flex flex-col items-center"
      >
        <img
          v-if="qrDataUrl"
          :src="qrDataUrl"
          alt="QRIS"
          width="280"
          height="280"
          class="rounded-lg bg-white"
        >
        <p class="mt-4 text-sm text-muted text-center max-w-xs">
          {{ t('order.scanHint') }}
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <UButton
          color="primary"
          size="lg"
          block
          class="min-h-12 shadow-glow-sky"
          :loading="checking"
          icon="i-lucide-refresh-cw"
          @click="checkStatus(true)"
        >
          {{ t('order.iAlreadyPaid') }}
        </UButton>
        <UButton
          :to="localePath('/')"
          color="neutral"
          variant="ghost"
          block
          class="min-h-11"
        >
          {{ t('common.back') }}
        </UButton>
      </div>
    </div>
  </UContainer>
</template>
