import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { domainTlds } from '../../../database/schema'
import { createId } from '../../../utils/id'

const bodySchema = z.object({
  tld: z.string().min(2).max(30).regex(/^[a-z0-9.]+$/),
  priceYearlyIdr: z.number().int().min(0),
  promoPriceYearlyIdr: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional().default(true)
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const tld = body.tld.toLowerCase().replace(/^\./, '').trim()
  const clash = await db.query.domainTlds.findFirst({ where: eq(domainTlds.tld, tld) })
  if (clash) {
    throw createError({ statusCode: 409, statusMessage: 'TLD sudah ada' })
  }

  const id = createId('tld')
  await db.insert(domainTlds).values({
    id,
    tld,
    priceYearlyIdr: body.priceYearlyIdr,
    promoPriceYearlyIdr: body.promoPriceYearlyIdr ?? null,
    isActive: body.isActive
  })

  const row = await db.query.domainTlds.findFirst({ where: eq(domainTlds.id, id) })
  return { data: row }
})
