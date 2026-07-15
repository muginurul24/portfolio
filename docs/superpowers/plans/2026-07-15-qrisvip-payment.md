# QrisVIP QRIS-Only Payment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Xendit with **QrisVIP / Otomatis VIP API V3.1** as the sole checkout payment rail: **QRIS only** (any bank/e-wallet that pays a QRIS, still settles via QrisVIP).

**Architecture:** Server creates order + pending payment, calls QrisVIP `POST /api/generate`, stores `trx_id` + raw QRIS payload, returns internal pay page URL (never trust client totals). Pay page renders QR from payload and polls `GET /api/orders/:id/payment-status` which may call QrisVIP Check Status V2. Optional inbound webhook re-verifies via Check Status V2 before marking paid (never trust webhook body alone for amount). On paid: same provisioning path as old Xendit webhook (order paid → site provisioning).

**Tech Stack:** Nuxt 4, Nitro, Drizzle SQLite, Zod, `ofetch`/`$fetch`, `qrcode` (SVG/data-URL), Vitest. Drop `xendit-node` usage from checkout path.

## Global Constraints

- **QRIS only** — do not implement VA, bank transfer UI, or RTOL disbursement in this plan.
- **QrisVIP only** — no Xendit create-invoice / Xendit webhook for new orders after cutover.
- Money: **IDR integers**; recompute totals server-side (`computeOrderTotals`); never trust client amounts.
- QrisVIP amount limits (from collection): min **10000**, max **10000000** IDR. Reject or free-path only outside range.
- `custom_ref` max **36** alphanumeric — use sanitized `orderNumber` (e.g. `MD20260715ABCD`).
- Secrets only in `runtimeConfig` / `.env` — never expose `client_key` to client.
- Activation only after **server-confirmed paid** (webhook and/or check-status), never client-only success.
- Soft Glass UI; copy Bahasa Indonesia first; errors = cause + fix.
- Keep public marketing + Xendit-free path for `totalIdr <= 0`.
- Disbursement (Inquiry/Transfer Fund) **out of scope** (ops later).
- Prefer small focused files; sparse comments; frequent commits.

## Locked product decisions (no re-ask)

| Decision | Choice | Why |
|----------|--------|-----|
| Provider | `qrisvip` | User rejected Xendit |
| Channel | QRIS only | User: pay with anything, but only via QrisVIP QRIS |
| After create order | Redirect **internal** `/order/pay/:id` (not external invoice URL) | Generate returns QR string, not hosted page |
| Confirm paid | Webhook (if merchant configures) **+** Check Status V2 poll | Collection documents check-status; webhook body not fully specified — always re-check |
| QR render | Server returns payload; client renders with `qrcode` | Payload is EMV string `000201…` |
| Min order | Enforce ≥ 10000 when not free | API requirement |
| Remove Xendit from checkout | Yes | Dead path confuses ops |
| Keep mark-paid-dev | Yes, `import.meta.dev` + role `dev` | Local testing without live QRIS |

## QrisVIP API contract (from Postman collection)

Base hosts:

- Generate / Check: `https://qris.otomatis.vip`
- Balance (optional ops): `https://rest.otomatis.vip`

### Generate QRIS

`POST https://qris.otomatis.vip/api/generate`

```json
{
  "username": "<player identifier returned in callbacks>",
  "amount": 10000,
  "uuid": "<merchant uuid_toko>",
  "expire": 1200,
  "custom_ref": "MD20260715ABCD"
}
```

Success:

```json
{
  "status": true,
  "data": "00020101021226…",
  "trx_id": "16e35a42…",
  "expired_at": 1200
}
```

Failure: `{ "status": false, "error": "…" }` (HTTP often still 200).

### Check Status V2

`POST https://qris.otomatis.vip/api/checkstatus/v2/{trx_id}`

```json
{
  "uuid": "<uuid_toko>",
  "client": "<panel client slug>",
  "client_key": "<secret>"
}
```

Paid:

```json
{
  "amount": 10000,
  "merchant_id": "uuid",
  "trx_id": "trxid",
  "rrn": "rrn",
  "status": "success",
  "created_at": "…",
  "finish_at": "…"
}
```

Pending: `"status": "pending"`. Not found: `{ "status": false, "error": "…" }`.

### Merchant credentials (env)

| Env | Maps to | Notes |
|-----|---------|-------|
| `NUXT_QRISVIP_UUID` | `uuid` / `uuid_toko` | Merchant UID from panel Toko menu |
| `NUXT_QRISVIP_CLIENT` | `client` | Panel slug e.g. path after `panel.otomatis.vip/` |
| `NUXT_QRISVIP_CLIENT_KEY` | `client_key` | Secret for status check |
| `NUXT_QRISVIP_USERNAME` | optional default `username` field | Prefer per-order `customerEmail` |
| `NUXT_QRISVIP_EXPIRE_SECONDS` | `expire` | Default `1200` (20 min) |
| `NUXT_QRISVIP_WEBHOOK_SECRET` | header verify if merchant sends secret | Optional; still re-check status |

## File map

| Path | Role |
|------|------|
| `server/utils/qrisvip.ts` | Client: generate, checkStatus, types |
| `server/utils/payments.ts` | Shared markPaid + provision site (extract from xendit webhook) |
| `server/api/orders/index.post.ts` | Create order → generate QRIS → return pay path |
| `server/api/orders/[id]/payment.get.ts` | Pay page data (QR payload, amount, status) |
| `server/api/orders/[id]/payment-status.get.ts` | Poll + optional remote check |
| `server/api/webhooks/qrisvip.post.ts` | Inbound notify → re-check → mark paid |
| `server/api/webhooks/xendit.post.ts` | Delete or hard-disable after cutover |
| `server/utils/xendit.ts` | Delete after cutover |
| `server/database/schema/index.ts` | `payments.provider` enum `qrisvip`; optional `qrisPayload`, `expiresAt` |
| `app/pages/order/checkout.vue` | Navigate to `/order/pay/:id` not external Xendit |
| `app/pages/order/pay/[id].vue` | QR display + countdown + poll |
| `app/pages/order/success.vue` | Keep; ensure works after QRIS paid |
| `nuxt.config.ts` | runtimeConfig QrisVIP; remove Xendit keys |
| `.env` / `.env.example` | QrisVIP vars; remove/deprecate Xendit |
| `package.json` | Add `qrcode` (+ `@types/qrcode`); remove `xendit-node` if unused |
| `tests/qrisvip.test.ts` | Pure helpers (custom_ref sanitize, amount clamp, payload detect) |
| `tests/payments-mark-paid.test.ts` | Optional pure provision helpers |
| `i18n/locales/id.json`, `en.json` | Pay page strings |

---

### Task 1: Env + runtimeConfig + schema provider

**Files:**
- Modify: `nuxt.config.ts` `runtimeConfig`
- Modify: `.env.example`, `.env` (local)
- Modify: `server/database/schema/index.ts` payments table
- Run: `CI=true pnpm exec drizzle-kit push --force` (or project `pnpm db:push`)

**runtimeConfig (server):**

```ts
// replace xendit* with:
qrisvipUuid: process.env.NUXT_QRISVIP_UUID || '',
qrisvipClient: process.env.NUXT_QRISVIP_CLIENT || '',
qrisvipClientKey: process.env.NUXT_QRISVIP_CLIENT_KEY || '',
qrisvipUsername: process.env.NUXT_QRISVIP_USERNAME || '',
qrisvipExpireSeconds: Number(process.env.NUXT_QRISVIP_EXPIRE_SECONDS || 1200),
qrisvipWebhookSecret: process.env.NUXT_QRISVIP_WEBHOOK_SECRET || '',
qrisvipBaseUrl: process.env.NUXT_QRISVIP_BASE_URL || 'https://qris.otomatis.vip',
```

Remove `xenditSecretKey`, `xenditWebhookToken`, `public.xenditPublicKey`.

**Schema payments:**

```ts
provider: text('provider', { enum: ['qrisvip', 'xendit'] }).notNull().default('qrisvip'),
providerRef: text('provider_ref'), // trx_id
method: text('method'), // 'qris'
// add:
qrisPayload: text('qris_payload'), // raw EMV string for regenerate-free display
expiresAt: integer('expires_at', { mode: 'timestamp' }),
```

Keep `xendit` in enum only for historical rows; new inserts always `qrisvip`.

- [ ] **Step 1:** Update schema + env example + nuxt.config.
- [ ] **Step 2:** `pnpm db:push` (or generate+migrate).
- [ ] **Step 3:** Commit

```bash
git add nuxt.config.ts .env.example server/database/schema/index.ts
git commit -m "feat(payments): schema and config for QrisVIP QRIS"
```

---

### Task 2: QrisVIP client utils (TDD pure helpers first)

**Files:**
- Create: `server/utils/qrisvip.ts`
- Create: `tests/qrisvip.test.ts`

**Interfaces:**

```ts
export type QrisGenerateResult =
  | { ok: true, trxId: string, payload: string, expiredAtSeconds: number | null, channel: 'qris' | 'va' | 'unknown' }
  | { ok: false, error: string }

export type QrisCheckResult =
  | { ok: true, status: 'success' | 'pending', amount: number | null, trxId: string, rrn: string | null, raw: unknown }
  | { ok: false, error: string, raw?: unknown }

export function sanitizeCustomRef(orderNumber: string): string
// alphanumeric only, max 36, uppercase

export function isQrisPayload(data: string): boolean
// starts with '000201'

export function assertPayableAmountIdr(amount: number): void
// throws createError-compatible message if < 10000 or > 10_000_000

export async function qrisvipGenerate(input: {
  username: string
  amountIdr: number
  customRef: string
  expireSeconds?: number
}): Promise<QrisGenerateResult>

export async function qrisvipCheckStatus(trxId: string): Promise<QrisCheckResult>
```

**Generate implementation sketch:**

```ts
const config = useRuntimeConfig()
const res = await $fetch<{ status: boolean, data?: string, trx_id?: string, expired_at?: number, error?: string }>(
  `${config.qrisvipBaseUrl}/api/generate`,
  {
    method: 'POST',
    body: {
      username: input.username,
      amount: input.amountIdr,
      uuid: config.qrisvipUuid,
      expire: input.expireSeconds ?? config.qrisvipExpireSeconds,
      custom_ref: input.customRef
    }
  }
)
if (!res.status || !res.trx_id || !res.data) {
  return { ok: false, error: res.error || 'Gagal generate QRIS' }
}
return {
  ok: true,
  trxId: res.trx_id,
  payload: res.data,
  expiredAtSeconds: res.expired_at ?? null,
  channel: isQrisPayload(res.data) ? 'qris' : 'va'
}
```

If channel is `va` in production path: treat as error for this product (QRIS-only) — log and return ok:false with message “Response bukan QRIS”.

**Check status:**

```ts
await $fetch(`${base}/api/checkstatus/v2/${trxId}`, {
  method: 'POST',
  body: {
    uuid: config.qrisvipUuid,
    client: config.qrisvipClient,
    client_key: config.qrisvipClientKey
  }
})
```

- [ ] **Step 1:** Write pure tests for `sanitizeCustomRef`, `isQrisPayload`, amount bounds.
- [ ] **Step 2:** `pnpm test tests/qrisvip.test.ts` → FAIL.
- [ ] **Step 3:** Implement helpers + client functions.
- [ ] **Step 4:** Tests pass (mock `$fetch` only if project already mocks; otherwise pure unit only).
- [ ] **Step 5:** Commit

```bash
git add server/utils/qrisvip.ts tests/qrisvip.test.ts
git commit -m "feat(payments): QrisVIP client and QRIS helpers"
```

---

### Task 3: Extract shared mark-paid + provision

**Files:**
- Create: `server/utils/order-fulfillment.ts`
- Modify: keep mark-paid-dev calling shared helper
- Will be used by webhook + status poll

**Produces:**

```ts
export async function fulfillPaidOrder(input: {
  orderId: string
  paymentId: string
  paidAmountIdr: number
  method?: string | null
  providerRef?: string | null
  rawPayload?: unknown
}): Promise<{ ok: true, alreadyPaid?: boolean } | { ok: false, reason: string }>
```

Logic ported from `server/api/webhooks/xendit.post.ts`:

1. Load payment; if already `paid` → `{ ok: true, alreadyPaid: true }`
2. Amount must equal `payment.amountIdr`
3. Load order; ignore if cancelled/expired
4. Attach user by email if missing
5. Update payment paid + method + rawPayload
6. Update order paid / paidAt
7. Increment promo usedCount if promoCode
8. Insert site provisioning if domain free; set order provisioning
9. Domain conflict → notes only

- [ ] **Step 1–3:** Extract without behavior change; mark-paid-dev uses it.
- [ ] **Step 4:** Commit

```bash
git add server/utils/order-fulfillment.ts server/api/orders server/api/webhooks
git commit -m "refactor(payments): shared fulfillPaidOrder for gateways"
```

---

### Task 4: Order create → QrisVIP generate

**Files:**
- Modify: `server/api/orders/index.post.ts`
- Install: `pnpm add qrcode && pnpm add -D @types/qrcode` (QR render can wait Task 6; dep ok early)

**Flow after totals:**

1. If `totalIdr <= 0` → free path (unchanged).
2. If `totalIdr < 10000` → `400` “Minimal pembayaran QRIS Rp 10.000”.
3. If `totalIdr > 10_000_000` → `400` “Maksimal pembayaran QRIS Rp 10.000.000”.
4. Insert order + payment (`provider: 'qrisvip'`, `method: 'qris'`, status pending).
5. Call `qrisvipGenerate({ username: customerEmail, amountIdr, customRef: sanitizeCustomRef(orderNumber) })`.
6. On fail: leave order pending; return `{ paymentUrl: null, payPath: locale-less `/order/pay/${orderId}`, error hint }` OR fail hard with 502 — **prefer keep order + return pay page that shows “gagal generate, hubungi CS / retry”**.
7. On success: update payment `providerRef=trx_id`, `qrisPayload=data`, `expiresAt=now+expire`.
8. Response shape:

```ts
{
  data: {
    id: orderId,
    orderNumber,
    status: 'pending_payment',
    totalIdr,
    paymentId,
    paymentUrl: null, // legacy field
    payPath: `/order/pay/${orderId}`, // NEW — checkout must use this
    qrisReady: true
  }
}
```

- [ ] **Step 1:** Replace `createXenditInvoice` call.
- [ ] **Step 2:** Manual curl create order in dev (mock or live creds).
- [ ] **Step 3:** Commit

```bash
git add server/api/orders/index.post.ts package.json pnpm-lock.yaml
git commit -m "feat(orders): create QrisVIP QRIS on checkout"
```

---

### Task 5: Payment status API + webhook

**Files:**
- Create: `server/api/orders/[id]/payment.get.ts`
- Create: `server/api/orders/[id]/payment-status.get.ts`
- Create: `server/api/webhooks/qrisvip.post.ts`
- Delete or gut: `server/api/webhooks/xendit.post.ts`, `server/utils/xendit.ts`

**payment.get.ts** (auth optional: allow if session owns order OR guest with matching email query later — **v1: anyone with order id + orderNumber query param** for guest checkout simplicity):

Safer v1:

- Require `?token=` = first 16 of `sha256(orderId + sessionPassword)` signed server-side at create time, returned as `payToken` — OR allow access by `orderId` only if status pending (security: UUID order ids are unguessable enough for MVP).

**Decision locked:** order ids are `createId('ord')` high entropy → allow GET by id for pending payments; do not list public. Still never return client_key.

Returns:

```ts
{
  data: {
    orderId, orderNumber, status, totalIdr,
    paymentStatus, qrisPayload, expiresAt,
    domainLabel
  }
}
```

**payment-status.get.ts:**

1. Load order+payment.
2. If already paid → return paid.
3. If `providerRef` missing → pending.
4. Call `qrisvipCheckStatus(providerRef)`.
5. If success + amount match → `fulfillPaidOrder`.
6. Return latest status.

**webhooks/qrisvip.post.ts:**

1. Optional header `x-qrisvip-secret` / `x-callback-token` vs `qrisvipWebhookSecret` if set.
2. Read body; extract `trx_id` from common fields (`trx_id`, `trxId`, `data.trx_id`).
3. Find payment by providerRef.
4. **Always** `qrisvipCheckStatus` — only fulfill if remote status success + amount match.
5. Return `{ ok: true }`.

- [ ] **Step 1–4:** Implement + unit smoke.
- [ ] **Step 5:** Commit

```bash
git add server/api/orders server/api/webhooks server/utils
git commit -m "feat(payments): QrisVIP status poll and webhook with re-check"
```

---

### Task 6: Pay page UI (Soft Glass)

**Files:**
- Create: `app/pages/order/pay/[id].vue`
- Modify: `app/pages/order/checkout.vue` — on success navigate to `payPath` / `/order/pay/${id}` instead of external `paymentUrl`
- Modify: `i18n/locales/id.json`, `en.json`

**UI behavior:**

1. `useFetch('/api/orders/${id}/payment')`.
2. Render amount (`formatIdr`), domain, order number (mono).
3. Render QR from `qrisPayload` via `qrcode` toDataURL in `onMounted` / `watch`.
4. Show copy-payload optional collapse for power users.
5. Countdown from `expiresAt`.
6. Poll `/api/orders/${id}/payment-status` every **5s** while pending (stop on paid/expired/unmount).
7. On paid → `navigateTo(/order/success?order=id)`.
8. Loading / error Soft Glass cards; primary sky CTA “Saya sudah bayar” triggers immediate status check.
9. Mobile: QR min ~220px, high contrast.

**Checkout change:**

```ts
const payPath = res.data.payPath || `/order/pay/${res.data.id}`
await navigateTo(localePath(payPath))
// remove external paymentUrl navigate for QRIS path
```

- [ ] **Step 1–3:** UI + i18n.
- [ ] **Step 4:** Commit

```bash
git add app/pages/order i18n/locales
git commit -m "feat(order): QRIS pay page with poll and Soft Glass UI"
```

---

### Task 7: Remove Xendit from project surface

**Files:**
- Delete: `server/utils/xendit.ts` (if unused)
- Delete or 410: `server/api/webhooks/xendit.post.ts`
- Modify: `package.json` remove `xendit-node`
- Modify: `.env.example` remove Xendit keys
- Grep repo for `xendit` / `Xendit` / `createXendit` — fix leftovers (docs, CLAUDE.md payments section)
- Dev payments admin already generic — show provider `qrisvip`

- [ ] **Step 1:** `rg -n "xendit|Xendit|xendit-node" --glob '!pnpm-lock.yaml'`
- [ ] **Step 2:** Clean all hits in app/server/docs as needed.
- [ ] **Step 3:** `pnpm remove xendit-node`
- [ ] **Step 4:** Commit

```bash
git add -A
git commit -m "chore(payments): remove Xendit; QrisVIP is sole gateway"
```

---

### Task 8: Docs, seed notes, verification

**Files:**
- Modify: `CLAUDE.md` payments section (QrisVIP steps)
- Modify: `.env` with real merchant values when available (placeholders OK)

**Manual matrix:**

| # | Case | Expected |
|---|------|----------|
| 1 | Create order total ≥ 10k, valid env | `payPath` + QR payload stored |
| 2 | Missing env credentials | Order pending; pay page shows clear error |
| 3 | Check status pending | UI stays pending |
| 4 | Check status success amount match | Order paid → success page |
| 5 | Amount mismatch | Do not mark paid |
| 6 | Free order total 0 | No QRIS call |
| 7 | Total < 10k non-free | 400 message |
| 8 | Webhook without secret (if secret set) | 401 |
| 9 | mark-paid-dev still works in dev | paid + site |
| 10 | Guest checkout email attach | unchanged |

- [ ] **Step 1:** `pnpm test`
- [ ] **Step 2:** Manual smoke with sandbox/live uuid if available
- [ ] **Step 3:** Commit docs

```bash
git commit -m "docs: QrisVIP payment flow and env"
```

---

## Out of scope

- VA generation / dual-channel checkout
- RTOL / BI FAST disbursement (collection sections 02+)
- Split settlements, multi-merchant
- Partial refunds
- Keeping Xendit as fallback

## Self-review

1. **Spec coverage:** Drop Xendit → Task 7. QrisVIP Postman generate/check → Tasks 2,4,5. QRIS only → generate rejects non-QRIS payload. Any pay method via QRIS → product copy + QR. Best practice secrets/recompute/re-check → Tasks 1,3,5.
2. **Placeholders:** None — concrete endpoints, env names, response shapes.
3. **Types:** `QrisGenerateResult` / `fulfillPaidOrder` names consistent.
4. **Security:** client_key server-only; amount re-check; no client-only activation.

## Execution notes

- Prefer subagent-driven.
- Need merchant `uuid`, `client`, `client_key` in `.env` before live generate works.
- If generate works but webhook never configured, polling alone is enough for v1.
- Chunk commits small; avoid rewriting marketing.

---
