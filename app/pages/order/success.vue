<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { link } = useWhatsApp()
const { loggedIn } = useUserSession()

useSeoMeta({ title: () => t('order.successTitle') })

const orderId = computed(() => String(route.query.order || ''))

const waHref = computed(() => {
  const text = orderId.value
    ? t('whatsapp.orderHelpWithId', { orderId: orderId.value })
    : t('whatsapp.orderHelp')
  return link(text)
})

const panelHref = computed(() =>
  loggedIn.value ? localePath('/panel') : localePath('/login')
)
</script>

<template>
  <UContainer class="py-10 md:py-16 max-w-xl">
    <UCard class="shadow-soft-md text-center">
      <div class="flex justify-center mb-4">
        <div class="size-14 rounded-full bg-success/10 flex items-center justify-center">
          <UIcon name="i-lucide-check-circle" class="size-8 text-success" />
        </div>
      </div>

      <h1 class="text-2xl font-semibold text-highlighted tracking-tight">
        {{ t('order.successTitle') }}
      </h1>
      <p class="mt-2 text-muted">
        {{ t('order.successDesc') }}
      </p>

      <div
        v-if="orderId"
        class="mt-6 rounded-lg bg-muted/50 px-4 py-3 text-left"
      >
        <p class="text-xs text-muted uppercase tracking-wide">
          {{ t('order.orderId') }}
        </p>
        <p class="mt-1 font-mono text-sm font-medium break-all">
          {{ orderId }}
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
</template>
