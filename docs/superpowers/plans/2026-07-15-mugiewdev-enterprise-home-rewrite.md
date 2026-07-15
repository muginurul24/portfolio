# MugiewDev Enterprise Home Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Brutal rewrite of marketing shell + homepage into modern premium enterprise high-end landing that **meets or exceeds webekspor.com section completeness** (including hero carousel) while elevating craft above discount-spam aesthetics.

**Architecture:** Keep Nuxt 4 + Nuxt UI 4. Rebuild home as ordered section orchestra with dedicated marketing components. Use **UCarousel** for segment hero banners. Data from existing APIs (`/api/templates`, `/api/packages`, `/api/domains/tlds`) + Nuxt Content blog. Dual-theme Soft Glass Trust tokens already present — extend, do not light-only hardcode.

**Tech Stack:** Nuxt 4, Nuxt UI 4 (`UCarousel`, `UPageCTA`, `UCard`, `UBadge`, `UButton`, `UContainer`), Tailwind 4, Lucide + Simple Icons, Plus Jakarta Sans, existing i18n/Pinia/APIs. No new UI kit. No GSAP unless a single optional reduced-motion-safe scroll fade.

## Global Constraints

- Product: website builder UMKM/export — **not** goods marketplace.
- Primary CTA: sky `#0369A1`; navy headings `#0F172A`; light default + full dark pairs.
- Font: Plus Jakarta Sans only (weights up to 800 OK via `@nuxt/fonts`).
- Icons: `i-lucide-*` / `i-simple-icons-*` only; no emoji icons.
- Copy: Bahasa Indonesia first; chrome via i18n `id` + `en`.
- A11y: contrast ≥4.5:1, focus visible, ≥44px targets, `prefers-reduced-motion`, carousel pause/controls.
- Components: `pathPrefix: false` already in `nuxt.config.ts` — tags = filename (`HeroDomainSearch`, not `MarketingHeroDomainSearch`).
- Money: IDR integers + `formatIdr()` / `formatIdrCompact()`.
- Do not break order/payment/auth APIs; do not commit `.env`.
- **Beat legacy density** without copying cheap promo spam; enterprise = calm authority + complete sections.
- Auto-import: never invent wrong component names — verify `.nuxt/components.d.ts` after create.

## Design direction (locked)

**Name:** Enterprise Soft Glass  
**Pattern hybrid:** Trust & Authority + Enterprise Gateway + legacy section inventory  
**Signature:** Numbered section system `01–08` + **segment hero carousel** (Export / UMKM / Toko) + domain search + transparent floor price — craft above webekspor, completeness not less.

### Homepage section order (must ship all)

| # | Section | Legacy parity | MugiewDev premium upgrade |
|---|---------|---------------|---------------------------|
| 0 | PromoBanner | WEBSITEJUARA strip | Calm single line, not shouty stack |
| 1 | Glass header | Full nav | Sticky glass, mega-feel services dropdown |
| 2 | Hero mission | Thesis + domain + price | Mesh + domain search + dual CTA + proof chips |
| 3 | **HeroCarousel** | 3-slide banner | UCarousel: Export / UMKM / Ecom — image panel + pitch + dual CTA |
| 4 | Trust logos strip | (weak on legacy) | **New enterprise:** payment/SSL/Xendit/responsive badges |
| 5 | Design collection | Koleksi Desain + chips | Category chips + 8 template cards + pick counts optional + Lihat semua |
| 6 | Services | 4 layanan | Bento 2×2 premium cards + Lihat layanan |
| 7 | Domain packages | 3 TLD cards | Live TLD prices from API + includes domain/host/SSL |
| 8 | Voice of users | Stats + testimonials | Stats strip + testimonial cards (photo placeholder + quote + name) |
| 9 | Community | 12k + benefits | Map/avatar cluster + 4 benefits + CTA |
| 10 | Portfolio teaser | (separate page only) | **New:** 3 case cards → `/portofolio` |
| 11 | Journal | 3 blog cards | Content collection 3 posts |
| 12 | Academy teaser | nav only | **New:** slim band → `/academy` |
| 13 | Final CTA | Mulai hari ini | Dual CTA + micro trust line |
| 14 | Footer | Columns + contact | Brand + blurb + columns + legal + social |

### Anti-patterns (explicit)

- ❌ Missing carousel when legacy has one  
- ❌ Home shorter/sparser than legacy  
- ❌ Discount-only hero without mission  
- ❌ Anonymous/wrong auto-import tags  
- ❌ Light-only glass/mesh  
- ❌ Emoji icons, GSAP bloat, marketplace search-as-primary  

## File map

| Path | Responsibility |
|------|----------------|
| `DESIGN.md` | Enterprise Soft Glass section inventory |
| `design-system/pages/home.md` | Page override — full section map |
| `design-system/mugiewdev/MASTER.md` | Enterprise dials |
| `app/assets/css/main.css` | Tokens + carousel/section-number utilities |
| `app/layouts/default.vue` | Shell chrome |
| `app/pages/index.vue` | Section orchestra only (thin) |
| `app/components/marketing/HeroCarousel.vue` | **New** UCarousel 3 segments |
| `app/components/marketing/TrustLogoStrip.vue` | **New** trust badges |
| `app/components/marketing/HomeTemplateShowcase.vue` | Rewrite: chips + denser cards |
| `app/components/marketing/HomeServicesBento.vue` | Rewrite: legacy 4 services parity |
| `app/components/marketing/HomeDomainPackages.vue` | **New** TLD pricing (replace thin pricing strip or absorb) |
| `app/components/marketing/HomeTestimonials.vue` | Rewrite: stats + multi-card |
| `app/components/marketing/HomeCommunity.vue` | Rewrite: richer |
| `app/components/marketing/HomePortfolioTeaser.vue` | **New** |
| `app/components/marketing/HomeBlogTeaser.vue` | Polish |
| `app/components/marketing/HomeAcademyTeaser.vue` | **New** |
| `app/components/marketing/HomeFinalCta.vue` | **New** wrap UPageCTA |
| `app/components/marketing/SectionHeading.vue` | Add optional `index` prop `01` |
| `app/components/marketing/HeroDomainSearch.vue` | Keep; polish |
| `app/components/marketing/PromoBanner.vue` | Keep calm |
| `i18n/locales/id.json`, `en.json` | All new chrome |
| `scripts/seed.ts` | Optional template descriptions if needed |

---

### Task 1: Design docs + section utilities

**Files:**
- Modify: `DESIGN.md`
- Modify: `design-system/pages/home.md` (rewrite)
- Modify: `design-system/mugiewdev/MASTER.md`
- Modify: `app/assets/css/main.css`

**Interfaces:**
- Produces CSS: `.section-index` (display number style), ensure `.dark` pairs for any new utility

- [ ] **Step 1: Rewrite `design-system/pages/home.md`**

Content must list full section table from Global Constraints (0–14) + signature carousel + dual theme note + component name list with **filename tags** (no Marketing prefix).

- [ ] **Step 2: Update DESIGN.md marketing layout**

Replace home section order with full 0–14 inventory. Style line: **Enterprise Soft Glass**. Signature: carousel + domain search + numbered sections.

- [ ] **Step 3: Add CSS utility**

```css
.section-index {
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.04em;
  font-weight: 700;
  line-height: 1;
  color: color-mix(in oklab, var(--color-sky-600) 22%, transparent);
}
.dark .section-index {
  color: color-mix(in oklab, var(--color-sky-400) 28%, transparent);
}
```

Keep existing mesh/glass dark pairs.

- [ ] **Step 4: MASTER.md** — Enterprise Soft Glass, dials Variance 7 / Motion 6 / Density 5, anti playful + anti AI purple.

- [ ] **Step 5: Commit**

```bash
git add DESIGN.md design-system app/assets/css/main.css
git commit -m "docs(ui): Enterprise Soft Glass home inventory and utilities"
```

---

### Task 2: SectionHeading supports numbered index

**Files:**
- Modify: `app/components/marketing/SectionHeading.vue`
- Modify: `i18n` only if needed

**Interfaces:**
- Props: `eyebrow?: string`, `title: string`, `description?: string`, `align?: 'left'|'center'`, `index?: string` (e.g. `'01'`)

- [ ] **Step 1: Implementation**

```vue
<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  index?: string
}>(), {
  align: 'center'
})
</script>

<template>
  <div
    class="mb-10 md:mb-12 max-w-3xl"
    :class="align === 'center' ? 'mx-auto text-center' : 'text-left'"
  >
    <div
      class="flex items-end gap-3 mb-3"
      :class="align === 'center' ? 'justify-center' : 'justify-start'"
    >
      <span
        v-if="index"
        class="section-index text-4xl md:text-5xl select-none"
        aria-hidden="true"
      >{{ index }}</span>
      <p
        v-if="eyebrow"
        class="text-sm font-semibold tracking-wide text-primary uppercase pb-1"
      >
        {{ eyebrow }}
      </p>
    </div>
    <h2 class="text-display text-3xl md:text-4xl lg:text-[2.75rem] text-highlighted">
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

- [ ] **Step 2: Commit**

```bash
git add app/components/marketing/SectionHeading.vue
git commit -m "feat(ui): numbered section heading for enterprise inventory"
```

---
### Task 3: HeroCarousel (legacy parity killer feature)

**Files:**
- Create: `app/components/marketing/HeroCarousel.vue`
- Modify: `i18n/locales/id.json`, `en.json`

**Interfaces:**
- Produces carousel of 3 slides: `export` | `umkm` | `ecommerce`
- Each slide: `badge`, `title`, `description`, `primaryTo`, `secondaryWaKey`, optional `priceHint`
- Uses Nuxt UI **UCarousel** (auto-import `UCarousel`)
- a11y: arrows + dots; respect reduced-motion (autoplay off if reduced)

- [ ] **Step 1: Confirm UCarousel API**

Read local types or Context7 Nuxt UI docs for `UCarousel` props (`items` vs default slot). Prefer slot-based slides for full control.

Minimal pattern (adapt if API differs after `nuxt prepare`):

```vue
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { link } = useWhatsApp()

const slides = computed(() => [
  {
    key: 'export',
    badge: t('home.carousel.exportBadge'),
    title: t('home.carousel.exportTitle'),
    description: t('home.carousel.exportDesc'),
    icon: 'i-lucide-globe',
    primaryLabel: t('hero.ctaPrimary'),
    primaryTo: localePath('/order/choose-domain'),
    secondaryLabel: t('cta.consult'),
    secondaryTo: link(t('whatsapp.consultExport')),
    accent: 'from-sky-600/20 to-slate-900/10'
  },
  {
    key: 'umkm',
    badge: t('home.carousel.umkmBadge'),
    title: t('home.carousel.umkmTitle'),
    description: t('home.carousel.umkmDesc'),
    icon: 'i-lucide-store',
    primaryLabel: t('cta.buildNow'),
    primaryTo: localePath('/jasa-pembuatan-website-umkm'),
    secondaryLabel: t('cta.consult'),
    secondaryTo: link(t('whatsapp.consultUmkm')),
    accent: 'from-emerald-600/15 to-sky-900/10'
  },
  {
    key: 'ecommerce',
    badge: t('home.carousel.ecomBadge'),
    title: t('home.carousel.ecomTitle'),
    description: t('home.carousel.ecomDesc'),
    icon: 'i-lucide-shopping-cart',
    primaryLabel: t('services.ecommerce'),
    primaryTo: localePath('/jasa-pembuatan-website-toko-online'),
    secondaryLabel: t('cta.consult'),
    secondaryTo: link(t('whatsapp.consultEcommerce')),
    accent: 'from-indigo-600/15 to-slate-900/10'
  }
])

const prefersReduced = usePreferredReducedMotion()
const autoplay = computed(() => prefersReduced.value === 'reduce' ? false : { delay: 5500 })
</script>

<template>
  <section class="section-y pt-0" aria-roledescription="carousel" :aria-label="t('home.carousel.label')">
    <UContainer>
      <UCarousel
        v-slot="{ item }"
        :items="slides"
        :ui="{ item: 'basis-full' }"
        :autoplay="autoplay"
        arrows
        dots
        class="rounded-2xl overflow-hidden ring-1 ring-default shadow-soft-xl"
      >
        <div
          class="relative min-h-[320px] md:min-h-[380px] grid md:grid-cols-2 gap-0 bg-elevated"
        >
          <div
            class="flex flex-col justify-center p-8 md:p-12 lg:p-14 space-y-5"
          >
            <UBadge color="primary" variant="subtle" class="w-fit">
              {{ item.badge }}
            </UBadge>
            <h2 class="text-display text-3xl md:text-4xl text-highlighted">
              {{ item.title }}
            </h2>
            <p class="text-muted text-base md:text-lg leading-relaxed max-w-lg">
              {{ item.description }}
            </p>
            <div class="flex flex-wrap gap-3 pt-1">
              <UButton
                :to="item.primaryTo"
                color="primary"
                size="lg"
                trailing-icon="i-lucide-arrow-right"
              >
                {{ item.primaryLabel }}
              </UButton>
              <UButton
                :to="item.secondaryTo"
                target="_blank"
                color="neutral"
                variant="outline"
                size="lg"
                icon="i-simple-icons-whatsapp"
              >
                {{ item.secondaryLabel }}
              </UButton>
            </div>
          </div>
          <div
            class="relative hidden md:flex items-center justify-center bg-gradient-to-br p-10"
            :class="item.accent"
          >
            <div class="glass-panel rounded-2xl p-10 shadow-soft-lg flex flex-col items-center gap-4">
              <div class="flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UIcon :name="item.icon" class="size-10" />
              </div>
              <p class="text-sm font-semibold text-highlighted text-center">
                {{ item.badge }}
              </p>
            </div>
          </div>
        </div>
      </UCarousel>
    </UContainer>
  </section>
</template>
```

If `usePreferredReducedMotion` unavailable, use:

```ts
const motionQuery = useMediaQuery('(prefers-reduced-motion: reduce)')
const autoplay = computed(() => motionQuery.value ? false : { delay: 5500 })
```

- [ ] **Step 2: i18n keys** under `home.carousel.*` (label, export/umkm/ecom badge/title/desc) id+en. Add WA keys if missing: `whatsapp.consultExport`, `consultEcommerce`.

- [ ] **Step 3: Smoke** — `pnpm exec nuxt prepare`; ensure `HeroCarousel` in components.d.ts as `HeroCarousel` (pathPrefix false).

- [ ] **Step 4: Commit**

```bash
git add app/components/marketing/HeroCarousel.vue i18n/locales/id.json i18n/locales/en.json
git commit -m "feat(ui): enterprise hero carousel for export UMKM ecommerce"
```

---

### Task 4: TrustLogoStrip + HomeDomainPackages

**Files:**
- Create: `app/components/marketing/TrustLogoStrip.vue`
- Create: `app/components/marketing/HomeDomainPackages.vue`
- Optionally deprecate usage of thin `HomePricingStrip` on home (keep file for landings or delete later)

**Interfaces:**
- TrustLogoStrip: static array of `{ icon, label }` — SSL, Xendit, Responsive, SEO, Hosting unlimited, Support
- HomeDomainPackages: `useFetch('/api/domains/tlds', { key: 'home-domain-packages' })` show top 3 TLDs + CTA Cari Domain; include bullets domain+host+SSL

- [ ] **Step 1: TrustLogoStrip**

```vue
<script setup lang="ts">
const { t } = useI18n()
const items = computed(() => [
  { icon: 'i-lucide-shield-check', label: t('home.trust.ssl') },
  { icon: 'i-lucide-credit-card', label: t('home.trust.xendit') },
  { icon: 'i-lucide-smartphone', label: t('home.trust.responsive') },
  { icon: 'i-lucide-search', label: t('home.trust.seo') },
  { icon: 'i-lucide-server', label: t('home.trust.hosting') },
  { icon: 'i-lucide-headphones', label: t('home.trust.support') }
])
</script>

<template>
  <section class="py-8 border-y border-default bg-muted/30">
    <UContainer>
      <p class="text-center text-xs font-semibold uppercase tracking-wider text-muted mb-6">
        {{ t('home.trust.eyebrow') }}
      </p>
      <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <li
          v-for="item in items"
          :key="item.label"
          class="flex flex-col items-center gap-2 text-center"
        >
          <div class="flex size-11 items-center justify-center rounded-xl bg-default ring-1 ring-default shadow-soft-sm text-primary">
            <UIcon :name="item.icon" class="size-5" />
          </div>
          <span class="text-xs font-medium text-highlighted">{{ item.label }}</span>
        </li>
      </ul>
    </UContainer>
  </section>
</template>
```

- [ ] **Step 2: HomeDomainPackages**

- SectionHeading `index="03"` (or renumber consistently with final orchestra)
- 3 cards from TLD API (com, co.id, id preferred)
- Each: `.tld` title, `formatIdr(price)`, list Domain · Hosting unlimited · SSL
- CTA → `/order/choose-domain`
- Link text for other TLDs

- [ ] **Step 3: i18n** `home.trust.*`, `home.domainPackages.*`

- [ ] **Step 4: Commit**

```bash
git add app/components/marketing/TrustLogoStrip.vue app/components/marketing/HomeDomainPackages.vue i18n/locales
git commit -m "feat(ui): trust strip and domain package pricing section"
```

---

### Task 5: Rewrite template showcase + services + steps (legacy density)

**Files:**
- Modify: `HomeTemplateShowcase.vue`
- Modify: `HomeServicesBento.vue`
- Modify: `HomeSteps.vue`
- Modify: i18n

**Interfaces:**
- Templates: category chip row (all + export/umkm/ecommerce/company/craft/…), filter client-side, 8 cards, dual actions Lihat + Buat
- Services: 4 cards matching legacy export/umkm/ecommerce/custom with audience eyebrow
- Steps: keep 3 steps, larger, `SectionHeading index="02"` etc.

- [ ] **Step 1: Template showcase rewrite**

```ts
const categories = [
  { key: 'all', label: t('home.templatesCatAll') },
  { key: 'export', label: t('home.templatesCatExport') },
  // ... agriculture craft company automotive restaurant service ecommerce
]
const active = ref('all')
const filtered = computed(() => {
  const rows = data.value?.data ?? []
  if (active.value === 'all') return rows.slice(0, 8)
  return rows.filter(r => r.category === active.value).slice(0, 8)
})
```

UI: chips as `UButton` size sm; cards `card-lift`; footer Lihat semua.

- [ ] **Step 2: Services rewrite** — audience labels: `Untuk eksportir` / `Untuk UMKM` / `Untuk toko online` / `Untuk enterprise`

- [ ] **Step 3: Steps** — pass `index` on SectionHeading

- [ ] **Step 4: Commit**

```bash
git add app/components/marketing/HomeTemplateShowcase.vue app/components/marketing/HomeServicesBento.vue app/components/marketing/HomeSteps.vue i18n/locales
git commit -m "feat(ui): dense template chips and premium service cards"
```

---

### Task 6: Testimonials + community rewrite

**Files:**
- Modify: `HomeTestimonials.vue`
- Modify: `HomeCommunity.vue`
- i18n

- [ ] **Step 1: Testimonials**

- Stats strip: 12.000+ · 89% · 4.9/5 (large tabular)
- 3–5 testimonial cards: avatar icon circle, quote, name, role, optional site label
- SectionHeading `index` + eyebrow `Suara pengguna`

- [ ] **Step 2: Community**

- Headline 12.000+ UMKM · 34 provinsi
- 4 benefit tiles: Grup · Kelas · Promo · Dana talangan
- Avatar cluster decorative (initials circles) + CTA `/komunitas`

- [ ] **Step 3: Commit**

```bash
git add app/components/marketing/HomeTestimonials.vue app/components/marketing/HomeCommunity.vue i18n/locales
git commit -m "feat(ui): premium social proof and community sections"
```

---

### Task 7: Portfolio + Academy + Blog + Final CTA components

**Files:**
- Create: `HomePortfolioTeaser.vue`
- Create: `HomeAcademyTeaser.vue`
- Create: `HomeFinalCta.vue`
- Modify: `HomeBlogTeaser.vue`

- [ ] **Step 1: Portfolio teaser** — 3 static case cards (niche, metric, name) → `/portofolio`

- [ ] **Step 2: Academy teaser** — band `bg-primary/5`, 12 modul pitch, CTA `/academy`

- [ ] **Step 3: Blog teaser** — ensure 3 posts, dates, SectionHeading index, Lihat semua

- [ ] **Step 4: HomeFinalCta** — wraps UPageCTA + micro line `Balas cepat · SEO siap · Tanpa komitmen panjang`

- [ ] **Step 5: Commit**

```bash
git add app/components/marketing/HomePortfolioTeaser.vue app/components/marketing/HomeAcademyTeaser.vue app/components/marketing/HomeFinalCta.vue app/components/marketing/HomeBlogTeaser.vue i18n/locales
git commit -m "feat(ui): portfolio academy blog and final CTA bands"
```

---

### Task 8: Thin index.vue orchestra + hero polish

**Files:**
- Rewrite: `app/pages/index.vue`
- Modify: hero domain search styling if needed
- Modify: `PromoBanner` only if spacing conflicts

**Interfaces:**
- `index.vue` only composes sections — no heavy inline markup beyond hero mission block

- [ ] **Step 1: index.vue structure**

```vue
<template>
  <div>
    <!-- Hero mission -->
    <section class="bg-mesh-hero section-y pt-10 md:pt-14">
      <UContainer>
        <!-- badge price · h1 · subtitle · HeroDomainSearch · dual CTA · stats chips -->
      </UContainer>
    </section>

    <HeroCarousel />
    <TrustLogoStrip />
    <HomeTemplateShowcase />
    <HomeServicesBento />
    <HomeSteps />
    <HomeDomainPackages />
    <HomeTestimonials />
    <HomeCommunity />
    <HomePortfolioTeaser />
    <HomeBlogTeaser />
    <HomeAcademyTeaser />
    <HomeFinalCta />
  </div>
</template>
```

Use correct auto-import names (filename only).

- [ ] **Step 2: `pnpm exec nuxt prepare`** — verify each tag exists in `.nuxt/components.d.ts`

- [ ] **Step 3: Commit**

```bash
git add app/pages/index.vue
git commit -m "feat(ui): assemble enterprise home section orchestra"
```

---

### Task 9: Shell upgrade (header/footer enterprise)

**Files:**
- Modify: `app/layouts/default.vue`

- [ ] **Step 1: Header**

- Keep PromoBanner + glass sticky
- Ensure services dropdown shows 4 jasa with icons
- Primary CTA `shadow-glow-sky` desktop
- Optional: secondary text link Portofolio already in nav

- [ ] **Step 2: Footer**

- Brand blurb + WA
- Contact column: support email from runtimeConfig, WA number
- Legal links intact
- Social real placeholders OK

- [ ] **Step 3: Commit**

```bash
git add app/layouts/default.vue i18n/locales
git commit -m "feat(ui): enterprise marketing shell chrome"
```

---

### Task 10: i18n completeness (all home chrome)

**Files:**
- `i18n/locales/id.json`, `en.json`

- [ ] **Step 1: Grep hard-coded ID in new marketing components; move to i18n**

- [ ] **Step 2: Ensure EN parity for every new key**

- [ ] **Step 3: Commit**

```bash
git add i18n/locales app/components/marketing
git commit -m "feat(ui): i18n for enterprise home rewrite"
```

---

### Task 11: Verification

- [ ] **Step 1: Automated**

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected: green (lint attr warnings OK if pre-existing).

- [ ] **Step 2: Runtime**

```bash
pnpm prepare:data
# CI=true pnpm exec drizzle-kit push --force
pnpm db:seed
pnpm dev
```

Checklist:

| Check | Pass |
|-------|------|
| No Vue Anonymous missing template | |
| Home has carousel with 3 slides | |
| All sections 2–13 visible without huge empty gaps | |
| Domain search + TLD packages load | |
| Templates chips filter | |
| Dark mode: mesh/glass/carousel readable | |
| Mobile 375: carousel + search usable | |
| Reduced motion: carousel not aggressive | |
| Order flow still works from CTAs | |

- [ ] **Step 3: Fix regressions only; commit if needed**

```bash
git commit -m "fix(ui): enterprise home verification polish"
```

---

## Out of scope

- Real photography asset pipeline (use abstract glass/icon panels OK)
- Replacing Nuxt UI / adding GSAP suites
- Multi-tenant site builder editor
- Live registrar API
- Rewriting panel admin to enterprise OS (marketing only this plan)

## Self-review

1. **Legacy coverage:** carousel, design collection+chips, 4 services, domain packages, testimonials+stats, community, blog, final CTA, footer — all tasked. **Plus** trust logos, portfolio teaser, academy teaser (enterprise surplus).
2. **No placeholders:** concrete components, UCarousel pattern, i18n key groups.
3. **Auto-import:** pathPrefix false + filename tags documented.
4. **Premium vs cheap:** calm promo, mission hero, numbered sections, trust strip — not Rp97k-only screaming.

## Execution notes

- Prefer subagent-driven per task; smoke home after Tasks 3, 5, 8.
- If UCarousel API differs, adapt only `HeroCarousel.vue` using Nuxt UI docs/Context7.
- Keep payment/order APIs untouched.
- After component create: always check `.nuxt/components.d.ts` for exact export name.
