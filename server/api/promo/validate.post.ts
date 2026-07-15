import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { promoCodes } from '../../database/schema'

const bodySchema = z.object({
  code: z.string().min(2).max(40),
  subtotalIdr: z.number().int().nonnegative().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const code = body.code.trim().toUpperCase()
  const promo = await db.query.promoCodes.findFirst({
    where: and(eq(promoCodes.code, code), eq(promoCodes.isActive, true))
  })
  if (!promo) {
    return { valid: false, code, discountIdr: 0, discountPercent: null as number | null }
  }
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
    return { valid: false, code, discountIdr: 0, discountPercent: null }
  }
  const now = new Date()
  if (promo.validFrom && promo.validFrom > now) return { valid: false, code, discountIdr: 0, discountPercent: null }
  if (promo.validUntil && promo.validUntil < now) return { valid: false, code, discountIdr: 0, discountPercent: null }

  return {
    valid: true,
    code: promo.code,
    discountIdr: promo.discountIdr ?? 0,
    discountPercent: promo.discountPercent ?? null
  }
})
