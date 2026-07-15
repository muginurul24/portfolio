# Hydration mismatches (Nuxt 4)

Read when fixing console hydration warnings, content flash, broken buttons after
load, or SEO HTML that does not match the client tree.

Official: [Nuxt hydration best practices](https://nuxt.com/docs/4.x/guide/best-practices/hydration)

## Why it matters

Vue hydrates server HTML by attaching reactivity and listeners. A mismatch means
the client VDOM does not equal the server HTML. Vue then re-renders the tree:

- Higher time-to-interactive
- Possible layout flash / CLS
- Event listeners may not attach as expected
- Visible UI can disagree with application state
- Crawlers may index server HTML that users never stably see

Treat warnings as defects, not noise.

## Detect

- Browser devtools console in development (Vue hydration mismatch logs)
- Visual flash of different text/structure on first paint → hydrate
- Nuxt DevTools payload + component tree when data sources diverge

## Common causes and fixes

### 1. Browser-only APIs during setup / render

```ts
// ❌ server has no localStorage
const theme = localStorage.getItem('theme') || 'light'
```

```ts
// ✅ SSR-friendly preference
const theme = useCookie('theme', { default: () => 'light' })
```

`window`, `document`, `navigator`, `localStorage`, `matchMedia` belong in
`onMounted`, a `.client` plugin, or behind `ClientOnly` when they affect render.

### 2. Non-deterministic values in the rendered tree

```vue
<!-- ❌ different every environment -->
<template>{{ Math.random() }}</template>
```

```vue
<script setup lang="ts">
// ✅ same value on server and client
const n = useState('rand', () => Math.random())
</script>
<template>{{ n }}</template>
```

Same class of bug: `Date.now()`, `new Date()` formatting that changes across
the SSR/client boundary, locale-default string formats without an explicit
locale, random IDs regenerated per side.

Time display: prefer `NuxtTime`, or render a stable fallback and update after
mount.

### 3. Client-only conditions in SSR markup

```vue
<!-- ❌ window undefined / different on server -->
<div v-if="window?.innerWidth > 768">Desktop</div>
```

Prefer CSS responsive utilities, or:

```vue
<ClientOnly>
  <DesktopPanel />
  <template #fallback>
    <p>…</p>
  </template>
</ClientOnly>
```

Always provide a fallback that is acceptable as the SSR HTML.

### 4. Third-party libraries with DOM side effects

Tag managers, carousels, maps, and chart libs often touch the DOM at import
time.

```ts
// ✅ after hydration
onMounted(async () => {
  const { default: lib } = await import('browser-only-lib')
  lib.init()
})
```

Avoid top-level `import 'browser-only-lib'` in SSR-shared modules.

### 5. Divergent data between server and client

Bare `$fetch` in setup runs on server **and** again on client → race and
mismatch risk. Use `useFetch` / `useAsyncData` so the server result is
serialized in the payload.

Inconsistent auth/session reads (cookie present only on one side, different
base URLs, clock-skewed “relative time” strings) also produce mismatches —
unify on SSR-safe composables (`useCookie`, `useRequestURL`, keyed fetch).

## Summary rules

1. SSR-friendly composables for shared state: `useFetch`, `useAsyncData`,
   `useState`, `useCookie`
2. Browser work after mount or in `.client` plugins
3. One data source for what the template prints
4. No render-time side effects in `setup`
5. `ClientOnly` is a seam, not a substitute for fixing avoidable mismatches

Further reading: [Vue SSR hydration mismatch](https://vuejs.org/guide/scaling-up/ssr#hydration-mismatch)
