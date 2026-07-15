import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { packages } from '../../../database/schema'

const serviceTypes = ['export', 'umkm', 'ecommerce', 'custom', 'academy'] as const

const bodySchema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).nullable().optional(),
  serviceType: z.enum(serviceTypes).optional(),
  priceYearlyIdr: z.number().int().min(0).optional(),
  priceMonthlyIdr: z.number().int().min(0).nullable().optional(),
  features: z.array(z.string()).optional(),
  includesDomain: z.boolean().optional(),
  includesHosting: z.boolean().optional(),
  includesSsl: z.boolean().optional(),
  includesBizEmail: z.boolean().optional(),
  termYears: z.number().int().min(1).max(10).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional()
}).refine(data => Object.keys(data).length > 0, { message: 'Tidak ada field diubah' })

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const existing = await db.query.packages.findFirst({ where: eq(packages.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Paket tidak ditemukan' })

  if (body.slug) {
    const slug = body.slug.toLowerCase().trim()
    const clash = await db.query.packages.findFirst({ where: eq(packages.slug, slug) })
    if (clash && clash.id !== id) {
      throw createError({ statusCode: 409, statusMessage: 'Slug paket sudah dipakai' })
    }
  }

  const patch: Record<string, unknown> = {}
  if (body.slug !== undefined) patch.slug = body.slug.toLowerCase().trim()
  if (body.name !== undefined) patch.name = body.name.trim()
  if (body.description !== undefined) patch.description = body.description?.trim() || null
  if (body.serviceType !== undefined) patch.serviceType = body.serviceType
  if (body.priceYearlyIdr !== undefined) patch.priceYearlyIdr = body.priceYearlyIdr
  if (body.priceMonthlyIdr !== undefined) patch.priceMonthlyIdr = body.priceMonthlyIdr
  if (body.features !== undefined) patch.features = body.features
  if (body.includesDomain !== undefined) patch.includesDomain = body.includesDomain
  if (body.includesHosting !== undefined) patch.includesHosting = body.includesHosting
  if (body.includesSsl !== undefined) patch.includesSsl = body.includesSsl
  if (body.includesBizEmail !== undefined) patch.includesBizEmail = body.includesBizEmail
  if (body.termYears !== undefined) patch.termYears = body.termYears
  if (body.isActive !== undefined) patch.isActive = body.isActive
  if (body.sortOrder !== undefined) patch.sortOrder = body.sortOrder

  await db.update(packages).set(patch).where(eq(packages.id, id))
  const row = await db.query.packages.findFirst({ where: eq(packages.id, id) })
  return { data: row }
})
