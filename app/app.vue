<script setup lang="ts">
const { locale } = useI18n()
const config = useRuntimeConfig()

useHead({
  htmlAttrs: {
    lang: locale
  },
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ]
})

useSeoMeta({
  title: 'MugiewDev',
  description: 'Platform website profesional untuk UMKM & eksportir Indonesia. Template siap pakai, domain, hosting, akademi ekspor, dan komunitas.',
  ogSiteName: config.public.siteName,
  ogType: 'website',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <a href="#main" class="skip-link">
      {{ $t('common.skipToContent') }}
    </a>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
