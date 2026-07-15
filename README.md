# MugiewDev

Platform website profesional untuk **UMKM & eksportir Indonesia** — feature-parity target: [webekspor.com](https://www.webekspor.com).

> Website builder + domain/hosting packages + akademi + komunitas.  
> **Bukan** marketplace barang B2B.

## Stack

- **Nuxt 4** · **Nuxt UI 4** · Tailwind CSS 4  
- **Pinia** · **VueUse** · **Zod**  
- **@nuxtjs/i18n** (id/en) · **@nuxt/content** · **@nuxt/image** · **@nuxt/fonts**  
- SEO: sitemap · robots · og-image  
- Auth: **nuxt-auth-utils**  
- DB: **Drizzle ORM** + SQLite (dev)  
- Pay: **Xendit** · Email: **Resend**  

## Quick start

```bash
pnpm install
cp .env.example .env
# set NUXT_SESSION_PASSWORD to ≥32 random chars

pnpm dev
```

Open http://localhost:3000

```bash
pnpm db:push      # create tables
pnpm lint
pnpm typecheck
pnpm build
```

## Docs for agents

| File | Purpose |
|------|---------|
| [AGENTS.md](./AGENTS.md) | Stack lock + hard rules |
| [CLAUDE.md](./CLAUDE.md) | Claude Code project rules |
| [DESIGN.md](./DESIGN.md) | Visual system |
| [docs/research/webekspor-analysis.md](./docs/research/webekspor-analysis.md) | Product research & backlog |
| [docs/architecture/overview.md](./docs/architecture/overview.md) | Architecture |

## Scripts

| Command | Action |
|---------|--------|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm db:generate` | Drizzle migrations |
| `pnpm db:push` | Push schema |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm test` | Vitest |

## License

Private — all rights reserved.
