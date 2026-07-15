import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { orders } from '../../../database/schema'
import type { UserRole } from '../../../../app/utils/roles'

const STATUSES = [
  'draft', 'pending_payment', 'paid', 'provisioning', 'active', 'cancelled', 'expired'
] as const

/** Allowed transitions. Dev can force any non-self transition. */
const ALLOWED: Record<string, string[]> = {
  draft: ['pending_payment', 'cancelled'],
  pending_payment: ['paid', 'cancelled', 'expired'],
  paid: ['provisioning', 'cancelled'],
  provisioning: ['active', 'cancelled'],
  active: ['cancelled', 'expired'],
  cancelled: [],
  expired: []
}

const bodySchema = z.object({
  status: z.enum(STATUSES).optional(),
  notes: z.string().max(4000).nullable().optional()
}).refine(data => Object.keys(data).length > 0, { message: 'Tidak ada field diubah' })

export default defineEventHandler(async (event) => {
  const session = await requireRole(event, ['cs', 'admin', 'dev'])
  const actor = sessionUser(session)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const existing = await db.query.orders.findFirst({ where: eq(orders.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Pesanan tidak ditemukan' })

  if (body.status && body.status !== existing.status) {
    const role = actor.role as UserRole
    const allowed = ALLOWED[existing.status] || []
    const isDev = role === 'dev'
    if (!isDev && !allowed.includes(body.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Transisi status ${existing.status} → ${body.status} tidak diizinkan`
      })
    }
    // CS cannot jump to paid without mark-paid-dev path
    if (role === 'cs' && body.status === 'paid') {
      throw createError({
        statusCode: 403,
        statusMessage: 'CS tidak bisa set paid manual — gunakan alur pembayaran'
      })
    }
  }

  const patch: Record<string, unknown> = { updatedAt: new Date() }
  if (body.status !== undefined) {
    patch.status = body.status
    if (body.status === 'paid' && !existing.paidAt) patch.paidAt = new Date()
    if (body.status === 'active' && !existing.activatedAt) patch.activatedAt = new Date()
  }
  if (body.notes !== undefined) patch.notes = body.notes

  await db.update(orders).set(patch).where(eq(orders.id, id))
  const row = await db.query.orders.findFirst({ where: eq(orders.id, id) })
  return { data: row }
})
