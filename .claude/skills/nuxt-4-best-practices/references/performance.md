# Performance (Nuxt 4)

Read when improving LCP/INP/CLS, bundle size, navigation speed, or choosing
render modes.

Official: [Nuxt performance best practices](https://nuxt.com/docs/4.x/guide/best-practices/performance)

## Built-in wins

### NuxtLink

Use `<NuxtLink>` for in-app routes. Nuxt prefetches page chunks when links
enter the viewport by default.

```vue
<NuxtLink to="/templates">Lihat template</NuxtLink>
```

If prefetch is too aggressive:

```ts
export default defineNuxtConfig({
  experimental: {
    defaults: {
      nuxtLink: {
        prefetchOn: { interaction: true, visibility: false },
      },
    },
  },
})
```

### Hybrid rendering (`routeRules`)

Different routes need different caching / SSR:

```ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/products/**': { swr: 3600 },
    '/blog': { isr: 3600 },
    '/admin/**': { ssr: false },
  },
})
```

Nitro applies cache handlers and middleware from these rules. Prefer hybrid over
forcing the entire app to SPA or full static.

### Lazy components

Prefix with `Lazy` to dynamic-import only when needed:

```vue
<script setup lang="ts">
const show = ref(false)
</script>
<template>
  <LazyMountainsList v-if="show" />
  <button v-else @click="show = true">Show</button>
</template>
```

### Lazy hydration (Nuxt ≥ 3.16)

Delay interactivity for non-critical islands:

```vue
<LazyMyComponent hydrate-on-visible />
```

Other strategies exist for idle / interaction / media — use when the block is
visible in HTML but does not need immediate listeners.

### Data fetching

`useFetch` / `useAsyncData` avoid double network cost and keep payload-driven
hydration. See `data-fetching.md`. Use `pick` / `transform` to keep payload
small.

## Core modules

### Images — `@nuxt/image`

Unoptimized images dominate LCP.

```vue
<!-- LCP / hero -->
<NuxtImg
  src="/hero-banner.jpg"
  format="webp"
  :preload="{ fetchPriority: 'high' }"
  loading="eager"
  width="1200"
  height="600"
/>

<!-- below fold -->
<NuxtImg
  src="/logo-partner.png"
  format="webp"
  loading="lazy"
  fetchpriority="low"
  width="200"
  height="100"
/>
```

Always set dimensions (or CSS aspect-ratio) to limit CLS.

### Fonts — `@nuxt/fonts`

Auto-resolves font-family, self-hosts, injects `@font-face`, caches under
`/_fonts`, and generates fallback metrics (fontaine) to reduce CLS. Prefer this
over ad-hoc Google Fonts `<link>` tags.

### Scripts — `@nuxt/scripts`

Third parties hurt INP/LCP. Load with explicit triggers and typed proxies:

```ts
const { onLoaded, proxy } = useScriptGoogleAnalytics({
  id: 'G-XXXX',
  scriptOptions: { trigger: 'manual' },
})
proxy.gtag('config', 'G-XXXX')
onLoaded(() => { /* script ready */ })
```

## Profiling

| Tool | Use |
| ---- | --- |
| `nuxi analyze` / `nuxt analyze` | Bundle visualizer — find fat modules to split or lazy-load |
| Nuxt DevTools | Timeline, assets, render tree, inspect, payload |
| Chrome Performance | Local LCP / CLS / INP |
| Lighthouse / PageSpeed Insights | Lab + field guidance, failing audits as backlog |

When the treemap shows a large block: import only what you need, lazy-load the
route/component, or replace the dependency.

## Practical agent checklist

- [ ] Internal links use `NuxtLink`
- [ ] Marketing/catalog routes use appropriate `routeRules`
- [ ] Heavy widgets are `Lazy*` and/or lazy-hydrated
- [ ] Initial data uses keyed `useFetch` / `useAsyncData` with slim payload
- [ ] LCP image optimized and high-priority; others lazy
- [ ] Fonts via Nuxt Fonts (or equivalent self-host + fallback metrics)
- [ ] Third-party scripts via Nuxt Scripts with non-blocking triggers
- [ ] Measured before/after with DevTools or Lighthouse when claiming a win
