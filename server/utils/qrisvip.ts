export const QRIS_MIN_IDR = 10_000
export const QRIS_MAX_IDR = 10_000_000

export type QrisGenerateResult =
  | {
    ok: true
    trxId: string
    payload: string
    expiredAtSeconds: number | null
    fee: number | null
    channel: 'qris' | 'va' | 'unknown'
  }
  | { ok: false, error: string }

export type QrisCheckResult =
  | {
    ok: true
    status: 'success' | 'pending'
    amount: number | null
    trxId: string
    rrn: string | null
    raw: unknown
  }
  | { ok: false, error: string, raw?: unknown }

/** Alphanumeric only, max 36, uppercase — QrisVIP custom_ref limit. */
export function sanitizeCustomRef(orderNumber: string): string {
  return String(orderNumber || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 36)
}

/**
 * QrisVIP username: alpha / numeric / dash / strip only (no @ email).
 * Use local-part of email or fallback guest id.
 */
export function sanitizeQrisUsername(raw: string, fallback = 'guest'): string {
  const base = String(raw || '')
    .trim()
    .toLowerCase()
  const local = base.includes('@') ? base.split('@')[0] || base : base
  const cleaned = local
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return cleaned || fallback
}

export function isQrisPayload(data: string): boolean {
  return typeof data === 'string' && data.startsWith('000201')
}

export function assertPayableAmountIdr(amount: number): void {
  if (!Number.isFinite(amount) || amount < QRIS_MIN_IDR) {
    const err = new Error('Minimal pembayaran QRIS Rp 10.000') as Error & { statusCode?: number }
    err.statusCode = 400
    throw err
  }
  if (amount > QRIS_MAX_IDR) {
    const err = new Error('Maksimal pembayaran QRIS Rp 10.000.000') as Error & { statusCode?: number }
    err.statusCode = 400
    throw err
  }
}

function qrisConfig() {
  const config = useRuntimeConfig()
  return {
    baseUrl: String(config.qrisvipBaseUrl || 'https://qris.otomatis.vip').replace(/\/$/, ''),
    uuid: String(config.qrisvipUuid || ''),
    client: String(config.qrisvipClient || ''),
    clientKey: String(config.qrisvipClientKey || ''),
    expireSeconds: Number(config.qrisvipExpireSeconds || 1200)
  }
}

export function qrisvipConfigured(): boolean {
  const c = qrisConfig()
  return Boolean(c.uuid)
}

export async function qrisvipGenerate(input: {
  username: string
  amountIdr: number
  customRef: string
  expireSeconds?: number
}): Promise<QrisGenerateResult> {
  const c = qrisConfig()
  if (!c.uuid) {
    return { ok: false, error: 'QrisVIP belum dikonfigurasi (NUXT_QRISVIP_UUID)' }
  }

  assertPayableAmountIdr(input.amountIdr)

  try {
    const res = await $fetch<{
      status?: boolean
      data?: string
      trx_id?: string
      expired_at?: number
      fee?: number
      error?: string
    }>(`${c.baseUrl}/api/generate`, {
      method: 'POST',
      body: {
        username: input.username,
        amount: input.amountIdr,
        uuid: c.uuid,
        expire: input.expireSeconds ?? c.expireSeconds,
        custom_ref: sanitizeCustomRef(input.customRef)
      }
    })

    if (!res?.status || !res.trx_id || !res.data) {
      return { ok: false, error: res?.error || 'Gagal generate QRIS' }
    }

    const channel = isQrisPayload(res.data)
      ? 'qris'
      : /^\d{8,}$/.test(res.data)
        ? 'va'
        : 'unknown'

    if (channel !== 'qris') {
      return {
        ok: false,
        error: 'Response bukan QRIS (produk hanya mendukung QRIS)'
      }
    }

    return {
      ok: true,
      trxId: res.trx_id,
      payload: res.data,
      expiredAtSeconds: res.expired_at ?? null,
      fee: res.fee != null && Number.isFinite(Number(res.fee)) ? Number(res.fee) : null,
      channel
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menghubungi QrisVIP'
    return { ok: false, error: message }
  }
}

export async function qrisvipCheckStatus(trxId: string): Promise<QrisCheckResult> {
  const c = qrisConfig()
  if (!c.uuid || !c.client || !c.clientKey) {
    return { ok: false, error: 'QrisVIP status check belum dikonfigurasi (uuid/client/client_key)' }
  }
  if (!trxId) {
    return { ok: false, error: 'trx_id kosong' }
  }

  try {
    const res = await $fetch<Record<string, unknown>>(
      `${c.baseUrl}/api/checkstatus/v2/${encodeURIComponent(trxId)}`,
      {
        method: 'POST',
        body: {
          uuid: c.uuid,
          client: c.client,
          client_key: c.clientKey
        }
      }
    )

    if (res && res.status === false) {
      return {
        ok: false,
        error: String(res.error || 'Transaction not found'),
        raw: res
      }
    }

    const statusRaw = String(res?.status || '').toLowerCase()
    if (statusRaw === 'success' || statusRaw === 'pending') {
      const amount = res.amount != null && Number.isFinite(Number(res.amount))
        ? Math.round(Number(res.amount))
        : null
      return {
        ok: true,
        status: statusRaw as 'success' | 'pending',
        amount,
        trxId: String(res.trx_id || trxId),
        rrn: res.rrn != null ? String(res.rrn) : null,
        raw: res
      }
    }

    return {
      ok: false,
      error: String(res?.error || `Status tidak dikenal: ${statusRaw}`),
      raw: res
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal cek status QrisVIP'
    return { ok: false, error: message }
  }
}
