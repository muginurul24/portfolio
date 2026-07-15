<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const { data, status } = await useFetch('/api/templates', {
  key: 'home-templates-showcase'
})

const items = computed(() => (data.value?.data ?? []).slice(0, 8))
</script>

<template>
  <section class="section-y bg-default">
    <UContainer>
      <SectionHeading
        :eyebrow="t('home.templatesEyebrow')"
        :title="t('home.templatesTitle')"
        :description="t('home.templatesDesc')"
      />
      <div v-if="status === 'pending'" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <USkeleton v-for="i in 4" :key="i" class="h-48 rounded-xl" />
      </div>
      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NuxtLink
          v-for="tpl in items"
          :key="tpl.id"
          :to="localePath(`/templates/${tpl.slug}`)"
          class="group block cursor-pointer"
        >
          <UCard class="card-lift overflow-hidden h-full" :ui="{ body: 'p-0' }">
            <div class="aspect-[4/3] bg-muted flex items-center justify-center relative">
              <UIcon
                name="i-lucide-layout-template"
                class="size-10 text-muted group-hover:text-primary transition-colors"
              />
              <UBadge
                v-if="tpl.isFeatured"
                color="primary"
                variant="solid"
                size="sm"
                class="absolute top-3 left-3"
              >
                {{ t('home.featured') }}
              </UBadge>
            </div>
            <div class="p-4">
              <p class="text-xs text-muted uppercase tracking-wide mb-1">
                {{ tpl.category }}
              </p>
              <h3 class="font-semibold text-highlighted group-hover:text-primary transition-colors">
                {{ tpl.name }}
              </h3>
            </div>
          </UCard>
        </NuxtLink>
      </div>
      <div class="mt-10 text-center">
        <UButton
          :to="localePath('/templates')"
          color="primary"
          variant="outline"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ t('cta.viewTemplates') }}
        </UButton>
      </div>
    </UContainer>
  </section>
</template>
