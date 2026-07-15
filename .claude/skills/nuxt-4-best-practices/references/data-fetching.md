# Data fetching (Nuxt 4)

Read when choosing between `$fetch`, `useFetch`, and `useAsyncData`, or when
debugging double fetches and empty client data.

Official: [Data fetching](https://nuxt.com/docs/4.x/getting-started/data-fetching)

## Why composables exist

Nuxt runs the same component setup on server and client. Bare `$fetch` in setup
hits the network twice and can hydrate with different results. `useFetch` and
`useAsyncData` fetch on the server (when `server: true`) and serialize into the
payload so the client reuses the value during hydration.

Inspect payload in Nuxt DevTools → Payload.

## Pick the right tool

| Situation | Tool |
| --------- | ---- |
| Simple URL / API route in setup | `useFetch` / `useLazyFetch` |
| Custom client (CMS SDK, multi-call, transform) | `useAsyncData` / `useLazyAsyncData` |
| Click, submit, imperative client call | `$fetch` |
| Need cookies/headers forwarded on server | `useFetch` (auto) or `useRequestFetch` / `useRequestHeaders` |

```vue
<script setup lang="ts">
const { data } = await useFetch('/api/data', { key: 'home-data' })

async function handleFormSubmit() {
  await $fetch('/api/submit', { method: 'POST', body: form })
}
</script>
```

## Keys

Always set an explicit key when:

- Building a reusable composable
- Key includes route params / user id / filters
- Multiple calls must share or isolate cache intentionally

```ts
// ✅
await useAsyncData(`user:${id}`, () => myGetFunction('users', { id }))

// ⚠️ autogen = file + line only — fragile in wrappers
await useAsyncData(() => myGetFunction('users'))
```

Calls that share a key must agree on `handler`, `deep`, `transform`, `pick`,
`getCachedData`, and `default`. They may differ on `server`, `lazy`,
`immediate`, `dedupe`, `watch`.

## Options that matter

### `lazy` / `useLazyFetch`

Do not block client navigation on the request; handle `status === 'pending'`.

### `server: false`

Skip SSR fetch. Data is not available during setup on first client run until
after hydration — design loading UI accordingly.

### `pick` / `transform`

Reduce payload size embedded in HTML:

```ts
await useFetch('/api/mountains/everest', {
  pick: ['title', 'description'],
})
```

### Reactive sources

```ts
const id = ref<string | null>(null)
useLazyFetch(() => `/api/users/${id.value}`, { immediate: false })

// or
useFetch('/api/users', { query: { user_id: id } })
```

`watch: false` disables auto re-execution on reactive option changes.

### Abort signals

Handlers receive a context with `signal` — pass it to `$fetch` for cancellation.

```ts
await useAsyncData('cart-discount', async (_nuxtApp, { signal }) => {
  const [coupons, offers] = await Promise.all([
    $fetch('/cart/coupons', { signal }),
    $fetch('/cart/offers', { signal }),
  ])
  return { coupons, offers }
})
```

## Side effects

`useAsyncData` is for **fetch + cache**, not for “run this Pinia action”.
Store actions as handlers can re-run with nullish data and surprise you.

```ts
// ❌
await useAsyncData(() => offersStore.getOffer(slug))

// ✅ force single intentional run
await callOnce(() => offersStore.getOffer(slug))
```

## Headers and cookies

On server, `useFetch` uses `useRequestFetch` to forward safe client headers
(including cookies) to internal APIs.

Manual pattern:

```ts
const headers = useRequestHeaders(['cookie'])
await $fetch('/api/me', { headers })
```

Never proxy indiscriminately. Exclude: `host`, `accept`, `content-length`,
`content-md5`, `content-type`, `x-forwarded-host`, `x-forwarded-port`,
`x-forwarded-proto`, `cf-connecting-ip`, `cf-ray`, and similar hop-by-hop /
infrastructure headers.

## Return surface

Shared by `useFetch` / `useAsyncData`:

- `data`, `error`, `status` (`idle` | `pending` | `success` | `error`) — refs
- `refresh` / `execute`
- `clear`

Awaiting the composable still leaves `data` empty when `server: false` until
the client fetch completes after hydration.

## Anti-patterns

- `$fetch` in setup for SSR page data
- Missing keys in shared composables
- Side effects inside fetch handlers
- Ignoring `status` when `lazy: true`
- Assuming `server: false` data exists during SSR HTML
- Forwarding full incoming headers to third-party APIs
