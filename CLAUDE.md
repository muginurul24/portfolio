# CLAUDE.md — MugiewDev

Project instructions for Claude Code / AI agents. Complements `AGENTS.md`.

## Mission

Ship **MugiewDev**: full feature-parity platform inspired by webekspor.com, on **Nuxt 4 + Nuxt UI**.  
Owner wants agents to **decide stack and implement** without re-asking for approval on defaults already locked in this repo.

## Always read before coding

1. `AGENTS.md` — stack lock + hard rules  
2. `DESIGN.md` — visual system  
3. `docs/research/webekspor-analysis.md` — product truth  
4. Relevant page under `design-system/` if present  

## Nuxt 4 patterns (required)

```ts
// ✅ SSR-safe data
const { data } = await useFetch('/api/templates', { key: 'templates' })

// ❌ Avoid for initial page data
const data = await $fetch('/api/templates')
```

- Secrets → `runtimeConfig` (server)  
- Theme/brand public tokens → `app.config.ts`  
- Hybrid rendering already in `nuxt.config.ts` `routeRules`  
- Auto-imports: components, composables, `server/utils`  

## Design enforcement

- Primary CTA color: sky (`#0369A1`)  
- Font: Plus Jakarta Sans only for UI  
- Icons: `i-lucide-*` / `i-simple-icons-*`  
- Soft UI shadows: use `shadow-soft-md` etc. from CSS tokens  
- Light mode default  
- No emoji icons  
- Copy in **Bahasa Indonesia** first; EN via i18n  

## Product copy voice

- Direct, practical, UMKM-friendly  
- Transparent price, no dark patterns  
- Active voice: "Buat Website Sekarang" not "Submit"  
- Errors: cause + fix, no vague "Terjadi kesalahan" alone when detail exists  

## Database

- Schema: `server/database/schema/index.ts`  
- Access: `useDb()` from `server/utils/db.ts`  
- Dev: SQLite file `.data/mugiew.sqlite`  
- Migrate: `pnpm db:push` or `pnpm db:generate && pnpm db:migrate`  

When adding tables: update schema, push, seed if needed. Keep IDR as integer.

## Payments (Xendit)

1. Create order server-side with recomputed totals  
2. Create Xendit invoice  
3. Webhook verifies token → mark payment + order paid  
4. Trigger provisioning status  

Never activate site on client-only success callback alone.

## Testing expectations

- Unit: utils, price calc, promo  
- Component: critical forms  
- API: auth + order happy path  
- `pnpm test` before large merges when tests exist  

## File touch etiquette

- Match existing comment density (sparse)  
- Prefer small focused files  
- Do not reformat unrelated files  
- Keep `pnpm` lockfile in sync  

## Skills

Project skill for conventions lives in `.claude/skills/mugiewdev-conventions/`.  
Use frontend-design + ui-ux-pro-max when building new UI surfaces; always re-check `DESIGN.md`.

## Out of scope unless asked

- Deploy provider lock-in (Nitro can target many)  
- Native mobile apps  
- Real domain registrar integration (stub first)  
- Live WhatsApp Business API (link `wa.me` is enough for v1)
