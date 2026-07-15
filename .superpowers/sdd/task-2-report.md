# Task 2 Report — Seed admin user + expand catalog seed

## Status

**DONE**

## What changed

### `scripts/seed.ts`
- Password helper `makePasswordHash` uses `@adonisjs/hash` Scrypt (same stack as `nuxt-auth-utils` `hashPassword` / `verifyPassword`).
- Resolves hash package as pnpm sibling of `nuxt-auth-utils` (not always hoisted).
- Seeds users:
  - `user_admin` / `admin@mugiewdev.com` / `Admin123!` / role `admin` / phone `6281280080275`
  - `user_demo` / `demo@mugiewdev.com` / `Demo1234!` / role `customer` / phone `6281234567890`
- Keeps existing promo `WEBSITEJUARA`, TLDs, templates, testimonials via `onConflictDoNothing`.
- Adds packages:
  - `pkg_export_2y` / `website-ekspor-2y` / `1_247_000` / `termYears: 2`
  - `pkg_ecom_standard` / `toko-online-standard` / `25_000_000` / `termYears: 1`

### `.env.example`
- Comment: `# Dev logins after seed: admin@mugiewdev.com / Admin123! ; demo@mugiewdev.com / Demo1234!`

## Verification

| Step | Result |
|------|--------|
| `pnpm prepare:data` | `.data` already present (mkdir noise on Windows only) |
| `pnpm exec drizzle-kit push --force` with `CI=true` | Schema applied (interactive TTY blocked plain `pnpm db:push`) |
| `pnpm db:seed` | `Seed OK → ./.data/mugiew.sqlite` |
| Hash check | admin/demo scrypt verify `true`; wrong password `false` |
| Rows | 2 users, 5 packages (incl. export 2y + ecom standard), WEBSITEJUARA present |

## Commit

- `98c612c` — `feat: seed admin/demo users and expand packages`

## Self-review

- Hash format `$scrypt$n=16384,r=8,p=1$...` matches Adonis defaults used by nuxt-auth-utils.
- Seed is idempotent on PK conflicts (`onConflictDoNothing`); re-seed will not refresh password hashes if users already exist.
- No `.env` committed.
- Scope limited to seed + env example docs.

## Notes / minor concerns

1. **db:push interactivity:** plain `pnpm db:push` needs TTY confirmation. Workaround used: `CI=true pnpm exec drizzle-kit push --force`. Document for agents/CI.
2. **prepare:data on Windows:** `mkdir -p` via cmd can error if dir exists; seed still works when `.data` already exists.
3. **Re-seed passwords:** ~~changing seed passwords later requires deleting those user rows first~~ **fixed** — users use `onConflictDoUpdate` on `id` (passwordHash/name/role/phone/email refresh).

## Review fix (Task 2 Important)

### Changes in `scripts/seed.ts`
1. Restore template slug `spice-border` → `spice-exporter` (id `tpl_spice-exporter`, name still "Spice Exporter Pro").
2. Before template insert: `DELETE` any leftover `slug = 'spice-border'` row from bad seed.
3. Users insert: `onConflictDoUpdate` on `users.id` sets email/name/role/passwordHash/phone/updatedAt so re-seed refreshes passwords. Other tables stay `onConflictDoNothing`.

### Seed re-run
```
$ pnpm db:seed
Seed OK → ./.data/mugiew.sqlite
```

Verify query:
- templates spice: `{ id: 'tpl_spice-exporter', slug: 'spice-exporter', name: 'Spice Exporter Pro' }`
- border gone: `count=0`
- users: `user_admin` / `user_demo` present with scrypt hashes

### Commit
- (see git log after commit) `fix: restore spice-exporter slug and upsert seed user passwords`
