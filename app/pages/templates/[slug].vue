<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const slug = computed(() => String(route.params.slug))

const { data, error } = await useFetch(() => `/api/templates/${slug.value}`, {
  key: () => `template-${slug.value}`
})

const tpl = computed(() => data.value?.data)
useSeoMeta({
  title: () => tpl.value?.name || t('nav.templates'),
  description: () => tpl.value?.description || undefined
})
</script>

<template>
  <UContainer class="py-10 md:py-16">
    <UAlert v-if="error" color="error" title="Template tidak ditemukan" />
    <template v-else-if="tpl">
      <div class="grid gap-8 lg:grid-cols-2">
        <div class="aspect-[4/3] rounded-xl bg-muted flex items-center justify-center shadow-soft-md">
          <UIcon name="i-lucide-layout-template" class="size-16 text-muted" />
        </div>
        <div>
          <UBadge class="mb-3">
            {{ tpl.category }}
          </UBadge>
          <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
            {{ tpl.name }}
          </h1>
          <p v-if="tpl.description" class="mt-3 text-muted">
            {{ tpl.description }}
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton
              color="primary"
              size="lg"
              :to="localePath({ path: '/order/choose-domain', query: { template: tpl.slug } })"
            >
              {{ t('cta.buildNow') }}
            </UButton>
            <UButton
              v-if="tpl.demoUrl"
              color="neutral"
              variant="outline"
              size="lg"
              :to="tpl.demoUrl"
              target="_blank"
              external
            >
              Preview
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UContainer>
</template>
