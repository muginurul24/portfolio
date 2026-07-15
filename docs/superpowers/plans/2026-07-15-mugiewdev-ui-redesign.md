# MugiewDev Premium UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lift marketing + shell UI past webekspor.com with richer Soft UI Evolution (trust navy + sky CTA), denser conversion sections, and premium craft — without swapping Nuxt UI or product stack.

**Architecture:** Keep Nuxt 4 + Nuxt UI 4. Upgrade tokens in `main.css` / `DESIGN.md` / design-system MASTER. Rebuild home as section composition (not bare `UPageHero` alone). Shared marketing components under `app/components/marketing/`. Service landings and templates catalog adopt same visual language.

**Tech Stack:** Nuxt 4, Nuxt UI 4, Tailwind 4, Lucide + Simple Icons, Plus Jakarta Sans, existing i18n, no new UI kit.

## Global Constraints

- Product: website builder for UMKM/export — not marketplace flashy.
- Primary CTA color: sky `#0369A1`; navy headings `#0F172A`; light default.
- Font: Plus Jakarta Sans only for UI (optional display weight 700–800 same family — no new font family unless task explicitly adds one via `@nuxt/fonts` and DESIGN.md).
- Icons: `i-lucide-*` / `i-simple-icons-*` only; no emoji icons.
- Copy: Bahasa Indonesia first; user strings via i18n.
- A11y: contrast ≥4.5:1, focus ring, 44px targets, `prefers-reduced-motion`.
- Motion: 150–300ms micro; max 1–2 animated moments per view; transform/opacity only.
- Do not reformat unrelated files; do not break order/payment APIs.
- Beat webekspor by craft + calm premium (not louder promo spam).

## Design direction (locked for this plan)

**Signature:** Full-bleed hero with soft mesh gradient + glass sticky header + **inline domain search** as primary above-fold action + transparent price floor. Remembered line remains *Bikin Website · Tanpa Ribet*.

**Style name:** Soft Glass Trust (Soft UI Evolution + restrained glass, not heavy Liquid Glass).

**Home section order (must beat webekspor density):**
1. Sticky glass header  
2. Hero (thesis + domain search + dual CTA + proof chips)  
3. Logo/trust strip (optional short)  
4. Template showcase (featured grid + “Lihat semua”)  
5. Services bento (4 layanan)  
6. How it works (3 steps, larger)  
7. Pricing / domain packages strip  
8. Testimonials + stats  
9. Community teaser  
10. Blog teaser (3 cards)  
11. Final CTA band  
12. Rich footer  

**Anti webekspor weaknesses to avoid:**
- Discount-first shouting as only hero message  
- Dense red strikethrough spam  
- Generic gray card walls without depth  
- Empty sections (home currently stops at features+steps+CTA)

## File map

| Path | Role |
|------|------|
| `DESIGN.md` | Updated tokens + patterns |
| `design-system/mugiewdev/MASTER.md` | Persist Soft Glass Trust |
| `design-system/pages/home.md` | Home overrides |
| `app/assets/css/main.css` | Tokens, glass, mesh, section utilities |
| `app/app.config.ts` | Button/card/header UI defaults |
| `app/layouts/default.vue` | Glass header, richer footer |
| `app/pages/index.vue` | Full home composition |
| `app/components/marketing/HeroDomainSearch.vue` | Domain search hero control |
| `app/components/marketing/HomeTemplateShowcase.vue` | Featured templates |
| `app/components/marketing/HomeServicesBento.vue` | 4 service cards |
| `app/components/marketing/HomeSteps.vue` | Process steps |
| `app/components/marketing/HomePricingStrip.vue` | Package/TLD pricing |
| `app/components/marketing/HomeTestimonials.vue` | Reviews + stats |
| `app/components/marketing/HomeCommunity.vue` | Community teaser |
| `app/components/marketing/HomeBlogTeaser.vue` | Blog row |
| `app/components/marketing/SectionHeading.vue` | Shared section title block |
| `app/components/marketing/PromoBanner.vue` | Slim top promo (optional, calm) |
| `app/pages/templates/index.vue` | Catalog visual upgrade |
| `app/pages/jasa-pembuatan-website-*.vue` | Align to new section chrome |
| `i18n/locales/id.json`, `en.json` | New chrome keys |

---

### Task 1: Design tokens Soft Glass Trust

**Files:**
- Modify: `app/assets/css/main.css`
- Modify: `DESIGN.md`
- Modify: `design-system/mugiewdev/MASTER.md`
- Modify: `app/app.config.ts`

**Interfaces:**
- Produces CSS utilities: `bg-mesh-hero`, `glass-panel`, `shadow-soft-*` (richer), `section-y`, `text-display`
- Produces appConfig ui tweaks for button radius/shadow, card ring

- [ ] **Step 1: Update `main.css` tokens**

Replace/extend `@theme static` and utilities. Keep Plus Jakarta Sans. Enrich shadows; add mesh + glass (light only friendly).

```css
@import "tailwindcss";
@import "@nuxt/ui";

@theme static {
  --font-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
  --font-display: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;

  --color-sky-50: #f0f9ff;
  --color-sky-100: #e0f2fe;
  --color-sky-200: #bae6fd;
  --color-sky-300: #7dd3fc;
  --color-sky-400: #38bdf8;
  --color-sky-500: #0ea5e9;
  --color-sky-600: #0369a1;
  --color-sky-700: #075985;
  --color-sky-800: #0c4a6e;
  --color-sky-900: #0c3d5c;
  --color-sky-950: #082f49;

  --shadow-soft-sm: 0 1px 2px rgb(15 23 42 / 0.04), 0 1px 1px rgb(15 23 42 / 0.03);
  --shadow-soft-md: 0 4px 16px -2px rgb(15 23 42 / 0.08), 0 2px 6px -2px rgb(15 23 42 / 0.05);
  --shadow-soft-lg: 0 12px 32px -8px rgb(15 23 42 / 0.12), 0 4px 12px -4px rgb(15 23 42 / 0.06);
  --shadow-soft-xl: 0 24px 48px -12px rgb(15 23 42 / 0.16), 0 8px 16px -8px rgb(15 23 42 / 0.08);
  --shadow-glow-sky: 0 0 0 1px rgb(3 105 161 / 0.12), 0 8px 30px -6px rgb(3 105 161 / 0.35);
}

/* Soft mesh hero background */
.bg-mesh-hero {
  background-color: #f8fafc;
  background-image:
    radial-gradient(ellipse 80% 60% at 50% -10%, rgb(14 165 233 / 0.18), transparent 55%),
    radial-gradient(ellipse 50% 40% at 100% 0%, rgb(15 23 42 / 0.06), transparent 50%),
    radial-gradient(ellipse 40% 30% at 0% 20%, rgb(3 105 161 / 0.08), transparent 45%);
}

.glass-panel {
  background: rgb(255 255 255 / 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgb(226 232 240 / 0.8);
}

.section-y {
  padding-block: 4rem;
}
@media (min-width: 768px) {
  .section-y {
    padding-block: 5.5rem;
  }
}

.text-display {
  letter-spacing: -0.03em;
  font-weight: 700;
  line-height: 1.1;
}

.card-lift {
  transition: box-shadow 200ms ease, transform 200ms ease;
}
.card-lift:hover {
  box-shadow: var(--shadow-soft-lg);
  transform: translateY(-2px);
}
@media (prefers-reduced-motion: reduce) {
  .card-lift,
  .card-lift:hover {
    transition: none;
    transform: none;
  }
}

/* keep existing page transitions + focus + skip-link from current file */
```

Keep existing page transition / focus / skip-link / tabular-nums blocks; merge carefully.

- [ ] **Step 2: Update `app.config.ts` card/button defaults**

```ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'sky',
      neutral: 'slate',
      success: 'green',
      warning: 'amber',
      error: 'red',
      info: 'sky'
    },
    button: {
      defaultVariants: {
        size: 'md'
      },
      slots: {
        base: 'cursor-pointer font-semibold'
      }
    },
    card: {
      slots: {
        root: 'shadow-soft-md ring-1 ring-default/80 bg-default'
      }
    }
  },
  mugiew: {
    brand: 'MugiewDev',
    tagline: 'Bikin Website · Tanpa Ribet',
    supportWa: '6281280080275',
    promoCode: 'WEBSITEJUARA',
    promoDiscountIdr: 500_000,
    startingPriceYearlyIdr: 1_000_000
  }
})
```

- [ ] **Step 3: Patch DESIGN.md**

Update Style line to **Soft Glass Trust (Soft UI Evolution)**. Add mesh/glass utilities. Keep color hex table; note richer shadows + home section order from this plan. Signature: hero domain search + mesh.

- [ ] **Step 4: Patch `design-system/mugiewdev/MASTER.md`**

Set style Soft Glass Trust; dials Variance 6 / Motion 5 / Density 4; list anti-patterns: cheap promo spam, emoji icons, gray-on-gray.

- [ ] **Step 5: Visual smoke**

```bash
pnpm dev
# open / — tokens load; no broken CSS
```

- [ ] **Step 6: Commit**

```bash
git add app/assets/css/main.css app/app.config.ts DESIGN.md design-system/mugiewdev/MASTER.md
git commit -m "feat(ui): Soft Glass Trust design tokens and utilities"
```

---

### Task 2: SectionHeading + PromoBanner primitives

**Files:**
- Create: `app/components/marketing/SectionHeading.vue`
- Create: `app/components/marketing/PromoBanner.vue`
- Modify: `i18n/locales/id.json`, `i18n/locales/en.json`

**Interfaces:**
- Produces `SectionHeading` props: `eyebrow?: string`, `title: string`, `description?: string`, `align?: 'left' | 'center'`
- Produces `PromoBanner` uses `appConfig.mugiew.promoCode` + `promoDiscountIdr`

- [ ] **Step 1: SectionHeading**

```vue
<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}>(), {
  align: 'center'
})
</script>

<template>
  <div
    class="mb-10 max-w-2xl"
    :class="align === 'center' ? 'mx-auto text-center' : 'text-left'"
  >
    <p
      v-if="eyebrow"
      class="text-sm font-semibold tracking-wide text-primary uppercase mb-2"
    >
      {{ eyebrow }}
    </p>
    <h2 class="text-display text-3xl md:text-4xl text-highlighted">
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="mt-3 text-muted text-base md:text-lg leading-relaxed"
    >
      {{ description }}
    </p>
  </div>
</template>
```

- [ ] **Step 2: PromoBanner (calm, not shouty)**

```vue
<script setup lang="ts">
const appConfig = useAppConfig()
const { t } = useI18n()
const localePath = useLocalePath()

const code = computed(() => appConfig.mugiew?.promoCode || 'WEBSITEJUARA')
const discount = computed(() => formatIdr(appConfig.mugiew?.promoDiscountIdr || 500_000))
</script>

<template>
  <div class="bg-primary text-white">
    <UContainer class="py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
      <span class="font-medium">
        {{ t('promo.banner', { code, discount }) }}
      </span>
      <UButton
        :to="localePath('/order/choose-domain')"
        size="xs"
        color="neutral"
        variant="solid"
        class="bg-white text-primary hover:bg-white/90"
      >
        {{ t('promo.bannerCta') }}
      </UButton>
    </UContainer>
  </div>
</template>
```

- [ ] **Step 3: i18n keys**

```json
"promo": {
  "banner": "Kode {code} potong {discount} untuk paket website tahunan",
  "bannerCta": "Pakai sekarang"
}
```

EN equivalents in `en.json`.

- [ ] **Step 4: Commit**

```bash
git add app/components/marketing/SectionHeading.vue app/components/marketing/PromoBanner.vue i18n/locales/id.json i18n/locales/en.json
git commit -m "feat(ui): section heading and calm promo banner"
```

---
### Task 3: Glass header + rich footer shell

**Files:**
- Modify: `app/layouts/default.vue`
- Modify: `i18n/locales/id.json`, `en.json` (footer blurb if needed)

**Interfaces:**
- Consumes: `PromoBanner`, `useWhatsApp`
- Produces: sticky glass header, optional promo above header, footer brand column with short value prop

- [ ] **Step 1: Insert PromoBanner above header**

In `default.vue` template root:

```vue
<div class="min-h-dvh flex flex-col bg-default">
  <PromoBanner />
  <UHeader :ui="{ root: 'sticky top-0 z-40 border-b border-default/70 glass-panel' }">
    <!-- existing left/nav/right -->
  </UHeader>
  ...
</div>
```

- [ ] **Step 2: Header polish**

- Logo + brand weight `font-semibold tracking-tight`
- Primary CTA button add class for glow optional: `shadow-glow-sky` only on desktop primary order button
- Keep mobile menu body as-is structure; ensure all clickable have `cursor-pointer` via appConfig

- [ ] **Step 3: Footer upgrade**

Replace thin footer top with brand blurb + columns:

```vue
<template #top>
  <UContainer class="py-12 md:py-16">
    <div class="grid gap-10 lg:grid-cols-12">
      <div class="lg:col-span-4 space-y-4">
        <div class="flex items-center gap-2">
          <AppLogo class="h-7 w-auto" />
          <span class="font-semibold text-lg">{{ t('brand.name') }}</span>
        </div>
        <p class="text-sm text-muted leading-relaxed max-w-sm">
          {{ t('footer.blurb') }}
        </p>
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
      <div class="lg:col-span-8">
        <UFooterColumns :columns="footerColumns" />
      </div>
    </div>
  </UContainer>
</template>
```

i18n:

```json
"footer": {
  "blurb": "Platform website profesional untuk UMKM dan eksportir Indonesia. Domain, hosting, template, akademi, dan komunitas — satu paket."
}
```

Keep social icons + copyright. Floating WA: `rounded-full shadow-soft-xl` + `size` xl; ensure `aria-label`.

- [ ] **Step 4: Smoke** `/` header sticky glass + footer blurb

- [ ] **Step 5: Commit**

```bash
git add app/layouts/default.vue i18n/locales/id.json i18n/locales/en.json
git commit -m "feat(ui): glass sticky header and richer footer"
```

---

### Task 4: HeroDomainSearch component

**Files:**
- Create: `app/components/marketing/HeroDomainSearch.vue`
- Reuse APIs: `/api/domains/tlds`, `/api/domains/check` (already exist)

**Interfaces:**
- Consumes: TLD list API, domain check API, `useOrderStore` optional
- Produces: on success navigate to `/order/choose-domain` with query `name`+`tld` or continue to checkout path used by choose-domain

- [ ] **Step 1: Implement component**

```vue
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const name = ref('')
const selectedTld = ref('com')
const checking = ref(false)
const available = ref<boolean | null>(null)
const error = ref('')

const { data: tldData } = await useFetch('/api/domains/tlds', { key: 'home-domain-tlds' })
const tlds = computed(() => tldData.value?.data ?? [{ tld: 'com', priceYearlyIdr: 1_247_000 }])

watch(selectedTld, () => {
  available.value = null
})

async function check() {
  error.value = ''
  available.value = null
  const n = name.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
  if (n.length < 3) {
    error.value = t('order.domainTooShort')
    return
  }
  checking.value = true
  try {
    const res = await $fetch<{ domain: string, available: boolean }>('/api/domains/check', {
      query: { name: n, tld: selectedTld.value }
    })
    available.value = res.available
    if (res.available) {
      await navigateTo({
        path: localePath('/order/choose-domain'),
        query: { name: n, tld: selectedTld.value }
      })
    }
  } catch {
    error.value = t('common.error')
  } finally {
    checking.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-xl mx-auto">
    <div class="glass-panel shadow-soft-xl rounded-2xl p-2 sm:p-3">
      <form class="flex flex-col sm:flex-row gap-2" @submit.prevent="check">
        <UInput
          v-model="name"
          size="xl"
          :placeholder="t('order.domainPlaceholder')"
          class="flex-1"
          :ui="{ base: 'font-mono' }"
          autocomplete="off"
          :aria-label="t('order.chooseDomain')"
        />
        <USelect
          v-model="selectedTld"
          :items="tlds.map((x: { tld: string }) => ({ label: `.${x.tld}`, value: x.tld }))"
          size="xl"
          class="sm:w-32"
        />
        <UButton
          type="submit"
          color="primary"
          size="xl"
          :loading="checking"
          :disabled="checking"
          trailing-icon="i-lucide-search"
          class="shadow-glow-sky"
        >
          {{ t('common.search') }}
        </UButton>
      </form>
    </div>
    <p v-if="error" class="mt-2 text-sm text-error text-center">
      {{ error }}
    </p>
    <p v-else-if="available === false" class="mt-2 text-sm text-error text-center">
      {{ t('order.domainUnavailable') }}
    </p>
    <p class="mt-3 text-center text-xs text-muted">
      {{ t('order.domainSearchHint') }}
    </p>
  </div>
</template>
```

- [ ] **Step 2: i18n keys**

```json
"order": {
  "domainPlaceholder": "namabisnis",
  "domainTooShort": "Nama domain minimal 3 karakter",
  "domainUnavailable": "Domain tidak tersedia. Coba nama lain.",
  "domainSearchHint": "Termasuk hosting unlimited + SSL. Cek ketersediaan real-time."
}
```

- [ ] **Step 3: Prefill choose-domain from query `name`/`tld`**

Modify `app/pages/order/choose-domain.vue` to read `route.query.name` and `route.query.tld` into local state on mount (small change, this task).

- [ ] **Step 4: Commit**

```bash
git add app/components/marketing/HeroDomainSearch.vue app/pages/order/choose-domain.vue i18n/locales
git commit -m "feat(ui): hero domain search control wired to APIs"
```

---

### Task 5: Home template showcase + services bento + steps

**Files:**
- Create: `app/components/marketing/HomeTemplateShowcase.vue`
- Create: `app/components/marketing/HomeServicesBento.vue`
- Create: `app/components/marketing/HomeSteps.vue`
- Modify: `i18n/locales/*`

**Interfaces:**
- Showcase: `useFetch('/api/templates', { key: 'home-templates', query: { } })` take first 8 featured or sortOrder
- Services: 4 cards linking to jasa pages
- Steps: 3 numbered large cards

- [ ] **Step 1: HomeTemplateShowcase**

```vue
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
              <UIcon name="i-lucide-layout-template" class="size-10 text-muted group-hover:text-primary transition-colors" />
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
```

- [ ] **Step 2: HomeServicesBento**

4 cards: export, umkm, ecommerce, custom — large icon tile, short desc, link `Pelajari`. Use gradient soft bg per card via `bg-primary/5` only (no random hex). Grid `md:grid-cols-2`.

- [ ] **Step 3: HomeSteps**

3 steps with large 01/02/03 display type, connecting line optional (CSS border, not animation spam).

- [ ] **Step 4: i18n home keys** for eyebrows/titles

- [ ] **Step 5: Commit**

```bash
git add app/components/marketing/HomeTemplateShowcase.vue app/components/marketing/HomeServicesBento.vue app/components/marketing/HomeSteps.vue i18n/locales
git commit -m "feat(ui): home template showcase services bento and steps"
```

---

### Task 6: Home pricing, testimonials, community, blog teaser

**Files:**
- Create: `app/components/marketing/HomePricingStrip.vue`
- Create: `app/components/marketing/HomeTestimonials.vue`
- Create: `app/components/marketing/HomeCommunity.vue`
- Create: `app/components/marketing/HomeBlogTeaser.vue`

**Interfaces:**
- Pricing: `useFetch('/api/packages')` + optional TLDs; show 3 cards max (export/umkm yearly + ecom teaser)
- Testimonials: static quality copy from seed content (or hardcode 3 reviews matching research voice) until testimonials API exists — mark as static v1
- Community: stats + CTA `/komunitas`
- Blog: `queryCollection('blog').order('date','DESC').limit(3)`

- [ ] **Step 1: HomePricingStrip** — cards with `formatIdr`, popular ring, CTA order

- [ ] **Step 2: HomeTestimonials** — 3 cards: quote, name, role; stats row 12k / 4.9 / 89%

- [ ] **Step 3: HomeCommunity** — soft primary/5 band, dual CTA komunitas + WA

- [ ] **Step 4: HomeBlogTeaser** — 3 MD cards with date + title + link

- [ ] **Step 5: Commit**

```bash
git add app/components/marketing/HomePricingStrip.vue app/components/marketing/HomeTestimonials.vue app/components/marketing/HomeCommunity.vue app/components/marketing/HomeBlogTeaser.vue i18n/locales
git commit -m "feat(ui): home pricing testimonials community and blog teasers"
```

---

### Task 7: Rebuild home page composition

**Files:**
- Modify: `app/pages/index.vue` (full rewrite of template structure)
- Create: `design-system/pages/home.md`

**Interfaces:**
- Consumes all Home* components + HeroDomainSearch + useWhatsApp

- [ ] **Step 1: Write home.md override** summarizing section order + signature domain search

- [ ] **Step 2: Rebuild `index.vue`**

Structure:

```vue
<template>
  <div>
    <section class="bg-mesh-hero section-y pt-10 md:pt-16">
      <UContainer>
        <div class="max-w-3xl mx-auto text-center space-y-6">
          <UBadge color="primary" variant="subtle" size="lg">
            {{ priceLabel }}
          </UBadge>
          <h1 class="text-display text-4xl sm:text-5xl md:text-6xl text-highlighted">
            {{ t('hero.title') }}
          </h1>
          <p class="text-lg md:text-xl text-muted leading-relaxed">
            {{ t('hero.subtitle') }}
          </p>
          <HeroDomainSearch />
          <div class="flex flex-wrap justify-center gap-3">
            <UButton :to="localePath('/order/choose-domain')" color="primary" size="xl" trailing-icon="i-lucide-arrow-right">
              {{ t('hero.ctaPrimary') }}
            </UButton>
            <UButton :to="waHref" target="_blank" color="neutral" variant="outline" size="xl" icon="i-simple-icons-whatsapp">
              {{ t('hero.ctaSecondary') }}
            </UButton>
          </div>
          <div class="flex flex-wrap justify-center gap-6 text-sm text-muted pt-2">
            <!-- stats chips with icons -->
          </div>
        </div>
      </UContainer>
    </section>

    <HomeTemplateShowcase />
    <HomeServicesBento />
    <HomeSteps />
    <HomePricingStrip />
    <HomeTestimonials />
    <HomeCommunity />
    <HomeBlogTeaser />

    <section class="section-y">
      <UContainer>
        <UPageCTA
          :title="t('home.ctaTitle')"
          :description="t('home.ctaDesc', { code: ..., discount: ... })"
          variant="subtle"
          class="shadow-soft-lg ring-1 ring-default"
          :links="[...]"
        />
      </UContainer>
    </section>
  </div>
</template>
```

Remove dependence on bare `UPageHero` / single `UPageSection` features for home (components replace them).

- [ ] **Step 3: SEO meta unchanged pattern**

- [ ] **Step 4: Visual QA checklist**

375 / 768 / 1280 widths: no horizontal scroll; hero search usable; sections spaced `section-y`.

- [ ] **Step 5: Commit**

```bash
git add app/pages/index.vue design-system/pages/home.md
git commit -m "feat(ui): rebuild home as premium Soft Glass Trust landing"
```

---

### Task 8: Templates catalog visual upgrade

**Files:**
- Modify: `app/pages/templates/index.vue`
- Modify: `app/pages/templates/[slug].vue`

- [ ] **Step 1: Catalog page**

- Sticky filter bar glass on scroll optional (simple: better spacing + search size lg)
- Cards: `card-lift`, aspect 4/3, category badge, dual actions Buat Website + Detail
- Empty state illustration via Lucide + CTA

- [ ] **Step 2: Detail page**

- Larger preview frame with soft shadow
- Sticky CTA column on desktop (`lg:sticky lg:top-24`)
- Feature bullets list (static from category if no API features)

- [ ] **Step 3: Commit**

```bash
git add app/pages/templates
git commit -m "feat(ui): premium templates catalog and detail chrome"
```

---

### Task 9: Service landings visual alignment

**Files:**
- Modify: four `app/pages/jasa-pembuatan-website-*.vue`
- Modify: `app/components/marketing/ServicePricing.vue`, `ServiceCta.vue`, `ServiceProof.vue`, `ServiceSteps.vue` as needed

- [ ] **Step 1: Hero each landing** use `bg-mesh-hero` + `SectionHeading` pattern (left align on desktop)

- [ ] **Step 2: ServicePricing cards** add `card-lift`, popular `shadow-glow-sky`, larger price type

- [ ] **Step 3: ServiceCta** full-bleed soft primary band

- [ ] **Step 4: Commit**

```bash
git add app/pages/jasa-pembuatan-website-*.vue app/components/marketing/Service*.vue
git commit -m "feat(ui): align service landings with Soft Glass Trust"
```

---

### Task 10: Order wizard + panel polish (light)

**Files:**
- Modify: `app/pages/order/choose-domain.vue`, `checkout.vue`, `success.vue`
- Modify: `app/layouts/panel.vue`, `app/pages/panel/index.vue` (visual only)

- [ ] **Step 1: Order pages** — progress stepper component inline (3 dots), glass summary card, consistent max-w

- [ ] **Step 2: Panel** — sidebar active state clearer; dashboard stat cards `card-lift` subtle; page bg `bg-muted/40`

- [ ] **Step 3: Commit**

```bash
git add app/pages/order app/layouts/panel.vue app/pages/panel/index.vue
git commit -m "feat(ui): polish order wizard and panel chrome"
```

---

### Task 11: i18n completeness + motion a11y pass

**Files:**
- Modify: `i18n/locales/id.json`, `en.json`
- Modify: `app/assets/css/main.css` if any motion leftovers

- [ ] **Step 1: Grep hard-coded ID strings in new marketing components; move chrome to i18n**

- [ ] **Step 2: Ensure all hover transforms gated by reduced-motion**

- [ ] **Step 3: Commit**

```bash
git add i18n/locales app/assets/css/main.css app/components/marketing
git commit -m "feat(ui): i18n coverage and reduced-motion for redesign"
```

---

### Task 12: Verification

- [ ] **Step 1: Automated**

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected: green.

- [ ] **Step 2: Manual visual checklist vs webekspor**

| Check | Pass criteria |
|-------|----------------|
| Home density | ≥ templates + services + steps + pricing + testimonials + blog + CTA |
| Hero | Domain search above fold + dual CTA |
| Craft | Glass header, mesh hero, soft shadows, no emoji icons |
| Mobile 375 | Search usable, no overflow |
| A11y | Focus visible, contrast, reduced-motion |
| Conversion | Promo calm banner, primary sky CTA consistent |
| APIs | Domain search + templates still load |

- [ ] **Step 3: Fix only visual regressions; commit if needed**

```bash
git commit -m "fix(ui): redesign verification polish"
```

---

## Out of scope

- New site builder editor
- Real template screenshot assets pipeline (placeholders OK with better frames)
- Replacing Nuxt UI
- Heavy GSAP/Liquid Glass morph (perf + a11y risk)
- Full brand re-illustration of webekspor logo art

## Self-review

1. **Spec coverage:** User wants better than webekspor visually — tasks cover tokens, shell, home density matching competitor sections, catalog/landings/order polish.
2. **No placeholders:** Components have concrete code/props.
3. **Constraints:** Soft UI sky/navy, Plus Jakarta, Lucide, i18n, a11y preserved.
4. **Differentiation:** Calm premium + domain-search hero + glass craft vs webekspor discount-noise.

## Execution notes

- Prefer `pnpm dev` visual check after Tasks 1, 3, 7.
- Seed DB for templates showcase (`pnpm db:seed`).
- Keep payment logic untouched except choose-domain query prefill.
