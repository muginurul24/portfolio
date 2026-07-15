/**
 * Cron: expire unpaid orders older than 48h.
 * Auth: header `x-cron-secret` or query `?secret=` must match runtimeConfig.cronSecret.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secret = String(config.cronSecret || '')
  const header = getHeader(event, 'x-cron-secret') || getQuery(event).secret
  if (!secret || header !== secret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const result = await expireStaleOrders()
  return { ok: true, ...result }
})
