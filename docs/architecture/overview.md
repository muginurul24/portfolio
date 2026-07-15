# Architecture — MugiewDev

```
┌─────────────────────────────────────────────────────────┐
│  Browser (SSR/Hydrate)                                  │
│  Nuxt 4 + Nuxt UI + Pinia + VueUse + i18n               │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Nitro server                                           │
│  /api/*  ·  auth session  ·  webhooks  ·  content       │
└───────┬─────────────────┬─────────────────┬─────────────┘
        │                 │                 │
   ┌────▼────┐      ┌─────▼─────┐     ┌─────▼─────┐
   │ Drizzle │      │  Xendit   │     │  Resend   │
   │ SQLite/ │      │  payment  │     │  email    │
   │ Postgres│      └───────────┘     └───────────┘
   └─────────┘
```

## Rendering strategy

| Area | Mode |
|------|------|
| Home, static marketing | prerender / SWR |
| Templates, blog | SWR |
| Order, login, panel | SSR |
| API | server only |

## Domain modules

1. **Catalog** — templates, packages, TLDs  
2. **Commerce** — orders, promo, payments, webhooks  
3. **Provisioning** — sites lifecycle  
4. **Learning** — courses, modules, progress  
5. **Community** — membership flag after site active  
6. **Content** — blog, FAQ, tutorial (file-based)  
7. **Identity** — users, session, roles  

## Order state machine

```
draft → pending_payment → paid → provisioning → active
                ↓                      ↓
            cancelled               expired / suspended
```

## Security

- Session password ≥ 32 chars  
- HttpOnly session cookie  
- Webhook token verification  
- Zod on inputs  
- Panel middleware auth  
- Robots disallow `/panel`, `/api`
