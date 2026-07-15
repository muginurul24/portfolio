import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { packages } from '../../../database/schema'
import { createId } from '../../../utils/id'

const serviceTypes = ['export', 'umkm', 'ecommerce', 'custom', 'academy'] as const

const bodySchema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional().nullable(),
  serviceType: z.enum(serviceTypes),
  priceYearlyIdr: z.number().int().min(0),
  priceMonthlyIdr: z.number().int().min(0).optional().nullable(),
  features: z.array(z.string()).optional().default([]),
  includesDomain: z.boolean().optional().default(true),
  includesHosting: z.boolean().optional().default(true),
  includesSsl: z.boolean().optional().default(true),
  includesBizEmail: z.boolean().optional().default(true),
  termYears: z.number().int().min(1).max(10).optional().default(1),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0)
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const slug = body.slug.toLowerCase().trim()
  const clash = await db.query.packages.findFirst({ where: eq(packages.slug, slug) })
  if (clash) {
    throw createError({ statusCode: 409, statusMessage: 'Slug paket sudah dipakai' })
  }

  const id = createId('pkg')
  await db.insert(packages).values({
    id,
    slug,
    name: body.name.trim(),
    description: body.description?.trim() || null,
    serviceType: body.serviceType,
    priceYearlyIdr: body.priceYearlyIdr,
    priceMonthlyIdr: body.priceMonthlyIdr ?? null,
    features: body.features ?? [],
    includesDomain: body.includesDomain,
    includesHosting: body.includesHosting,
    includesSsl: body.includesSsl,
    includesBizEmail: body.includesBizEmail,
    termYears: body.termYears,
    isActive: body.isActive,
    sortOrder: body.sortOrder
  })

  const row = await db.query.packages.findFirst({ where: eq(packages.id, id) })
  return { data: row }
})
