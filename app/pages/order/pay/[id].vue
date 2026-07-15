<script setup lang="ts">
import QRCode from 'qrcode'
import { formatIdr } from '~/utils/format'

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const toast = useToast()
const { link } = useWhatsApp()

const orderId = computed(() => String(route.params.id || ''))
const payToken = computed(() => {
  const q = route.query.token
  return typeof q === 'string' ? q : Array.isArray(q) ? String(q[0] || '') : ''
})

useSeoMeta({ title: () => t('order.payTitle') })

const qrDataUrl = ref<string | null>(null)
const checking = ref(false)
const now = ref(Date.now())
let pollTimer: ReturnType<typeof setInterval> | null = null
let tickTimer: ReturnType<typeof setInterval> | null = null

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

const remainingMs = computed(() => {
  const exp = pay.value?.expiresAt
  if (!exp) return null
  return new Date(exp).getTime() - now.value
})

const countdownText = computed(() => {
  const ms = remainingMs.value
  if (ms == null) return null
  if (ms <= 0) return '00:00:00'
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map(n => String(n).padStart(2, '0')).join(':')
})

const isExpired = computed(() => {
  const ms = remainingMs.value
  if (ms == null) return false
  return ms <= 0
})

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

const waHref = computed(() => {
  const ref = pay.value?.orderNumber || orderId.value
  const text = ref
    ? t('whatsapp.orderHelpWithId', { orderId: ref })
    : t('whatsapp.orderHelp')
  return link(text)
})

const payTips = computed(() => [
  { icon: 'i-lucide-smartphone', text: t('order.payTip1') },
  { icon: 'i-lucide-scan-line', text: t('order.payTip2') },
  { icon: 'i-lucide-monitor-check', text: t('order.payTip3') }
])

async function checkStatus(navigateOnPaid = true) {
  if (!orderId.value || isExpired.value) return
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
    if (import.meta.client && document.visibilityState === 'visible' && !isExpired.value) {
      void checkStatus(true)
    }
  }, 5000)
}

watch(isExpired, (expired) => {
  if (expired) stopPoll()
})

onMounted(() => {
  tickTimer = setInterval(() => {
    now.value = Date.now()
  }, 1000)

  if (pay.value?.paymentStatus === 'paid' || pay.value?.orderStatus === 'paid') {
    void navigateTo({
      path: localePath('/order/success'),
      query: { order: orderId.value }
    })
    return
  }
  if (!isExpired.value) startPoll()
})

onBeforeUnmount(() => {
  stopPoll()
  if (tickTimer) {
    clearInterval(tickTimer)
    tickTimer = null
  }
})
</script>

<template>
  <div class="bg-mesh-hero min-h-[60vh]">
    <UContainer class="py-10 md:py-16 max-w-lg">
      <OrderStepper :step="2" />

      <div class="text-center mb-8">
        <p class="text-sm font-semibold text-primary tracking-wide uppercase">
          {{ t('order.payEyebrow') }}
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
        class="rounded-2xl ring-1 ring-default/60 bg-default/80 backdrop-blur-sm shadow-soft-md p-8 text-center text-muted"
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
        <!-- Meta + amount -->
        <UCard
          class="glass-panel"
          :ui="{ root: 'shadow-soft-lg rounded-2xl ring-1 ring-default/60' }"
        >
          <div class="space-y-4">
            <div class="space-y-3 text-sm">
              <div class="flex justify-between gap-3">
                <span class="text-muted">{{ t('order.orderNumber') }}</span>
                <span class="font-mono text-highlighted">{{ pay.orderNumber }}</span>
              </div>
              <div
                v-if="pay.domainLabel"
                class="flex justify-between gap-3"
              >
                <span class="text-muted">{{ t('order.domainLabel') }}</span>
                <span class="font-mono text-highlighted">{{ pay.domainLabel }}</span>
              </div>
            </div>

            <div class="rounded-xl bg-muted/30 ring-1 ring-default/40 px-4 py-4 text-center">
              <p class="text-xs font-medium uppercase tracking-wide text-muted">
                {{ t('order.total') }}
              </p>
              <p class="mt-1 text-3xl md:text-4xl font-semibold tracking-tight text-highlighted tabular-nums font-mono">
                {{ formatIdr(pay.totalIdr) }}
              </p>
            </div>

            <div
              v-if="countdownText"
              class="flex items-center justify-between gap-3 text-sm"
            >
              <span class="text-muted flex items-center gap-1.5">
                <UIcon
                  name="i-lucide-timer"
                  class="size-4 shrink-0"
                />
                {{ t('order.countdownLabel') }}
              </span>
              <span
                class="font-mono tabular-nums font-semibold"
                :class="isExpired ? 'text-error' : 'text-highlighted'"
              >
                {{ countdownText }}
              </span>
            </div>
            <p
              v-else-if="expiresLabel"
              class="text-xs text-muted text-right"
            >
              {{ t('order.expiresAt') }}: {{ expiresLabel }}
            </p>
          </div>
        </UCard>

        <!-- Expired recovery -->
        <UAlert
          v-if="isExpired"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :title="t('order.countdownExpired')"
          :description="t('order.countdownExpiredDesc')"
        />

        <UAlert
          v-else-if="!pay.qrisPayload"
          color="warning"
          variant="subtle"
          :title="t('order.qrisMissingTitle')"
          :description="t('order.qrisMissingDesc')"
        />

        <!-- QR + tips -->
        <div
          v-if="pay.qrisPayload"
          class="rounded-2xl ring-1 ring-default/60 bg-default/90 backdrop-blur-sm shadow-soft-md p-6 flex flex-col items-center transition-opacity"
          :class="isExpired ? 'opacity-40 pointer-events-none' : ''"
        >
          <div class="rounded-xl bg-white p-3 shadow-soft-sm ring-1 ring-slate-200/80">
            <img
              v-if="qrDataUrl"
              :src="qrDataUrl"
              :alt="t('order.payEyebrow')"
              width="280"
              height="280"
              class="rounded-lg bg-white block"
            >
            <div
              v-else
              class="size-[280px] flex items-center justify-center text-muted text-sm"
            >
              {{ t('common.loading') }}
            </div>
          </div>

          <p
            v-if="!isExpired"
            class="mt-4 text-sm text-muted text-center max-w-xs"
          >
            {{ t('order.scanHint') }}
          </p>
          <p
            v-if="!isExpired"
            class="mt-1 text-xs text-muted/80 text-center"
          >
            {{ t('order.pollingHint') }}
          </p>
        </div>

        <div
          v-if="pay.qrisPayload && !isExpired"
          class="rounded-2xl ring-1 ring-default/50 bg-default/70 backdrop-blur-sm p-5"
        >
          <h2 class="text-sm font-semibold text-highlighted mb-3 flex items-center gap-2">
            <UIcon
              name="i-lucide-list-checks"
              class="size-4 text-primary"
            />
            {{ t('order.payTipsTitle') }}
          </h2>
          <ul class="space-y-3">
            <li
              v-for="(tip, i) in payTips"
              :key="i"
              class="flex gap-3 text-sm text-muted"
            >
              <span class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UIcon
                  :name="tip.icon"
                  class="size-3.5"
                />
              </span>
              <span class="leading-snug pt-1">{{ tip.text }}</span>
            </li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-2">
          <UButton
            v-if="!isExpired"
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
            :to="waHref"
            color="neutral"
            :variant="isExpired ? 'solid' : 'outline'"
            size="lg"
            block
            class="min-h-12"
            icon="i-lucide-message-circle"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t('order.payHelpWa') }}
          </UButton>

          <UButton
            :to="localePath(isExpired ? '/order/choose-domain' : '/')"
            color="neutral"
            variant="ghost"
            block
            class="min-h-11"
          >
            {{ isExpired ? t('order.chooseDomain') : t('common.back') }}
          </UButton>
        </div>
      </div>
    </UContainer>
  </div>
</template>
