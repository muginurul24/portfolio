# Conversion + Ops Excellence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden money-path security, then make MugiewDev conversion-honest and post-pay trustworthy: pay-token access, free-order provision, domain truth, QRIS pay polish, success/SLA timeline, sticky checkout, panel pay-resume, QRIS trust, ops queue + 48h expiry, inquiry leads, Soft Glass error page.

**Architecture:** Keep Nuxt 4 + Nuxt UI Soft Glass + QrisVIP QRIS-only. Security first (signed pay token + webhook fail-closed + free-order fulfill), then conversion UX + ops automation on existing APIs. Small focused files. No second payment provider.

**Tech Stack:** Nuxt 4, Nuxt UI 4, Tailwind 4, Drizzle + SQLite, Zod, Vitest, QrisVIP, existing `formatIdr` / order store / Soft Glass tokens.

## Global Constraints

- Stack lock: Nuxt 4 + Nuxt UI 4 + pnpm — no kit swap.
- Payments: **QRIS only via QrisVIP** — never reintroduce Xendit as live rail.
- Money: IDR **integers**, server recompute totals, never trust client amounts.
- Copy: **Bahasa Indonesia first**, EN via i18n; active voice UMKM-friendly.
- Primary CTA color: sky `#0369A1`; font UI Plus Jakarta Sans; icons `i-lucide-*` / `i-simple-icons-*`.
- Design: Enterprise Soft Glass (`DESIGN.md`) — `glass-panel`, `shadow-soft-*`, `bg-mesh-hero`, light default + dark pairs.
- Auth roles: `customer | cs | admin | dev`; protect panel/dev with existing middleware.
- Strings: all user-facing via `t()` / `$t` — no hard-coded ID/EN except brand names.
- Tests: Vitest; extend unit tests for pricing/expiry/domain messaging; run `pnpm test` after task clusters.
- Commits: conventional `feat:`, `fix:`, `docs:`, `chore:`; never commit `.env`.
- Out of scope this plan: real domain registrar API, multi-PG rails, academy LMS/quiz/cert, community auto-invite automation, HS-code builder.

## Audit synthesis (why these tasks)

Three parallel audits (product / backend / UX) merged. Order: **security money path → conversion UX → ops → docs/tests**.

| Gap | Severity | Task |
|-----|----------|------|
| Public payment GET/status IDOR (no auth/token) | P0 security | Task 0 |
| Webhook secret optional; free order skips provision; ecom seed > QRIS max; mark-paid-dev loose | P0 security | Task 0b |
| Trust badge still says Xendit while pay is QRIS | P0 trust | Task 1 |
| Domain check always “available” (stub) — false certainty | P0 trust | Task 2 |
| Pay page: no countdown, weak tips, hard-coded strings, no stepper | P0 conversion | Task 3 |
| Success page thin next-steps / SLA; raw status | P0 trust | Task 4 |
| Panel orders: no resume pay CTA | P0 conversion | Task 4b |
| Checkout friction (sticky total, defaults, package cards) | P1 conversion | Task 5 |
| Template catalog shop-window weak (placeholder only) | P1 conversion | Task 6 |
| No unpaid auto-expire (WE: 2×24h) | P1 ops | Task 7 |
| Dev has no paid-provision queue focus | P1 ops | Task 8 |
| Service pages lack structured inquiry → DB | P1 leads | Task 9 |
| No `error.vue`; domain inputs placeholder-only labels | P1 UX | Task 9b |
| AGENTS.md still documents Xendit webhook path | P2 docs | Task 10 |
| Thin API tests for money path | P2 quality | Task 11 |
| Floating WA + HomePricingStrip mount | P2 UX | Task 12 |

**Already strong — do not rebuild:** Soft Glass home orchestra, QrisVIP generate/check/webhook + `fulfillPaidOrder`, promo engine, dev full CRUD, role matrix, server total recompute, route parity with webekspor, i18n key parity 540/540.

**Explicitly deferred:** real registrar, multi-PG, academy LMS, password-reset full Resend flow, rate-limit plugin (note only), Postgres migration.

---

### Task 0: Signed pay-access token (kill payment IDOR)

**Files:**
- Create: `server/utils/pay-token.ts`
- Modify: `server/api/orders/index.post.ts` — return `payToken` in create response
- Modify: `server/api/orders/[id]/payment.get.ts` — require token or session owner
- Modify: `server/api/orders/[id]/payment-status.get.ts` — same gate
- Modify: `app/pages/order/checkout.vue` — navigate with token query
- Modify: `app/pages/order/pay/[id].vue` — pass token to fetches
- Test: `tests/pay-token.test.ts`

**Interfaces:**
- Consumes: `orderId`, `runtimeConfig.session.password` or dedicated `payTokenSecret` (≥32)
- Produces:
  - `signPayToken(orderId: string, ttlSec = 172800): string` (48h)
  - `verifyPayToken(token: string, orderId: string): boolean`
  - HMAC-SHA256 payload `orderId.exp` base64url

- [ ] **Step 1: Failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { signPayToken, verifyPayToken } from '../server/utils/pay-token'

describe('pay-token', () => {
  const secret = 'x'.repeat(32)
  it('roundtrips', () => {
    const t = signPayToken('ord_1', secret, 3600)
    expect(verifyPayToken(t, 'ord_1', secret)).toBe(true)
  })
  it('rejects wrong order', () => {
    const t = signPayToken('ord_1', secret, 3600)
    expect(verifyPayToken(t, 'ord_2', secret)).toBe(false)
  })
  it('rejects tampered', () => {
    const t = signPayToken('ord_1', secret, 3600)
    expect(verifyPayToken(t + 'x', 'ord_1', secret)).toBe(false)
  })
})
```

- [ ] **Step 2: Run — FAIL missing module**

Run: `pnpm test tests/pay-token.test.ts`

- [ ] **Step 3: Implement `server/utils/pay-token.ts`**

Use Node `crypto.createHmac('sha256', secret)`. Format: `base64url(orderId).base64url(expMs).base64url(sig)`.

```ts
import { createHmac, timingSafeEqual } from 'node:crypto'

function b64url(input: string | Buffer) {
  return Buffer.from(input).toString('base64url')
}

export function signPayToken(orderId: string, secret: string, ttlSec = 172800): string {
  const exp = String(Date.now() + ttlSec * 1000)
  const body = `${b64url(orderId)}.${b64url(exp)}`
  const sig = createHmac('sha256', secret).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyPayToken(token: string, orderId: string, secret: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [oidB64, expB64, sig] = parts
  if (!oidB64 || !expB64 || !sig) return false
  const body = `${oidB64}.${expB64}`
  const expected = createHmac('sha256', secret).update(body).digest('base64url')
  try {
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false
  } catch {
    return false
  }
  const id = Buffer.from(oidB64, 'base64url').toString('utf8')
  const exp = Number(Buffer.from(expB64, 'base64url').toString('utf8'))
  if (id !== orderId) return false
  if (!Number.isFinite(exp) || Date.now() > exp) return false
  return true
}

export async function assertPayAccess(event: H3Event, order: { id: string, userId: string | null, customerEmail: string | null }) {
  const config = useRuntimeConfig()
  const secret = String(config.payTokenSecret || config.session?.password || '')
  if (secret.length < 32) {
    throw createError({ statusCode: 500, statusMessage: 'Pay token secret not configured' })
  }
  const q = getQuery(event)
  const token = String(q.token || getHeader(event, 'x-pay-token') || '')
  if (token && verifyPayToken(token, order.id, secret)) return { via: 'token' as const }

  const session = await getUserSession(event)
  const u = session.user as { id?: string, email?: string, role?: string } | undefined
  if (u?.role === 'dev' || u?.role === 'admin' || u?.role === 'cs') return { via: 'staff' as const }
  if (u?.id && order.userId && u.id === order.userId) return { via: 'session' as const }
  const email = u?.email?.toLowerCase().trim()
  if (email && order.customerEmail?.toLowerCase() === email) return { via: 'session' as const }

  throw createError({ statusCode: 401, statusMessage: 'Token bayar tidak valid atau kedaluwarsa' })
}
```

Wire `runtimeConfig.payTokenSecret` from `NUXT_PAY_TOKEN_SECRET` fallback session password in `nuxt.config.ts`.

- [ ] **Step 4: Gate payment.get + payment-status.get** with `assertPayAccess` after loading order. Strip `providerRef` from public payment GET response (keep internal only) — return `providerRef` only to staff optional; customers need only `qrisPayload`.

- [ ] **Step 5: Order create returns `payToken` + `payPath` including `?token=`**

```ts
const payToken = signPayToken(orderId, secret)
// payPath: `/order/pay/${orderId}?token=${encodeURIComponent(payToken)}`
```

Checkout navigates `localePath(payPath)` already if server embeds token in path.

Pay page reads `route.query.token` and passes to `useFetch` query.

- [ ] **Step 6: Tests PASS + commit**

```bash
git add server/utils/pay-token.ts server/api/orders nuxt.config.ts app/pages/order tests/pay-token.test.ts .env.example
git commit -m "fix(security): signed pay token gates payment endpoints"
```

---

### Task 0b: Money-path correctness (webhook, free order, seed cap, mark-paid-dev)

**Files:**
- Modify: `server/api/webhooks/qrisvip.post.ts` — production fail-closed if secret empty when `NODE_ENV=production` or `NUXT_QRISVIP_REQUIRE_WEBHOOK_SECRET=true`
- Modify: `server/utils/qris-reconcile.ts` — reject remote success when amount null and no webhook amount
- Modify: `server/api/orders/index.post.ts` — free path call `fulfillPaidOrder`; reject totals > `QRIS_MAX_IDR` with clear message before insert
- Modify: `scripts/seed.ts` — ecom packages either ≤10M note “invoice offline” flag or price 9_900_000 with description project deposit; prefer set `isActive: false` for >10M packages + comment
- Modify: `server/api/orders/[id]/mark-paid-dev.post.ts` — **only** `requireRole(['dev'])`, remove customer fallback
- Modify: `.env.example` document secrets

- [ ] **Step 1: mark-paid-dev tighten**

```ts
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  await requireRole(event, ['dev'])
  // ... fulfill only
})
```

- [ ] **Step 2: Free order uses fulfill**

After insert with total 0, call:

```ts
await fulfillPaidOrder({
  orderId,
  paymentId,
  paidAmountIdr: 0,
  method: 'free',
  rawPayload: { source: 'free-order' }
})
```

Do not double-mark outside fulfill.

- [ ] **Step 3: Cap / seed**

Before generate QRIS:

```ts
if (!isFree && totals.totalIdr > QRIS_MAX_IDR) {
  throw createError({
    statusCode: 400,
    statusMessage: `Total melebihi batas QRIS Rp${QRIS_MAX_IDR.toLocaleString('id-ID')}. Hubungi CS untuk paket project.`
  })
}
```

Seed: deactivate or lower `pkg_ecom_*` above max.

- [ ] **Step 4: Webhook secret**

```ts
const secret = String(config.qrisvipWebhookSecret || '')
const requireSecret = process.env.NODE_ENV === 'production' || config.qrisvipRequireWebhookSecret
if (requireSecret && !secret) {
  throw createError({ statusCode: 500, statusMessage: 'Webhook secret not configured' })
}
if (secret) { /* existing header check */ }
```

- [ ] **Step 5: Amount null guard in reconcile** — if remote paid but amount missing, require webhook.amount match; else `reason: 'amount_missing'`.

- [ ] **Step 6: Commit**

```bash
git commit -m "fix(payments): free-order fulfill, QRIS cap, webhook fail-closed, mark-paid-dev"
```

---

### Task 1: Replace Xendit trust with QRIS honesty

**Files:**
- Modify: `app/components/marketing/TrustLogoStrip.vue`
- Modify: `i18n/locales/id.json` (`home.trust.xendit` → QRIS copy; keep key or rename both locales)
- Modify: `i18n/locales/en.json` (same)
- Grep/fix any remaining user-facing “Xendit” in `app/` and `i18n/` marketing strings (not historical docs)

**Interfaces:**
- Consumes: existing `t('home.trust.*')`
- Produces: trust chip meaning “Bayar QRIS (semua e-wallet & bank)” / EN equivalent

- [ ] **Step 1: Write failing test for copy helper (optional thin)**

If no pure helper exists, skip unit test; verify via manual string assert in step 4. Prefer direct i18n edit.

- [ ] **Step 2: Update i18n**

In `id.json`:
```json
"trust": {
  "eyebrow": "Siap dipakai bisnis sungguhan",
  "ssl": "SSL gratis",
  "qris": "Bayar QRIS semua bank",
  "responsive": "Tampil rapi di HP",
  "seo": "Siap diindeks Google",
  "hosting": "Hosting unlimited",
  "support": "CS responsif"
}
```

In `en.json`:
```json
"trust": {
  "eyebrow": "Built for real businesses",
  "ssl": "Free SSL",
  "qris": "QRIS — all banks & e-wallets",
  "responsive": "Mobile-ready",
  "seo": "Google-ready SEO",
  "hosting": "Unlimited hosting",
  "support": "Responsive support"
}
```

Remove `home.trust.xendit` from both files.

- [ ] **Step 3: Update TrustLogoStrip**

```vue
const items = computed(() => [
  { icon: 'i-lucide-shield-check', label: t('home.trust.ssl') },
  { icon: 'i-lucide-qr-code', label: t('home.trust.qris') },
  { icon: 'i-lucide-smartphone', label: t('home.trust.responsive') },
  { icon: 'i-lucide-search', label: t('home.trust.seo') },
  { icon: 'i-lucide-server', label: t('home.trust.hosting') },
  { icon: 'i-lucide-headphones', label: t('home.trust.support') }
])
```

- [ ] **Step 4: Grep residual marketing Xendit**

Run: `rg -n "Xendit|xendit" app i18n --glob '!**/docs/**'`
Expected: no user-facing marketing hits (schema enum `xendit` on payments may remain for legacy rows — OK).

- [ ] **Step 5: Commit**

```bash
git add app/components/marketing/TrustLogoStrip.vue i18n/locales/id.json i18n/locales/en.json
git commit -m "fix(trust): replace Xendit badge with QRIS honesty"
```

---

### Task 2: Honest domain availability UX

**Files:**
- Modify: `server/api/domains/check.get.ts`
- Modify: `app/pages/order/choose-domain.vue`
- Modify: `i18n/locales/id.json`, `i18n/locales/en.json`
- Test: `tests/domain-check.test.ts` (new) — pure logic if extracted; else document API contract in test of helper

**Interfaces:**
- Consumes: GET `/api/domains/check?name=&tld=`
- Produces: `{ domain, available, stub: true, confidence: 'soft' | 'hard_unavailable', messageKey?: string }`

- [ ] **Step 1: Write failing test for availability helper**

Create `server/utils/domain-availability.ts`:

```ts
const RESERVED = new Set(['www', 'mail', 'admin', 'root', 'api', 'mugiewdev', 'webekspor'])

export type DomainCheckResult = {
  domain: string
  available: boolean
  stub: true
  confidence: 'soft' | 'hard_unavailable'
}

export function evaluateDomainStub(name: string, tld: string): DomainCheckResult {
  const n = name.toLowerCase().replace(/[^a-z0-9-]/g, '')
  const t = tld.toLowerCase().replace(/^\./, '')
  const domain = `${n}.${t}`
  if (n.length < 3 || RESERVED.has(n)) {
    return { domain, available: false, stub: true, confidence: 'hard_unavailable' }
  }
  // Soft: not a live WHOIS — ops will confirm
  return { domain, available: true, stub: true, confidence: 'soft' }
}
```

Test `tests/domain-check.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { evaluateDomainStub } from '../server/utils/domain-availability'

describe('evaluateDomainStub', () => {
  it('blocks reserved names hard', () => {
    const r = evaluateDomainStub('admin', 'com')
    expect(r.available).toBe(false)
    expect(r.confidence).toBe('hard_unavailable')
  })
  it('soft-available for normal names', () => {
    const r = evaluateDomainStub('tokobunga', 'com')
    expect(r.available).toBe(true)
    expect(r.confidence).toBe('soft')
    expect(r.stub).toBe(true)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL (module missing)**

Run: `pnpm test tests/domain-check.test.ts`
Expected: FAIL cannot find module

- [ ] **Step 3: Implement helper + wire API**

`server/api/domains/check.get.ts`:

```ts
import { z } from 'zod'
import { evaluateDomainStub } from '../../utils/domain-availability'

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
  return evaluateDomainStub(parsed.data.name, parsed.data.tld)
})
```

- [ ] **Step 4: Run test — expect PASS**

Run: `pnpm test tests/domain-check.test.ts`
Expected: PASS

- [ ] **Step 5: UI honesty on choose-domain**

Add i18n:

ID:
```json
"domainSoftAvailable": "Format OK — staf konfirmasi ketersediaan setelah bayar",
"domainSoftHint": "Pengecekan live registrar belum otomatis. Lanjut aman; kami cek & ganti opsi jika domain terlanjur diambil.",
"domainHardUnavailable": "Nama ini tidak bisa dipakai. Pilih yang lain."
```

EN:
```json
"domainSoftAvailable": "Format looks good — staff confirms availability after payment",
"domainSoftHint": "Live registrar check is not automatic yet. Safe to continue; we verify and offer alternatives if taken.",
"domainHardUnavailable": "This name cannot be used. Pick another."
```

In `choose-domain.vue` after check response:
- If `!available` → error with `domainHardUnavailable`, disable continue
- If `available && confidence === 'soft'` → success-soft UAlert (warning/subtle) with `domainSoftAvailable` + `domainSoftHint`, still allow continue
- Never green-check “domain pasti free” copy

- [ ] **Step 6: Commit**

```bash
git add server/utils/domain-availability.ts server/api/domains/check.get.ts app/pages/order/choose-domain.vue tests/domain-check.test.ts i18n/locales/id.json i18n/locales/en.json
git commit -m "feat(domain): honest soft-available messaging for stub check"
```

---

### Task 3: QRIS pay page conversion polish (frontend-design + ui-ux-pro-max)

**Files:**
- Modify: `app/pages/order/pay/[id].vue`
- Modify: `i18n/locales/id.json`, `i18n/locales/en.json`
- Optional create: `app/components/order/PayCountdown.vue`

**Interfaces:**
- Consumes: `/api/orders/:id/payment`, `/api/orders/:id/payment-status`
- Produces: polished pay UI with countdown, tips, sticky amount, expired state

**Design direction (frontend-design):**
- Signature: large mono amount + QR on soft elevated card; calm navy/sky Soft Glass — not flashy fintech neon.
- Single primary CTA: “Saya sudah bayar” / poll.
- Secondary: WA bantuan, back.

**UX rules (ui-ux-pro-max):**
- Touch targets ≥44px; loading on check button; error near action.
- Countdown uses `tabular-nums`; expired disables QR opacity + clear recovery (WA / new order).
- `prefers-reduced-motion` safe (no decorative spin beyond UButton loading).
- Hard-code free strings → i18n (`Domain` label, `QRIS` eyebrow).

- [ ] **Step 1: Add i18n keys**

ID:
```json
"payEyebrow": "Pembayaran QRIS",
"payTipsTitle": "Cara bayar",
"payTip1": "Buka e-wallet atau m-banking → pilih bayar QRIS",
"payTip2": "Scan kode di layar ini (bukan screenshot buram)",
"payTip3": "Jangan tutup halaman sampai status terbayar",
"countdownLabel": "Berlaku hingga",
"countdownExpired": "QRIS kedaluwarsa",
"countdownExpiredDesc": "Buat order baru atau hubungi CS via WhatsApp.",
"payHelpWa": "Butuh bantuan bayar?",
"pollingHint": "Kami cek status otomatis tiap 5 detik"
```

EN equivalents active voice.

- [ ] **Step 2: Implement countdown computed**

In pay page script:

```ts
const now = ref(Date.now())
let tickTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  tickTimer = setInterval(() => { now.value = Date.now() }, 1000)
})
onBeforeUnmount(() => {
  if (tickTimer) clearInterval(tickTimer)
})

const remainingMs = computed(() => {
  const exp = pay.value?.expiresAt
  if (!exp) return null
  return new Date(exp).getTime() - now.value
})

const countdownText = computed(() => {
  const ms = remainingMs.value
  if (ms == null) return null
  if (ms <= 0) return '00:00:00'
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map(n => String(n).padStart(2, '0')).join(':')
})
```

- [ ] **Step 3: Template structure**

Wire:
1. `OrderStepper` step 2 or 3 appropriate (pay = checkout payment — use step 2 if stepper only 3 stages; or extend later). Prefer show order meta + QR without broken stepper.
2. Soft glass card: order number, domain (`t('order.domainLabel')`), total `formatIdr`, countdown.
3. QR white pad + tips list with lucide icons.
4. Expired: UAlert error + hide QR / opacity-40 + CTA WA + link home.
5. Primary check button `min-h-12`, secondary WA.

- [ ] **Step 4: Manual visual check**

With `pnpm dev`: open a pending pay URL or mock — confirm countdown ticks, expired path, i18n ID/EN.

- [ ] **Step 5: Commit**

```bash
git add app/pages/order/pay/[id].vue i18n/locales/id.json i18n/locales/en.json app/components/order/PayCountdown.vue
git commit -m "feat(pay): QRIS countdown, tips, and Soft Glass conversion polish"
```

---

### Task 4: Post-pay success timeline + SLA

**Files:**
- Modify: `app/pages/order/success.vue`
- Modify: `i18n/locales/id.json`, `i18n/locales/en.json`

**Interfaces:**
- Consumes: order status when logged in; guest neutral pending
- Produces: 3-step “next” timeline: Bayar → Proses (1–2×24 jam kerja) → Live + WA + panel CTA

- [ ] **Step 1: Add i18n timeline keys**

ID:
```json
"nextStepsTitle": "Langkah selanjutnya",
"nextPaid": "Pembayaran diterima",
"nextProvision": "Tim siapkan website & domain",
"nextProvisionEta": "Estimasi 1–2×24 jam kerja",
"nextLive": "Website live & akses panel",
"openPanel": "Buka panel saya",
"orderAgain": "Pesan website lain",
"saveOrderNumber": "Simpan nomor order untuk CS"
```

EN equivalents.

- [ ] **Step 2: UI timeline**

Vertical Soft Glass steps with check on paid, current pulse on provision when paid, muted on live until status `active`. Keep existing guest-safe: never claim paid if unauthenticated without server proof.

- [ ] **Step 3: CTAs**

- Logged-in paid → primary `localePath('/panel/orders')` or `/panel`
- Always secondary WA with order number in message via `useWhatsApp().link(...)`
- Link templates/order again

- [ ] **Step 4: Commit**

```bash
git add app/pages/order/success.vue i18n/locales/id.json i18n/locales/en.json
git commit -m "feat(order): post-pay SLA timeline and next-step CTAs"
```

---

### Task 4b: Panel orders resume-pay CTA

**Files:**
- Modify: `app/pages/panel/orders/index.vue`
- Modify: `server/api/orders/index.get.ts` if pay path/token not returned
- Modify: i18n `panel.payNow`, `panel.orderDetail`

**Interfaces:**
- Consumes: list of user orders with `status`, `id`
- Produces: for `pending_payment` rows, primary button → `/order/pay/:id` with **fresh signed token** from API

- [ ] **Step 1: API list includes `canPay` + mint token for owner**

On `GET /api/orders` (session required already): for each `pending_payment` order, attach:

```ts
payPath: `/order/pay/${order.id}?token=${signPayToken(order.id, secret)}`
```

Only for owner session.

- [ ] **Step 2: UI**

```vue
<UButton
  v-if="row.status === 'pending_payment' && row.payPath"
  :to="localePath(row.payPath)"
  color="primary"
  size="sm"
>
  {{ t('panel.payNow') }}
</UButton>
```

Human status labels via `t('order.status.' + status)` map — not raw `pending_payment`.

- [ ] **Step 3: Commit**

```bash
git add app/pages/panel/orders/index.vue server/api/orders/index.get.ts i18n/locales/id.json i18n/locales/en.json
git commit -m "feat(panel): resume unpaid orders with signed pay link"
```

---

### Task 5: Checkout friction kill + sticky summary

**Files:**
- Modify: `app/pages/order/checkout.vue`
- Modify: `app/stores/order.ts` (if needed for package default)
- Modify: `i18n/locales/id.json`, `i18n/locales/en.json`

**Interfaces:**
- Consumes: packages API, promo validate, order POST
- Produces: sticky price summary (desktop aside / mobile bottom bar), query defaults `package` / `template` / `service`

- [ ] **Step 1: Prefill from query**

Support:
- `?template=`
- `?package=` or `?pkg=`
- `?service=umkm|export|ecommerce` → map to default package id from loaded packages (`serviceType` field)

```ts
watch(packages, (list) => {
  if (!list.length) return
  const qPkg = String(route.query.package || route.query.pkg || '')
  if (qPkg && list.some(p => p.id === qPkg || p.slug === qPkg)) {
    form.packageId = list.find(p => p.id === qPkg || p.slug === qPkg)!.id
    return
  }
  const service = String(route.query.service || '')
  if (service) {
    const match = list.find(p => p.serviceType === service || p.slug.includes(service))
    if (match) form.packageId = match.id
  }
}, { immediate: true })
```

- [ ] **Step 2: Sticky summary card**

Desktop: `lg:grid` form | summary  
Mobile: fixed bottom glass bar with total + submit (padding-bottom on form so content not hidden). Use `glass-panel`, `tabular-nums`, strike subtotal if promo.

- [ ] **Step 3: Field UX**

- Labels visible (already UFormField)
- Phone `type="tel"`, email `type="email"`
- Disable submit while `loading`; show spinner
- Error UAlert cause+fix above submit
- Auto-apply promo if store has code on mount

- [ ] **Step 4: Commit**

```bash
git add app/pages/order/checkout.vue i18n/locales/id.json i18n/locales/en.json
git commit -m "feat(checkout): sticky summary, query package defaults, promo hydrate"
```

---

### Task 6: Templates shop-window polish

**Files:**
- Modify: `app/pages/templates/index.vue`
- Modify: `app/pages/templates/[slug].vue`
- Modify: `app/components/marketing/HomeTemplateShowcase.vue` (if same placeholder pattern)
- Modify: `i18n/locales/id.json`, `i18n/locales/en.json`
- Optional: seed `previewImage` / gradient category map in component

**Interfaces:**
- Consumes: template `category`, `name`, `slug`, optional `thumbnailUrl`/`previewImage` if schema has it
- Produces: category-colored preview tiles, price-from chip, single primary CTA hierarchy

- [ ] **Step 1: Category visual map**

```ts
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
```

Replace flat muted box with gradient + monogram of category icon.

- [ ] **Step 2: CTA hierarchy**

List card: primary **Pilih** full width; secondary detail ghost.  
Detail page: i18n for Preview button (`templates.preview` ID “Lihat demo” / EN “View demo”) — remove hard-coded `Preview`.

- [ ] **Step 3: Optional price cue**

If packages loaded cheaply, show `t('templates.fromPrice', { price })` under name — or static from appConfig starting price. Avoid N+1 API.

- [ ] **Step 4: Commit**

```bash
git add app/pages/templates/index.vue app/pages/templates/[slug].vue app/components/marketing/HomeTemplateShowcase.vue i18n/locales/id.json i18n/locales/en.json
git commit -m "feat(templates): category preview tiles and CTA hierarchy polish"
```

---

### Task 7: Unpaid order auto-expire (48h)

**Files:**
- Create: `server/utils/order-expiry.ts`
- Create: `server/api/cron/expire-orders.post.ts` (or `.get.ts` with secret)
- Modify: `server/api/orders/[id]/payment-status.get.ts` — opportunistic expire on read
- Modify: `.env.example` — `NUXT_CRON_SECRET=`
- Modify: `nuxt.config.ts` runtimeConfig `cronSecret`
- Test: `tests/order-expiry.test.ts`

**Interfaces:**
- Consumes: orders with `status = 'pending_payment'` and `createdAt` older than 48h; related payments pending
- Produces: `expireStaleOrders(now = new Date()): { expiredOrderIds: string[] }`; payment status `expired`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from 'vitest'
import { shouldExpireOrder } from '../server/utils/order-expiry'

describe('shouldExpireOrder', () => {
  it('expires pending older than 48h', () => {
    const created = new Date('2026-07-01T00:00:00Z')
    const now = new Date('2026-07-04T00:00:00Z')
    expect(shouldExpireOrder({ status: 'pending_payment', createdAt: created }, now)).toBe(true)
  })
  it('keeps fresh pending', () => {
    const created = new Date('2026-07-14T12:00:00Z')
    const now = new Date('2026-07-15T12:00:00Z')
    expect(shouldExpireOrder({ status: 'pending_payment', createdAt: created }, now)).toBe(false)
  })
  it('never expires paid', () => {
    expect(shouldExpireOrder({ status: 'paid', createdAt: new Date('2020-01-01') }, new Date())).toBe(false)
  })
})
```

- [ ] **Step 2: Run — FAIL**

Run: `pnpm test tests/order-expiry.test.ts`

- [ ] **Step 3: Implement**

```ts
// server/utils/order-expiry.ts
export const UNPAID_TTL_MS = 48 * 60 * 60 * 1000

export function shouldExpireOrder(
  order: { status: string, createdAt: Date | string },
  now = new Date()
): boolean {
  if (order.status !== 'pending_payment') return false
  const created = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt)
  return now.getTime() - created.getTime() >= UNPAID_TTL_MS
}

export async function expireStaleOrders(now = new Date()) {
  const db = useDb()
  const { and, eq, lt } = await import('drizzle-orm')
  const { orders, payments } = await import('../database/schema')
  const cutoff = new Date(now.getTime() - UNPAID_TTL_MS)
  const stale = await db.query.orders.findMany({
    where: and(eq(orders.status, 'pending_payment'), lt(orders.createdAt, cutoff))
  })
  const expiredOrderIds: string[] = []
  for (const o of stale) {
    await db.update(orders).set({ status: 'expired', updatedAt: now }).where(eq(orders.id, o.id))
    await db.update(payments).set({ status: 'expired', updatedAt: now }).where(eq(payments.orderId, o.id))
    expiredOrderIds.push(o.id)
  }
  return { expiredOrderIds }
}
```

Ensure schema allows `expired` on order/payment status enums — if not, extend schema + `pnpm db:push`.

Cron route:

```ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secret = String(config.cronSecret || '')
  const header = getHeader(event, 'x-cron-secret') || getQuery(event).secret
  if (!secret || header !== secret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const result = await expireStaleOrders()
  return { ok: true, ...result }
})
```

Also call `shouldExpireOrder` single-row path inside payment-status GET before remote check — expire that order if stale.

- [ ] **Step 4: Tests PASS + schema**

Run: `pnpm test tests/order-expiry.test.ts`

- [ ] **Step 5: Commit**

```bash
git add server/utils/order-expiry.ts server/api/cron/expire-orders.post.ts server/api/orders/[id]/payment-status.get.ts server/database/schema/index.ts tests/order-expiry.test.ts .env.example nuxt.config.ts
git commit -m "feat(orders): auto-expire unpaid after 48h"
```

---

### Task 8: Dev paid-provision queue

**Files:**
- Create: `server/api/dev/orders/queue.get.ts`
- Modify: `app/pages/dev/index.vue` and/or `app/pages/dev/orders/index.vue`
- Modify: `i18n/locales/id.json`, `i18n/locales/en.json` under `dev.*`

**Interfaces:**
- Consumes: `requireRole(['dev','admin'])` or existing dev gate
- Produces: list orders `status in ('paid','provisioning')` sorted oldest first with site status

- [ ] **Step 1: API**

```ts
export default defineEventHandler(async (event) => {
  await requireRole(event, ['dev', 'admin'])
  const db = useDb()
  // query paid + provisioning with optional site join
  return { data: rows }
})
```

- [ ] **Step 2: Dev UI panel**

On `dev/index` or orders page top section:
- Table: order number, domain, paid at, status, actions
- Actions: set `provisioning`, set `active` (existing patch), note field if present
- Empty: DevEmptyState “Tidak ada antrian — bagus”

- [ ] **Step 3: Commit**

```bash
git add server/api/dev/orders/queue.get.ts app/pages/dev/index.vue app/pages/dev/orders/index.vue i18n/locales/id.json i18n/locales/en.json
git commit -m "feat(dev): paid order provision queue"
```

---

### Task 9: Public inquiry lead capture

**Files:**
- Create: `server/api/inquiries/index.post.ts`
- Modify: service landing components or `app/components/marketing/ServiceCta.vue`
- Create: `app/components/marketing/InquiryForm.vue`
- Modify: i18n keys `inquiry.*`
- Optional: show new rows already in `dev/inquiries`

**Interfaces:**
- Consumes: Zod `{ name, email, phone?, message, source, service? }`
- Produces: insert into `inquiries` table; rate-limit soft via IP header log (simple in-memory Map OK for SQLite v1)

- [ ] **Step 1: API with Zod**

```ts
const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(8).max(20).optional(),
  message: z.string().min(10).max(2000),
  source: z.string().max(80).default('website'),
  service: z.string().max(40).optional()
})
```

- [ ] **Step 2: InquiryForm Soft Glass**

Fields + submit → toast success “Tim CS akan hubungi Anda” + optional WA deep link. Errors cause+fix.

- [ ] **Step 3: Mount on 4 service pages or shared ServiceCta**

- [ ] **Step 4: Commit**

```bash
git add server/api/inquiries/index.post.ts app/components/marketing/InquiryForm.vue app/components/marketing/ServiceCta.vue app/pages/jasa-*.vue i18n/locales/id.json i18n/locales/en.json
git commit -m "feat(leads): public inquiry form to inquiries table"
```

---

### Task 9b: Soft Glass `error.vue` + domain visible labels

**Files:**
- Create: `app/error.vue`
- Modify: `app/pages/order/choose-domain.vue` — `UFormField` label for domain name
- Modify: `app/components/marketing/HeroDomainSearch.vue` — visible label / sr-only + helper
- Modify: i18n `error.*`, `order.domainNameLabel`

- [ ] **Step 1: `app/error.vue`**

Nuxt error page Soft Glass: status code, clear title, description, CTA home + templates + WA. Use `clearError({ redirect })`. Match `403.vue` tone.

- [ ] **Step 2: Domain labels**

Replace placeholder-only domain input with:

```vue
<UFormField :label="t('order.domainNameLabel')" name="domain" required>
  <UInput v-model="name" ... />
</UFormField>
```

Hero: keep compact but add `sr-only` label + `aria-describedby` helper.

- [ ] **Step 3: Commit**

```bash
git add app/error.vue app/pages/order/choose-domain.vue app/components/marketing/HeroDomainSearch.vue i18n/locales/id.json i18n/locales/en.json
git commit -m "feat(ux): Soft Glass error page and domain field labels"
```

---

### Task 10: Docs truth (AGENTS + research payment)

**Files:**
- Modify: `AGENTS.md` — payments QrisVIP, webhook path `/api/webhooks/qrisvip`, roles include `dev`
- Modify: `docs/research/webekspor-analysis.md` backlog checkboxes for done items (seed, wizard, QRIS not Xendit) — note provider pivot

- [ ] **Step 1: Patch AGENTS.md API conventions**

Replace Xendit webhook line with QrisVIP; roles line `customer | cs | admin | dev`.

- [ ] **Step 2: Update research backlog checkboxes** to match reality; add note “Payment provider: QrisVIP QRIS-only (2026-07-15)”.

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md docs/research/webekspor-analysis.md
git commit -m "docs: align agents and research with QrisVIP and shipped parity"
```

---

### Task 11: Money-path unit tests expansion

**Files:**
- Modify: `tests/pricing.test.ts` if gaps
- Create: `tests/order-totals-promo.test.ts` only if not covered
- Extend: `tests/qris-reconcile.test.ts` for amount mismatch edge if pure functions exportable

- [ ] **Step 1: Inventory**

Run: `pnpm test` — note count baseline.

- [ ] **Step 2: Add tests for**
  - `computeOrderTotals` multi-year + percent promo floor at 0
  - `assertPayableAmountIdr` min/max
  - `shouldExpireOrder` (from Task 7)
  - `evaluateDomainStub` (from Task 2)

- [ ] **Step 3: Commit**

```bash
git add tests/
git commit -m "test: expand pricing domain expiry coverage for money path"
```

---

### Task 12: Floating WhatsApp + global conversion chrome

**Files:**
- Create: `app/components/FloatingWhatsApp.vue`
- Modify: `app/layouts/default.vue`
- Modify: i18n `whatsapp.floatingLabel`

**Interfaces:**
- Consumes: `useWhatsApp().link`
- Produces: fixed bottom-right FAB `min-h-12 min-w-12`, `shadow-soft-xl`, `i-simple-icons-whatsapp`, `aria-label`, hide on `/order/pay/*` optional to avoid covering QR (or offset higher)

- [ ] **Step 1: Component**

```vue
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
    class="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-green-600 text-white shadow-soft-xl hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
    :aria-label="t('whatsapp.floatingLabel')"
  >
    <UIcon name="i-simple-icons-whatsapp" class="size-7" />
  </a>
</template>
```

- [ ] **Step 2: Mount in default layout** before footer close

- [ ] **Step 3: Commit**

```bash
git add app/components/FloatingWhatsApp.vue app/layouts/default.vue i18n/locales/id.json i18n/locales/en.json
git commit -m "feat(ux): floating WhatsApp consult FAB"
```

---

## File map (create / modify summary)

| Path | Role |
|------|------|
| `server/utils/pay-token.ts` | HMAC pay access |
| `server/utils/domain-availability.ts` | Stub domain truth |
| `server/utils/order-expiry.ts` | 48h unpaid TTL |
| `server/api/cron/expire-orders.post.ts` | Secured expire runner |
| `server/api/dev/orders/queue.get.ts` | Ops queue |
| `server/api/inquiries/index.post.ts` | Lead capture |
| `app/error.vue` | Global Soft Glass errors |
| `app/components/order/PayCountdown.vue` | Optional countdown atom |
| `app/components/marketing/InquiryForm.vue` | Lead form |
| `app/components/FloatingWhatsApp.vue` | FAB |
| `app/pages/order/pay/[id].vue` | Pay conversion |
| `app/pages/order/success.vue` | SLA timeline |
| `app/pages/order/checkout.vue` | Sticky checkout |
| `app/pages/order/choose-domain.vue` | Soft-available UI |
| `app/pages/panel/orders/index.vue` | Resume pay |
| `app/pages/templates/*` | Shop window |
| `app/components/marketing/TrustLogoStrip.vue` | QRIS trust |
| `app/pages/dev/orders/index.vue` | Queue UI |
| `tests/pay-token.test.ts` | Token crypto |
| `tests/domain-check.test.ts` | Domain helper |
| `tests/order-expiry.test.ts` | Expiry helper |
| `i18n/locales/{id,en}.json` | All copy |
| `AGENTS.md`, research md | Truth docs |

---

## Self-review

1. **Spec coverage:** Backend P0 IDOR/webhook/free/seed/mark-paid → Tasks 0–0b. Product+UX P0 conversion → 1–4b. Ops/leads → 7–9. Error/a11y → 9b. Docs/tests/FAB → 10–12. Deferred: registrar, LMS, multi-PG, full Resend reset, rate-limit package (document in Task 10 only).
2. **Placeholder scan:** No TBD steps; code sketches concrete.
3. **Type consistency:** `signPayToken` / `verifyPayToken` / `assertPayAccess` shared; `confidence: 'soft' | 'hard_unavailable'`; `UNPAID_TTL_MS`; `expireStaleOrders`.
4. **Schema watch:** Task 7 must extend status enums if `expired` missing — implementer verifies `server/database/schema/index.ts` before push.
5. **Cross-task:** Task 3/4b depend on Task 0 token query param. Task 0b free-order before heavy checkout polish.

## Execution note

Prefer **Subagent-Driven** order: **0 → 0b → 1 → 2 → 3 → 4 → 4b → 5 → 6 → 7 → 8 → 9 → 9b → 10 → 11 → 12**. After 0b + 7 run full `pnpm test`. After 12 smoke: home trust → templates → choose-domain soft banner → checkout sticky → pay countdown (token URL) → success timeline → panel resume → dev queue.

---

**Plan complete path:** `docs/superpowers/plans/2026-07-15-conversion-ops-excellence.md`
