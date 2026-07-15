<script setup lang="ts">
const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const { number: waNumber, link } = useWhatsApp()

const supportEmail = computed(() => String(config.public.supportEmail || 'support@mugiewdev.com'))

function formatWaDisplay(raw: string) {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('62') && digits.length >= 11) {
    return `+62 ${digits.slice(2, 5)}-${digits.slice(5, 9)}-${digits.slice(9)}`
  }
  return raw.startsWith('+') ? raw : `+${digits}`
}

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

const footerColumns = computed(() => [
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
        label: formatWaDisplay(waNumber.value),
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
        <NuxtLink :to="localePath('/')" class="flex items-center gap-2 cursor-pointer">
          <AppLogo class="h-6 w-auto shrink-0" />
          <span class="font-semibold tracking-tight text-highlighted hidden sm:inline">{{ t('brand.name') }}</span>
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

    <UFooter :ui="{ root: 'border-t border-default/70 mt-auto bg-default' }">
      <template #top>
        <UContainer class="py-12 md:py-16">
          <div class="grid gap-10 lg:grid-cols-12">
            <div class="lg:col-span-4 space-y-4">
              <div class="flex items-center gap-2">
                <AppLogo class="h-7 w-auto" />
                <span class="font-semibold text-lg tracking-tight text-highlighted">{{ t('brand.name') }}</span>
              </div>
              <p class="text-sm text-muted leading-relaxed max-w-sm">
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
                <UButton
                  :to="`mailto:${supportEmail}`"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-mail"
                  class="text-muted"
                >
                  {{ supportEmail }}
                </UButton>
              </div>
            </div>
            <div class="lg:col-span-8">
              <UFooterColumns :columns="footerColumns" />
            </div>
          </div>
        </UContainer>
      </template>

      <template #left>
        <p class="text-sm text-muted">
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
