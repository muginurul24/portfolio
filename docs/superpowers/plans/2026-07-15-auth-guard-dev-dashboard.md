# Auth Guard UX + Dev Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement best-practice auth/guard UX (what guests vs authenticated users see) and a full **role `dev`** dashboard to create/manage every product domain in MugiewDev (users, catalog, commerce, sites, content, academy).

**Architecture:** `nuxt-auth-utils` session remains source of truth. Route middleware: `auth` (any login) + `role` (capability matrix). Server helpers `requireUserSession` + `requireRole`. Customer panel stays under `/panel/**` (own data). Staff/dev console under `/dev/**` (global CRUD). Never trust client role alone for mutations — re-check on API.

**Tech Stack:** Nuxt 4, nuxt-auth-utils, Drizzle SQLite, Zod, Nuxt UI 4, i18n, existing schema domains.

## Global Constraints

- Roles after this plan: `customer | cs | admin | dev` (extend schema enum).
- `dev` = full platform management (superuser).
- `admin` = business ops (orders/sites/users/catalog/promos; no destructive schema/dev tools).
- `cs` = support (read orders/sites/inquiries; limited status updates; no catalog delete).
- `customer` = own orders/sites/inquiries/academy/settings only.
- Session fields: `{ id, email, name, phone, role }` typed via `#auth-utils`.
- Server: `requireUserSession` for protected APIs; `requireRole(event, roles[])` for staff/dev.
- Client: never hide-only security — always enforce on server.
- Money IDR integers; Zod all bodies; Soft Glass UI; i18n ID default.
- pathPrefix false for components; no secrets in client.
- Do not break Xendit webhook or public marketing routes.

---

## Auth / Guard display matrix (product UX)

### A. Guest (not logged in)

| Surface | Show |
|---------|------|
| Header | Logo, nav marketing, **Masuk**, **Buat Website**, locale, color mode |
| Home / marketing | Full public content + CTA order/WA |
| `/login`, `/register` | Forms; if already logged in → redirect `/panel` or `/dev` by role |
| `/panel/**` | **Guard:** redirect `/login?redirect=<path>` |
| `/dev/**` | **Guard:** redirect `/login?redirect=<path>` |
| Order wizard | Allowed; banner “Login disarankan” (already) |
| API protected | **401** JSON |

### B. Authenticated `customer`

| Surface | Show |
|---------|------|
| Header | Replace **Masuk** with avatar menu: Dasbor, Pesanan, Website, Settings, Keluar |
| `/panel` | Own stats, orders, sites, inquiries, academy progress, settings |
| `/dev/**` | **403 page** “Akses ditolak” + link ke panel |
| API staff | **403** |

### C. Authenticated `cs`

| Surface | Show |
|---------|------|
| Header | Menu staff: Panel CS (orders/inquiries/sites read+update status) |
| `/dev` limited | Orders, inquiries, sites (no catalog destroy, no user role promote to dev) |
| Customer panel | Optional still accessible for own test account data |

### D. Authenticated `admin`

| Surface | Show |
|---------|------|
| `/dev` | Catalog, packages, TLD, promos, orders, sites, users (not dev-only tools), testimonials |
| Cannot | Change own role to remove last dev; no raw SQL |

### E. Authenticated `dev`

| Surface | Show |
|---------|------|
| Full `/dev/**` | All CRUD: users (all roles), templates, packages, domain TLDs, promos, orders, payments, sites, inquiries, courses/modules, testimonials, system health |
| Header | Badge **DEV** + link Dev Console |
| Can seed-like actions | Mark paid (dev only already), re-provision site status |

### Guard pages (shared UI)

1. **Unauthenticated hit protected route** → soft login page with return URL (not blank 401 screen).
2. **Authenticated wrong role** → `/403` (or `/panel/forbidden`) with reason + CTAs.
3. **API 401** → client clears session hint / redirect login.
4. **API 403** → toast “Tidak punya akses”.

---

## File map

| Path | Role |
|------|------|
| `shared/types/auth.d.ts` | `#auth-utils` User role typing |
| `server/utils/auth.ts` | `requireRole`, `getSessionUser`, role helpers |
| `app/middleware/auth.ts` | Wait `ready`, redirect with `redirect` query |
| `app/middleware/role-dev.ts` | Require `dev` (or admin for subset routes) |
| `app/middleware/role-staff.ts` | `cs|admin|dev` |
| `app/pages/403.vue` | Forbidden UX |
| `app/layouts/default.vue` | Auth-aware header menu |
| `app/layouts/dev.vue` | Dev console shell |
| `app/pages/dev/**` | Dev dashboard modules |
| `server/api/dev/**` | CRUD APIs |
| `server/database/schema/index.ts` | role enum + `dev` |
| `scripts/seed.ts` | seed `mugiew@nuxt.dev` as `dev` |
| `i18n/locales/*` | auth/guard/dev strings |
| `tests/auth-role.test.ts` | pure role helper tests |

---

### Task 1: Session types + role helpers (TDD)

**Files:**
- Create: `shared/types/auth.d.ts`
- Create: `server/utils/auth.ts`
- Create: `app/utils/roles.ts` (client-safe pure helpers)
- Create: `tests/roles.test.ts`
- Modify: `server/database/schema/index.ts` role enum add `dev`
- Modify: `scripts/seed.ts` admin user role → `dev`

**Interfaces:**
```ts
export type UserRole = 'customer' | 'cs' | 'admin' | 'dev'

export function isStaff(role: UserRole): boolean // cs|admin|dev
export function isDev(role: UserRole): boolean
export function canAccessDevConsole(role: UserRole): boolean // admin|dev (cs limited later)
export function canManageCatalog(role: UserRole): boolean // admin|dev
export function canManageUsers(role: UserRole): boolean // admin|dev
export function canPromoteDev(role: UserRole): boolean // dev only
```

Server:
```ts
export async function requireRole(event, roles: UserRole[])
// uses requireUserSession; throws 403 if role not in list
```

- [ ] **Step 1: Write tests** in `tests/roles.test.ts` for matrix above.

- [ ] **Step 2: Run** `pnpm test tests/roles.test.ts` → FAIL.

- [ ] **Step 3: Implement** `app/utils/roles.ts` + schema enum + auth.d.ts + server requireRole.

- [ ] **Step 4: Seed** `mugiew@nuxt.dev` role `dev`, password `aa123123`.

- [ ] **Step 5: `CI=true pnpm exec drizzle-kit push --force` + `pnpm db:seed`.

- [ ] **Step 6: Commit**

```bash
git commit -m "feat(auth): add dev role, session types, and role helpers"
```

---

### Task 2: Middleware auth/guard UX

**Files:**
- Modify: `app/middleware/auth.ts`
- Create: `app/middleware/staff.ts`
- Create: `app/middleware/dev.ts`
- Create: `app/pages/403.vue`
- Modify: `app/pages/login.vue` (honor redirect; post-login route by role)

**Auth middleware behavior:**
```ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, ready } = useUserSession()
  const localePath = useLocalePath()
  if (!ready.value) return // or await fetch once
  if (!loggedIn.value) {
    return navigateTo({
      path: localePath('/login'),
      query: { redirect: to.fullPath }
    })
  }
})
```

**dev middleware:** require role `dev` (or `admin` if route meta `staffMin: 'admin'`). Else → `/403`.

**Login success routing:**
```ts
if (role === 'dev' || role === 'admin') navigateTo(redirect || '/dev')
else if (role === 'cs') navigateTo(redirect || '/dev/orders')
else navigateTo(redirect || '/panel')
```

Safe redirect: only internal paths starting with `/`, never `//`.

- [ ] **Step 1–5:** implement + manual smoke guest→login→redirect.

- [ ] **Commit:** `feat(auth): guard middleware with redirect and 403 page`

---

### Task 3: Marketing header auth-aware UI

**Files:**
- Modify: `app/layouts/default.vue`
- Optional: `app/components/AppUserMenu.vue`

**Guest:** Masuk + Buat Website  
**Logged in:** User menu (name/email, role badge), links:
- customer: Panel, Pesanan, Website, Settings, Logout  
- staff/dev: Dev Console, Panel, Logout  

Do not show Dev Console to customer.

- [ ] **Commit:** `feat(ui): auth-aware marketing header menu`

---

### Task 4: Harden server APIs with requireRole

**Files:**
- Modify all protected `server/api/**` to use `requireUserSession` / `requireRole`
- Create: `server/api/dev/overview.get.ts` (counts for dev home)

Rules:
- Customer list endpoints: own data only (existing).
- Mutations on catalog/users: `admin|dev`.
- Delete user / set role dev: `dev` only.
- Webhook stays public with token.

- [ ] **Commit:** `feat(auth): enforce requireRole on protected APIs`

---

### Task 5: Dev layout + overview dashboard

**Files:**
- Create: `app/layouts/dev.vue` (sidebar: Overview, Users, Templates, Packages, Domains, Promos, Orders, Payments, Sites, Inquiries, Academy, Testimonials, System)
- Create: `app/pages/dev/index.vue` middleware `['auth','dev']` layout `dev`
- Create: `server/api/dev/overview.get.ts`

Overview cards: users, orders by status, revenue paid sum, sites provisioning, open inquiries, active promos.

- [ ] **Commit:** `feat(dev): console shell and overview metrics`

---

### Task 6: Dev Users CRUD

**Files:**
- `server/api/dev/users/index.get.ts` list/search
- `server/api/dev/users/index.post.ts` create (hash password)
- `server/api/dev/users/[id].patch.ts` update name/phone/role/password
- `server/api/dev/users/[id].delete.ts` soft-block if last dev
- `app/pages/dev/users/index.vue` table + UModal form

Zod role enum; prevent demoting last `dev`.

- [ ] **Commit:** `feat(dev): users management CRUD`

---

### Task 7: Dev Catalog — Templates + Packages + Domain TLDs

**Files:**
- APIs under `server/api/dev/templates/**`, `packages/**`, `domains/**`
- Pages: `app/pages/dev/templates/index.vue`, `packages/index.vue`, `domains/index.vue`

Templates: CRUD fields matching schema (slug unique, category enum, featured, active, sortOrder, urls).  
Packages: serviceType, prices, features JSON array editor (textarea lines → string[]).  
TLDs: tld, priceYearlyIdr, promoPrice, active.

- [ ] **Commit:** `feat(dev): catalog templates packages and domain TLDs admin`

---

### Task 8: Dev Commerce — Promos, Orders, Payments, Sites

**Files:**
- `server/api/dev/promos/**`
- `server/api/dev/orders/**` (list filters, patch status, notes)
- `server/api/dev/payments/**` (list by order)
- `server/api/dev/sites/**` (list, patch status/adminUrl/expiresAt)
- Pages under `app/pages/dev/{promos,orders,payments,sites}/`

Order status transitions allowed: document matrix (e.g. pending→cancelled; paid→provisioning→active; no paid←cancelled without dev).

Reuse mark-paid-dev only when `import.meta.dev` + role dev.

- [ ] **Commit:** `feat(dev): commerce orders payments sites promos admin`

---

### Task 9: Dev Inquiries + Testimonials + Academy

**Files:**
- `server/api/dev/inquiries/**` status pipeline new→contacted→quoted→won/lost
- `server/api/dev/testimonials/**` CRUD
- `server/api/dev/courses/**` + modules CRUD
- Pages: `dev/inquiries`, `dev/testimonials`, `dev/academy`

- [ ] **Commit:** `feat(dev): inquiries testimonials and academy admin`

---

### Task 10: Customer panel polish (auth experience)

**Files:**
- `app/layouts/panel.vue` — remove dual client redirect race; rely on middleware; show user role; link to Dev if staff
- Empty states already exist — ensure CTAs correct
- Settings: show role; customers cannot edit role

- [ ] **Commit:** `feat(panel): align customer panel with auth middleware best practices`

---

### Task 11: i18n + verification

**Files:** `i18n/locales/id.json`, `en.json` for auth/403/dev nav/actions

- [ ] `pnpm test && pnpm lint && pnpm typecheck && pnpm build`
- [ ] Manual matrix:
  1. Guest `/panel` → login?redirect=
  2. Login customer → `/panel`, no `/dev`
  3. Login `mugiew@nuxt.dev` (dev) → `/dev`, CRUD template works
  4. Customer hit `/dev` → 403
  5. API without session → 401
  6. API customer POST dev template → 403

- [ ] **Commit:** `feat(auth): i18n and verification for guard and dev dashboard`

---

## Out of scope

- OAuth/social login
- Full RBAC permissions table (roles sufficient for v1)
- Visual page builder for customer sites
- Real registrar/Xendit live beyond existing

## Self-review

1. Auth display matrix covered (guest/customer/cs/admin/dev).
2. Dev can manage all schema domains via tasks 6–9.
3. Server enforcement not UI-only.
4. Types/tests for role helpers first.

## Execution notes

- Prefer subagent-driven.
- After schema role change always push + reseed.
- Keep public marketing unauthenticated.
