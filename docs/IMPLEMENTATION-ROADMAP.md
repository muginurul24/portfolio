# Implementation Roadmap — next AI agents

Scaffold complete. Work remaining in priority order.

## Done (scaffold)

- [x] Nuxt 4 + Nuxt UI project
- [x] Full module stack (i18n, content, image, fonts, pinia, auth-utils, SEO, charts)
- [x] Design system Soft UI Evolution + DESIGN.md
- [x] AGENTS.md / CLAUDE.md / skill conventions
- [x] Drizzle schema + SQLite push + seed
- [x] Layout marketing + panel
- [x] Pages: home, templates, 4 services, academy, komunitas, FAQ, order wizard stub, login, panel
- [x] API: health, auth login/logout, templates list
- [x] i18n id/en
- [x] Content collections blog/faq

## Next P0

1. **Orders API** — create order, recompute price server-side, promo validation  
2. **Xendit** — create invoice, webhook `/api/webhooks/xendit`, mark paid  
3. **Auth register + seed admin user**  
4. **Panel** — list orders & sites from DB  
5. **Templates detail page** + wire catalog to `/api/templates`

## P1

6. Service landing polish + real pricing from `packages` table  
7. Blog index/detail from Content  
8. Portofolio + tutorial pages  
9. Legal pages (syarat, privasi, refund)  
10. Domain check real/stub consistent with checkout

## P2

11. Academy modules CRUD + progress  
12. Inquiry inbox  
13. Email via Resend (order paid, welcome)  
14. Admin role routes  

## Commands

```bash
pnpm dev
pnpm db:push --force   # if non-interactive needed: drizzle-kit push --force
pnpm db:seed
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

## Env required for payments

```
NUXT_XENDIT_SECRET_KEY=
NUXT_XENDIT_WEBHOOK_TOKEN=
NUXT_PUBLIC_XENDIT_PUBLIC_KEY=
NUXT_RESEND_API_KEY=
NUXT_SESSION_PASSWORD=   # already in .env local
```
