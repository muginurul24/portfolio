# Plugins (Nuxt 4)

Read when adding `app/plugins/*`, wrapping Vue plugins, or debugging slow
startup / hydration.

Official best practices: [plugins guide](https://nuxt.com/docs/4.x/guide/best-practices/plugins)
Directory API: [app/plugins](https://nuxt.com/docs/4.x/directory-structure/app/plugins)

## Guiding idea

Plugins run while the application is created — on the server for SSR and again
as part of client startup/hydration. Expensive plugin work delays interactivity
for every page.

## Prefer composition over plugins

If a utility can be an auto-imported composable or plain module, keep it that
way. Callers pull it only when needed; you avoid global init cost and keep
dependency graphs clear.

Use a plugin when you must:

- Register a Vue plugin (`nuxtApp.vueApp.use(...)`)
- Provide something app-wide via `nuxtApp.provide`
- Hook Nuxt runtime lifecycle (`hooks` in object syntax)
- Run true once-per-app setup that cannot be lazy

## Keep setup cheap

- No heavy sync computation at top level
- No unconditional network calls without need
- Defer browser-only SDKs to `.client` plugins + idle/visible triggers
- Split “register” from “first use” when the library allows

## Async plugins: enable `parallel`

Default plugin loading is sequential. An async plugin without `parallel: true`
blocks subsequent plugins.

```ts
export default defineNuxtPlugin({
  name: 'feature-flags',
  parallel: true,
  async setup(nuxtApp) {
    const flags = await $fetch('/api/flags')
    return { provide: { flags } }
  },
})
```

Only keep sequential order when one plugin truly depends on another’s provide.

## Object syntax

```ts
export default defineNuxtPlugin({
  name: 'my-plugin',
  enforce: 'pre', // or 'post' — must be static
  async setup(nuxtApp) {
    // main body
  },
  hooks: {
    'app:created'() {
      // statically registered
    },
  },
  env: {
    islands: true, // set false to skip on server-only / island renders
  },
})
```

Static analysis depends on literal `name` / `enforce` / hooks. Do not write
`enforce: import.meta.server ? 'pre' : 'post'` — that defeats optimizations.

## Vue plugins

Wrap third-party Vue plugins in a Nuxt plugin, often `.client.ts` when they
assume `window`:

```ts
// app/plugins/vue-gtag.client.ts
import VueGtag, { trackRouter } from 'vue-gtag-next'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueGtag, {
    property: { id: 'GA_MEASUREMENT_ID' },
  })
  trackRouter(useRouter())
})
```

For analytics/ads/embeds, prefer `@nuxt/scripts` abstractions when available —
better SSR, privacy, and load control than raw Vue plugins.

## File naming conventions

| Suffix / location | Behavior |
| ----------------- | -------- |
| `*.client.ts` | Client only |
| `*.server.ts` | Server only |
| `app/plugins/` | Auto-registered app plugins |
| order / `enforce` | Control sequence when required |

## Anti-patterns

- Plugin that only re-exports helpers (use composables)
- Blocking async plugin without `parallel: true`
- Importing large browser SDKs into universal plugins
- Runtime-computed `enforce` / dynamic hook names in object syntax
- Doing per-request business logic in a plugin instead of middleware or
  server routes
