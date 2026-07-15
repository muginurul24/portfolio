<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  description?: string
  primaryLabel?: string
  primaryTo?: string
  primaryExternal?: boolean
  secondaryLabel?: string
  secondaryTo?: string
  secondaryExternal?: boolean
}>(), {
  primaryExternal: false,
  secondaryExternal: false
})

const { t } = useI18n()
const localePath = useLocalePath()
const appConfig = useAppConfig()
const { link } = useWhatsApp()

const discountLabel = computed(() =>
  formatIdr(appConfig.mugiew?.promoDiscountIdr || 500_000)
)

const waHref = computed(() => link(t('whatsapp.consultDefault')))

function isExternalUrl(to: string) {
  return /^https?:\/\//i.test(to)
}

const primary = computed(() => {
  const to = props.primaryTo || localePath('/order/choose-domain')
  const external = props.primaryExternal || isExternalUrl(to)
  return {
    label: props.primaryLabel || t('cta.buildNow'),
    to,
    external,
    icon: external && to.includes('wa.me') ? 'i-simple-icons-whatsapp' : undefined,
    trailingIcon: external ? undefined : 'i-lucide-arrow-right'
  }
})

const secondary = computed(() => {
  const to = props.secondaryTo || waHref.value
  const external = props.secondaryExternal || isExternalUrl(to) || !props.secondaryTo
  return {
    label: props.secondaryLabel || t('cta.consult'),
    to,
    external,
    icon: external && String(to).includes('wa.me') ? 'i-simple-icons-whatsapp' : undefined
  }
})
</script>

<template>
  <section class="section-y bg-mesh-hero border-y border-default">
    <UContainer>
      <UPageCTA
        :title="title || t('serviceLanding.ctaTitle')"
        :description="description || t('serviceLanding.ctaDesc', {
          code: appConfig.mugiew?.promoCode || 'WEBSITEJUARA',
          discount: discountLabel
        })"
        variant="subtle"
        class="shadow-soft-lg ring-1 ring-default"
        :links="[
          {
            label: primary.label,
            to: primary.to,
            target: primary.external ? '_blank' : undefined,
            icon: primary.icon,
            trailingIcon: primary.trailingIcon,
            color: 'primary',
            size: 'xl'
          },
          {
            label: secondary.label,
            to: secondary.to,
            target: secondary.external ? '_blank' : undefined,
            icon: secondary.icon,
            color: 'neutral',
            variant: 'outline',
            size: 'xl'
          }
        ]"
      />
    </UContainer>
  </section>
</template>
