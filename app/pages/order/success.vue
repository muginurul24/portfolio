<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { link } = useWhatsApp()
const { loggedIn } = useUserSession()

useSeoMeta({ title: () => t('order.successTitle') })

const orderId = computed(() => String(route.query.order || ''))

type OrderRow = {
  id: string
  orderNumber?: string
  status: string
  totalIdr?: number
}

const orderStatus = ref<string | null>(null)
const orderNumber = ref('')
const fetchError = ref(false)
const loadingOrder = ref(false)

const paidLike = new Set(['paid', 'provisioning', 'active'])
const pendingLike = new Set(['pending_payment', 'draft'])

const isPaid = computed(() => orderStatus.value != null && paidLike.has(orderStatus.value))
const isActive = computed(() => orderStatus.value === 'active')
const isPending = computed(() =>
  orderStatus.value == null
    ? Boolean(orderId.value)
    : pendingLike.has(orderStatus.value)
)

if (orderId.value) {
  if (loggedIn.value) {
    loadingOrder.value = true
    const { data, error } = await useFetch<{ data: OrderRow }>(
      `/api/orders/${orderId.value}`,
      { key: `order-success-${orderId.value}` }
    )
    loadingOrder.value = false
    if (error.value || !data.value?.data) {
      fetchError.value = true
      orderStatus.value = null
    } else {
      orderStatus.value = data.value.data.status
      orderNumber.value = data.value.data.orderNumber || data.value.data.id
    }
  } else {
    // Unauthenticated: never claim paid - neutral pending confirmation only
    orderStatus.value = null
  }
}

const title = computed(() => {
  if (isPaid.value) return t('order.successTitlePaid')
  return t('order.successTitlePending')
})

const description = computed(() => {
  if (isPaid.value) return t('order.successDescPaid')
  if (!loggedIn.value && orderId.value) return t('order.successDescGuestPending')
  if (fetchError.value) return t('order.successDescUnknown')
  return t('order.successDescPending')
})

const statusIcon = computed(() =>
  isPaid.value ? 'i-lucide-check-circle' : 'i-lucide-clock'
)

const statusColorClass = computed(() =>
  isPaid.value ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
)

function humanStatus(status: string | null) {
  if (!status) {
    return t('panel.statusPendingPayment')
  }
  const map: Record<string, string> = {
    draft: t('panel.statusDraft'),
    pending_payment: t('panel.statusPendingPayment'),
    paid: t('panel.statusPaid'),
    provisioning: t('panel.statusProvisioning'),
    active: t('panel.statusActive'),
    cancelled: t('panel.statusCancelled'),
    expired: t('panel.statusExpired')
  }
  return map[status] || status
}

type TimelineState = 'done' | 'current' | 'muted'

const timelineSteps = computed(() => {
  const paidDone = isPaid.value
  const liveDone = isActive.value
  const provisionState: TimelineState = liveDone
    ? 'done'
    : paidDone
      ? 'current'
      : 'muted'
  const paidState: TimelineState = paidDone ? 'done' : isPending.value ? 'current' : 'muted'
  const liveState: TimelineState = liveDone ? 'done' : 'muted'

  return [
    {
      key: 'paid',
      title: t('order.nextPaid'),
      detail: null as string | null,
      state: paidState,
      icon: paidDone ? 'i-lucide-check' : 'i-lucide-wallet'
    },
    {
      key: 'provision',
      title: t('order.nextProvision'),
      detail: t('order.nextProvisionEta'),
      state: provisionState,
      icon: liveDone ? 'i-lucide-check' : 'i-lucide-wrench'
    },
    {
      key: 'live',
      title: t('order.nextLive'),
      detail: null as string | null,
      state: liveState,
      icon: liveDone ? 'i-lucide-check' : 'i-lucide-globe'
    }
  ]
})

const displayOrderRef = computed(() => orderNumber.value || orderId.value)

const waHref = computed(() => {
  const ref = displayOrderRef.value
  const text = ref
    ? t('whatsapp.orderHelpWithId', { orderId: ref })
    : t('whatsapp.orderHelp')
  return link(text)
})

const panelHref = computed(() => {
  if (!loggedIn.value) return localePath('/login')
  return localePath('/panel/orders')
})

const panelLabel = computed(() =>
  loggedIn.value ? t('order.openPanel') : t('auth.login')
)

const orderAgainHref = computed(() => localePath('/order/choose-domain'))
</script>

<template>
  <div class="bg-mesh-hero min-h-[60vh]">
    <UContainer class="py-10 md:py-16 max-w-3xl">
      <OrderStepper :step="3" />

      <UCard
        class="mx-auto max-w-xl text-center glass-panel"
        :ui="{ root: 'shadow-soft-md ring-1 ring-default/60' }"
      >
        <div class="flex justify-center mb-4">
          <div
            class="size-14 rounded-full flex items-center justify-center"
            :class="statusColorClass"
          >
            <UIcon :name="statusIcon" class="size-8" />
          </div>
        </div>

        <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
          {{ title }}
        </h1>
        <p class="mt-2 text-muted">
          {{ description }}
        </p>

        <div
          v-if="orderId"
          class="mt-6 rounded-xl bg-muted/40 px-4 py-3 text-left ring-1 ring-default/50"
        >
          <p class="text-xs text-muted uppercase tracking-wide">
            {{ t('order.orderId') }}
          </p>
          <p class="mt-1 font-mono text-sm font-medium break-all">
            {{ displayOrderRef }}
          </p>
          <p class="mt-1 text-xs text-muted">
            {{ t('order.saveOrderNumber') }}
          </p>
          <p
            v-if="orderStatus || isPending"
            class="mt-2 text-xs text-muted"
          >
            {{ t('order.statusLabel') }}:
            <span class="font-medium text-highlighted">{{ humanStatus(orderStatus) }}</span>
          </p>
        </div>

        <!-- Next-steps SLA timeline -->
        <div class="mt-8 text-left">
          <h2 class="text-sm font-semibold text-highlighted tracking-tight">
            {{ t('order.nextStepsTitle') }}
          </h2>
          <ol class="mt-4 space-y-0">
            <li
              v-for="(step, index) in timelineSteps"
              :key="step.key"
              class="relative flex gap-3"
            >
              <div class="flex flex-col items-center">
                <div
                  class="relative z-[1] flex size-9 shrink-0 items-center justify-center rounded-full ring-1"
                  :class="{
                    'bg-success text-white ring-success/30': step.state === 'done',
                    'bg-primary text-white ring-primary/40 shadow-glow-sky': step.state === 'current',
                    'bg-muted/60 text-muted ring-default/60': step.state === 'muted'
                  }"
                >
                  <span
                    v-if="step.state === 'current'"
                    class="absolute inset-0 rounded-full bg-primary/30 animate-ping"
                    aria-hidden="true"
                  />
                  <UIcon :name="step.icon" class="relative size-4" />
                </div>
                <div
                  v-if="index < timelineSteps.length - 1"
                  class="w-px flex-1 min-h-6 my-1"
                  :class="step.state === 'done' ? 'bg-success/40' : 'bg-default/80'"
                  aria-hidden="true"
                />
              </div>
              <div
                class="glass-panel flex-1 rounded-xl px-3 py-2.5 mb-3 shadow-soft-sm"
                :class="{
                  'opacity-100': step.state !== 'muted',
                  'opacity-60': step.state === 'muted'
                }"
              >
                <p
                  class="text-sm font-medium"
                  :class="step.state === 'muted' ? 'text-muted' : 'text-highlighted'"
                >
                  {{ step.title }}
                </p>
                <p
                  v-if="step.detail"
                  class="mt-0.5 text-xs text-muted"
                >
                  {{ step.detail }}
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <UButton
            :to="panelHref"
            color="primary"
            size="lg"
            icon="i-lucide-layout-dashboard"
          >
            {{ panelLabel }}
          </UButton>
          <UButton
            :to="waHref"
            color="neutral"
            variant="outline"
            size="lg"
            icon="i-lucide-message-circle"
            target="_blank"
            rel="noopener"
            external
          >
            {{ t('order.contactSupport') }}
          </UButton>
        </div>

        <div class="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
          <UButton
            :to="orderAgainHref"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-lucide-plus"
          >
            {{ t('order.orderAgain') }}
          </UButton>
          <UButton
            :to="localePath('/')"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-home"
          >
            {{ t('order.backHome') }}
          </UButton>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>
