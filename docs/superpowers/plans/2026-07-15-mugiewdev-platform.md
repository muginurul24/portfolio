# MugiewDev Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete feature-parity website-builder platform (webekspor-class) on existing Nuxt 4 scaffold: order → Xendit pay → panel sites/orders, plus marketing polish.

**Architecture:** Nitro REST + Drizzle SQLite (Postgres-ready later). Session auth (`nuxt-auth-utils`). Server recomputes order totals from packages/TLDs/promo. Xendit invoice + webhook mutates payment/order; paid order creates site row (ops provisioning v1). Marketing uses Nuxt Content + SWR routeRules.

**Tech Stack:** Nuxt 4, Nuxt UI 4, Drizzle, better-sqlite3, Zod, Xendit, Resend, Vitest, pnpm.

## Global Constraints

- Stack locked: Nuxt 4 + Nuxt UI 4 + Tailwind 4 — no swap.
- Money: IDR integers only; format via `formatIdr()` in `app/utils/format.ts`.
- Validation: Zod on every API body (`readValidatedBody`).
- Auth: protect `/panel/**` with `middleware: 'auth'`. Roles: `customer | admin | cs`.
- Payments: never trust client totals; recompute server-side.
- i18n: user strings via `$t`/`t()`; default locale `id`.
- UI: Soft UI Evolution — primary sky CTA `#0369A1`, Plus Jakarta Sans, Lucide icons, light default.
- Package manager: `pnpm` only.
- Commits: conventional (`feat:`, `fix:`, `test:`, `docs:`). Never commit `.env`.
- Product: website builder, NOT goods marketplace/RFQ.
- Read first when coding UI: `DESIGN.md`, `AGENTS.md`, `docs/research/webekspor-analysis.md`.

## Current state (do not re-scaffold)

**Done:** Nuxt modules, schema, seed script, marketing pages stub, order wizard stub, login, panel shell, `/api/templates`, `/api/auth/login|logout`, format utils + tests.

**Missing / stub:** register, seed admin user, price engine, orders API, Xendit, webhook, panel data, template detail, domain API, packages API, promo validate API, blog/legal/portofolio pages, logo asset, stores/composables.

## File map (create / modify)

| Path | Role |
|------|------|
| `server/utils/id.ts` | `createId()`, `createOrderNumber()` |
| `server/utils/password.ts` | hash helpers if needed (prefer nuxt-auth-utils) |
| `server/utils/pricing.ts` | pure price recompute |
| `server/utils/xendit.ts` | invoice create wrapper |
| `server/utils/email.ts` | Resend wrapper (optional P1) |
| `server/api/auth/register.post.ts` | register |
| `server/api/auth/me.get.ts` | session user |
| `server/api/domains/check.get.ts` | domain availability stub |
| `server/api/domains/tlds.get.ts` | TLD list from DB |
| `server/api/packages/index.get.ts` | packages list |
| `server/api/promo/validate.post.ts` | promo check |
| `server/api/templates/[slug].get.ts` | template detail |
| `server/api/orders/index.post.ts` | create order + invoice |
| `server/api/orders/index.get.ts` | list my orders |
| `server/api/orders/[id].get.ts` | order detail |
| `server/api/sites/index.get.ts` | list my sites |
| `server/api/webhooks/xendit.post.ts` | payment webhook |
| `server/api/panel/stats.get.ts` | dashboard stats |
| `tests/pricing.test.ts` | price engine unit tests |
| `tests/promo.test.ts` | promo pure helpers if extracted |
| `scripts/seed.ts` | add admin user + expand seed |
| `app/stores/order.ts` | order wizard draft (Pinia) |
| `app/composables/useWhatsApp.ts` | WA deep link |
| `app/pages/templates/[slug].vue` | template detail |
| `app/pages/order/*` | wire real APIs |
| `app/pages/panel/*` | sites, orders, stats |
| `app/pages/register.vue` | register UI |
| `app/pages/blog/*`, legal, portofolio, tutorial | marketing parity |
| `public/images/main-logo.svg` | brand logo |
| `i18n/locales/{id,en}.json` | new keys |

---

### Task 1: IDs + pricing pure functions (TDD)

**Files:**
- Create: `server/utils/id.ts`
- Create: `server/utils/pricing.ts`
- Create: `tests/pricing.test.ts`
- Test: `tests/pricing.test.ts`

**Interfaces:**
- Produces:
  - `createId(prefix?: string): string`
  - `createOrderNumber(date?: Date): string` → `MD-YYYYMMDD-XXXX`
  - `computeOrderTotals(input: ComputeOrderInput): { subtotalIdr: number; discountIdr: number; totalIdr: number }`

```ts
// ComputeOrderInput shape
export interface ComputeOrderInput {
  packagePriceYearlyIdr: number
  termYears: number // 1|2|3
  domainPriceYearlyIdr: number // 0 if package includes domain already priced as bundle
  promo?: { discountIdr?: number | null; discountPercent?: number | null } | null
  // When package is domain+host bundle, pass packagePrice only and domainPriceYearlyIdr = 0
}
```

- [ ] **Step 1: Write failing tests**

Create `tests/pricing.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { computeOrderTotals } from '../server/utils/pricing'
import { createOrderNumber, createId } from '../server/utils/id'

describe('computeOrderTotals', () => {
  it('multiplies package by term years', () => {
    const r = computeOrderTotals({
      packagePriceYearlyIdr: 1_247_000,
      termYears: 2,
      domainPriceYearlyIdr: 0
    })
    expect(r.subtotalIdr).toBe(2_494_000)
    expect(r.discountIdr).toBe(0)
    expect(r.totalIdr).toBe(2_494_000)
  })

  it('applies fixed promo discount IDR', () => {
    const r = computeOrderTotals({
      packagePriceYearlyIdr: 1_247_000,
      termYears: 1,
      domainPriceYearlyIdr: 0,
      promo: { discountIdr: 500_000 }
    })
    expect(r.discountIdr).toBe(500_000)
    expect(r.totalIdr).toBe(747_000)
  })

  it('never returns negative total', () => {
    const r = computeOrderTotals({
      packagePriceYearlyIdr: 100_000,
      termYears: 1,
      domainPriceYearlyIdr: 0,
      promo: { discountIdr: 500_000 }
    })
    expect(r.totalIdr).toBe(0)
  })

  it('applies percent promo on subtotal', () => {
    const r = computeOrderTotals({
      packagePriceYearlyIdr: 1_000_000,
      termYears: 1,
      domainPriceYearlyIdr: 0,
      promo: { discountPercent: 10 }
    })
    expect(r.discountIdr).toBe(100_000)
    expect(r.totalIdr).toBe(900_000)
  })

  it('prefers fixed discountIdr over percent when both set', () => {
    const r = computeOrderTotals({
      packagePriceYearlyIdr: 1_000_000,
      termYears: 1,
      domainPriceYearlyIdr: 0,
      promo: { discountIdr: 50_000, discountPercent: 50 }
    })
    expect(r.discountIdr).toBe(50_000)
    expect(r.totalIdr).toBe(950_000)
  })
})

describe('createId', () => {
  it('returns prefix_ plus id', () => {
    const id = createId('ord')
    expect(id.startsWith('ord_')).toBe(true)
    expect(id.length).toBeGreaterThan(8)
  })
})

describe('createOrderNumber', () => {
  it('matches MD-YYYYMMDD-XXXX', () => {
    const n = createOrderNumber(new Date('2026-07-15T00:00:00Z'))
    expect(n).toMatch(/^MD-20260715-[A-Z0-9]{4}$/)
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
pnpm test tests/pricing.test.ts
```

Expected: FAIL module not found / cannot resolve.

- [ ] **Step 3: Implement `server/utils/id.ts`**

```ts
import { randomBytes } from 'node:crypto'

export function createId(prefix = 'id'): string {
  return `${prefix}_${randomBytes(12).toString('hex')}`
}

export function createOrderNumber(date = new Date()): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  const suffix = randomBytes(2).toString('hex').toUpperCase()
  return `MD-${y}${m}${d}-${suffix}`
}
```

- [ ] **Step 4: Implement `server/utils/pricing.ts`**

```ts
export interface ComputeOrderInput {
  packagePriceYearlyIdr: number
  termYears: number
  domainPriceYearlyIdr: number
  promo?: { discountIdr?: number | null; discountPercent?: number | null } | null
}

export function computeOrderTotals(input: ComputeOrderInput) {
  const term = Math.min(3, Math.max(1, Math.floor(input.termYears || 1)))
  const subtotalIdr = (input.packagePriceYearlyIdr + input.domainPriceYearlyIdr) * term

  let discountIdr = 0
  const promo = input.promo
  if (promo) {
    if (promo.discountIdr != null && promo.discountIdr > 0) {
      discountIdr = Math.floor(promo.discountIdr)
    } else if (promo.discountPercent != null && promo.discountPercent > 0) {
      discountIdr = Math.floor((subtotalIdr * promo.discountPercent) / 100)
    }
  }

  if (discountIdr > subtotalIdr) discountIdr = subtotalIdr
  const totalIdr = Math.max(0, subtotalIdr - discountIdr)
  return { subtotalIdr, discountIdr, totalIdr }
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
pnpm test tests/pricing.test.ts
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add server/utils/id.ts server/utils/pricing.ts tests/pricing.test.ts
git commit -m "$(cat <<'EOF'
feat: add order pricing engine and id helpers

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Seed admin user + expand catalog seed

**Files:**
- Modify: `scripts/seed.ts`
- Modify: `.env.example` (document demo login)

**Interfaces:**
- Consumes: schema `users`, `promoCodes`, packages, etc.
- Produces: seeded user `admin@mugiewdev.com` / `Admin123!` (dev only); keep existing promo/templates.

- [ ] **Step 1: Add password hash helper in seed**

Use Node crypto scrypt compatible with `nuxt-auth-utils` `hashPassword` if importable from script; otherwise call:

```ts
// Prefer in seed:
import { hashPassword } from 'nuxt-auth-utils/dist/runtime/server/utils/password'
// If that path fails at runtime, use:
// import { hash } from 'ohash' — DO NOT.
// Fallback: spawn via nitro not available; implement scrypt matching nuxt-auth-utils.
```

**Practical approach:** in seed script use dynamic import after checking nuxt-auth-utils API, or hash with:

```bash
# One-off verify in Node during task:
pnpm exec tsx -e "import { hashPassword } from 'nuxt-auth-utils'; console.log(await hashPassword('Admin123!'))"
```

If `hashPassword` not exportable from package root, use:

```ts
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto'

// Match nuxt-auth-utils format if documented as scrypt$...
// Read node_modules/nuxt-auth-utils password util and copy encode format EXACTLY.
```

**Required seed user row:**

```ts
{
  id: 'user_admin',
  email: 'admin@mugiewdev.com',
  name: 'Admin Mugiew',
  role: 'admin',
  passwordHash: '<hash of Admin123!>',
  phone: '6281280080275'
}
```

Also add customer demo:

```ts
{
  id: 'user_demo',
  email: 'demo@mugiewdev.com',
  name: 'Demo Customer',
  role: 'customer',
  passwordHash: '<hash of Demo1234!>',
  phone: '6281234567890'
}
```

- [ ] **Step 2: Expand packages** — add multi-year export/umkm and ecom standard if missing:

```ts
{
  id: 'pkg_export_2y',
  slug: 'website-ekspor-2y',
  name: 'Website Ekspor 2 Tahun',
  serviceType: 'export',
  priceYearlyIdr: 1_247_000, // yearly unit; termYears=2 applied at order time
  termYears: 2,
  features: ['Domain', 'Hosting unlimited', 'SSL', 'Email bisnis', 'Komunitas']
},
{
  id: 'pkg_ecom_standard',
  slug: 'toko-online-standard',
  name: 'Toko Online Standard',
  serviceType: 'ecommerce',
  priceYearlyIdr: 25_000_000,
  features: ['≤1000 SKU', 'Loyalty', 'Multi-warehouse', 'Wholesale'],
  termYears: 1
}
```

- [ ] **Step 3: Run seed**

```bash
pnpm prepare:data
pnpm db:push
pnpm db:seed
```

Expected: `Seed OK → ./.data/mugiew.sqlite` (or configured path).

- [ ] **Step 4: Document in `.env.example` comment**

```
# Dev logins after seed: admin@mugiewdev.com / Admin123! ; demo@mugiewdev.com / Demo1234!
```

- [ ] **Step 5: Commit**

```bash
git add scripts/seed.ts .env.example
git commit -m "$(cat <<'EOF'
feat: seed admin/demo users and expand packages

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Auth register + me endpoints

**Files:**
- Create: `server/api/auth/register.post.ts`
- Create: `server/api/auth/me.get.ts`
- Create: `app/pages/register.vue`
- Modify: `app/pages/login.vue` (link to register)
- Modify: `i18n/locales/id.json`, `i18n/locales/en.json`

**Interfaces:**
- Consumes: `users` table, `hashPassword`/`setUserSession` from nuxt-auth-utils
- Produces:
  - `POST /api/auth/register` body `{ email, password, name, phone? }` → `{ ok: true }`
  - `GET /api/auth/me` → `{ user }` or 401

- [ ] **Step 1: Implement register**

`server/api/auth/register.post.ts`:

```ts
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { createId } from '../../utils/id'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(20).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const email = body.email.toLowerCase().trim()

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email)
  })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Email sudah terdaftar' })
  }

  const passwordHash = await hashPassword(body.password)
  const id = createId('user')

  await db.insert(users).values({
    id,
    email,
    passwordHash,
    name: body.name.trim(),
    phone: body.phone?.trim() || null,
    role: 'customer'
  })

  await setUserSession(event, {
    user: { id, email, name: body.name.trim(), role: 'customer' }
  })

  return { ok: true }
})
```

- [ ] **Step 2: Implement me**

`server/api/auth/me.get.ts`:

```ts
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return { user: session.user }
})
```

- [ ] **Step 3: Register page**

Mirror `app/pages/login.vue` with fields name, email, phone, password; POST `/api/auth/register`; on success navigate `/panel`.

Add i18n keys:

```json
"auth": {
  "register": "Daftar",
  "name": "Nama lengkap",
  "phone": "WhatsApp",
  "haveAccount": "Sudah punya akun?",
  "noAccount": "Belum punya akun?"
}
```

(EN equivalents in `en.json`.)

- [ ] **Step 4: Manual smoke**

```bash
pnpm dev
# POST register via UI; login admin seed
```

- [ ] **Step 5: Commit**

```bash
git add server/api/auth/register.post.ts server/api/auth/me.get.ts app/pages/register.vue app/pages/login.vue i18n/locales/id.json i18n/locales/en.json
git commit -m "$(cat <<'EOF'
feat: add register and session me endpoints

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Catalog APIs (templates detail, packages, TLDs, domain check, promo)

**Files:**
- Create: `server/api/templates/[slug].get.ts`
- Create: `server/api/packages/index.get.ts`
- Create: `server/api/domains/tlds.get.ts`
- Create: `server/api/domains/check.get.ts`
- Create: `server/api/promo/validate.post.ts`
- Modify: `app/pages/templates/index.vue` (useFetch API)
- Create: `app/pages/templates/[slug].vue`

**Interfaces:**
- `GET /api/templates?category=&q=` → `{ data: Template[] }` (exists)
- `GET /api/templates/:slug` → `{ data: Template }`
- `GET /api/packages?serviceType=` → `{ data: Package[] }`
- `GET /api/domains/tlds` → `{ data: DomainTld[] }`
- `GET /api/domains/check?name=&tld=` → `{ domain, available: boolean }`
- `POST /api/promo/validate` body `{ code, subtotalIdr? }` → `{ valid, code, discountIdr, discountPercent }`

- [ ] **Step 1: Template by slug**

```ts
// server/api/templates/[slug].get.ts
import { and, eq } from 'drizzle-orm'
import { templates } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug wajib' })
  const db = useDb()
  const row = await db.query.templates.findFirst({
    where: and(eq(templates.slug, slug), eq(templates.isActive, true))
  })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Template tidak ditemukan' })
  return { data: row }
})
```

- [ ] **Step 2: Packages + TLDs**

```ts
// server/api/packages/index.get.ts
import { and, eq } from 'drizzle-orm'
import { packages } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const serviceType = typeof q.serviceType === 'string' ? q.serviceType : undefined
  const db = useDb()
  const data = await db.query.packages.findMany({
    where: and(
      eq(packages.isActive, true),
      serviceType ? eq(packages.serviceType, serviceType as never) : undefined
    ),
    orderBy: (p, { asc }) => [asc(p.sortOrder), asc(p.priceYearlyIdr)]
  })
  return { data }
})
```

```ts
// server/api/domains/tlds.get.ts
import { eq } from 'drizzle-orm'
import { domainTlds } from '../../database/schema'

export default defineEventHandler(async () => {
  const db = useDb()
  const data = await db.query.domainTlds.findMany({
    where: eq(domainTlds.isActive, true)
  })
  return { data }
})
```

- [ ] **Step 3: Domain check stub**

```ts
// server/api/domains/check.get.ts
import { z } from 'zod'

const querySchema = z.object({
  name: z.string().min(3).max(63).regex(/^[a-z0-9-]+$/i),
  tld: z.string().min(2).max(20)
})

export default defineEventHandler(async (event) => {
  const raw = getQuery(event)
  const parsed = querySchema.safeParse({ name: raw.name, tld: raw.tld })
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Nama domain tidak valid' })
  }
  const name = parsed.data.name.toLowerCase()
  const tld = parsed.data.tld.toLowerCase().replace(/^\./, '')
  const domain = `${name}.${tld}`
  // v1 stub: reserved words unavailable
  const reserved = new Set(['www', 'mail', 'admin', 'root', 'api', 'mugiewdev', 'webekspor'])
  const available = !reserved.has(name) && name.length >= 3
  return { domain, available, stub: true }
})
```

- [ ] **Step 4: Promo validate**

```ts
// server/api/promo/validate.post.ts
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { promoCodes } from '../../database/schema'

const bodySchema = z.object({
  code: z.string().min(2).max(40),
  subtotalIdr: z.number().int().nonnegative().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const code = body.code.trim().toUpperCase()
  const promo = await db.query.promoCodes.findFirst({
    where: and(eq(promoCodes.code, code), eq(promoCodes.isActive, true))
  })
  if (!promo) {
    return { valid: false, code, discountIdr: 0, discountPercent: null as number | null }
  }
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
    return { valid: false, code, discountIdr: 0, discountPercent: null }
  }
  const now = new Date()
  if (promo.validFrom && promo.validFrom > now) return { valid: false, code, discountIdr: 0, discountPercent: null }
  if (promo.validUntil && promo.validUntil < now) return { valid: false, code, discountIdr: 0, discountPercent: null }

  return {
    valid: true,
    code: promo.code,
    discountIdr: promo.discountIdr ?? 0,
    discountPercent: promo.discountPercent ?? null
  }
})
```

- [ ] **Step 5: Wire templates index to API**

In `app/pages/templates/index.vue` replace hardcoded `templates` ref with:

```ts
const activeCategory = ref('all')
const search = ref('')

const { data, status, refresh } = await useFetch('/api/templates', {
  key: 'templates-catalog',
  query: computed(() => ({
    category: activeCategory.value === 'all' ? undefined : activeCategory.value,
    q: search.value.trim() || undefined
  })),
  watch: [activeCategory, search]
})

const templates = computed(() => data.value?.data ?? [])
```

Client filter can stay as secondary if API already filters; prefer API-only filter.

- [ ] **Step 6: Template detail page**

`app/pages/templates/[slug].vue`:

```vue
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
          <UBadge class="mb-3">{{ tpl.category }}</UBadge>
          <h1 class="text-3xl font-semibold tracking-tight text-highlighted">{{ tpl.name }}</h1>
          <p v-if="tpl.description" class="mt-3 text-muted">{{ tpl.description }}</p>
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
```

- [ ] **Step 7: Smoke APIs**

```bash
curl -s "http://localhost:3000/api/templates" | head
curl -s "http://localhost:3000/api/promo/validate" -H 'content-type: application/json' -d '{"code":"WEBSITEJUARA"}'
curl -s "http://localhost:3000/api/domains/check?name=bisnisjaya&tld=com"
```

- [ ] **Step 8: Commit**

```bash
git add server/api/templates server/api/packages server/api/domains server/api/promo app/pages/templates
git commit -m "$(cat <<'EOF'
feat: catalog APIs and template detail page

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---
### Task 5: Create order API (server recompute + pending)

**Files:**
- Create: `server/api/orders/index.post.ts`
- Create: `server/api/orders/index.get.ts`
- Create: `server/api/orders/[id].get.ts`

**Interfaces:**
- Consumes: `computeOrderTotals`, packages, domainTlds, promoCodes, templates
- Produces `POST /api/orders` body:

```ts
{
  packageId: string
  templateId?: string
  templateSlug?: string
  domainName: string
  domainTld: string
  termYears: 1 | 2 | 3
  promoCode?: string
  customerName: string
  customerEmail: string
  customerPhone?: string
}
```

Response:

```ts
{
  data: {
    id: string
    orderNumber: string
    status: 'pending_payment'
    subtotalIdr: number
    discountIdr: number
    totalIdr: number
    paymentUrl?: string | null
    paymentId?: string | null
  }
}
```

**Pricing rule (locked):**
- Annual packages include domain+host in `packages.priceYearlyIdr`.
- For `export` | `umkm`: `domainPriceYearlyIdr = 0` (bundle). Validate TLD exists.
- Never use client-sent amounts.

- [ ] **Step 1: Implement POST orders**

```ts
// server/api/orders/index.post.ts
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { orders, packages, domainTlds, promoCodes, templates, payments } from '../../database/schema'
import { createId, createOrderNumber } from '../../utils/id'
import { computeOrderTotals } from '../../utils/pricing'

const bodySchema = z.object({
  packageId: z.string().min(1),
  templateId: z.string().optional(),
  templateSlug: z.string().optional(),
  domainName: z.string().min(3).max(80),
  domainTld: z.string().min(2).max(20),
  termYears: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
  promoCode: z.string().max(40).optional(),
  customerName: z.string().min(2).max(120),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8).max(20).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const session = await getUserSession(event)

  const pkg = await db.query.packages.findFirst({
    where: and(eq(packages.id, body.packageId), eq(packages.isActive, true))
  })
  if (!pkg) throw createError({ statusCode: 400, statusMessage: 'Paket tidak valid' })

  const tld = body.domainTld.toLowerCase().replace(/^\./, '')
  const tldRow = await db.query.domainTlds.findFirst({
    where: and(eq(domainTlds.tld, tld), eq(domainTlds.isActive, true))
  })
  if (!tldRow) throw createError({ statusCode: 400, statusMessage: 'TLD tidak didukung' })

  let templateId = body.templateId || null
  if (!templateId && body.templateSlug) {
    const tpl = await db.query.templates.findFirst({
      where: and(eq(templates.slug, body.templateSlug), eq(templates.isActive, true))
    })
    templateId = tpl?.id ?? null
  }

  let promo: { discountIdr?: number | null; discountPercent?: number | null } | null = null
  let promoCode: string | null = null
  if (body.promoCode?.trim()) {
    const code = body.promoCode.trim().toUpperCase()
    const row = await db.query.promoCodes.findFirst({
      where: and(eq(promoCodes.code, code), eq(promoCodes.isActive, true))
    })
    if (!row) throw createError({ statusCode: 400, statusMessage: 'Kode promo tidak valid' })
    promo = { discountIdr: row.discountIdr, discountPercent: row.discountPercent }
    promoCode = row.code
  }

  const totals = computeOrderTotals({
    packagePriceYearlyIdr: pkg.priceYearlyIdr,
    termYears: body.termYears,
    domainPriceYearlyIdr: 0,
    promo
  })

  const rawDomain = body.domainName.toLowerCase().replace(/\.$/, '')
  const domainName = rawDomain.includes('.')
    ? rawDomain.split('.')[0]!
    : rawDomain.replace(/[^a-z0-9-]/g, '')

  const orderId = createId('ord')
  const orderNumber = createOrderNumber()
  const userId = (session.user as { id?: string } | undefined)?.id ?? null

  await db.insert(orders).values({
    id: orderId,
    orderNumber,
    userId,
    packageId: pkg.id,
    templateId,
    domainName,
    domainTld: tld,
    termYears: body.termYears,
    subtotalIdr: totals.subtotalIdr,
    discountIdr: totals.discountIdr,
    totalIdr: totals.totalIdr,
    promoCode,
    status: 'pending_payment',
    customerName: body.customerName.trim(),
    customerEmail: body.customerEmail.toLowerCase().trim(),
    customerPhone: body.customerPhone?.trim() || null
  })

  const paymentId = createId('pay')
  await db.insert(payments).values({
    id: paymentId,
    orderId,
    amountIdr: totals.totalIdr,
    status: 'pending'
  })

  return {
    data: {
      id: orderId,
      orderNumber,
      status: 'pending_payment' as const,
      subtotalIdr: totals.subtotalIdr,
      discountIdr: totals.discountIdr,
      totalIdr: totals.totalIdr,
      paymentId,
      paymentUrl: null as string | null
    }
  }
})
```

- [ ] **Step 2: List + get orders (auth)**

```ts
// server/api/orders/index.get.ts
import { eq } from 'drizzle-orm'
import { orders } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const user = session.user as { id: string; role: string }
  const db = useDb()

  if (user.role === 'admin' || user.role === 'cs') {
    const data = await db.query.orders.findMany({
      orderBy: (o, { desc: d }) => [d(o.createdAt)],
      limit: 100
    })
    return { data }
  }

  const data = await db.query.orders.findMany({
    where: eq(orders.userId, user.id),
    orderBy: (o, { desc: d }) => [d(o.createdAt)]
  })
  return { data }
})
```

```ts
// server/api/orders/[id].get.ts
import { eq } from 'drizzle-orm'
import { orders } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const user = session.user as { id: string; role: string; email?: string }
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })
  const db = useDb()
  const row = await db.query.orders.findFirst({ where: eq(orders.id, id) })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Pesanan tidak ditemukan' })
  const isStaff = user.role === 'admin' || user.role === 'cs'
  if (!isStaff && row.userId !== user.id && row.customerEmail !== user.email) {
    throw createError({ statusCode: 403, statusMessage: 'Akses ditolak' })
  }
  return { data: row }
})
```

- [ ] **Step 3: Smoke create order** after seed packages exist.

- [ ] **Step 4: Commit**

```bash
git add server/api/orders
git commit -m "feat: create and list orders with server-side pricing"
```

---

### Task 6: Xendit invoice + webhook + site row

**Files:**
- Create: `server/utils/xendit.ts`
- Modify: `server/api/orders/index.post.ts`
- Create: `server/api/webhooks/xendit.post.ts`
- Create: `server/api/orders/[id]/mark-paid-dev.post.ts`
- Create: `server/api/sites/index.get.ts`
- Create: `server/api/panel/stats.get.ts`

**Interfaces:**
- `createXenditInvoice(...) => { id, invoiceUrl } | null`
- Webhook verifies `x-callback-token` === `runtimeConfig.xenditWebhookToken`
- Paid path: payment paid → order paid → insert site provisioning → order provisioning
- Dev helper mark-paid only when `import.meta.dev`

- [ ] **Step 1: Xendit util**

```ts
// server/utils/xendit.ts
import { Xendit } from 'xendit-node'

export function getXenditClient() {
  const config = useRuntimeConfig()
  const secret = config.xenditSecretKey as string
  if (!secret) return null
  return new Xendit({ secretKey: secret })
}

export async function createXenditInvoice(input: {
  externalId: string
  amount: number
  email: string
  description: string
  successRedirectUrl: string
  failureRedirectUrl: string
}) {
  const client = getXenditClient()
  if (!client) return null

  // If SDK method names differ in xendit-node v7, adapt here only.
  const invoice = await client.Invoice.createInvoice({
    data: {
      externalId: input.externalId,
      amount: input.amount,
      payerEmail: input.email,
      description: input.description,
      successRedirectUrl: input.successRedirectUrl,
      failureRedirectUrl: input.failureRedirectUrl,
      currency: 'IDR'
    }
  })
  return {
    id: String((invoice as { id?: string }).id || ''),
    invoiceUrl: String((invoice as { invoiceUrl?: string }).invoiceUrl || '')
  }
}
```

- [ ] **Step 2: After payment insert in order POST, create invoice**

```ts
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl as string
const invoice = await createXenditInvoice({
  externalId: orderNumber,
  amount: totals.totalIdr,
  email: body.customerEmail.toLowerCase().trim(),
  description: `MugiewDev ${orderNumber} — ${domainName}.${tld}`,
  successRedirectUrl: `${siteUrl}/order/success?order=${orderId}`,
  failureRedirectUrl: `${siteUrl}/order/checkout?failed=1`
})

if (invoice?.id) {
  await db.update(payments).set({
    providerRef: invoice.id,
    updatedAt: new Date()
  }).where(eq(payments.id, paymentId))
}

return {
  data: {
    id: orderId,
    orderNumber,
    status: 'pending_payment' as const,
    subtotalIdr: totals.subtotalIdr,
    discountIdr: totals.discountIdr,
    totalIdr: totals.totalIdr,
    paymentId,
    paymentUrl: invoice?.invoiceUrl ?? null
  }
}
```

- [ ] **Step 3: Webhook handler**

```ts
// server/api/webhooks/xendit.post.ts
import { eq } from 'drizzle-orm'
import { orders, payments, sites, promoCodes } from '../../database/schema'
import { createId } from '../../utils/id'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getHeader(event, 'x-callback-token')
  if (!config.xenditWebhookToken || token !== config.xenditWebhookToken) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook token' })
  }

  const body = await readBody(event) as {
    id?: string
    external_id?: string
    status?: string
    payment_method?: string
  }

  const status = (body.status || '').toUpperCase()
  if (status !== 'PAID' && status !== 'SETTLED') {
    return { ok: true, ignored: true }
  }

  const db = useDb()
  const providerRef = body.id || null
  const externalId = body.external_id || null

  let payment = providerRef
    ? await db.query.payments.findFirst({ where: eq(payments.providerRef, providerRef) })
    : null

  if (!payment && externalId) {
    const order = await db.query.orders.findFirst({ where: eq(orders.orderNumber, externalId) })
    if (order) {
      payment = await db.query.payments.findFirst({ where: eq(payments.orderId, order.id) })
    }
  }

  if (!payment) {
    throw createError({ statusCode: 404, statusMessage: 'Payment not found' })
  }
  if (payment.status === 'paid') return { ok: true, duplicate: true }

  const now = new Date()
  await db.update(payments).set({
    status: 'paid',
    paidAt: now,
    method: body.payment_method || null,
    rawPayload: body,
    updatedAt: now
  }).where(eq(payments.id, payment.id))

  const order = await db.query.orders.findFirst({ where: eq(orders.id, payment.orderId) })
  if (!order) return { ok: true }

  await db.update(orders).set({
    status: 'paid',
    paidAt: now,
    updatedAt: now
  }).where(eq(orders.id, order.id))

  if (order.promoCode) {
    const promo = await db.query.promoCodes.findFirst({ where: eq(promoCodes.code, order.promoCode) })
    if (promo) {
      await db.update(promoCodes).set({
        usedCount: (promo.usedCount || 0) + 1
      }).where(eq(promoCodes.id, promo.id))
    }
  }

  const userId = order.userId
  if (userId && order.domainName && order.domainTld) {
    const domain = `${order.domainName}.${order.domainTld}`
    const expires = new Date(now)
    expires.setFullYear(expires.getFullYear() + (order.termYears || 1))
    await db.insert(sites).values({
      id: createId('site'),
      userId,
      orderId: order.id,
      templateId: order.templateId,
      domain,
      status: 'provisioning',
      expiresAt: expires
    }).onConflictDoNothing()

    await db.update(orders).set({
      status: 'provisioning',
      updatedAt: new Date()
    }).where(eq(orders.id, order.id))
  }

  return { ok: true }
})
```

- [ ] **Step 4: Dev mark-paid**

```ts
// server/api/orders/[id]/mark-paid-dev.post.ts
import { eq } from 'drizzle-orm'
import { orders, payments, sites } from '../../../database/schema'
import { createId } from '../../../utils/id'

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  const session = await getUserSession(event)
  if (!session.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })
  const db = useDb()
  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) })
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const now = new Date()
  await db.update(payments).set({ status: 'paid', paidAt: now, updatedAt: now }).where(eq(payments.orderId, id))
  await db.update(orders).set({ status: 'paid', paidAt: now, updatedAt: now }).where(eq(orders.id, id))

  const userId = order.userId || (session.user as { id: string }).id
  if (userId && order.domainName && order.domainTld) {
    const domain = `${order.domainName}.${order.domainTld}`
    const expires = new Date(now)
    expires.setFullYear(expires.getFullYear() + (order.termYears || 1))
    await db.insert(sites).values({
      id: createId('site'),
      userId,
      orderId: order.id,
      templateId: order.templateId,
      domain,
      status: 'provisioning',
      expiresAt: expires
    }).onConflictDoNothing()
    await db.update(orders).set({ status: 'provisioning', updatedAt: new Date() }).where(eq(orders.id, id))
  }
  return { ok: true }
})
```

- [ ] **Step 5: Sites + panel stats APIs**

```ts
// server/api/sites/index.get.ts
import { eq } from 'drizzle-orm'
import { sites } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const user = session.user as { id: string; role: string }
  const db = useDb()
  if (user.role === 'admin') {
    return { data: await db.query.sites.findMany({ limit: 100 }) }
  }
  return { data: await db.query.sites.findMany({ where: eq(sites.userId, user.id) }) }
})
```

```ts
// server/api/panel/stats.get.ts
import { eq } from 'drizzle-orm'
import { sites, orders, courseProgress } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const user = session.user as { id: string }
  const db = useDb()
  const userSites = await db.query.sites.findMany({ where: eq(sites.userId, user.id) })
  const userOrders = await db.query.orders.findMany({ where: eq(orders.userId, user.id) })
  const siteIds = new Set(userSites.map(s => s.id))
  const allInquiries = siteIds.size ? await db.query.inquiries.findMany() : []
  const inquiryCount = allInquiries.filter(i => i.siteId && siteIds.has(i.siteId) && i.status === 'new').length
  const progress = await db.query.courseProgress.findMany({ where: eq(courseProgress.userId, user.id) })

  return {
    data: {
      activeSites: userSites.filter(s => s.status === 'active' || s.status === 'provisioning').length,
      orders: userOrders.length,
      newInquiries: inquiryCount,
      academyCompleted: progress.filter(p => p.completedAt).length
    }
  }
})
```

- [ ] **Step 6: Commit**

```bash
git add server/utils/xendit.ts server/api/webhooks server/api/orders server/api/sites server/api/panel
git commit -m "feat: Xendit invoice, webhook, and site provisioning records"
```

---

### Task 7: Wire order wizard UI to APIs

**Files:**
- Create: `app/stores/order.ts`
- Modify: `app/pages/order/choose-domain.vue`
- Modify: `app/pages/order/checkout.vue`
- Create: `app/pages/order/success.vue`
- Modify: i18n locales

- [ ] **Step 1: Pinia store**

```ts
// app/stores/order.ts
import { defineStore } from 'pinia'

export const useOrderStore = defineStore('order', {
  state: () => ({
    domainName: '' as string,
    domainTld: 'com' as string,
    templateSlug: '' as string,
    packageId: 'pkg_export_1y' as string,
    termYears: 1 as 1 | 2 | 3,
    promoCode: '' as string
  }),
  getters: {
    fullDomain: (s) => (s.domainName ? `${s.domainName}.${s.domainTld}` : '')
  },
  actions: {
    setDomain(name: string, tld: string) {
      this.domainName = name
      this.domainTld = tld
    },
    setTemplate(slug: string) {
      this.templateSlug = slug
    }
  }
})
```

- [ ] **Step 2: choose-domain**

- Fetch TLDs: `useFetch('/api/domains/tlds', { key: 'domain-tlds' })`
- Check: `$fetch('/api/domains/check', { query: { name, tld } })`
- On continue: write store + navigate checkout with query

- [ ] **Step 3: checkout submit**

```ts
const res = await $fetch<{ data: {
  id: string
  paymentUrl: string | null
} }>('/api/orders', {
  method: 'POST',
  body: {
    packageId: form.packageId || 'pkg_export_1y',
    templateSlug: template.value || undefined,
    domainName: domainParts.name,
    domainTld: domainParts.tld,
    termYears: Number(form.termYears) as 1 | 2 | 3,
    promoCode: form.promoCode || undefined,
    customerName: form.name,
    customerEmail: form.email,
    customerPhone: form.phone
  }
})
if (res.data.paymentUrl) {
  await navigateTo(res.data.paymentUrl, { external: true })
} else {
  await navigateTo({ path: localePath('/order/success'), query: { order: res.data.id } })
}
```

Promo:

```ts
const r = await $fetch<{ valid: boolean; discountIdr: number }>('/api/promo/validate', {
  method: 'POST',
  body: { code: form.promoCode }
})
if (r.valid) promoDiscount.value = r.discountIdr
else error.value = 'Kode promo tidak valid'
```

- [ ] **Step 4: success page** — order id, link panel/login, WA support.

- [ ] **Step 5: Manual E2E**

1. Login/register
2. Domain → checkout → create order
3. `POST /api/orders/:id/mark-paid-dev`
4. Panel shows site/order

- [ ] **Step 6: Commit**

```bash
git add app/stores/order.ts app/pages/order
git commit -m "feat: wire order wizard to catalog and payment APIs"
```

---

### Task 8: Panel pages

**Files:**
- Modify: `app/pages/panel/index.vue`
- Create: `app/pages/panel/orders/index.vue`
- Create: `app/pages/panel/sites/index.vue`
- Create: `app/pages/panel/inquiries/index.vue`
- Create: `app/pages/panel/settings/index.vue`
- Create: `app/pages/panel/academy/index.vue`

- [ ] **Step 1: Dashboard stats** via `useFetch('/api/panel/stats', { key: 'panel-stats' })`

- [ ] **Step 2: Orders list** via `useFetch('/api/orders')` — orderNumber, domain, status badge, `formatIdr(totalIdr)`

- [ ] **Step 3: Sites list** via `useFetch('/api/sites')`

- [ ] **Step 4: Empty states** for inquiries/academy

- [ ] **Step 5: Commit**

```bash
git add app/pages/panel
git commit -m "feat: panel dashboard orders and sites from API"
```

---

### Task 9: Brand assets

**Files:**
- Create: `public/images/main-logo.svg`
- Refresh: `public/favicon.ico`
- Modify: `app/components/AppLogo.vue`

- [ ] **Step 1: Download**

```bash
mkdir -p public/images
curl -fsSL "https://www.webekspor.com/images/main-logo.svg" -o public/images/main-logo.svg
curl -fsSL "https://www.webekspor.com/favicon.ico" -o public/favicon.ico
```

- [ ] **Step 2: AppLogo uses `/images/main-logo.svg`**

```vue
<template>
  <img
    src="/images/main-logo.svg"
    alt="MugiewDev"
    class="h-7 w-auto"
    width="140"
    height="28"
  >
</template>
```

- [ ] **Step 3: Commit**

```bash
git add public/images/main-logo.svg public/favicon.ico app/components/AppLogo.vue
git commit -m "feat: brand logo and favicon assets"
```

---

### Task 10: Marketing parity pages

**Files:**
- Create: `app/pages/blog/index.vue`, `app/pages/blog/[...slug].vue`
- Create: `app/pages/portofolio/index.vue`
- Create: `app/pages/tutorial/index.vue`
- Create: `app/pages/syarat-ketentuan.vue`, `app/pages/privasi.vue`, `app/pages/refund.vue`
- Content samples under `content/blog/`, `content/tutorial/`
- Modify footer links in `app/layouts/default.vue` if missing

- [ ] **Step 1: Blog list**

```ts
const { data: posts } = await useAsyncData('blog-list', () =>
  queryCollection('blog').order('date', 'DESC').all()
)
```

Detail via path from collection.

- [ ] **Step 2: Legal pages** — prose sections: layanan, bayar, SLA unpaid auto-cancel 2x24 jam, refund ringkas. Copy ID professional.

- [ ] **Step 3: Portofolio grid** — static case cards OK v1.

- [ ] **Step 4: Tutorial index** from content collection.

- [ ] **Step 5: Commit**

```bash
git add app/pages content app/layouts/default.vue
git commit -m "feat: blog legal portfolio and tutorial marketing pages"
```

---

### Task 11: Service landings polish

**Files:**
- Modify: four `app/pages/jasa-pembuatan-website-*.vue`
- Optional: `app/components/marketing/ServicePricing.vue`, `Steps.vue`

- [ ] **Step 1: Fetch packages** with `serviceType` query per page

- [ ] **Step 2: Section order** Hero → Proof → Features → Steps → Pricing → CTA (`DESIGN.md`)

- [ ] **Step 3: Ecommerce pricing** Basic 15jt / Standard 25jt from packages table

- [ ] **Step 4: Commit**

```bash
git add app/pages/jasa-pembuatan-website-umkm.vue app/pages/jasa-pembuatan-website-ekspor.vue app/pages/jasa-pembuatan-website-toko-online.vue app/pages/jasa-pembuatan-website-custom.vue app/components/marketing
git commit -m "feat: polish service landings with live package pricing"
```

---

### Task 12: i18n + WhatsApp composable

**Files:**
- Create: `app/composables/useWhatsApp.ts`
- Modify: `i18n/locales/id.json`, `en.json`

```ts
// app/composables/useWhatsApp.ts
export function useWhatsApp() {
  const config = useRuntimeConfig()
  const number = computed(() => config.public.whatsappNumber as string)
  function link(text?: string) {
    const base = `https://wa.me/${number.value}`
    return text ? `${base}?text=${encodeURIComponent(text)}` : base
  }
  return { number, link }
}
```

- [ ] **Step 1: Add composable**
- [ ] **Step 2: Move hard-coded user strings from new pages into i18n**
- [ ] **Step 3: Commit**

```bash
git add app/composables/useWhatsApp.ts i18n/locales
git commit -m "feat: WhatsApp composable and i18n string coverage"
```

---

### Task 13: Verification

- [ ] **Step 1: Automated**

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected: green. Fix type errors from new APIs if any.

- [ ] **Step 2: Manual E2E checklist**

1. Home + logo
2. Templates list/detail from DB
3. Domain reserved words unavailable
4. Checkout recomputes total + WEBSITEJUARA
5. Dev mark-paid creates site
6. Panel stats/orders/sites
7. Seed admin login
8. Register new user
9. Webhook bad token → 401
10. Logged-out `/panel` → login

- [ ] **Step 3: Commit fixes if needed**

```bash
git add -A
git commit -m "fix: verification fixes after platform wire-up"
```

---

## Out of scope this plan

- Live multi-tenant visual site editor
- Real domain registrar API
- Full academy video + quiz engine
- Production Resend templates (optional later)
- Admin CRUD UI beyond lists
- Dana talangan underwriting
- Loyalty/wholesale on customer sites

## Self-review

1. **Spec coverage:** Design v1 items map to Tasks 1–13 (auth, catalog, order+Xendit, panel, marketing pages, assets).
2. **Placeholders:** No TBD; concrete code and commands.
3. **Type consistency:** `computeOrderTotals` and order POST body aligned Tasks 1, 5, 7.
4. **Differentiation:** server price integrity, SEO modules already scaffolded, Soft UI Evolution, panel stats, dev mark-paid path.

## Execution notes

- Small commits per task.
- Adapt only `server/utils/xendit.ts` if SDK shape differs.
- SQLite: `file:./.data/mugiew.sqlite`.
- Guest checkout allowed (`userId` null); site row needs userId — prefer login before pay for full path.
