import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { promoCodes } from '../../../database/schema'

const bodySchema = z.object({
  code: z.string().min(3).max(40).optional(),
  discountIdr: z.number().int().min(0).nullable().optional(),
  discountPercent: z.number().int().min(0).max(100).nullable().optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  validFrom: z.string().datetime().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, { message: 'Tidak ada field diubah' })

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const existing = await db.query.promoCodes.findFirst({ where: eq(promoCodes.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Promo tidak ditemukan' })

  if (body.code) {
    const code = body.code.trim().toUpperCase()
    const clash = await db.query.promoCodes.findFirst({ where: eq(promoCodes.code, code) })
    if (clash && clash.id !== id) {
      throw createError({ statusCode: 409, statusMessage: 'Kode promo sudah ada' })
    }
  }

  const patch: Record<string, unknown> = {}
  if (body.code !== undefined) patch.code = body.code.trim().toUpperCase()
  if (body.discountIdr !== undefined) patch.discountIdr = body.discountIdr
  if (body.discountPercent !== undefined) patch.discountPercent = body.discountPercent
  if (body.maxUses !== undefined) patch.maxUses = body.maxUses
  if (body.validFrom !== undefined) patch.validFrom = body.validFrom ? new Date(body.validFrom) : null
  if (body.validUntil !== undefined) patch.validUntil = body.validUntil ? new Date(body.validUntil) : null
  if (body.isActive !== undefined) patch.isActive = body.isActive

  await db.update(promoCodes).set(patch).where(eq(promoCodes.id, id))
  const row = await db.query.promoCodes.findFirst({ where: eq(promoCodes.id, id) })
  return { data: row }
})
