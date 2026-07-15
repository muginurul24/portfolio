<script setup lang="ts">
const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const { number: waNumber, link } = useWhatsApp()

const supportEmail = computed(() => String(config.public.supportEmail || 'support@mugiewdev.com'))

function formatWaDisplay(raw: unknown) {
  // runtimeConfig / env can be non-string under HMR — coerce first
  const s = String(raw ?? '').trim()
  if (!s) return ''
  const digits = s.replace(/\D/g, '')
  if (!digits) return s
  if (digits.startsWith('62') && digits.length >= 11) {
    return `+62 ${digits.slice(2, 5)}-${digits.slice(5, 9)}-${digits.slice(9)}`
  }
  return s.startsWith('+') ? s : `+${digits}`
}

const waDisplay = computed(() => formatWaDisplay(waNumber.value))

const serviceItems = computed(() => [
  { label: t('services.export'), to: localePath('/jasa-pembuatan-website-ekspor'), icon: 'i-lucide-globe' },
  { label: t('services.umkm'), to: localePath('/jasa-pembuatan-website-umkm'), icon: 'i-lucide-store' },
  { label: t('services.ecommerce'), to: localePath('/jasa-pembuatan-website-toko-online'), icon: 'i-lucide-shopping-cart' },
  { label: t('services.custom'), to: localePath('/jasa-pembuatan-website-custom'), icon: 'i-lucide-sparkles' }
])

const navItems = computed(() => [
  { label: t('nav.templates'), to: localePath('/templates') },
  {
    label: t('nav.services'),
    children: serviceItems.value
  },
  { label: t('nav.academy'), to: localePath('/academy') },
  { label: t('nav.portfolio'), to: localePath('/portofolio') },
  { label: t('nav.community'), to: localePath('/komunitas') },
  { label: t('nav.blog'), to: localePath('/blog') },
  { label: t('nav.faq'), to: localePath('/faq') }
])

const year = new Date().getFullYear()

interface FooterLink {
  label: string
  to: string
  icon?: string
  target?: '_blank'
}

interface FooterColumn {
  label: string
  children: FooterLink[]
}

const footerColumns = computed((): FooterColumn[] => [
  {
    label: t('footer.products'),
    children: [
      { label: t('nav.templates'), to: localePath('/templates') },
      { label: t('services.export'), to: localePath('/jasa-pembuatan-website-ekspor') },
      { label: t('services.umkm'), to: localePath('/jasa-pembuatan-website-umkm') },
      { label: t('services.ecommerce'), to: localePath('/jasa-pembuatan-website-toko-online') },
      { label: t('services.custom'), to: localePath('/jasa-pembuatan-website-custom') }
    ]
  },
  {
    label: t('footer.resources'),
    children: [
      { label: t('nav.blog'), to: localePath('/blog') },
      { label: t('nav.tutorial'), to: localePath('/tutorial') },
      { label: t('nav.faq'), to: localePath('/faq') },
      { label: t('nav.academy'), to: localePath('/academy') },
      { label: t('nav.community'), to: localePath('/komunitas') }
    ]
  },
  {
    label: t('footer.contact'),
    children: [
      {
        label: supportEmail.value,
        to: `mailto:${supportEmail.value}`,
        icon: 'i-lucide-mail'
      },
      {
        label: waDisplay.value || String(waNumber.value || ''),
        to: link(),
        target: '_blank',
        icon: 'i-simple-icons-whatsapp'
      }
    ]
  },
  {
    label: t('footer.legal'),
    children: [
      { label: t('footer.terms'), to: localePath('/legal/syarat-ketentuan') },
      { label: t('footer.privacy'), to: localePath('/legal/kebijakan-privasi') },
      { label: t('footer.refund'), to: localePath('/legal/kebijakan-pengembalian') }
    ]
  }
])

const availableLocales = computed(() =>
  (locales.value as Array<{ code: string, name: string }>).filter(l => l.code !== locale.value)
)

const waHref = computed(() => link())
</script>

<template>
  <div class="min-h-dvh flex flex-col bg-default">
    <PromoBanner />

    <UHeader :ui="{ root: 'sticky top-0 z-40 border-b border-default/70 glass-panel' }">
      <template #left>
        <NuxtLink :to="localePath('/')" class="inline-flex items-center cursor-pointer" :aria-label="t('brand.name')">
          <AppLogo class="h-6 w-auto shrink-0" />
        </NuxtLink>
      </template>

      <UNavigationMenu :items="navItems" class="hidden lg:flex" />

      <template #right>
        <UColorModeButton />

        <UDropdownMenu
          :items="availableLocales.map(l => ({
            label: l.name,
            onSelect: () => setLocale(l.code as 'id' | 'en')
          }))"
        >
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-languages"
            :aria-label="t('common.switchLanguage')"
            size="sm"
          />
        </UDropdownMenu>

        <UButton
          :to="localePath('/login')"
          color="neutral"
          variant="ghost"
          class="hidden sm:inline-flex"
        >
          {{ t('nav.login') }}
        </UButton>

        <UButton
          :to="localePath('/order/choose-domain')"
          color="primary"
          trailing-icon="i-lucide-arrow-right"
          class="hidden sm:inline-flex shadow-glow-sky"
        >
          {{ t('nav.order') }}
        </UButton>
      </template>

      <template #body>
        <UNavigationMenu :items="navItems" orientation="vertical" class="lg:hidden" />
        <div class="flex flex-col gap-2 mt-4 lg:hidden">
          <UButton :to="localePath('/login')" color="neutral" variant="outline" block>
            {{ t('nav.login') }}
          </UButton>
          <UButton
            :to="localePath('/order/choose-domain')"
            color="primary"
            trailing-icon="i-lucide-arrow-right"
            block
            class="shadow-glow-sky"
          >
            {{ t('nav.order') }}
          </UButton>
        </div>
      </template>
    </UHeader>

    <UMain id="main" class="flex-1">
      <slot />
    </UMain>

    <UFooter
      :ui="{
        root: 'border-t border-default/70 mt-auto bg-default',
        top: 'py-0',
        bottom: 'border-t border-default/60',
        container: 'max-w-[90rem] mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-6 lg:py-5 lg:flex lg:items-center lg:justify-between lg:gap-x-6'
      }"
    >
      <template #top>
        <!-- Wider than default UContainer (7xl) so legal/contact never ellipsis -->
        <div class="max-w-[90rem] mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-12 md:py-16 lg:py-20">
          <div class="grid gap-12 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14">
            <div class="lg:col-span-3 space-y-4 min-w-0">
              <NuxtLink :to="localePath('/')" class="inline-flex items-center cursor-pointer w-fit" :aria-label="t('brand.name')">
                <AppLogo class="h-7 w-auto shrink-0" />
              </NuxtLink>
              <p class="text-sm text-muted leading-relaxed">
                {{ t('footer.blurb') }}
              </p>
              <div class="flex flex-wrap items-center gap-2">
                <UButton
                  :to="waHref"
                  target="_blank"
                  icon="i-simple-icons-whatsapp"
                  color="success"
                  variant="soft"
                >
                  {{ t('cta.consult') }}
                </UButton>
              </div>
            </div>

            <div class="lg:col-span-9 min-w-0">
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 xl:gap-8">
                <div
                  v-for="col in footerColumns"
                  :key="col.label"
                  class="min-w-0"
                >
                  <p class="text-sm font-semibold text-highlighted tracking-tight">
                    {{ col.label }}
                  </p>
                  <ul class="mt-5 space-y-3.5">
                    <li
                      v-for="(item, i) in col.children"
                      :key="`${col.label}-${i}`"
                      class="min-w-0"
                    >
                      <NuxtLink
                        :to="item.to"
                        :target="item.target"
                        :external="Boolean(item.target === '_blank' || (typeof item.to === 'string' && item.to.startsWith('mailto:')))"
                        class="group inline-flex items-start gap-2 text-sm text-muted hover:text-default transition-colors cursor-pointer max-w-full"
                      >
                        <UIcon
                          v-if="item.icon"
                          :name="item.icon"
                          class="size-4 shrink-0 mt-0.5 text-muted group-hover:text-primary"
                        />
                        <span class="min-w-0 whitespace-normal break-words leading-snug">
                          {{ item.label }}
                        </span>
                      </NuxtLink>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #left>
        <p class="text-sm text-muted text-center lg:text-start">
          {{ t('footer.copyright', { year }) }}
        </p>
      </template>

      <template #right>
        <div class="flex items-center gap-1">
          <UButton
            :to="waHref"
            target="_blank"
            icon="i-simple-icons-whatsapp"
            color="neutral"
            variant="ghost"
            :aria-label="t('footer.socialWhatsapp')"
          />
          <UButton
            to="https://instagram.com/mugiewdev"
            target="_blank"
            icon="i-simple-icons-instagram"
            color="neutral"
            variant="ghost"
            :aria-label="t('footer.socialInstagram')"
          />
          <UButton
            to="https://linkedin.com/company/mugiewdev"
            target="_blank"
            icon="i-simple-icons-linkedin"
            color="neutral"
            variant="ghost"
            :aria-label="t('footer.socialLinkedin')"
          />
        </div>
      </template>
    </UFooter>

    <!-- Floating WA -->
    <UButton
      :to="waHref"
      target="_blank"
      icon="i-simple-icons-whatsapp"
      color="success"
      size="xl"
      class="fixed bottom-6 right-6 z-50 shadow-soft-xl rounded-full cursor-pointer"
      :aria-label="t('nav.contact')"
    />
  </div>
</template>
