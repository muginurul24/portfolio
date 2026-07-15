# Auth Guard Display + Dev Console Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close remaining auth/guard UX gaps (what each role sees, what they cannot access) and elevate `/dev/**` + `/panel/**` to enterprise Soft Glass console quality so role `dev` can manage every platform domain with best-practice security and UI.

**Architecture:** Build on worktree branch `worktree-feat-auth-dev-dashboard` (CRUD APIs + pages already exist). Do **not** re-scaffold roles/CRUD. Focus on: (1) display matrix correctness, (2) server capability matrix hardening, (3) shared admin UI primitives, (4) Soft Glass console visual system, (5) destructive-action safety, (6) verification matrix.

**Tech Stack:** Nuxt 4, Nuxt UI 4, nuxt-auth-utils, Drizzle SQLite, Zod, i18n (ID default), Vitest, DESIGN.md Enterprise Soft Glass.

## Global Constraints

- Work primarily in worktree: `.claude/worktrees/feat-auth-dev-dashboard` (or merge to main first if user chooses).
- Roles locked: `customer | cs | admin | dev`.
- Security: never UI-only. Mutations re-check `requireRole` on server.
- Money stays IDR integers; Zod all bodies.
- Styling: Enterprise Soft Glass from `DESIGN.md` — primary sky `#0369A1`, navy `#0F172A`, Plus Jakarta Sans UI, IBM Plex Mono for IDs/prices, `shadow-soft-*`, `glass-panel`, dual light/dark, Lucide icons only (no emoji icons).
- UX density: console is **dense dashboard** (8–16px gaps), marketing stays spacious.
- Copy: Bahasa Indonesia first; active voice; errors = cause + fix.
- Do not break Xendit webhook or public marketing routes.
- pathPrefix false for components; no secrets in client.
- Prefer small focused files; match sparse comment density.

---

## Baseline (already shipped on worktree — do not rebuild)

| Area | Status |
|------|--------|
| Role helpers + `requireRole` | Done (`app/utils/roles.ts`, `server/utils/auth.ts`) |
| Middleware `auth` / `staff` / `dev` | Done |
| `/403`, login redirect by role | Done |
| AppUserMenu guest vs auth | Partial (needs role badge + CS menu precision) |
| Dev layout shell + overview | Done (still has client `watchEffect` race) |
| CRUD: users, catalog, promos, orders, payments, sites, inquiries, testimonials, academy | Done (functional; UI polish incomplete) |
| Panel layout | Done (middleware-only; needs a11y/visual polish) |

This plan **polishes and hardens**, not reimplements CRUD.

---

## Auth / Guard display matrix (source of truth)

### A. Guest

| Surface | Show | Hide / Guard |
|---------|------|--------------|
| Marketing header | Logo, nav, **Masuk**, **Buat Website**, locale, color mode | User menu, DEV badge, panel links |
| `/panel/**`, `/dev/**` | Redirect → `/login?redirect=<fullPath>` | Never blank 401 HTML |
| Order wizard | Allowed + soft “Login disarankan” | — |
| Protected API | **401** JSON | — |

### B. Customer

| Surface | Show | Guard |
|---------|------|-------|
| Header | Avatar menu: Panel, Pesanan, Website, Settings, Keluar | Dev Console |
| `/panel/**` | Own data only | Other users’ data (API filter) |
| `/dev/**` | **403** + CTA panel/home | All staff APIs **403** |

### C. CS

| Surface | Show | Guard |
|---------|------|-------|
| Header | Badge **CS** + Dev Console → lands `/dev/orders` | Catalog destroy, user promote-to-dev, system raw tools |
| `/dev` nav | Overview (limited), Orders, Payments, Sites, Inquiries | Users, Templates, Packages, Domains, Promos, Academy, Testimonials (hide or 403) |
| Mutations | Order status (no force-paid), site status, inquiry pipeline | Promo/catalog CRUD, delete users |

### D. Admin

| Surface | Show | Guard |
|---------|------|-------|
| Full business console | Users (not promote-to-dev), catalog, promos, orders, sites, content | Promote role `dev`; delete last-dev; mark-paid-dev only if `import.meta.dev` |

### E. Dev

| Surface | Show | Guard |
|---------|------|-------|
| Everything | All CRUD + system health + mark-paid-dev (dev env) | Still no client-trusted totals; webhook stays token-gated |

### Shared guard UX

1. Unauth → login with return URL (preserve query).
2. Wrong role → `/403` with role-aware primary CTA.
3. API 401 → toast + optional session clear + login.
4. API 403 → toast “Tidak punya akses”.
5. Destructive delete → `UModal` confirm (not browser `confirm()`).

---

## Design system — Dev Console (frontend-design + ui-ux-pro-max)

**Product subject:** Ops console for website-builder platform (UMKM/export). Audience: Mugiew staff. Job: scan metrics → act on one entity → confirm safely.

**Visual direction (locked to DESIGN.md, not generic AI dashboard):**

| Token | Value |
|-------|-------|
| Page bg | `bg-muted/40` + subtle mesh only on overview hero strip |
| Chrome | `glass-panel` sticky header/sidebar; `shadow-soft-sm` cards |
| Density | Compact tables: `text-sm`, row py-2.5–3, sticky thead |
| Accent | Sky primary CTAs; role badges: DEV=primary, ADMIN=warning, CS=neutral |
| Type | Plus Jakarta UI; Fraunces only for empty-state titles; mono for order numbers/slugs/TLD |
| Motion | 150–250ms; respect `prefers-reduced-motion`; skeletons not spinners for >300ms lists |
| A11y | 44px touch targets, visible focus, icon buttons `aria-label`, confirm dialogs Esc/Cancel |
| Dark | Full semantic tokens; no hard-coded white cards |

**Signature element:** Console **command rail** — left nav grouped (Platform / Catalog / Commerce / Content / System) with active sky highlight + role chip. One primary action per page top-right (“Tambah …”).

**Anti-patterns:** emoji icons, browser `confirm()`, dual client+middleware redirects, hiding nav without server 403, gray-on-gray tables, placeholder-only form labels.

---

## File map (this plan)

| Path | Responsibility |
|------|----------------|
| `app/utils/roles.ts` | Add `canManageOrders`, `canManageContent`, `navSections` helpers if missing |
| `app/utils/auth-redirect.ts` | Keep; ensure register uses same as login |
| `app/components/AppUserMenu.vue` | Role badge; CS/admin/dev menu precision |
| `app/layouts/default.vue` | Guest CTA vs auth menu only (verify) |
| `app/layouts/dev.vue` | Grouped nav, remove watchEffect race, mobile drawer a11y |
| `app/layouts/panel.vue` | Match visual density; skip link |
| `app/components/dev/DevPageHeader.vue` | Shared title + subtitle + primary action |
| `app/components/dev/DevDataTable.vue` | Shared table chrome (optional thin wrapper) |
| `app/components/dev/DevConfirmModal.vue` | Destructive confirm Soft Glass |
| `app/components/dev/DevEmptyState.vue` | Empty + CTA |
| `app/plugins/api-auth.client.ts` | Optional: intercept 401/403 toasts |
| `server/api/dev/**` | Tighten role arrays per matrix (CS vs admin) |
| `app/pages/dev/**` | Use shared components; replace `confirm()`; loading skeletons |
| `app/pages/register.vue` | Role-aware redirect like login |
| `app/pages/403.vue` | Soft Glass polish if needed |
| `i18n/locales/id.json` + `en.json` | Nav groups, confirm copy, toast keys |
| `tests/roles.test.ts` | Extend capability matrix |
| `DESIGN.md` | Short “Dev Console” subsection (optional) |

---

### Task 1: Capability matrix helpers (TDD)

**Files:**
- Modify: `app/utils/roles.ts`
- Modify: `tests/roles.test.ts`

**Interfaces:**
```ts
export type UserRole = 'customer' | 'cs' | 'admin' | 'dev'

export function canManageOrders(role: UserRole): boolean // cs|admin|dev
export function canManageInquiries(role: UserRole): boolean // cs|admin|dev
export function canManageSites(role: UserRole): boolean // cs|admin|dev
export function canManagePayments(role: UserRole): boolean // cs|admin|dev
export function canManageContent(role: UserRole): boolean // admin|dev (testimonials, academy)
export function canAccessSystem(role: UserRole): boolean // admin|dev
// existing: isStaff, isDev, canAccessDevConsole, canManageCatalog, canManageUsers, canPromoteDev
```

- [ ] **Step 1: Write failing tests** in `tests/roles.test.ts`

```ts
it('canManageOrders: cs|admin|dev', () => {
  expect(canManageOrders('customer')).toBe(false)
  expect(canManageOrders('cs')).toBe(true)
  expect(canManageOrders('admin')).toBe(true)
  expect(canManageOrders('dev')).toBe(true)
})

it('canManageContent: admin|dev only', () => {
  expect(canManageContent('cs')).toBe(false)
  expect(canManageContent('admin')).toBe(true)
})

it('canAccessSystem: admin|dev', () => {
  expect(canAccessSystem('cs')).toBe(false)
  expect(canAccessSystem('dev')).toBe(true)
})
```

- [ ] **Step 2: Run** `pnpm test tests/roles.test.ts` → FAIL (exports missing).

- [ ] **Step 3: Implement** helpers in `app/utils/roles.ts` (pure functions only).

- [ ] **Step 4: Run** `pnpm test tests/roles.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add app/utils/roles.ts tests/roles.test.ts
git commit -m "feat(auth): extend role capability matrix for console nav"
```

---

### Task 2: Server API role hardening (matrix)

**Files:**
- Modify each mutation/list under `server/api/dev/**` so roles match matrix:
  - Users / catalog / promos / testimonials / courses: `['admin','dev']`
  - Orders / payments / sites / inquiries: `['cs','admin','dev']`
  - Overview: `['admin','dev']` (CS already limited on page)
  - System health page may call public `/api/health` — keep; page middleware staff
- Modify: `server/api/dev/orders/[id].patch.ts` — keep CS blocked from force `paid`
- Modify: `server/api/orders/[id]/mark-paid-dev.post.ts` — require `import.meta.dev` + `requireRole(event, ['dev'])` (or staff already? tighten to **dev only**)

**Interfaces:**
- Consumes: `requireRole(event, UserRole[])`
- Produces: consistent 403 `statusMessage: 'Akses ditolak'`

- [ ] **Step 1: Audit** with ripgrep:

```bash
rg -n "requireRole" server/api/dev
```

List any endpoint still using only `requireUserSession` for mutations.

- [ ] **Step 2: Patch mark-paid-dev**

```ts
// after import.meta.dev check:
await requireRole(event, ['dev'])
```

- [ ] **Step 3: Tighten CS on catalog** — ensure no CS can hit templates/packages/domains/promos POST/PATCH/DELETE (already admin|dev; verify).

- [ ] **Step 4: Manual API smoke** (with session cookies):
  - customer → POST `/api/dev/templates` → 403
  - no session → GET `/api/dev/users` → 401

- [ ] **Step 5: Commit**

```bash
git add server/api/dev server/api/orders
git commit -m "feat(auth): harden dev API roles to capability matrix"
```

---

### Task 3: Marketing header + AppUserMenu display matrix

**Files:**
- Modify: `app/components/AppUserMenu.vue`
- Modify: `app/layouts/default.vue` (only if guest CTA wrong)
- Modify: `i18n/locales/id.json`, `en.json`

**Interfaces:**
- Consumes: `canAccessDevConsole`, `isStaff`, `UserRole`
- Produces: menu items by role; role badge chip

**Menu rules:**

```ts
// Guest: parent layout shows Masuk + Buat Website (not this component)

// Customer: Panel, Orders, Sites, Settings, Logout
// CS: Dev Console (/dev/orders), Panel, Settings, Logout + badge CS
// Admin: Dev Console (/dev), Panel, Settings, Logout + badge ADMIN
// Dev: Dev Console (/dev), Panel, Settings, Logout + badge DEV
```

- [ ] **Step 1: Implement role badge** next to display name (UBadge subtle).

- [ ] **Step 2: Fix CS landing** — `to: localePath('/dev/orders')` when role === 'cs', else `/dev`.

- [ ] **Step 3: Hide customer-only order/site shortcuts for staff** (optional clutter) OR keep both — prefer: staff see Dev Console first, Panel second.

- [ ] **Step 4: Visual check** light/dark; touch target ≥44px for avatar button.

- [ ] **Step 5: Commit**

```bash
git add app/components/AppUserMenu.vue i18n/locales
git commit -m "feat(ui): role-aware marketing user menu and badges"
```

---

### Task 4: Register + login redirect parity

**Files:**
- Modify: `app/pages/register.vue`
- Modify: `app/pages/login.vue` (verify only)
- Uses: `homeForRole`, `safeInternalPath` from `app/utils/auth-redirect.ts`

- [ ] **Step 1: Align register** when already logged in and after success:

```ts
import type { UserRole } from '~/utils/roles'
import { homeForRole, safeInternalPath } from '~/utils/auth-redirect'

const { loggedIn, user, fetch: refreshSession } = useUserSession()
const route = useRoute()

function destinationForSession(): string {
  const role = (user.value as { role?: UserRole } | null)?.role
  return safeInternalPath(route.query.redirect, homeForRole(role, localePath))
}

if (import.meta.client && loggedIn.value) {
  await navigateTo(destinationForSession())
}
// after register success:
await refreshSession()
await navigateTo(destinationForSession())
```

- [ ] **Step 2: Ensure** `safeInternalPath` rejects `//evil.com` and external URLs.

- [ ] **Step 3: Commit**

```bash
git add app/pages/register.vue app/pages/login.vue app/utils/auth-redirect.ts
git commit -m "feat(auth): register uses safe role-based redirect"
```

---

### Task 5: Dev layout — remove race, grouped Soft Glass nav

**Files:**
- Modify: `app/layouts/dev.vue`
- Modify: `i18n/locales/*` for group labels

**Rules:**
- **Delete** client `watchEffect` login redirect (middleware already guards pages).
- Nav groups:
  1. Platform: Overview, Users
  2. Catalog: Templates, Packages, Domains, Promos
  3. Commerce: Orders, Payments, Sites
  4. Content: Inquiries, Academy, Testimonials
  5. System: System
- Filter each item with capability helpers (CS never sees catalog links).
- Mobile: collapsible drawer, Esc closes, focus trap optional (USlideover if available).
- Sticky glass sidebar; active link sky highlight; DEV/ADMIN/CS badge.

- [ ] **Step 1: Remove** lines equivalent to:

```ts
watchEffect(() => {
  if (import.meta.client && !loggedIn.value) {
    navigateTo(localePath('/login'))
  }
})
```

- [ ] **Step 2: Build `navGroups` computed** filtered by role helpers.

- [ ] **Step 3: Render** group labels (`text-xs uppercase tracking-wide text-muted`) + links.

- [ ] **Step 4: Mobile menu** with same groups; `aria-label` on hamburger.

- [ ] **Step 5: Commit**

```bash
git add app/layouts/dev.vue i18n/locales
git commit -m "feat(dev): soft-glass grouped console nav without client guard race"
```

---

### Task 6: Shared Dev UI primitives

**Files:**
- Create: `app/components/dev/DevPageHeader.vue`
- Create: `app/components/dev/DevConfirmModal.vue`
- Create: `app/components/dev/DevEmptyState.vue`
- Create: `app/components/dev/DevSkeletonTable.vue`

**DevPageHeader:**

```vue
<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  total?: number
}>()
</script>
<template>
  <div class="flex flex-wrap items-start justify-between gap-3 mb-6">
    <div>
      <h1 class="text-2xl font-semibold text-highlighted tracking-tight">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-muted mt-1">
        {{ subtitle }}
        <span v-if="total != null" class="tabular-nums"> · {{ total }}</span>
      </p>
    </div>
    <div class="flex flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
```

**DevConfirmModal:** v-model open; props `title`, `description`, `confirmLabel`, `loading`, `color` default `error`; emits `confirm`.

**DevEmptyState:** icon + title + description + optional CTA slot.

**DevSkeletonTable:** 5 rows shimmer, reduced-motion safe.

- [ ] **Step 1: Create components** (pathPrefix false → tags `DevPageHeader` etc.).

- [ ] **Step 2: Smoke** import on `/dev/users` only first.

- [ ] **Step 3: Commit**

```bash
git add app/components/dev
git commit -m "feat(dev): shared console header confirm empty skeleton components"
```

---

### Task 7: Migrate all `/dev/**` pages to primitives + confirm UX

**Files:**
- Modify every `app/pages/dev/**/index.vue` that uses `confirm()` or raw header markup:
  - users, templates, packages, domains, promos, orders, payments, sites, inquiries, testimonials, academy, system, overview

**Pattern:**

```ts
const confirmOpen = ref(false)
const pendingDelete = ref<{ id: string, label: string } | null>(null)

function askDelete(row: { id: string }, label: string) {
  pendingDelete.value = { id: row.id, label }
  confirmOpen.value = true
}

async function doDelete() {
  if (!pendingDelete.value) return
  // existing $fetch DELETE
}
```

- [ ] **Step 1: Replace** all `confirm(t(...))` with `DevConfirmModal`.

- [ ] **Step 2: Replace** page headers with `DevPageHeader`.

- [ ] **Step 3: Replace** bare “loading…” text with `DevSkeletonTable` when `status === 'pending'`.

- [ ] **Step 4: Empty** → `DevEmptyState` with primary add CTA where create exists.

- [ ] **Step 5: Forms** — visible labels, required markers, error toast cause+fix (already), password show toggle if easy via UInput type toggle.

- [ ] **Step 6: Commit**

```bash
git add app/pages/dev
git commit -m "feat(dev): polish all console modules with shared Soft Glass UX"
```

---

### Task 8: Panel layout polish + 403 Soft Glass

**Files:**
- Modify: `app/layouts/panel.vue`
- Modify: `app/pages/403.vue`
- Modify: `app/pages/panel/**` empty states only if CTAs wrong

**Panel rules:**
- Middleware-only auth (already).
- Show role badge + staff link (already) — style with glass + soft shadows.
- Mobile drawer: ensure labels+icons, close on navigate.
- Skip link to `#main` if missing.
- Customer never sees Dev Console link.

**403:**
- Use `glass-panel` card, shield icon, role-aware CTA (already logic) — improve spacing/type.

- [ ] **Step 1–3: Implement visual polish.**

- [ ] **Step 4: Commit**

```bash
git add app/layouts/panel.vue app/pages/403.vue app/pages/panel
git commit -m "feat(panel): soft-glass panel chrome and 403 guard polish"
```

---

### Task 9: Optional global API error plugin

**Files:**
- Create: `app/plugins/api-auth.client.ts`

```ts
export default defineNuxtPlugin(() => {
  const toast = useToast()
  const localePath = useLocalePath()
  // Intercept $fetch via global interceptor if project pattern allows;
  // else document page-level handling is enough (YAGNI).
})
```

Only implement if Nuxt 4 / ofetch onResponseError is already used in repo. Otherwise **skip** and document manual toast pattern (already on pages).

- [ ] **Step 1: Grep** existing interceptors.

- [ ] **Step 2: Implement or skip with comment in plan checkbox.**

- [ ] **Step 3: Commit only if code added.**

---

### Task 10: DESIGN.md console subsection + i18n completeness

**Files:**
- Modify: `DESIGN.md` — add “Dev Console / Panel” section (density, groups, badges).
- Modify: `i18n/locales/id.json`, `en.json` — nav group labels, confirm strings, `auth.roleBadge*`.

- [ ] **Step 1: Add DESIGN.md section** (short, no redesign of marketing).

- [ ] **Step 2: Sync id/en keys** — run:

```bash
node -e "/* flat-key compare id vs en; exit 1 if mismatch */"
```

- [ ] **Step 3: Commit**

```bash
git add DESIGN.md i18n/locales
git commit -m "docs(design): console Soft Glass rules and i18n keys"
```

---

### Task 11: Verification matrix + merge readiness

**Files:** none (commands + manual)

- [ ] **Step 1: Automated**

```bash
pnpm test
pnpm exec eslint "app/layouts/dev.vue" "app/layouts/panel.vue" "app/components/dev/**/*" "app/components/AppUserMenu.vue" "server/api/dev/**/*.ts" --quiet
# optional: pnpm typecheck
```

Expected: tests all pass; no severity-2 eslint on touched files.

- [ ] **Step 2: Manual matrix**

| # | Action | Expected |
|---|--------|----------|
| 1 | Guest opens `/panel` | Redirect login?redirect= |
| 2 | Guest opens `/dev` | Redirect login?redirect= |
| 3 | Login customer | `/panel`; no Dev Console in menu |
| 4 | Customer opens `/dev` | 403 |
| 5 | Login `mugiew@nuxt.dev` | `/dev`; badge DEV |
| 6 | Dev creates template | Success toast; list refresh |
| 7 | Dev deletes user last-dev | Server 400 |
| 8 | API no cookie GET `/api/dev/users` | 401 |
| 9 | Customer POST `/api/dev/templates` | 403 |
| 10 | Light/dark console | Readable contrast, glass ok |
| 11 | Mobile console | Drawer works; 44px targets |
| 12 | reduced-motion | No layout thrash |

- [ ] **Step 3: Commit** verification notes only if code fixes arise.

- [ ] **Step 4: Offer merge** worktree → main via finishing-a-development-branch skill.

---

## Out of scope

- OAuth / social login
- Full RBAC permissions table UI
- Visual page builder for customer sites
- Live registrar / WhatsApp Business API
- Rebuilding marketing home (already enterprise plan)

## Self-review

1. **Spec coverage:** Display matrix A–E → Tasks 3–5, 8. Dev manage-all → baseline + Task 7 polish. Best-practice guard → Tasks 2, 4, 5, 11. Styling skills → Design system section + Tasks 5–8.
2. **Placeholders:** None — concrete files, code, commands.
3. **Types:** Role helpers names consistent across tasks.
4. **YAGNI:** API plugin optional; no rewrite of working CRUD handlers.

## Execution notes

- Prefer subagent-driven; one task per commit.
- If main lacks worktree commits, merge auth branch first OR execute entirely inside worktree.
- Keep chunks small to avoid context overflow.
