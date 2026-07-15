---
name: mugiewdev-conventions
description: >
  Project conventions for MugiewDev (Nuxt 4 website-builder for UMKM/exporters).
  Use this skill whenever editing or creating files in the MugiewDev repo — pages,
  components, API routes, schema, i18n, design tokens, order/payment flows, panel,
  templates catalog, or docs. Also use when the user mentions MugiewDev, webekspor
  parity, order wizard, Xendit, templates catalog, akademi, or panel dashboard.
---

# MugiewDev Conventions

## Before any implementation

1. Read `AGENTS.md`, `DESIGN.md`, and `docs/research/webekspor-analysis.md`.
2. Confirm the task matches product reality: **website builder**, not goods marketplace.
3. Prefer existing Nuxt UI components and tokens over custom CSS.

## UI work

- Soft UI Evolution: navy + sky CTA, Plus Jakarta Sans, soft shadows.
- `primary: sky`, `neutral: slate`, light default.
- Icons: Lucide / Simple Icons only.
- All user strings through i18n (`id` default).
- Marketing section order: Hero → Proof → Features → Steps → CTA.
- Order wizard: one primary action per step; recompute price on server.

## Server work

- Zod-validate bodies.
- `useDb()` for Drizzle.
- Money as integer IDR.
- Auth session via `nuxt-auth-utils`.
- Webhooks verify shared secret before mutating state.

## File placement

| Kind | Path |
|------|------|
| Page | `app/pages/...` |
| Layout | `app/layouts/` |
| Component | `app/components/<domain>/` |
| API | `server/api/...` |
| Schema | `server/database/schema/` |
| Content MD | `content/` |
| Locale | `i18n/locales/{id,en}.json` |

## Do not

- Introduce another UI kit.
- Store secrets in `public` runtime config.
- Trust client-submitted totals for payment.
- Build RFQ / multi-vendor marketplace features unless product docs change.
