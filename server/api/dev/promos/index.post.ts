import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { promoCodes } from '../../../database/schema'
import { createId } from '../../../utils/id'

const bodySchema = z.object({
  code: z.string().min(3).max(40),
  discountIdr: z.number().int().min(0).optional().nullable(),
  discountPercent: z.number().int().min(0).max(100).optional().nullable(),
  maxUses: z.number().int().min(1).optional().nullable(),
  validFrom: z.string().datetime().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional().default(true)
}).refine(
  d => (d.discountIdr != null && d.discountIdr > 0) || (d.discountPercent != null && d.discountPercent > 0),
  { message: 'Isi diskon IDR atau persen' }
)

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const code = body.code.trim().toUpperCase()
  const clash = await db.query.promoCodes.findFirst({ where: eq(promoCodes.code, code) })
  if (clash) throw createError({ statusCode: 409, statusMessage: 'Kode promo sudah ada' })

  const id = createId('promo')
  await db.insert(promoCodes).values({
    id,
    code,
    discountIdr: body.discountIdr ?? null,
    discountPercent: body.discountPercent ?? null,
    maxUses: body.maxUses ?? null,
    usedCount: 0,
    validFrom: body.validFrom ? new Date(body.validFrom) : null,
    validUntil: body.validUntil ? new Date(body.validUntil) : null,
    isActive: body.isActive
  })

  const row = await db.query.promoCodes.findFirst({ where: eq(promoCodes.id, id) })
  return { data: row }
})
