# AGENTS.md — MugiewDev

Instructions for **any** AI coding agent working on this repo.

## What this product is

**MugiewDev** clones feature-parity of [webekspor.com](https://www.webekspor.com): a **website-builder platform** for Indonesian UMKM & exporters (templates, domain, hosting, academy, community).

It is **NOT** a B2B goods marketplace. No RFQ matching, no take-rate on product sales.

Full research: `docs/research/webekspor-analysis.md`  
Design system: `DESIGN.md`  
Human/agent conventions: `CLAUDE.md`

## Stack (locked — do not swap without strong reason)

| Layer | Choice |
|-------|--------|
| Framework | **Nuxt 4** (`nuxt@^4`) |
| UI | **Nuxt UI 4** + Tailwind CSS 4 |
| Icons | Lucide + Simple Icons (`@iconify-json/*`) |
| Fonts | `@nuxt/fonts` → Plus Jakarta Sans |
| Images | `@nuxt/image` (webp/avif) |
| Content | `@nuxt/content` (blog, FAQ, tutorial) |
| i18n | `@nuxtjs/i18n` — default **id**, + **en** |
| SEO | `@nuxtjs/sitemap`, `@nuxtjs/robots`, `nuxt-og-image` |
| State | Pinia (`@pinia/nuxt`) |
| Utils | `@vueuse/nuxt`, `date-fns`, `zod` |
| Auth | `nuxt-auth-utils` (session cookies) |
| DB | Drizzle ORM + better-sqlite3 (dev); Postgres-ready later |
| Payments | QrisVIP QRIS (`ofetch` + `qrcode`) |
| Email | `resend` |
| Charts | `nuxt-charts` (panel analytics) |
| Test | Vitest + `@nuxt/test-utils` |
| Package manager | **pnpm** only |

## Directory map (Nuxt 4)

```
app/
  assets/css/main.css     # design tokens
  components/             # auto-imported
  composables/
  layouts/                # default, panel
  middleware/             # auth
  pages/                  # file routes
  stores/                 # pinia
  types/
  utils/
  app.config.ts           # public theme tokens
  app.vue
server/
  api/                    # Nitro routes
  database/schema/        # Drizzle
  utils/db.ts
content/                  # Nuxt Content MD
i18n/locales/             # id.json, en.json
docs/                     # research, architecture
design-system/            # MASTER + page overrides
```

## Hard rules

1. **Read first:** `DESIGN.md`, this file, `docs/research/webekspor-analysis.md` for product work.
2. **Nuxt conventions:** `useFetch` / `useAsyncData` for SSR data — not bare `$fetch` in setup for initial load. Keys on async data. `runtimeConfig` for secrets.
3. **Validation:** Zod on every API body (`readValidatedBody`).
4. **i18n:** User-facing strings via `$t` / `t()` — no hard-coded ID/EN in templates except brand names.
5. **Money:** IDR integers (no floats). Format with `formatIdr()` from `app/utils/format.ts`.
6. **Auth:** Protect `/panel/**` with `middleware: 'auth'`. Roles: `customer | admin | cs`.
7. **Payments:** Never trust client amounts — recompute server-side from package/domain/promo.
8. **No secrets in client:** only `runtimeConfig.public.*`.
9. **UI:** Nuxt UI components (`UButton`, `UCard`, …). Lucide icons. Soft shadows tokens. Light-first.
10. **A11y:** labels, focus, 44px targets, reduced-motion, skip-link already in layout.
11. **Route naming:** keep WebEkspor-compatible paths where possible (`/templates`, `/order/choose-domain`, `/jasa-pembuatan-website-*`).
12. **Commits:** conventional (`feat:`, `fix:`, `docs:`, `chore:`). Do not commit `.env`.

## How to run

```bash
pnpm install
cp .env.example .env   # set NUXT_SESSION_PASSWORD (≥32 chars)
pnpm dev               # http://localhost:3000
pnpm db:push           # apply Drizzle schema
pnpm lint && pnpm typecheck
```

## Implementation order (for agents)

Follow `docs/research/webekspor-analysis.md` backlog:

1. Seed DB (templates, packages, domain TLDs, promo WEBSITEJUARA)
2. Public service landings + templates detail
3. Order wizard + QrisVIP QRIS + status poll/webhook
4. Panel CRUD (sites, orders, inquiries)
5. Academy modules + progress
6. Content pages polish + SEO meta per route

## API conventions

- REST under `/api/*`
- Auth endpoints: `/api/auth/*`
- Webhooks: `/api/webhooks/xendit`
- Errors: `createError({ statusCode, statusMessage })`
- Success: plain JSON objects

## What NOT to build

- Multi-vendor product marketplace / RFQ board
- Crypto payments
- Separate micro-frontends
- Replacing Nuxt UI with another component library mid-project
- Committing production secrets

## Docs for Nuxt

Always prefer live Nuxt 4 docs:
- https://nuxt.com/llms-full.txt
- https://nuxt.com/docs/4.x/
- Module best practices: https://nuxt.com/docs/4.x/guide/modules/best-practices
