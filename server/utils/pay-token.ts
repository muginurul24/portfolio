import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

function b64url(input: string | Buffer) {
  return Buffer.from(input).toString('base64url')
}

export function signPayToken(orderId: string, secret: string, ttlSec = 172800): string {
  const exp = String(Date.now() + ttlSec * 1000)
  const body = `${b64url(orderId)}.${b64url(exp)}`
  const sig = createHmac('sha256', secret).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyPayToken(token: string, orderId: string, secret: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [oidB64, expB64, sig] = parts
  if (!oidB64 || !expB64 || !sig) return false
  const body = `${oidB64}.${expB64}`
  const expected = createHmac('sha256', secret).update(body).digest('base64url')
  try {
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false
  } catch {
    return false
  }
  const id = Buffer.from(oidB64, 'base64url').toString('utf8')
  const exp = Number(Buffer.from(expB64, 'base64url').toString('utf8'))
  if (id !== orderId) return false
  if (!Number.isFinite(exp) || Date.now() > exp) return false
  return true
}

export async function assertPayAccess(
  event: H3Event,
  order: { id: string, userId: string | null, customerEmail: string | null }
) {
  const config = useRuntimeConfig()
  const secret = String(config.payTokenSecret || config.session?.password || '')
  if (secret.length < 32) {
    throw createError({ statusCode: 500, statusMessage: 'Pay token secret not configured' })
  }
  const q = getQuery(event)
  const token = String(q.token || getHeader(event, 'x-pay-token') || '')
  if (token && verifyPayToken(token, order.id, secret)) return { via: 'token' as const }

  const session = await getUserSession(event)
  const u = session.user as { id?: string, email?: string, role?: string } | undefined
  if (u?.role === 'dev' || u?.role === 'admin' || u?.role === 'cs') return { via: 'staff' as const }
  if (u?.id && order.userId && u.id === order.userId) return { via: 'session' as const }
  const email = u?.email?.toLowerCase().trim()
  if (email && order.customerEmail?.toLowerCase() === email) return { via: 'session' as const }

  throw createError({ statusCode: 401, statusMessage: 'Token bayar tidak valid atau kedaluwarsa' })
}
