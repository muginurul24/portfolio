<script setup lang="ts">
interface TemplateRow {
  id: string
  slug: string
  name: string
  category: string
  isFeatured?: boolean
}

const { t, locale } = useI18n()
const localePath = useLocalePath()
const appConfig = useAppConfig()

const { data, status } = await useFetch<{ data: TemplateRow[] }>('/api/templates', {
  key: 'home-templates-showcase'
})

const categoryTone: Record<string, string> = {
  export: 'from-sky-600/20 to-slate-800/10',
  agriculture: 'from-emerald-600/20 to-lime-700/10',
  craft: 'from-amber-500/20 to-orange-800/10',
  company: 'from-slate-500/20 to-sky-900/10',
  automotive: 'from-red-600/15 to-slate-800/10',
  restaurant: 'from-orange-500/20 to-rose-800/10',
  service: 'from-violet-500/20 to-sky-800/10',
  ecommerce: 'from-cyan-500/20 to-indigo-800/10'
}

const categoryIcon: Record<string, string> = {
  export: 'i-lucide-ship',
  agriculture: 'i-lucide-sprout',
  craft: 'i-lucide-palette',
  company: 'i-lucide-building-2',
  automotive: 'i-lucide-car',
  restaurant: 'i-lucide-utensils',
  service: 'i-lucide-briefcase',
  ecommerce: 'i-lucide-shopping-bag'
}

const categories = computed(() => [
  { key: 'all', label: t('home.templatesCatAll') },
  { key: 'export', label: t('home.templatesCatExport') },
  { key: 'umkm', label: t('home.templatesCatUmkm') },
  { key: 'ecommerce', label: t('home.templatesCatEcommerce') },
  { key: 'company', label: t('home.templatesCatCompany') },
  { key: 'craft', label: t('home.templatesCatCraft') },
  { key: 'agriculture', label: t('home.templatesCatAgriculture') },
  { key: 'automotive', label: t('home.templatesCatAutomotive') },
  { key: 'restaurant', label: t('home.templatesCatRestaurant') },
  { key: 'service', label: t('home.templatesCatService') }
])

const active = ref('all')

const categoryLabel = computed(() => {
  const map = Object.fromEntries(categories.value.map(c => [c.key, c.label]))
  return (key: string) => map[key] ?? key
})

const filtered = computed(() => {
  const rows = data.value?.data ?? []
  if (active.value === 'all') return rows.slice(0, 8)
  return rows.filter(r => r.category === active.value).slice(0, 8)
})

const fromPriceLabel = computed(() => {
  const amount = appConfig.mugiew?.startingPriceYearlyIdr
  if (!amount) return null
  const price = formatIdr(amount, locale.value === 'en' ? 'en-ID' : 'id-ID')
  return t('templates.fromPrice', { price })
})

function previewTone(category: string) {
  return categoryTone[category?.toLowerCase?.()] || 'from-sky-600/15 to-slate-700/10'
}

function previewIcon(category: string) {
  return categoryIcon[category?.toLowerCase?.()] || 'i-lucide-layout-template'
}
</script>

<template>
  <section id="template" class="section-y bg-default">
    <UContainer>
      <SectionHeading
        index="01"
        :eyebrow="t('home.templatesEyebrow')"
        :title="t('home.templatesTitle')"
        :description="t('home.templatesDesc')"
      />

      <div class="mb-8 flex flex-wrap justify-center gap-2">
        <UButton
          v-for="cat in categories"
          :key="cat.key"
          :color="active === cat.key ? 'primary' : 'neutral'"
          :variant="active === cat.key ? 'solid' : 'outline'"
          size="sm"
          class="cursor-pointer"
          @click="active = cat.key"
        >
          {{ cat.label }}
        </UButton>
      </div>

      <div v-if="status === 'pending'" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <USkeleton v-for="i in 8" :key="i" class="h-64 rounded-xl" />
      </div>

      <div
        v-else-if="filtered.length"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <UCard
          v-for="tpl in filtered"
          :key="tpl.id"
          class="card-lift overflow-hidden h-full flex flex-col"
          :ui="{ body: 'p-0 flex flex-col h-full', root: 'ring-default shadow-soft-md' }"
        >
          <div
            class="aspect-[4/3] bg-gradient-to-br flex items-center justify-center relative"
            :class="previewTone(tpl.category)"
          >
            <div class="size-14 rounded-2xl bg-default/70 backdrop-blur-sm ring-1 ring-default/60 shadow-soft-sm flex items-center justify-center">
              <UIcon
                :name="previewIcon(tpl.category)"
                class="size-7 text-primary"
              />
            </div>
            <UBadge
              v-if="tpl.isFeatured"
              color="primary"
              variant="solid"
              size="sm"
              class="absolute top-3 left-3"
            >
              {{ t('home.featured') }}
            </UBadge>
            <UBadge
              v-else
              color="neutral"
              variant="subtle"
              size="sm"
              class="absolute top-3 left-3"
            >
              {{ categoryLabel(tpl.category) }}
            </UBadge>
          </div>
          <div class="p-4 md:p-5 flex flex-col flex-1">
            <p class="text-xs text-muted uppercase tracking-wide mb-1">
              {{ categoryLabel(tpl.category) }}
            </p>
            <h3 class="font-semibold text-highlighted tracking-tight line-clamp-2">
              {{ tpl.name }}
            </h3>
            <p v-if="fromPriceLabel" class="mt-1.5 text-xs text-muted tabular-nums">
              {{ fromPriceLabel }}
            </p>
            <div class="mt-auto pt-4 flex flex-col gap-2">
              <UButton
                :to="localePath({ path: '/order/choose-domain', query: { template: tpl.slug } })"
                size="sm"
                color="primary"
                block
                class="cursor-pointer"
              >
                {{ t('home.templatesBuild') }}
              </UButton>
              <UButton
                :to="localePath(`/templates/${tpl.slug}`)"
                size="sm"
                color="neutral"
                variant="ghost"
                block
                class="cursor-pointer"
              >
                {{ t('home.templatesView') }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <div
        v-else
        class="py-12 flex flex-col items-center text-center max-w-md mx-auto"
      >
        <div class="size-14 rounded-2xl bg-muted flex items-center justify-center mb-4 shadow-soft-sm">
          <UIcon name="i-lucide-layout-template" class="size-7 text-muted" />
        </div>
        <p class="text-sm text-muted leading-relaxed">
          {{ t('home.templatesEmpty') }}
        </p>
        <UButton
          color="primary"
          variant="outline"
          size="sm"
          class="mt-4 cursor-pointer"
          @click="active = 'all'"
        >
          {{ t('home.templatesCatAll') }}
        </UButton>
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
