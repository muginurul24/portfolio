# Task 2 Report — Middleware auth/guard UX

**Status:** done

## Delivered
- `app/middleware/auth.ts` — fetch session if not ready; redirect login?redirect=
- `app/middleware/staff.ts` — cs|admin|dev else /403
- `app/middleware/dev.ts` — dev only else /403
- `app/utils/auth-redirect.ts` — safeInternalPath + homeForRole
- `app/pages/403.vue` — forbidden UX
- `app/pages/dev/index.vue` — placeholder console (middleware auth+dev)
- `app/pages/login.vue` — role-based post-login + safe redirect
- i18n auth.forbidden* + dev.console*
- tests/auth-redirect.test.ts

## Commit
feat(auth): guard middleware with redirect and 403 page
