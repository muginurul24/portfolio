import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { domainTlds } from '../../../database/schema'

const bodySchema = z.object({
  tld: z.string().min(2).max(30).regex(/^[a-z0-9.]+$/).optional(),
  priceYearlyIdr: z.number().int().min(0).optional(),
  promoPriceYearlyIdr: z.number().int().min(0).nullable().optional(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, { message: 'Tidak ada field diubah' })

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const existing = await db.query.domainTlds.findFirst({ where: eq(domainTlds.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'TLD tidak ditemukan' })

  if (body.tld) {
    const tld = body.tld.toLowerCase().replace(/^\./, '').trim()
    const clash = await db.query.domainTlds.findFirst({ where: eq(domainTlds.tld, tld) })
    if (clash && clash.id !== id) {
      throw createError({ statusCode: 409, statusMessage: 'TLD sudah ada' })
    }
  }

  const patch: Record<string, unknown> = {}
  if (body.tld !== undefined) patch.tld = body.tld.toLowerCase().replace(/^\./, '').trim()
  if (body.priceYearlyIdr !== undefined) patch.priceYearlyIdr = body.priceYearlyIdr
  if (body.promoPriceYearlyIdr !== undefined) patch.promoPriceYearlyIdr = body.promoPriceYearlyIdr
  if (body.isActive !== undefined) patch.isActive = body.isActive

  await db.update(domainTlds).set(patch).where(eq(domainTlds.id, id))
  const row = await db.query.domainTlds.findFirst({ where: eq(domainTlds.id, id) })
  return { data: row }
})
