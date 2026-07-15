<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { link } = useWhatsApp()

const statusCode = computed(() => Number(props.error?.statusCode) || 500)

const title = computed(() => {
  if (statusCode.value === 404) return t('error.notFoundTitle')
  if (statusCode.value === 403) return t('error.forbiddenTitle')
  if (statusCode.value >= 500) return t('error.serverTitle')
  return t('error.defaultTitle')
})

const description = computed(() => {
  if (statusCode.value === 404) return t('error.notFoundDesc')
  if (statusCode.value === 403) return t('error.forbiddenDesc')
  if (statusCode.value >= 500) return t('error.serverDesc')
  return props.error?.statusMessage || t('error.defaultDesc')
})

const icon = computed(() => {
  if (statusCode.value === 404) return 'i-lucide-search-x'
  if (statusCode.value === 403) return 'i-lucide-shield-off'
  return 'i-lucide-triangle-alert'
})

const waHref = computed(() => link(t('whatsapp.consultDefault')))

function go(path: string) {
  clearError({ redirect: localePath(path) })
}
</script>

<template>
  <div class="min-h-dvh flex items-center justify-center bg-muted/40 p-4">
    <div class="w-full max-w-lg glass-panel shadow-soft-lg rounded-2xl p-8 md:p-10 text-center">
      <div class="inline-flex size-16 items-center justify-center rounded-2xl bg-error/10 text-error mb-6">
        <UIcon
          :name="icon"
          class="size-8"
        />
      </div>
      <p class="text-sm font-semibold text-error tracking-wide uppercase mb-2">
        {{ statusCode }}
      </p>
      <h1 class="text-display text-3xl text-highlighted">
        {{ title }}
      </h1>
      <p class="mt-3 text-muted leading-relaxed">
        {{ description }}
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <UButton
          color="primary"
          size="lg"
          class="min-h-11 shadow-glow-sky"
          @click="go('/')"
        >
          {{ t('error.goHome') }}
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          class="min-h-11"
          @click="go('/templates')"
        >
          {{ t('error.goTemplates') }}
        </UButton>
        <UButton
          :to="waHref"
          external
          target="_blank"
          rel="noopener noreferrer"
          color="neutral"
          variant="ghost"
          size="lg"
          icon="i-simple-icons-whatsapp"
          class="min-h-11"
        >
          {{ t('error.contactWa') }}
        </UButton>
      </div>
    </div>
  </div>
</template>
