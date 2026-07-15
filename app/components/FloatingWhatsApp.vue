<script setup lang="ts">
const { t } = useI18n()
const { link } = useWhatsApp()
const route = useRoute()
const hidden = computed(() => route.path.includes('/order/pay'))
const href = computed(() => link(t('whatsapp.consultDefault')))
</script>

<template>
  <a
    v-if="!hidden"
    :href="href"
    target="_blank"
    rel="noopener"
    class="fixed bottom-5 right-5 z-40 flex size-14 min-h-12 min-w-12 items-center justify-center rounded-full bg-green-600 text-white shadow-soft-xl hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
    :aria-label="t('whatsapp.floatingLabel')"
  >
    <UIcon name="i-simple-icons-whatsapp" class="size-7" />
  </a>
</template>
