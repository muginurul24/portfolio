# Task 2 Report — Middleware auth/guard UX

**Status:** done  
**Branch:** worktree-feat-auth-dev-dashboard

## Delivered
- `app/middleware/auth.ts` — fetch session if not ready; redirect `login?redirect=`
- `app/middleware/staff.ts` — cs|admin|dev else `/403`
- `app/middleware/dev.ts` — role `dev` only else `/403` (admin uses staff routes)
- `app/utils/auth-redirect.ts` — `safeInternalPath` + `homeForRole`
- `app/pages/403.vue` — Soft UI forbidden; CTAs by session/role
- `app/pages/dev/index.vue` — placeholder console (`auth`+`staff` so admin/cs land OK)
- `app/pages/dev/orders/index.vue` — CS home placeholder (`auth`+`staff`)
- `app/pages/login.vue` — role home + safe internal redirect
- i18n id+en: `auth.forbidden*`, `errors.*`, `dev.*`
- `tests/auth-redirect.test.ts`

## Role routing
| Role | Default home | Middleware on home |
|------|--------------|--------------------|
| dev, admin | `/dev` | staff |
| cs | `/dev/orders` | staff |
| customer | `/panel` | auth |

Safe redirect: `/…` only, never `//`.

## Tests
```
pnpm test tests/auth-redirect.test.ts tests/roles.test.ts
Test Files  2 passed · Tests 10 passed
```

## Commit
`feat(auth): guard middleware with redirect and 403 page`
