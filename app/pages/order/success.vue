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
    // Unauthenticated: never claim paid — neutral pending confirmation only
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

const waHref = computed(() => {
  const ref = orderNumber.value || orderId.value
  const text = ref
    ? t('whatsapp.orderHelpWithId', { orderId: ref })
    : t('whatsapp.orderHelp')
  return link(text)
})

const panelHref = computed(() =>
  loggedIn.value ? localePath('/panel') : localePath('/login')
)
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
            {{ orderNumber || orderId }}
          </p>
          <p
            v-if="orderStatus"
            class="mt-2 text-xs text-muted"
          >
            {{ t('order.statusLabel') }}:
            <span class="font-medium text-highlighted">{{ orderStatus }}</span>
          </p>
          <p
            v-else-if="isPending"
            class="mt-2 text-xs text-muted"
          >
            {{ t('order.statusLabel') }}:
            <span class="font-medium text-highlighted">pending_payment</span>
          </p>
        </div>

        <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <UButton
            :to="panelHref"
            color="primary"
            size="lg"
            icon="i-lucide-layout-dashboard"
          >
            {{ loggedIn ? t('order.goToPanel') : t('auth.login') }}
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

        <UButton
          :to="localePath('/')"
          color="neutral"
          variant="ghost"
          size="sm"
          class="mt-6"
          icon="i-lucide-home"
        >
          {{ t('order.backHome') }}
        </UButton>
      </UCard>
    </UContainer>
  </div>
</template>
